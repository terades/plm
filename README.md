# PLM Inventory Service

Dieses Projekt stellt eine kleine FastAPI-Anwendung bereit, 
mit der Bestandsdaten aus Dynamics 365 abgefragt werden können.

## Anwendung starten

Am einfachsten wird die Anwendung mit uvicorn gestartet:

```bash
uvicorn backend:app --reload
```

Alternativ kann auch `python backend.py` verwendet werden.

## Benötigte Umgebungsvariablen

Für die Anbindung an Azure muss mindestens die URL
zum verwendeten Key Vault angegeben werden:

- `AZURE_KEY_VAULT_URL` – vollständige URL des Azure Key Vaults

Für die Authentifizierung über einen Service Principal
benötigt `DefaultAzureCredential` zusätzlich folgende Variablen:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_SECRET`

Sind diese gesetzt (oder ist z.B. ein Azure CLI Login verfügbar),
können die benötigten Secrets aus dem Key Vault geladen
und anschließend die D365-Dienste aufgerufen werden.
