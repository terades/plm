// js/views/bomView.js

console.log("[bomView] Skript wird geladen."); // Log: Skript-Start

// Simulierte BOM-Datenstruktur
const simulatedBomData = [
    {
        id: 'item-1-1', item: 'Endprodukt XYZ', version: '1.0', quantity: 1,
        children: [
            { id: 'item-2-1-1', item: 'Baugruppe A', version: '1.2', quantity: 1, children: [] },
            {
                id: 'item-2-1-2', item: 'Baugruppe B', version: '2.0', quantity: 2,
                children: [
                    { id: 'item-3-2-2-1', item: 'Teil B1', version: '1.0', quantity: 3, children: [] },
                    { id: 'item-3-2-2-2', item: 'Teil B2', version: '1.1', quantity: 2, children: [] }
                ]
            }
        ]
    }
];

// Helfer-Maps
const itemMap = new Map();
const childrenMap = new Map();

function buildHelperMaps(items) {
    items.forEach(item => {
        itemMap.set(item.id, item);
        if (item.children && item.children.length > 0) {
            childrenMap.set(item.id, item.children);
            buildHelperMaps(item.children);
        } else {
            childrenMap.set(item.id, []);
        }
    });
}
buildHelperMaps(simulatedBomData);

// Gibt die Items für den aktuellen Pfad zurück
function getItemsForPath(path) {
    if (!path || path.length === 0) return simulatedBomData;
    const lastId = path[path.length - 1];
    return childrenMap.get(lastId) || [];
}

// Renderfunktion
function render(containerElement, productId = null, pathArr = []) {
    const navigationPath = Array.isArray(pathArr) ? pathArr : [];
    const itemsToDisplay = getItemsForPath(navigationPath);

    // Breadcrumb-HTML erzeugen
    let breadcrumbHtml = '';
    if (navigationPath.length > 0) {
        let pathSoFar = [];
        breadcrumbHtml = `<nav class="mb-4 text-sm text-gray-600 dark:text-gray-300"><span class="font-semibold">Pfad:</span> `;
        breadcrumbHtml += `<a href="#" class="hover:underline" data-bom-breadcrumb="root">Wurzel</a>`;
        navigationPath.forEach((id, idx) => {
            pathSoFar.push(id);
            const item = itemMap.get(id);
            if (item) {
                breadcrumbHtml += ` <span class="mx-1">/</span> <a href="#" class="hover:underline" data-bom-breadcrumb="${idx}">${item.item}</a>`;
            }
        });
        breadcrumbHtml += `</nav>`;
    }

    // HTML für Karten erzeugen
    let cardsHtml = '';
    if (itemsToDisplay.length > 0) {
        cardsHtml = itemsToDisplay.map(item => {
            const hasChildren = childrenMap.get(item.id)?.length > 0;
            return `
                <div class="bg-gray-100 dark:bg-gray-600 p-4 rounded-md shadow-sm flex flex-col ${hasChildren ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-500 transition' : ''}"
                    ${hasChildren ? `data-item-id="${item.id}" data-action="drill-down"` : ''}>
                    <div class="flex justify-between items-center mb-2">
                        <span class="font-semibold text-gray-800 dark:text-gray-100">${item.item}</span>
                        ${hasChildren
                            ? `<span class="text-blue-500 dark:text-blue-300 text-sm">${childrenMap.get(item.id).length} Unterteile</span>`
                            : '<span class="text-gray-500 dark:text-gray-400 text-sm">Keine Unterteile</span>'
                        }
                    </div>
                    <div class="text-sm text-gray-600 dark:text-gray-300">
                        <p><strong>ID:</strong> ${item.id}</p>
                        <p><strong>Version:</strong> ${item.version}</p>
                        <p><strong>Menge:</strong> ${item.quantity}</p>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        cardsHtml = '<p class="text-gray-600 dark:text-gray-300">Keine Unterteile auf dieser Ebene gefunden.</p>';
    }

    // Gesamtes BOM-HTML inkl. Breadcrumb
    const bomHtml = `
        <h2 class="text-2xl font-semibold mb-4">Stückliste (Simulation)</h2>
        <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 dark:bg-gray-700">
            ${breadcrumbHtml}
            <p class="text-gray-700 mb-4 dark:text-gray-300">
                Dies ist eine <b>simulierte</b> interaktive Stücklistenansicht in Kartenform.<br>
                Klicken Sie auf eine Karte, um tiefer in die Struktur einzusteigen.
            </p>
            ${navigationPath.length > 0 ? `
                <div class="mb-4">
                    <button class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500" id="bom-back-btn">&larr; Zurück</button>
                </div>
            ` : ''}
            <div id="bom-cards-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                ${cardsHtml}
            </div>
            <div class="mt-6">
                <button class="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition" id="back-to-dashboard-btn">Zurück zum Dashboard</button>
            </div>
        </div>
    `;
    containerElement.innerHTML = bomHtml;

    // Breadcrumb-Click-Handler
    const breadcrumbNav = containerElement.querySelector('nav');
    if (breadcrumbNav) {
        breadcrumbNav.addEventListener('click', (e) => {
            const link = e.target.closest('[data-bom-breadcrumb]');
            if (link) {
                e.preventDefault();
                const idx = link.getAttribute('data-bom-breadcrumb');
                if (idx === "root") {
                    window.router.goToBom([]);
                } else {
                    const newPath = navigationPath.slice(0, Number(idx) + 1);
                    window.router.goToBom(newPath);
                }
            }
        });
    }

    // Event Delegation für Karten
    const cardsContainer = document.getElementById('bom-cards-container');
    if (cardsContainer) {
        cardsContainer.onclick = function(event) {
            const card = event.target.closest('[data-action="drill-down"]');
            if (!card) return;
            const itemId = card.dataset.itemId;
            if (itemId && childrenMap.get(itemId)?.length > 0) {
                window.router.goToBom([...navigationPath, itemId]);
            }
        };
    }

    // "Zurück"-Button
    const backBtn = document.getElementById('bom-back-btn');
    if (backBtn) backBtn.onclick = function(event) {
        event.preventDefault();
        if (navigationPath.length > 0) {
            window.router.goToBom(navigationPath.slice(0, -1));
        }
    };

    // "Zurück zum Dashboard"
    const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');
    if (backToDashboardBtn) backToDashboardBtn.onclick = function(event) {
        event.preventDefault();
        window.router.goBackToDashboard();
    };
}

// Nur noch die Renderfunktion exportieren
window.bomView = { render };

console.log("[bomView] Skript-Ladevorgang abgeschlossen. bomView.render() global verfügbar.");
