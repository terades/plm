// js/views/documentsView.js

// Rendert die simulierte Dokumentenansicht
// Akzeptiert optional eine productId, falls man Dokumente zu einem spezifischen Produkt zeigen möchte
function render(containerElement, productId = null) {
    const productInfo = productId ? ` für Produkt ${productId}` : '';
    const documentsHtml = `
        <h2 class="text-2xl font-semibold mb-4">Dokumente (Simulation${productInfo})</h2>
         <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 dark:bg-gray-700">
            <p class="text-gray-700 mb-4 dark:text-gray-300">
                Dies ist eine simulierte Ansicht der verknüpften Dokumente.
                In einem echten PLM-System könnten hier Spezifikationen,
                Zeichnungen, Prüfberichte, Zertifikate etc. gelistet und verwaltet werden.
            </p>
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                 <h3 class="lg font-semibold mb-2">Beispielhafte Dokumente:</h3>
                 <ul class="list-disc list-inside text-gray-900 dark:text-gray-100">
                     <li><a href="#" class="text-blue-600 hover:underline dark:text-blue-400">Datenblatt_V1.2.pdf</a></li>
                     <li><a href="#" class="text-blue-600 hover:underline dark:text-blue-400">3D_Modell.stp</a></li>
                     <li><a href="#" class="text-blue-600 hover:underline dark:text-blue-400">Fertigungsanleitung.docx</a></li>
                 </ul>
            </div>

             <div class="mt-6"> <button class="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition" id="back-to-dashboard-btn">Zurück zum Dashboard</button>
            </div>
        </div>
    `;

    window.domUtils.setElementContent(containerElement.id, documentsHtml);

    // Event Listener für Zurück-Button
     const backToDashboardButton = document.getElementById('back-to-dashboard-btn');
     if(backToDashboardButton) {
        backToDashboardButton.addEventListener('click', () => {
             window.router.goBackToDashboard();
         });
     }
}

// Macht die Renderfunktion global verfügbar
window.documentsView = {
    render
};
