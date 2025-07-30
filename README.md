# Production Order Transformer

Diese kleine Anwendung erlaubt es, mehrere CSV-Zeilen einzufügen, die jeweils ein JSON-Feld enthalten.
Über eine HTML-Oberfläche können die Daten per JSONata transformiert und anschließend kopiert werden.

## Verwendung

1. `transform.html` in einem Browser öffnen.
2. Die CSV-Daten in das Textfeld einfügen (inklusive mehrerer Zeilen).
3. Auf **Transformieren** klicken.
4. Das transformierte JSON erscheint darunter und kann kopiert werden.

Die Transformation erzeugt für jede Zeile ein JSON mit grundlegenden Informationen zum Produktionsauftrag.
