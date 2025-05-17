// js/views/dashboardView.js

// Rendert das Produkt Dashboard
function render(containerElement) {
    const products = window.state.getAllProducts(); // Daten aus dem State holen

    let dashboardHtml = `
        <h2 class="text-2xl font-semibold mb-4">Produkt Dashboard</h2>

        <div class="mb-4">
            <input type="text" id="product-search" placeholder="Nach Name oder ID filtern..." class="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
        </div>

        <div id="product-list">
            ${renderProductTable(products)}
        </div>
    `;

    window.domUtils.setElementContent(containerElement.id, dashboardHtml);

    // Event Listener für die Suche hinzufügen
    const productSearchInput = document.getElementById('product-search');
    if(productSearchInput) {
        productSearchInput.addEventListener('input', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            const allProducts = window.state.getAllProducts(); // Immer aktuelle Daten holen
            const filteredProducts = allProducts.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.id.toLowerCase().includes(searchTerm)
            );
            window.domUtils.setElementContent('product-list', renderProductTable(filteredProducts));
        });
    }


     // Event Delegation für Klicks auf ID, Bearbeiten, Status ändern, Archivieren
    // Wir fügen den Listener zum Elternelement #product-list hinzu, nachdem es gerendert wurde.
     const productListElement = document.getElementById('product-list');
     if (productListElement) {
         productListElement.addEventListener('click', (event) => {
             const target = event.target;
             const productId = target.dataset.productId;

             if (!productId) return; // Kein data-product-id Attribut gefunden

             if (target.classList.contains('product-id-link')) { // Klick auf Produkt-ID (neue Klasse)
                 window.router.navigateTo('details', { productId: productId });
             } else if (target.classList.contains('edit-button')) {
                  window.router.navigateTo('edit', { productId: productId });
             } else if (target.classList.contains('status-button')) {
                  const newStatus = prompt("Neuen Status eingeben (z.B. In Entwicklung, Freigegeben, Archiviert):");
                  if (newStatus) {
                      // Optional: Überprüfen, ob der neue Status einer der erlaubten Statuswerte ist
                       const validStatuses = ['In Entwicklung', 'Review', 'Freigegeben', 'Abgekündigt', 'Archiviert'];
                       if (!validStatuses.includes(newStatus)) {
                            alert(`Ungültiger Status "${newStatus}". Erlaubt sind: ${validStatuses.join(', ')}`);
                            return; // Eingabe ungültig, abbrechen
                       }

                       if (window.state.updateProductStatus(productId, newStatus)) {
                            // Nur die Tabelle neu rendern, nicht die ganze Ansicht
                            const updatedProducts = window.state.getAllProducts();
                            window.domUtils.setElementContent('product-list', renderProductTable(updatedProducts));
                       } else {
                            alert("Fehler beim Ändern des Status.");
                       }
                  }
             } else if (target.classList.contains('archive-button')) {
                 if (confirm(`Produkt ${productId} wirklich archivieren?`)) {
                      if (window.state.archiveProduct(productId)) {
                          // Nur die Tabelle neu rendern
                           const updatedProducts = window.state.getAllProducts();
                           window.domUtils.setElementContent('product-list', renderProductTable(updatedProducts));
                      } else {
                          alert("Fehler beim Archivieren des Produkts.");
                      }
                 }
             }
         });
     } else {
          console.error("Element #product-list nicht gefunden nach Rendering.");
     }
}

// Hilfsfunktion zum Rendern der Produktliste als Tabelle
function renderProductTable(productsToRender) {
    if (productsToRender.length === 0) {
        return '<p class="text-center text-gray-500 dark:text-gray-400">Keine Produkte gefunden.</p>';
    }

    let tableHtml = `
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white shadow-md rounded dark:bg-gray-700">
                <thead>
                    <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal dark:bg-gray-600 dark:text-gray-300">
                        <th class="py-3 px-6 text-left">ID</th>
                        <th class="py-3 px-6 text-left">Name</th>
                        <th class="py-3 px-6 text-left">Version</th>
                        <th class="py-3 px-6 text-left">Status</th>
                        <th class="py-3 px-6 text-left">Letzte Änderung</th>
                        <th class="py-3 px-6 text-center">Aktionen</th>
                    </tr>
                </thead>
                <tbody class="text-gray-600 text-sm font-light dark:text-gray-200">
                    ${productsToRender.map(product => `
                        <tr class="border-b border-gray-200 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600">
                            <td class="py-3 px-6 text-left whitespace-nowrap cursor-pointer text-blue-600 hover:underline dark:text-blue-400 product-id-link" data-product-id="${product.id}">${product.id}</td>
                            <td class="py-3 px-6 text-left">${product.name}</td>
                            <td class="py-3 px-6 text-left">${product.version}</td>
                            <td class="py-3 px-6 text-left">
                                <span class="${window.domUtils.getStatusBadgeClass(product.status)}">
                                    ${product.status}
                                </span>
                            </td>
                            <td class="py-3 px-6 text-left">${product.lastChangeDate}</td>
                            <td class="py-3 px-6 text-center">
                                <button class="action-button edit-button px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 mr-2" data-product-id="${product.id}">Bearbeiten</button>
                                <button class="action-button status-button px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 mr-2" data-product-id="${product.id}">Status ändern</button>
                                <button class="action-button archive-button px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600" data-product-id="${product.id}">Archivieren</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    return tableHtml;
}

// Macht die Renderfunktion global verfügbar
window.dashboardView = {
    render
};
