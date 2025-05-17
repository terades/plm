// js/views/settingsView.js

// Rendert die simulierte Einstellungsansicht
function render(containerElement) {
    const settingsHtml = `
        <h2 class="text-2xl font-semibold mb-4">Einstellungen (Simulation)</h2>
         <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 dark:bg-gray-700">
            <p class="text-gray-700 mb-4 dark:text-gray-300">
                Dies ist eine simulierte Einstellungsseite.
                In einem echten System könnten hier Benutzerprofile,
                Anwendungspräferenzen, Berechtigungen etc. konfiguriert werden.
            </p>
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                 <h3 class="lg font-semibold mb-2">Beispiel Einstellungen:</h3>
                 <p class="text-gray-900 dark:text-gray-100">Sprache: Deutsch</p>
                 <p class="text-900 dark:text-gray-100">Standardansicht nach Login: Dashboard</p>
                 </div>

             <div class="mt-6"> <button class="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition" id="back-to-dashboard-btn">Zurück zum Dashboard</button>
            </div>
        </div>
    `;

    window.domUtils.setElementContent(containerElement.id, settingsHtml);

     // Event Listener für Zurück-Button
     const backToDashboardButton = document.getElementById('back-to-dashboard-btn');
     if(backToDashboardButton) {
        backToDashboardButton.addEventListener('click', () => {
             window.router.goBackToDashboard();
         });
     }
}

// Macht die Renderfunktion global verfügbar
window.settingsView = {
    render
};
