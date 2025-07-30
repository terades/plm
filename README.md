# Production Order Transformer

Diese kleine Anwendung erlaubt es, mehrere CSV-Zeilen einzufügen, die jeweils ein JSON-Feld enthalten.
Über eine HTML-Oberfläche können die Daten per JSONata transformiert und anschließend kopiert werden.

## Verwendung

1. `transform.html` in einem Browser öffnen.
2. Optional kann über **Datei auswählen** eine CSV-Datei hochgeladen werden und der Inhalt landet im Textfeld.
3. Die CSV-Daten im Textfeld können weiterhin bearbeitet werden.
4. Auf **Transformieren** klicken oder direkt nach dem Upload wird die Tabelle befüllt.
5. Darunter erscheint eine Tabelle mit dem transformierten JSON je Zeile.
   Über den **Kopieren**-Knopf in jeder Tabellenzeile kann das jeweilige JSON in die Zwischenablage übernommen werden.

Die Transformation erzeugt für jede Zeile ein JSON mit umfangreichen Informationen zum Produktionsauftrag.

Alternativ kann die Transformation auch auf der Kommandozeile erfolgen:

```bash
npm install
npm run transform
```

Der Befehl liest `test.csv`, wandelt jede Zeile per JSONata um und schreibt das Ergebnis nach `output.json`.

## Website im Codespace starten

Im GitHub Codespace kann ein kleiner Webserver gestartet werden, um die HTML-Oberfläche zu nutzen:

```bash
npm install    # falls noch nicht geschehen
npm start
```

Nach dem Start zeigt Codespaces einen Link für Port 8080 an. Über diesen kann `transform.html` im Browser geöffnet werden.
