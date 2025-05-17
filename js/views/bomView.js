// js/views/bomView.js

console.log("[bomView] Skript wird geladen."); // Log: Skript-Start

// Simulierte, fest definierte BOM-Datenstruktur für die Demo mit eindeutigen IDs.
// Diese Struktur ist hierarchisch und repräsentiert die Einrückungsebenen.
// ID-Konvention: 'item-[Level]-[Index]' oder 'item-[Level]-[ParentIndex]-[Index]'
const simulatedBomData = [
    {
        id: 'item-1-1', item: 'Endprodukt XYZ', version: '1.0', quantity: 1,
        children: [
            { id: 'item-2-1-1', item: 'Baugruppe A', version: '1.2', quantity: 1, children: [] },
            {
                id: 'item-2-1-2', item: 'Baugruppe B', version: '2.0', quantity: 2,
                children: [
                    { id: 'item-3-2-1', item: 'Teil 1', version: 'A', quantity: 5, children: [] },
                    { id: 'item-3-2-2', item: 'Teil 2', version: 'B', quantity: 1, children: [] }
                ]
            },
            { id: 'item-2-1-3', item: 'Einkaufsteil C', version: '3.1', quantity: 1, children: [] }
        ]
    },
     { // Ein weiteres Top-Level-Produkt zur Demonstration
        id: 'item-1-2', item: 'Produkt ABC', version: 'A.01', quantity: 1,
        children: [
             { id: 'item-2-2-1', item: 'Komponente X', version: '1.0', quantity: 3, children: [] }
        ]
     }
];

// Interner Zustand: Verfolgt den Navigationspfad (die IDs der übergeordneten Elemente).
// Ein leeres Array bedeutet, dass wir die Top-Level-Elemente anzeigen.
let navigationHistory = []; // Array<string>

// Helfer-Maps für schnellen Zugriff auf Items und ihre Kinder.
// Wird einmal beim Laden des Skripts aufgebaut.
const itemMap = new Map(); // Map<ItemID, ItemObject>
const childrenMap = new Map(); // Map<ItemID, Array<ItemObject>> (speichert die Kinder jedes Items)

// Rekursive Funktion zum Aufbau der Helfer-Maps
function buildHelperMaps(items) {
    items.forEach(item => {
        itemMap.set(item.id, item);
        if (item.children && item.children.length > 0) {
            childrenMap.set(item.id, item.children);
            buildHelperMaps(item.children); // Rekursiver Aufruf für Kinder
        } else {
             childrenMap.set(item.id, []); // Sicherstellen, dass auch Items ohne Kinder in childrenMap sind
        }
    });
}

// Baue die Maps beim Laden des Skripts
buildHelperMaps(simulatedBomData);
console.log("[bomView] Helper maps aufgebaut.");
// console.log("itemMap:", itemMap); // Debug
// console.log("childrenMap:", childrenMap); // Debug


// Funktion, die die Items für den gegebenen Navigationspfad zurückgibt.
// Der Pfad ist ein Array von Item-IDs vom Top-Level abwärts.
// Gibt die Kinder des letzten Items im Pfad zurück, oder die Top-Level-Items, wenn der Pfad leer ist.
function getItemsForPath(path) {
    if (path.length === 0) {
        return simulatedBomData; // Top-Level
    }

    const lastItemIdInPath = path[path.length - 1];
    // Nutze childrenMap für schnellen Zugriff
    const children = childrenMap.get(lastItemIdInPath);

    if (children) {
        console.log(`[bomView] Gefundene Items für Pfad (Kinder von ${lastItemIdInPath}):`, children);
        return children;
    } else {
        console.warn(`[bomView] Keine Kinder gefunden für Item ID im Pfad: ${lastItemIdInPath}. Pfad:`, path);
        return []; // Leeres Array, wenn das letzte Item im Pfad keine Kinder hat
    }
}


// Funktion zum Rendern der interaktiven, kartenbasierten Stücklistenansicht.
function render(containerElement, productId = null) {
    console.log(`[bomView] Starte Rendering der kartenbasierten BOM-Ansicht für Produkt ID: ${productId}. Aktueller Pfad:`, navigationHistory);

    // Hole Produktdetails für den Titel, falls eine ID übergeben wurde.
    const product = productId ? window.state.getProductById(productId) : null;
    const productInfo = product ? ` für Produkt ${product.name} (${product.id})` : '';
    const title = `Stückliste (Simulation${productInfo})`;

    // Baue das Grundgerüst der Ansicht auf.
    const bomHtml = `
        <h2 class="text-2xl font-semibold mb-4">${title}</h2>
        <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 dark:bg-gray-700">
            <p class="text-gray-700 mb-4 dark:text-gray-300">
                Dies ist eine **simulierte** interaktive Stücklistenansicht in Kartenform.
                Klicken Sie auf eine Karte, um tiefer in die Struktur einzusteigen.
            </p>

            ${navigationHistory.length > 0 ?
               // "Zurück" Button, wenn nicht auf Top-Level
              `<div class="mb-4">
                 <button class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500" id="bom-back-btn">&larr; Zurück</button>
               </div>`
              : '' // Kein Zurück-Button auf Top-Level
            }

            <div id="bom-cards-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                </div>

            <div class="mt-6">
                 <button class="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition" id="back-to-dashboard-btn">Zurück zum Dashboard</button>
            </div>
        </div>
    `;

    // Füge das Grundgerüst in den Container ein.
    window.domUtils.setElementContent(containerElement.id, bomHtml);
    console.log("[bomView] Kartenbasiertes BOM-Grundgerüst in contentArea eingefügt.");

    // Holen Sie sich die Referenzen auf die Container und Buttons
    const cardsContainer = document.getElementById('bom-cards-container');
    const backBtn = document.getElementById('bom-back-btn');
    const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');

    // Fügen Sie Event Delegation für Klicks auf die Karten im Container hinzu
    if (cardsContainer) {
        console.log("[bomView] Karten-Container gefunden. Füge Event Listener hinzu.");
        cardsContainer.addEventListener('click', handleCardClick);

        // Holen Sie sich die Items für das aktuelle Level
        const itemsToDisplay = getItemsForPath(navigationHistory);
        console.log("[bomView] Items für das aktuelle Level zum Anzeigen:", itemsToDisplay);


        if (itemsToDisplay.length > 0) {
            // Erstelle und füge die Karten-Elemente hinzu (performanter als innerHTML +=)
            const fragment = document.createDocumentFragment(); // Temporäres Fragment

            itemsToDisplay.forEach(item => {
                 // Prüfe, ob das Item Kinder hat, indem wir in childrenMap nachsehen
                 const hasChildren = childrenMap.has(item.id) && childrenMap.get(item.id).length > 0;

                 // Erstelle das DOM-Element für eine einzelne Karte
                 const cardElement = document.createElement('div');
                 cardElement.classList.add('bg-gray-100', 'dark:bg-gray-600', 'p-4', 'rounded-md', 'shadow-sm', 'flex', 'flex-col');

                 // Füge data-Attribute hinzu, wenn die Karte klickbar sein soll (also Kinder hat)
                 if (hasChildren) {
                     cardElement.classList.add('cursor-pointer', 'hover:bg-gray-200', 'dark:hover:bg-gray-500', 'transition');
                     cardElement.dataset.itemId = item.id; // Item ID für Drill-down
                     cardElement.dataset.action = 'drill-down'; // Aktionstyp
                 }

                 cardElement.innerHTML = `
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-semibold text-gray-800 dark:text-gray-100">${item.item}</span>
                            ${hasChildren ?
                               // Indicator für aufklappbare Karten
                              `<span class="text-blue-500 dark:text-blue-300 text-sm">${childrenMap.get(item.id).length} Unterteile</span>`
                              : '<span class="text-gray-500 dark:text-gray-400 text-sm">Keine Unterteile</span>'
                           }
                        </div>
                        <div class="text-sm text-gray-600 dark:text-gray-300">
                            <p><strong>ID:</strong> ${item.id}</p>
                            <p><strong>Version:</strong> ${item.version}</p>
                            <p><strong>Menge:</strong> ${item.quantity}</p>
                        </div>
                 `;
                 fragment.appendChild(cardElement); // Füge die Karte zum Fragment hinzu
            });

            cardsContainer.appendChild(fragment); // Füge das Fragment (mit allen Karten) dem DOM hinzu
            console.log("[bomView] BOM-Karten DOM-Rendering abgeschlossen.");


        } else {
             // Keine Items auf diesem Level gefunden
             console.log("[bomView] Keine Items für das aktuelle Level gefunden.");
              cardsContainer.innerHTML = '<p class="text-gray-600 dark:text-gray-300">Keine Unterteile auf dieser Ebene gefunden.</p>';
        }

    } else {
         console.error("[bomView] Element #bom-cards-container NICHT gefunden nach Rendering.");
    }


    // Event Listener für den "Zurück" Button (innerhalb der BOM-Ansicht)
    if (backBtn) {
        console.log("[bomView] 'Zurück' Button Listener hinzugefügt.");
        backBtn.addEventListener('click', handleBackClick);
    }

     // Event Listener für den "Zurück zum Dashboard" Button.
     if(backToDashboardBtn) {
        console.log("[bomView] Zurück zum Dashboard Button Listener hinzugefügt.");
        backToDashboardBtn.addEventListener('click', handleBackToDashboardClick);
     } else {
          console.warn("[bomView] Zurück zum Dashboard Button NICHT gefunden.");
     }


     console.log(`[bomView] Rendering der kartenbasierten BOM-Ansicht abgeschlossen.`);

}

// Event Handler für Klicks auf Karten (delegiert vom cardsContainer)
function handleCardClick(event) {
    const target = event.target;
    console.log("[bomView] Karten-Container Klick Event ausgelöst. Geklickt auf:", target);

    // Finde die geklickte Karte, die zum Rein-Drillen markiert ist
    // Nutze .closest(), um sicherzustellen, dass wir die Karte selbst bekommen, auch wenn auf Kind-Elemente geklickt wird
    const clickedCard = target.closest('[data-action="drill-down"]');

    if (clickedCard) {
        console.log("[bomView] Klick erfolgte auf eine drill-down Karte:", clickedCard);
        // Verhindere Standardaktionen und Event-Weitergabe.
        // Obwohl ein div/span/etc. keine Standardaktion hat, ist stopPropagation wichtig
        // um zu verhindern, dass der Klick den Header-Listener in app.js erreicht (falls der aggressive Listener fehlt oder umgangen wird).
        event.preventDefault(); // Verhindert z.B. Textselektion bei schnellem Doppelklick
        event.stopPropagation(); // WICHTIG: Verhindert Durchdringen zu übergeordneten Listenern

        const itemId = clickedCard.dataset.itemId; // Hol die Item ID aus dem data-Attribut
        console.log("[bomView] Drill-down auf Item ID:", itemId);

        // Prüfe, ob das Item tatsächlich Kinder hat, bevor wir den Pfad ändern (Doppelprüfung zur Sicherheit)
        const item = itemMap.get(itemId);
        if (item && childrenMap.has(item.id) && childrenMap.get(item.id).length > 0) {
             console.log(`[bomView] Item ${itemId} hat Kinder. Füge ID zum Pfad hinzu.`);
            navigationHistory.push(itemId); // Füge die Item ID zum Navigationspfad hinzu
            console.log("[bomView] Navigationspfad aktualisiert:", navigationHistory);
            // Rendere die Ansicht neu mit dem neuen Pfad
            // Wir benötigen eine Referenz auf den Content-Bereich, diese muss von render bereitgestellt werden.
            // Da wir wissen, dass es immer #content-area ist:
             const contentArea = document.getElementById('content-area');
             if (contentArea) {
                render(contentArea); // Rufe die Renderfunktion erneut auf
             } else {
                 console.error("[bomView] contentArea für Re-Rendering nach Drill-down nicht gefunden!");
             }

        } else {
             console.log("[bomView] Item hat keine Kinder, kein Drill-down möglich oder bereits auf tiefster Ebene.", item);
             // Optional: Feedback an den Benutzer geben, dass es keine Unterteile gibt oder dies das Ende der Hierarchie ist
        }

    } else {
         // Klick kam im cardsContainer, aber nicht auf eine klickbare Karte (z.B. Zwischenraum oder Karte ohne Kinder)
         console.log("[bomView] Klick im Karten-Container war nicht auf eine drill-down Karte. Ignoriere.");
    }
}

// Event Handler für den "Zurück" Button (innerhalb der BOM-Ansicht)
function handleBackClick(event) {
    console.log("[bomView] 'Zurück' Button geklickt.");
    // Stoppe Event-Weitergabe
    event.preventDefault();
    event.stopPropagation();

    if (navigationHistory.length > 0) {
        const poppedId = navigationHistory.pop(); // Entferne das letzte Element aus dem Pfad
        console.log(`[bomView] Entfernte ${poppedId} aus dem Pfad.`);
        console.log("[bomView] Navigationspfad aktualisiert (Zurück):", navigationHistory);
        // Rendere die Ansicht neu mit dem kürzeren Pfad
        const contentArea = document.getElementById('content-area');
         if (contentArea) {
            render(contentArea); // Rufe die Renderfunktion erneut auf
         } else {
             console.error("[bomView] contentArea für Re-Rendering nach 'Zurück' nicht gefunden!");
         }

    } else {
        console.warn("[bomView] 'Zurück' geklickt auf Top-Level. Sollte nicht passieren.");
    }
}

// Event Handler für den "Zurück zum Dashboard" Button
function handleBackToDashboardClick(event) {
    console.log("[bomView] Zurück zum Dashboard Button geklickt.");
    // Stoppe Event-Weitergabe
    event.preventDefault();
    event.stopPropagation();

    navigationHistory = []; // Setzt den Pfad zurück beim Verlassen der Ansicht
    console.log("[bomView] Navigationspfad zurückgesetzt beim Verlassen.");
    window.router.goBackToDashboard(); // Navigiert über den Router
    console.log("[bomView] Navigiere zum Dashboard über Router.");
}


// Macht die Renderfunktion global verfügbar.
window.bomView = {
    render
};

console.log("[bomView] Skript-Ladevorgang abgeschlossen. bomView.render() global verfügbar."); // Log: Skript-Ende
