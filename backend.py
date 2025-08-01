import os
import logging
import sqlite3
import json
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Dict, Optional, List, Any
import asyncio

# Importieren Sie Ihre bewährte D365InventoryClient-Klasse
from datetime import datetime, timedelta
import requests
from azure.keyvault.secrets import SecretClient
from azure.identity import DefaultAzureCredential

# Aussagekräftiges Logging für die gesamte Anwendung einrichten
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(module)s - %(message)s')

# Basisverzeichnisse und Dateien
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
QUERY_DB = os.path.join(BASE_DIR, "queries.sqlite")


def init_query_db() -> None:
    """Initialize the SQLite database used for storing queries and results."""
    try:
        conn = sqlite3.connect(QUERY_DB)
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS queries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                interval INTEGER NOT NULL,
                data TEXT NOT NULL
            )
            """
        )
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                filters TEXT NOT NULL,
                result_count INTEGER NOT NULL,
                data TEXT NOT NULL
            )
            """
        )
        conn.commit()
    except Exception as e:
        logging.error(f"Fehler beim Initialisieren der Query-Datenbank: {e}")
        raise
    finally:
        conn.close()


init_query_db()

# --------------------------------------------------------------------
# KLASSE ZUR D365-KOMMUNIKATION
# --------------------------------------------------------------------
class D365InventoryClient:
    def __init__(self):
        self.key_vault_url = os.getenv("AZURE_KEY_VAULT_URL")
        if not self.key_vault_url:
            raise ValueError("AZURE_KEY_VAULT_URL Umgebungsvariable nicht gesetzt.")
        
        logging.info(f"Verwende Key Vault: {self.key_vault_url}")
        
        self.credential = DefaultAzureCredential()
        self.secret_client = SecretClient(vault_url=self.key_vault_url, credential=self.credential)

        logging.info("Lade D365-Secrets aus Azure Key Vault...")
        self.client_id = self._get_secret("d365-inventory-visibility-client-id")
        self.client_secret = self._get_secret("d365-inventory-visibility-secret")
        self.tenant_id = self._get_secret("d365-inventory-visibility-tenant-id")
        self.scope = self._get_secret("d365-inventory-visibility-scope")
        self.environment_id = self._get_secret("d365-inventory-visibility-environment")
        logging.info("✅ D365-Secrets erfolgreich geladen.")
        
        self.oauth_url = f"https://login.microsoftonline.com/{self.tenant_id}/oauth2/v2.0/token"
        self.security_service_url = "https://securityservice.operations365.dynamics.com/token"
        self.inventory_service_url = f"https://inventoryservice.weu-il104.gateway.prod.island.powerapps.com/api/environment/{self.environment_id}/onhand/exactquery"
        
        self.oauth_token_cache = {"token": None, "expires": datetime.now()}
        self.security_token_cache = {"token": None, "expires": datetime.now()}

    def _get_secret(self, secret_name: str) -> str:
        try:
            return self.secret_client.get_secret(secret_name).value
        except Exception as e:
            logging.error(f"Fehler beim Abrufen des Secrets '{secret_name}': {e}")
            raise

    def get_oauth_token(self) -> Optional[str]:
        if self.oauth_token_cache["token"] and self.oauth_token_cache["expires"] > datetime.now():
            return self.oauth_token_cache["token"]
        data = { "client_id": self.client_id, "client_secret": self.client_secret, "grant_type": "client_credentials", "scope": self.scope }
        response = requests.post(self.oauth_url, headers={"Content-Type": "application/x-www-form-urlencoded"}, data=data)
        response.raise_for_status()
        token_data = response.json()
        expires_in = token_data.get("expires_in", 3599)
        self.oauth_token_cache["token"] = token_data["access_token"]
        self.oauth_token_cache["expires"] = datetime.now() + timedelta(seconds=expires_in - 60)
        return self.oauth_token_cache["token"]

    def get_security_service_token(self) -> Optional[str]:
        if self.security_token_cache["token"] and self.security_token_cache["expires"] > datetime.now():
            return self.security_token_cache["token"]
        oauth_token = self.get_oauth_token()
        payload = { "grant_type": "client_credentials", "client_assertion_type": "aad_app", "client_assertion": oauth_token, "scope": "https://inventoryservice.operations365.dynamics.com/.default", "context": self.environment_id, "context_type": "finops-env" }
        response = requests.post(self.security_service_url, headers={"Api-Version": "1.0", "Content-Type": "application/json"}, json=payload)
        response.raise_for_status()
        token_data = response.json()
        expires_in = token_data.get("expires_in", 3599)
        self.security_token_cache["token"] = token_data["access_token"]
        self.security_token_cache["expires"] = datetime.now() + timedelta(seconds=expires_in - 60)
        return self.security_token_cache["token"]

    def query_inventory(self, query_payload: Dict) -> Dict:
        security_token = self.get_security_service_token()
        headers = { "Content-Type": "application/json", "Authorization": f"Bearer {security_token}", "Api-Version": "1.0" }
        response = requests.post(self.inventory_service_url, headers=headers, json=query_payload)
        response.raise_for_status()
        return response.json()

# --------------------------------------------------------------------
# FASTAPI ANWENDUNGS-LOGIK
# --------------------------------------------------------------------

# Pydantic-Modell für die eingehenden Daten von der Webseite
class QueryFilters(BaseModel):
    """Eingabedaten der Abfrage.

    Viele Felder sind optional, um auch unvollständige Formulare annehmen zu
    können. Dadurch löst die Request-Validierung keinen 422 Fehler mehr aus,
    wenn einzelne Werte leer gelassen werden. Produkt-IDs werden als Liste
    übergeben und standardmäßig zu einer leeren Liste initialisiert.
    """

    organizationId: Optional[str] = None
    productIds: List[str] = []
    siteId: Optional[str] = None
    locationId: Optional[str] = None
    WMSLocationId: Optional[str] = None
    InventStatusId: Optional[str] = None
    ConfigId: Optional[str] = None
    SizeId: Optional[str] = None
    ColorId: Optional[str] = None
    StyleId: Optional[str] = None
    BatchId: Optional[str] = None


class TrackingConfig(BaseModel):
    enabled: bool

class ScheduledQuery(BaseModel):
    id: Optional[int] = None
    filters: Dict[str, Any]
    interval: int

# FastAPI-Anwendung initialisieren
# WICHTIG: Diese Zeile steht auf der obersten Ebene (nicht eingerückt)
app = FastAPI()

# Informationen zur letzten erfolgreichen Abfrage
last_query_info: Dict[str, Any] = {}
tracking_enabled: bool = True


def load_queries() -> List[Dict[str, Any]]:
    try:
        conn = sqlite3.connect(QUERY_DB)
        cur = conn.cursor()
        cur.execute("SELECT id, interval, data FROM queries ORDER BY id")
        rows = cur.fetchall()
        result = []
        for row in rows:
            data = json.loads(row[2])
            result.append({"id": row[0], "interval": row[1], "filters": data})
        return result
    except Exception as e:
        logging.error(f"Fehler beim Öffnen der Query-Datenbank: {e}")
        return []
    finally:
        if 'conn' in locals():
            conn.close()


def add_or_update_query(query: ScheduledQuery) -> int:
    try:
        conn = sqlite3.connect(QUERY_DB)
        cur = conn.cursor()
        if query.id is None:
            cur.execute(
                "INSERT INTO queries (interval, data) VALUES (?, ?)",
                (query.interval, json.dumps(query.filters)),
            )
            query_id = cur.lastrowid
        else:
            cur.execute(
                "UPDATE queries SET interval=?, data=? WHERE id=?",
                (query.interval, json.dumps(query.filters), query.id),
            )
            query_id = query.id
        conn.commit()
        return query_id
    except Exception as e:
        logging.error(f"Fehler beim Schreiben in die Query-Datenbank: {e}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()


def delete_query(query_id: int) -> None:
    try:
        conn = sqlite3.connect(QUERY_DB)
        cur = conn.cursor()
        cur.execute("DELETE FROM queries WHERE id=?", (query_id,))
        conn.commit()
    except Exception as e:
        logging.error(f"Fehler beim Löschen aus der Query-Datenbank: {e}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()


# ---------------------------- Scheduler Logic ----------------------------
scheduled_queries: Dict[int, Dict[str, Any]] = {}


async def run_scheduler() -> None:
    client = D365InventoryClient()
    while True:
        now = datetime.utcnow()
        for qid, info in list(scheduled_queries.items()):
            if now >= info["next_run"]:
                filters_model = QueryFilters(**info["filters"])
                try:
                    all_vals = filters_model.dict()
                    active_dimensions, active_values = [], []
                    dimension_keys = [
                        "siteId",
                        "locationId",
                        "WMSLocationId",
                        "ConfigId",
                        "SizeId",
                        "ColorId",
                        "StyleId",
                        "InventStatusId",
                        "BatchId",
                    ]
                    for key in dimension_keys:
                        value = all_vals.get(key)
                        if value and value not in [".", "*"]:
                            active_dimensions.append(key)
                            active_values.append(value)
                    payload = {
                        "dimensionDataSource": "fno",
                        "filters": {
                            "organizationId": [all_vals["organizationId"]],
                            "productId": all_vals["productIds"],
                            "dimensions": active_dimensions,
                            "values": [active_values],
                        },
                        "groupByValues": dimension_keys,
                        "returnNegative": True,
                    }
                    result = client.query_inventory(query_payload=payload)
                    result_count = len(result)
                    timestamp = datetime.utcnow().isoformat()
                    if tracking_enabled:
                        last_query_info.update({
                            "timestamp": timestamp,
                            "filters": info["filters"],
                            "resultCount": result_count,
                        })
                    save_inventory_result(timestamp, info["filters"], result_count, result)
                except Exception as e:
                    logging.error(f"Fehler bei geplanter Abfrage {qid}: {e}")
                finally:
                    info["next_run"] = now + timedelta(seconds=info["interval"])
        await asyncio.sleep(1)


@app.on_event("startup")
async def startup_event() -> None:
    for q in load_queries():
        scheduled_queries[q["id"]] = {
            "filters": q["filters"],
            "interval": q["interval"],
            "next_run": datetime.utcnow(),
        }
    asyncio.create_task(run_scheduler())


def save_inventory_result(timestamp: str, filters: Dict[str, Any], result_count: int, data: List[Dict[str, Any]]) -> None:
    """Persist the retrieved inventory data in the SQLite database."""
    try:
        conn = sqlite3.connect(QUERY_DB)
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO results (timestamp, filters, result_count, data) VALUES (?, ?, ?, ?)",
            (timestamp, json.dumps(filters), result_count, json.dumps(data)),
        )
        conn.commit()
    except Exception as e:
        logging.error(f"Fehler beim Speichern der Ergebnisdaten: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

# API-Endpunkt, der die Abfrage durchführt
@app.post("/api/inventory")
async def get_inventory(filters: QueryFilters):
    logging.info(f"API-Anfrage erhalten mit Filtern: {filters.dict()}")
    try:
        all_vals = filters.dict()
        active_dimensions, active_values = [], []
        dimension_keys = ["siteId", "locationId", "WMSLocationId", "ConfigId", "SizeId", "ColorId", "StyleId", "InventStatusId", "BatchId"]

        for key in dimension_keys:
            value = all_vals.get(key)
            if value and value not in [".", "*"]:
                active_dimensions.append(key)
                active_values.append(value)

        payload = {
            "dimensionDataSource": "fno",
            "filters": {
                "organizationId": [all_vals["organizationId"]],
                "productId": all_vals["productIds"],
                "dimensions": active_dimensions,
                "values": [active_values]
            },
            "groupByValues": ["siteId", "locationId", "WMSLocationId", "ConfigId", "SizeId", "ColorId", "StyleId", "InventStatusId", "BatchId"],
            "returnNegative": True
        }

        client = D365InventoryClient()
        result = client.query_inventory(query_payload=payload)
        result_count = len(result)
        logging.info(f"Abfrage lieferte {result_count} Zeilen")

        timestamp = datetime.utcnow().isoformat()
        query_info = {
            "timestamp": timestamp,
            "filters": filters.dict(),
            "resultCount": result_count,
        }
        if tracking_enabled:
            last_query_info.update(query_info)
        save_inventory_result(timestamp, filters.dict(), result_count, result)

        response = query_info.copy()
        response["data"] = result
        return response

    except Exception as e:
        logging.error(f"API-Fehler: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tracking")
async def get_tracking():
    return {"enabled": tracking_enabled}


@app.post("/api/tracking")
async def set_tracking(config: TrackingConfig):
    global tracking_enabled
    tracking_enabled = config.enabled
    if not tracking_enabled:
        last_query_info.clear()
    return {"enabled": tracking_enabled}


@app.get("/api/queries")
async def get_saved_queries():
    return {"queries": load_queries()}


@app.post("/api/queries")
async def upsert_saved_query(query: ScheduledQuery):
    query_id = add_or_update_query(query)
    scheduled_queries[query_id] = {
        "filters": query.filters,
        "interval": query.interval,
        "next_run": datetime.utcnow(),
    }
    return {"id": query_id}


@app.delete("/api/queries/{query_id}")
async def remove_saved_query(query_id: int):
    delete_query(query_id)
    scheduled_queries.pop(query_id, None)
    return {"status": "deleted"}


@app.get("/api/status")
async def get_status():
    if not tracking_enabled:
        return {"trackingEnabled": False}
    return {"trackingEnabled": True, **last_query_info}


# Statische Dateien bereitstellen (HTML, CSS, JS)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Hauptseite (index.html) bereitstellen
@app.get("/")
async def read_root():
    index_path = os.path.join(STATIC_DIR, "index.html")
    logging.info(f"Lade index.html von: {index_path}")
    logging.info(f"Aktuelles Arbeitsverzeichnis: {os.getcwd()}")
    logging.info(f"backend.py liegt in: {os.path.abspath(__file__)}")
    return FileResponse(index_path)


# Uvicorn-Server starten, wenn die Datei direkt ausgeführt wird
# (Nützlich für direktes Starten mit 'python backend.py', aber 'uvicorn' Befehl ist flexibler)
if __name__ == "__main__":
    import uvicorn
    # Stellen Sie sicher, dass die Umgebungsvariablen gesetzt sind, bevor Sie dies ausführen
    uvicorn.run("backend:app", host="127.0.0.1", port=8000, reload=True)

    #STARTSCRIPT#STARTSCRIPT#STARTSCRIPT#STARTSCRIPT
    #AZ-LOGIN erstmal!!
    #cd C:/Users/ideke/Python/d365/UI
    #python -m uvicorn backend:app --reload

