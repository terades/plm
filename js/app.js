// js/app.js - Hauptinitialisierung und globale Event-Handler

console.log("[app.js] Skript wird geladen."); // Log: Skript-Start

// Referenz auf den Hauptinhaltsbereich.
// Diese Variable wird global (im Skript-Scope) deklariert.
const contentArea = document.getElementById('content-area'); // Einzige Deklaration von contentArea
console.log("[app.js] contentArea Element beim Laden des Skripts:", contentArea); // Log: contentArea beim Laden

// Referenz auf den Theme-Toggle Button im Header
const themeToggleBtn = document.getElementById('theme-toggle');

// --- KEIN AGGRESSIVER GLOBALER CLICK LISTENER AUF WINDOW/DOCUMENT IN CAPTURE PHASE ---
// Der extrem aggressive Listener wurde entfernt.
// Event-Handling für Klicks im Inhaltsbereich wird nun wieder primär
// vom tbody-Listener in bomView.js und sekundär vom Header-Listener in Bubbling Phase behandelt.


document.addEventListener('DOMContentLoaded', () => {
    console.log("[app.js] DOMContentLoaded Event ausgelöst. Anwendungsstart."); // Log: DOM geladen

    // Stelle sicher, dass contentArea verfügbar ist.
    // Die Variable 'contentArea' von außerhalb dieses Blocks wird hier verwendet.
    if (!contentArea) {
        console.error("[app.js] #content-area Element NICHT gefunden nach DOMContentLoaded!"); // Log: contentArea fehlt
        // Kritischer Fehler anzeigen
        if (window.domUtils) {
             window.domUtils.setElementContent(document.body.id, '<p class="text-red-600 dark:text-red-400">Kritischer Fehler: Haupt-Inhaltsbereich konnte nicht gefunden werden. Anwendung kann nicht starten.</p>');
        } else {
             document.body.innerHTML = '<p class="text-red-600 dark:text-red-400">Kritischer Fehler: Haupt-Inhaltsbereich konnte nicht gefunden werden.</p>';
        }
        return; // Kritischer Fehler, beende Initialisierung
    } else {
         console.log("[app.js] #content-area Element gefunden nach DOMContentLoaded."); // Log: contentArea gefunden
    }


    // --- Router initialisieren ---
    // Das contentArea Element an den Router übergeben, damit dieser es verwenden kann.
    console.log("[app.js] Prüfe window.router und init() Methode vor Initialisierung..."); // Log: Vor Router Init Prüfung
    if (window.router && typeof window.router.init === 'function') {
        console.log("[app.js] Router Objekt und init() Methode gefunden. Rufe init() auf."); // Log: Router Init Start
        window.router.init(contentArea); // Initialisiere den Router mit dem Content-Bereich
        console.log("[app.js] Router init() aufgerufen."); // Log: Router Init Ende
    } else {
         console.error("[app.js] Router Objekt oder init() Methode NICHT verfügbar vor Initialisierung!"); // Log: Router Init Fehler
         // Fehler anzeigen, da Router nicht initialisiert werden kann
         if (window.domUtils) {
              window.domUtils.setElementContent(contentArea.id, '<p class="text-red-600 dark:text-red-400">Anwendung konnte nicht initialisiert werden: Router fehlt oder defekt.</p>');
         } else {
              contentArea.innerHTML = '<p class="text-red-600 dark:text-red-400">Anwendung konnte nicht initialisiert werden: Router fehlt oder defekt.</p>';
         }
         return; // Kritischer Fehler, beende Initialisierung
    }


    // --- Event Listener für Theme Toggle ---
    if(themeToggleBtn) {
         console.log("[app.js] Theme Toggle Button Listener hinzugefügt.");
         themeToggleBtn.addEventListener('click', (event) => { // Sicherstellen, dass event übergeben wird
             console.log("[app.js] Theme Toggle Button geklickt.");
             event.preventDefault();
             event.stopPropagation(); // Stoppt das Blubbern

             document.body.classList.toggle('dark:bg-gray-900');
             document.body.classList.toggle('dark:text-gray-100');
             document.body.classList.toggle('bg-gray-100');
             document.body.classList.toggle('text-gray-900');

             if (document.body.classList.contains('dark:bg-gray-900')) {
                 localStorage.setItem('theme', 'dark');
             } else {
                 localStorage.setItem('theme', 'light');
             }

             const header = document.querySelector('header');
             if(header) {
                 if (document.body.classList.contains('dark:bg-gray-900')) {
                     header.classList.add('dark:bg-gray-800'); // Beispiel Anpassung
                 } else {
                     header.classList.remove('dark:bg-gray-800'); // Beispiel Anpassung
                 }
             }
         });
    }


    // Initialen Theme-Zustand aus localStorage laden.
    console.log("[app.js] Lade initialen Theme-Zustand.");
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark:bg-gray-900', 'dark:text-gray-100');
        document.body.classList.remove('bg-gray-100', 'text-gray-900');
         const header = document.querySelector('header');
          if(header) header.classList.add('dark:bg-gray-800');
    } else {
         document.body.classList.add('bg-gray-100', 'text-gray-900');
         document.body.classList.remove('dark:bg-gray-900', 'dark:text-gray-100');
         const header = document.querySelector('header');
         if(header) header.classList.remove('dark:bg-gray-800');
    }


    // --- Event Listener für Hauptnavigation (Header - BUBBLING PHASE) ---
    // Nutzt Event Delegation auf dem Header-Element.
     const header = document.querySelector('header');
     if(header) {
         console.log("[app.js] Header Click Listener hinzugefügt (Bubbling Phase).");
         header.addEventListener('click', (event) => { // Sicherstellen, dass event übergeben wird
             const target = event.target;

             // *** ANGEPASSTES LOGGING zur besseren Nachverfolgung ***
             // WICHTIG: Prüfen, ob contentArea überhaupt existiert, bevor .contains aufgerufen wird
             if (!contentArea) {
                console.error("[app.js - BUBBLING] KRITISCH: contentArea Element ist null. Die Prüfung 'clickInsideContentArea' wird fehlschlagen oder Fehler verursachen.");
             }
             console.log("[app.js - BUBBLING] Click Event auf header registriert. Target:", target);


             // Robuste Prüfung: Überprüfe, ob der Klick seinen Ursprung im Hauptinhaltsbereich hat.
             // Diese Prüfung ist nun wieder entscheidend, da der aggressive Capture Listener fehlt.
             const clickInsideContentArea = contentArea && contentArea.contains(target);

             // Erweitertes Logging für diese kritische Prüfung:
             console.log(
                "[app.js - BUBBLING] Prüfung: clickInsideContentArea =", clickInsideContentArea,
                "; contentArea vorhanden:", !!contentArea, // Zeigt an, ob contentArea zum Zeitpunkt des Klicks existiert
                "; target:", target // Das tatsächlich geklickte Element
             );


             if (clickInsideContentArea) {
                 console.log("[app.js - BUBBLING] Klick kam aus dem Inhaltsbereich, ignoriere im Header-Listener.");
                 // Wir lassen das Event hier bewusst weiter blubbern, damit der tbody-Listener in bomView.js
                 // das Event empfangen kann. (Kommentar überarbeitet: Wenn bomView.js stopPropagation() macht, kommt es hier nicht an)
                 // Wenn dieser Block erreicht wird, bedeutet das, dass event.stopPropagation() in bomView.js
                 // den Event NICHT gestoppt hat oder dieser Listener vor einem anderen relevanten Listener feuert.
                 // Dieser 'return' ist dann der letzte Schutz, um die Header-Navigation zu verhindern.
                 return;
             }

             // Finde den nächstgelegenen Button mit einem 'data-route' Attribut.
             const navButton = target.closest('button[data-route]');
             console.log("[app.js - BUBBLING] Ergebnis target.closest('button[data-route]'):", navButton);

             // Wenn ein solcher Navigations-Button gefunden wurde:
             if (navButton) {
                 console.log("[app.js - BUBBLING] Navigations-Button im Header geklickt. Route:", navButton.dataset.route);
                 event.preventDefault();
                 event.stopPropagation(); // Stoppt das Blubbern
                 console.log("[app.js - BUBBLING] preventDefault() und stopPropagation() für NavButton aufgerufen.");

                 const route = navButton.dataset.route;
                 console.log(`[app.js - BUBBLING] Rufe window.router.navigateTo('${route}') auf.`);
                 window.router.navigateTo(route); // Rufe den Router auf
             } else {
                 console.log("[app.js - BUBBLING] Klick im Header war nicht auf einen Navigations-Button. Ignoriere.");
             }
         });
     } else {
          console.warn("[app.js] Header Element NICHT gefunden.");
     }

    console.log("[app.js] Prüfe window.router und navigateTo() Methode vor initialer Navigation..."); // Log: Vor initialer Nav Prüfung

    // --- Anwendungsstart ---
    // Startet die initiale Navigation NACHDEM DOMContentLoaded und Router.init() gelaufen sind.
    if (window.router && typeof window.router.navigateTo === 'function') {
        console.log("[app.js] Router.navigateTo verfügbar. Starte initiale Navigation zum Dashboard."); // Log: Initiale Nav Start
        window.router.navigateTo('dashboard'); // Startet auf der Dashboard-Seite.
        console.log("[app.js] Initiale Navigation zum Dashboard aufgerufen."); // Log: Initiale Nav Aufruf
    } else {
        // Diese Fehler sollten durch die Prüfungen weiter oben abgefangen werden,
        // aber als letzte Sicherheit.
        console.error("[app.js] Router Objekt oder navigateTo() Methode nach DOMContentLoaded NICHT verfügbar!"); // Log: Initiale Nav Fehler
        if(contentArea && window.domUtils) {
             window.domUtils.setElementContent(contentArea.id, '<p class="text-red-600 dark:text-red-400">Anwendung konnte nicht initialisiert werden: Router.navigateTo fehlt.</p>');
        } else if (contentArea) {
             contentArea.innerHTML = '<p class="text-red-600 dark:text-red-400">Anwendung konnte nicht initialisiert werden: Router.navigateTo fehlt.</p>';
        }
    }
});

console.log("[app.js] Skript-Ladevorgang abgeschlossen."); // Log: Skript-Ende
