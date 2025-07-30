# Production Order Transformer

Diese kleine Anwendung erlaubt es, mehrere CSV-Zeilen einzufügen, die jeweils ein JSON-Feld enthalten.
Über eine HTML-Oberfläche können die Daten per JSONata transformiert und anschließend kopiert werden.

## Verwendung

1. `transform.html` in einem Browser öffnen.
2. Die CSV-Daten in das Textfeld einfügen (inklusive mehrerer Zeilen).
3. Auf **Transformieren** klicken.
4. Darunter erscheint eine Tabelle mit dem transformierten JSON je Zeile.
   Über den **Kopieren**-Knopf in jeder Tabellenzeile kann das jeweilige JSON in die Zwischenablage übernommen werden.

Die Transformation erzeugt für jede Zeile ein JSON mit umfangreichen Informationen zum Produktionsauftrag.

Alternativ kann die Transformation auch auf der Kommandozeile erfolgen:

```bash
npm install
npm run transform
```

Der Befehl liest `test.csv`, wandelt jede Zeile per JSONata um und schreibt das Ergebnis nach `output.json`.
