// js/views/productDetailsView.js

// Rendert die Produktdetailansicht
function render(containerElement, productId) {
    const product = window.state.getProductById(productId); // Produkt aus dem State holen

    if (!product) {
        window.domUtils.setElementContent(containerElement.id, '<p class="text-red-600 dark:text-red-400">Produkt nicht gefunden.</p>');
        return;
    }

    const detailsHtml = `
        <h2 class="text-2xl font-semibold mb-4">Produktdetails: ${product.name} (${product.id})</h2>

        <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 dark:bg-gray-700">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p class="text-gray-700 text-sm font-bold mb-1 dark:text-gray-300">Produkt-ID:</p>
                    <p class="text-gray-900 dark:text-gray-100">${product.id}</p>
                </div>
                 <div>
                    <p class="text-gray-700 text-sm font-bold mb-1 dark:text-gray-300">Produktname:</p>
                    <p class="text-gray-900 dark:text-gray-100">${product.name}</p>
                </div>
                 <div>
                    <p class="text-gray-700 text-sm font-bold mb-1 dark:text-gray-300">Version:</p>
                    <p class="text-gray-900 dark:text-gray-100">${product.version}</p>
                </div>
                <div>
                    <p class="text-gray-700 text-sm font-bold mb-1 dark:text-gray-300">Status:</p>
                     <p>
                        <span class="${window.domUtils.getStatusBadgeClass(product.status)}">
                            ${product.status}
                        </span>
                    </p>
                </div>
                 <div>
                    <p class="text-gray-700 text-sm font-bold mb-1 dark:text-gray-300">Erstelldatum:</p>
                    <p class="text-gray-900 dark:text-gray-100">${product.creationDate}</p>
                </div>
                <div>
                    <p class="text-gray-700 text-sm font-bold mb-1 dark:text-gray-300">Letzte Änderung:</p>
                    <p class="text-gray-900 dark:text-gray-100">${product.lastChangeDate}</p>
                </div>
            </div>

            <div class="mt-4">
                <p class="text-gray-700 text-sm font-bold mb-1 dark:text-gray-300">Beschreibung:</p>
                <p class="text-gray-900 dark:text-gray-100">${product.description || '-'}</p>
            </div>

             <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                    <p class="text-gray-700 text-sm font-bold mb-1 dark:text-gray-300">Material:</p>
                    <p class="text-gray-900 dark:text-gray-100">${product.material || '-'}</p>
                </div>
                <div>
                    <p class="text-gray-700 text-sm font-bold mb-1 dark:text-gray-300">Lieferant:</p>
                    <p class="text-gray-900 dark:text-gray-100">${product.supplier || '-'}</p>
                </div>
            </div>

            <div class="mt-4">
                 <p class="text-gray-700 text-sm font-bold mb-1 dark:text-gray-300">Technische Zeichnung / Dokument:</p>
                 <p class="text-gray-900 dark:text-gray-100">${product.drawingFileName ? product.drawingFileName : '-'}</p>
                 </div>

            <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                 <h3 class="text-lg font-semibold mb-2">Stückliste (Platzhalter)</h3>
                 <p class="text-gray-500 italic dark:text-gray-400">Hier würde eine hierarchische Liste von Kind-Komponenten stehen.</p>
                 <ul class="list-disc list-inside text-gray-900 dark:text-gray-100">
                     <li>Komponente Alpha (COM-001) - v1.1</li>
                     <li>Baugruppe Beta (ASSY-005) - v2.0
                         <ul class="list-circle list-inside ml-4">
                            <li>Teil Gamma (PART-010)</li>
                            <li>Teil Delta (PART-011)</li>
                         </ul>
                     </li>
                 </ul>
            </div>

             <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                 <h3 class="text-lg font-semibold mb-2">Verknüpfte Dokumente (Platzhalter)</h3>
                 <p class="text-gray-500 italic dark:text-gray-400">Hier würde eine Liste verknüpfter Dokumente stehen.</p>
                 <ul class="list-disc list-inside text-gray-900 dark:text-gray-100">
                     <li><a href="#" class="text-blue-600 hover:underline dark:text-blue-400">Produktspezifikation.pdf</a></li>
                     <li><a href="#" class="text-blue-600 hover:underline dark:text-blue-400">Prüfprotokoll_2023.xlsx</a></li>
                 </ul>
            </div>


            <div class="mt-6 flex space-x-4"> <button class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition" id="edit-product-btn" data-product-id="${product.id}">Bearbeiten</button>
                 <button class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition" id="archive-product-btn" data-product-id="${product.id}">Archivieren</button>
                 <button class="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition" id="back-to-dashboard-btn">Zurück zum Dashboard</button>
            </div>
        </div>
    `;

    window.domUtils.setElementContent(containerElement.id, detailsHtml);

    // Event Listener für Bearbeiten-Button
    const editProductButton = document.getElementById('edit-product-btn');
    if(editProductButton) {
        editProductButton.addEventListener('click', (event) => {
             const id = event.target.dataset.productId;
             window.router.navigateTo('edit', { productId: id });
         });
    }

    // Event Listener für Archivieren-Button
    const archiveProductButton = document.getElementById('archive-product-btn');
     if(archiveProductButton) {
         archiveProductButton.addEventListener('click', (event) => {
              const id = event.target.dataset.productId;
             if (confirm(`Produkt ${id} wirklich archivieren?`)) {
                 if (window.state.archiveProduct(id)) {
                     alert('Produkt erfolgreich archiviert.');
                      window.router.goBackToDashboard(); // Nach Archivieren zum Dashboard
                 } else {
                     alert('Fehler beim Archivieren des Produkts.');
                 }
             }
         });
     }


     // Event Listener für Zurück-Button
     const backToDashboardButton = document.getElementById('back-to-dashboard-btn');
     if(backToDashboardButton) {
        backToDashboardButton.addEventListener('click', () => {
             window.router.goBackToDashboard();
         });
     }

}

// Macht die Renderfunktion global verfügbar
window.productDetailsView = {
    render
};
