import os
import shelve
import logging
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Dict, Optional, List, Any

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
QUERY_DB = os.path.join(BASE_DIR, "queries.db")

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


class SavedQueries(BaseModel):
    queries: List[Dict[str, Any]]

# FastAPI-Anwendung initialisieren
# WICHTIG: Diese Zeile steht auf der obersten Ebene (nicht eingerückt)
app = FastAPI()

# Informationen zur letzten erfolgreichen Abfrage
last_query_info: Dict[str, Any] = {}
tracking_enabled: bool = True


def load_queries() -> List[Dict[str, Any]]:
    try:
        with shelve.open(QUERY_DB) as db:
            return db.get("queries", [])
    except Exception as e:
        logging.error(f"Fehler beim Öffnen der Query-Datenbank: {e}")
        return []


def save_queries(queries: List[Dict[str, Any]]) -> None:
    try:
        with shelve.open(QUERY_DB) as db:
            db["queries"] = queries
    except Exception as e:
        logging.error(f"Fehler beim Schreiben in die Query-Datenbank: {e}")
        raise

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

        timestamp = datetime.utcnow().isoformat()
        query_info = {
            "timestamp": timestamp,
            "filters": filters.dict(),
            "resultCount": len(result),
        }
        if tracking_enabled:
            last_query_info.update(query_info)

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
async def update_saved_queries(query_list: SavedQueries):
    save_queries(query_list.queries)
    return {"status": "ok"}


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

