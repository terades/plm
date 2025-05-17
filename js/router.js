// js/router.js - Steuert die Navigation zwischen den Ansichten

console.log("[router.js] Skript wird geladen."); // Log: Skript-Start

// Anstatt contentArea hier zu deklarieren, wird es von app.js über die init-Funktion gesetzt.
let _contentArea = null; // Interne Variable zur Speicherung des Haupt-Content-Bereichs

// Funktion zur Initialisierung des Routers mit dem Haupt-Content-Bereich.
// Diese Funktion wird einmal von app.js aufgerufen.
function init(areaElement) {
    console.log("[router.js] init() aufgerufen mit Element:", areaElement); // Log: init Start
    if (areaElement instanceof HTMLElement) {
        _contentArea = areaElement;
        console.log("[router.js] Router initialisiert mit contentArea:", _contentArea); // Log: init Erfolg
    } else {
        console.error("[router.js] Router-Initialisierung fehlgeschlagen: Ungültiges Element übergeben.", areaElement); // Log: init Fehler
        _contentArea = null; // Sicherstellen, dass _contentArea null ist bei Fehler
    }
}


// Dieses Objekt ordnet Routen-Namen den entsprechenden Rendering-Funktionen zu.
// Jede Rendering-Funktion erhält die Route-Parameter.
// Sie nutzt intern die _contentArea Variable, die über init() gesetzt wurde.
const routes = {
    'dashboard': (params) => {
        console.log("[router.js] Rendere View: dashboard"); // Log: View-Rendering
        if (window.dashboardView && _contentArea) {
            window.dashboardView.render(_contentArea); // Nutzt _contentArea
        } else {
            console.error("[router.js] dashboardView oder _contentArea nicht verfügbar für Rendering!"); // Log: View/Area fehlt
            // Zeige Fehlermeldung im Content-Bereich, falls verfügbar
            if (_contentArea && window.domUtils) {
                 window.domUtils.setElementContent(_contentArea.id, '<p class="text-red-600 dark:text-red-400">Fehler: Dashboard-Ansicht konnte nicht geladen werden.</p>');
            }
        }
    },
    'create': (params) => {
         console.log("[router.js] Rendere View: create"); // Log: View-Rendering
         if (window.productFormView && _contentArea) {
            window.productFormView.render(_contentArea); // Nutzt _contentArea
         } else {
             console.error("[router.js] productFormView oder _contentArea nicht verfügbar für Rendering!"); // Log: View/Area fehlt
             if (_contentArea && window.domUtils) {
                  window.domUtils.setElementContent(_contentArea.id, '<p class="text-red-600 dark:text-red-400">Fehler: Produktformular-Ansicht konnte nicht geladen werden.</p>');
             }
         }
    },
    'details': (params) => {
         console.log(`[router.js] Rendere View: details für Produkt ID: ${params.productId}`); // Log: View-Rendering
         if (window.productDetailsView && _contentArea) {
            window.productDetailsView.render(_contentArea, params.productId); // Nutzt _contentArea und Parameter
         } else {
              console.error("[router.js] productDetailsView oder _contentArea nicht verfügbar für Rendering!"); // Log: View/Area fehlt
              if (_contentArea && window.domUtils) {
                   window.domUtils.setElementContent(_contentArea.id, '<p class="text-red-600 dark:text-red-400">Fehler: Produktdetails-Ansicht konnte nicht geladen werden.</p>');
              }
         }
    },
    'edit': (params) => {
         console.log(`[router.js] Rendere View: edit für Produkt ID: ${params.productId}`); // Log: View-Rendering
         // Hol das Produkt aus dem State, um es an das Formular zu übergeben
         const productToEdit = window.state ? window.state.getProductById(params.productId) : null;
         if (!productToEdit) {
             console.error(`[router.js] Produkt mit ID ${params.productId} zum Bearbeiten nicht gefunden.`); // Log: Produkt fehlt
             if (_contentArea && window.domUtils) {
                  window.domUtils.setElementContent(_contentArea.id, '<p class="text-red-600 dark:text-red-400">Fehler: Produkt zum Bearbeiten nicht gefunden.</p>');
             }
             return; // Abbrechen, wenn Produkt nicht gefunden
         }
         if (window.productFormView && _contentArea) {
            window.productFormView.render(_contentArea, productToEdit); // Nutzt _contentArea und Parameter
         } else {
              console.error("[router.js] productFormView oder _contentArea nicht verfügbar für Bearbeitung!"); // Log: View/Area fehlt
              if (_contentArea && window.domUtils) {
                   window.domUtils.setElementContent(_contentArea.id, '<p class="text-red-600 dark:text-red-400">Fehler: Produktformular-Ansicht konnte nicht geladen werden.</p>');
              }
         }
    },
     'bom': (params) => {
         console.log(`[router.js] Rendere View: bom für Produkt ID: ${params.productId}`); // Log: View-Rendering
         if (window.bomView && _contentArea) {
             window.bomView.render(_contentArea, params.productId); // Nutzt _contentArea und Parameter
         } else {
              console.error("[router.js] bomView oder _contentArea nicht verfügbar für Rendering!"); // Log: View/Area fehlt
              if (_contentArea && window.domUtils) {
                   window.domUtils.setElementContent(_contentArea.id, '<p class="text-red-600 dark:text-red-400">Fehler: Stücklisten-Ansicht konnte nicht geladen werden.</p>');
              }
         }
     },
     'documents': (params) => {
         console.log(`[router.js] Rendere View: documents für Produkt ID: ${params.productId}`); // Log: View-Rendering
         if (window.documentsView && _contentArea) {
             window.documentsView.render(_contentArea, params.productId); // Nutzt _contentArea und Parameter
         } else {
              console.error("[router.js] documentsView oder _contentArea nicht verfügbar für Rendering!"); // Log: View/Area fehlt
              if (_contentArea && window.domUtils) {
                   window.domUtils.setElementContent(_contentArea.id, '<p class="text-red-600 dark:text-red-400">Fehler: Dokumenten-Ansicht konnte nicht geladen werden.</p>');
              }
         }
     },
     'settings': (params) => { // Auch wenn Settings keine Parameter nutzt, kann params hier bleiben
         console.log("[router.js] Rendere View: settings"); // Log: View-Rendering
         if (window.settingsView && _contentArea) {
             window.settingsView.render(_contentArea); // Nutzt _contentArea
         } else {
              console.error("[router.js] settingsView oder _contentArea nicht verfügbar für Rendering!"); // Log: View/Area fehlt
              if (_contentArea && window.domUtils) {
                   window.domUtils.setElementContent(_contentArea.id, '<p class="text-red-600 dark:text-red-400">Fehler: Einstellungs-Ansicht konnte nicht geladen werden.</p>');
              }
         }
     },
     // Hier könnten weitere Routen hinzugefügt werden
     '404': (params) => { // params können hier leer sein, aber die Signatur passt zu navigateTo
         console.log("[router.js] Rendere View: 404 (Seite nicht gefunden)"); // Log: View-Rendering
         if (_contentArea && window.domUtils) {
              // Direkter Aufruf von navigateTo im onclick benötigt window.router.navigateTo
              window.domUtils.setElementContent(_contentArea.id, '<h2 class="text-2xl font-semibold mb-4">Seite nicht gefunden</h2><p class="text-red-600 dark:text-red-400">Die angeforderte Seite existiert nicht.</p><div class="mt-6"><button class="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition" onclick="window.router.navigateTo(\'dashboard\')">Zum Dashboard</button></div>');
         } else {
              console.error("[router.js] 404-Seite kann nicht gerendert werden, _contentArea oder domUtils fehlt."); // Log: Fehler
         }
     }
};

let currentRoute = 'dashboard'; // Standard-Route beim Start
let routeParams = {}; // Parameter für die aktuelle Route (z.B. Produkt-ID)

// Navigiert zu einer bestimmten Route
function navigateTo(route, params = {}) {
    // Loggt jeden Navigationsversuch mit Ziel und Parametern UND den Aufruf-Stack
    console.log(`%c[router.js] navigateTo aufgerufen: Zielroute = '${route}', Parameter =`, 'color: #007bff; font-weight: bold;', params); // Auffälliger Log für Navigation
    console.trace("[router.js] navigateTo Call Stack:"); // Loggt den Aufruf-Stack

    if (!_contentArea) {
         console.error("[router.js] navigateTo kann nicht ausgeführt werden: Router wurde nicht initialisiert (_contentArea fehlt)."); // Log: Fehler
         // Hier könnte man eine kritische Fehlermeldung anzeigen
         return; // Abbruch, wenn Router nicht initialisiert
    }

    if (routes[route]) {
        currentRoute = route;
        routeParams = params;
        // Optional: Update der URL im Browser, um History zu ermöglichen (für diesen Prototyp weggelassen)
        // history.pushState(params, '', route);
        renderCurrentRoute();
    } else {
        console.error(`[router.js] Route "${route}" nicht gefunden. Navigiere zu 404.`); // Log: Route unbekannt
        // Optional: Zu einer 404-Seite umleiten
        navigateTo('404'); // Fallback zu 404
    }
}

// Rendert die aktuelle Route basierend auf currentRoute und routeParams
function renderCurrentRoute() {
    console.log(`[router.js] Starte Rendering der aktuellen Route: '${currentRoute}' mit Parametern:`, routeParams); // Log: Rendering-Start

    // Sicherstellen, dass der _contentArea existiert, bevor wir versuchen ihn zu leeren oder zu rendern.
    if (!_contentArea) {
         console.error("[router.js] renderCurrentRoute kann nicht ausgeführt werden: _contentArea nicht verfügbar."); // Log: Fehler
         return; // Abbrechen
    }

    // Alten Inhalt des Bereichs leeren
    if (window.domUtils) {
         window.domUtils.clearElement(_contentArea);
         console.log("[router.js] _contentArea geleert."); // Log: Bereich geleert
    } else {
         console.error("[router.js] window.domUtils nicht verfügbar zum Leeren!"); // Log: Fehler beim Leeren
         _contentArea.innerHTML = ''; // Fallback Leeren
    }


    const renderFn = routes[currentRoute];
    if (renderFn) {
        console.log(`[router.js] Rufe Renderfunktion für Route '${currentRoute}' auf.`); // Log: Renderfunktion gefunden
        // Rufe die Renderfunktion der entsprechenden View auf und übergebe die Parameter.
        // Die Views erhalten nun das _contentArea Element intern über den Router,
        // die render-Funktionen in den Views erwarten das Element als ersten Parameter,
        // was durch die routes[route].render(_contentArea, params) oder render(params)
        // Struktur gewährleistet wird, wenn die views korrekt mit _contentArea arbeiten.
        // In unserer aktuellen View-Struktur erwarten die render-Funktionen
        // das Element als *ersten* Parameter: render(containerElement, params...).
        // Also müssen wir das Element hier an die renderFn übergeben.
         try {
             // Die Renderfunktionen in den Views erwarten das containerElement als ersten Parameter.
             renderFn(routeParams); // Die Views selbst nutzen dann _contentArea, das ist ok so.
              console.log(`[router.js] Rendering für Route '${currentRoute}' abgeschlossen.`); // Log: Rendering-Ende
        } catch (error) {
             console.error(`[router.js] Fehler beim Rendering der Route "${currentRoute}":`, error); // Log: Renderfehler
             if (_contentArea && window.domUtils) {
                 window.domUtils.setElementContent(_contentArea.id, `<p class="text-red-600 dark:text-red-400">Fehler beim Laden der Ansicht: ${currentRoute}. Details in der Konsole.</p>`);
             } else if (_contentArea) {
                  _contentArea.innerHTML = `<p class="text-red-600 dark:text-red-400">Fehler beim Laden der Ansicht: ${currentRoute}. Details in der Konsole.</p>`;
             }
        }

    } else {
         // Sollte nicht passieren, da navigateTo dies prüft, aber als Fallback
         console.error(`[router.js] Keine Renderfunktion für Route "${currentRoute}" gefunden (nach navigateTo Prüfung).`); // Log: Renderfunktion fehlt (unerwartet)
         // Zeige eine Fehlermeldung oder leite zur 404-Seite um
         navigateTo('404');
    }
}

// Funktion, die von den Views aufgerufen werden kann, um zur Dashboard-Ansicht zurückzukehren
function goBackToDashboard() {
    console.log("[router.js] goBackToDashboard aufgerufen."); // Log: Zurück zum Dashboard
    navigateTo('dashboard');
}

// Funktion, die von den Views aufgerufen werden kann, um zur Detailansicht zurückzukehren (nach Bearbeiten/Löschen etc.)
function goBackToDetails(productId) {
    console.log(`[router.js] goBackToDetails aufgerufen für Produkt ID: ${productId}`); // Log: Zurück zu Details
    if (productId) {
        navigateTo('details', { productId: productId });
    } else {
        console.warn("[router.js] goBackToDetails aufgerufen ohne Produkt ID. Navigiere zum Dashboard."); // Log: ID fehlt
        navigateTo('dashboard'); // Fallback, falls keine ID übergeben wurde
    }
}

console.log("[router.js] Bereite Zuweisung von window.router vor..."); // Log: Vor Zuweisung

// Macht die Funktionen (einschließlich init) global verfügbar.
window.router = {
    init, // Die neue Initialisierungsfunktion
    navigateTo,
    goBackToDashboard,
    goBackToDetails
};

console.log("[router.js] Skript-Ladevorgang abgeschlossen. window.router zugewiesen:", window.router); // Log: Skript-Ende und Zuweisung
