# Projekt

Dieses Repository enthält ein kleines FastAPI-Backend zur Abfrage von D365 Inventar.

## Startscript-Hinweise

Die folgenden Befehle wurden zuvor am Ende von `backend.py` als Kommentar festgehalten und wurden in diese README ausgelagert:

```bash
#AZ-LOGIN erstmal!!
#cd C:/Users/ideke/Python/d365/UI
#python -m uvicorn backend:app --reload
```

Sie können die Anwendung auch direkt mit Uvicorn starten:

```bash
uvicorn backend:app --reload
```
