// js/app.js - Hauptinitialisierung und globale Event-Handler

console.log("[app.js] Skript wird geladen."); // Log: Skript-Start

// Referenz auf den Hauptinhaltsbereich.
const contentArea = document.getElementById('content-area');
console.log("[app.js] contentArea Element beim Laden des Skripts:", contentArea);

// Referenz auf den Theme-Toggle Button im Header
const themeToggleBtn = document.getElementById('theme-toggle');

document.addEventListener('DOMContentLoaded', () => {
    console.log("[app.js] DOMContentLoaded Event ausgelöst. Anwendungsstart.");

    if (!contentArea) {
        console.error("[app.js] #content-area Element NICHT gefunden nach DOMContentLoaded!");
        if (window.domUtils) {
            window.domUtils.setElementContent(document.body.id, '<p class="text-red-600 dark:text-red-400">Kritischer Fehler: Haupt-Inhaltsbereich konnte nicht gefunden werden. Anwendung kann nicht starten.</p>');
        } else {
            document.body.innerHTML = '<p class="text-red-600 dark:text-red-400">Kritischer Fehler: Haupt-Inhaltsbereich konnte nicht gefunden werden.</p>';
        }
        return;
    } else {
        console.log("[app.js] #content-area Element gefunden nach DOMContentLoaded.");
    }

    // --- Router initialisieren ---
    console.log("[app.js] Prüfe window.router und init() Methode vor Initialisierung...");
    if (window.router && typeof window.router.init === 'function') {
        console.log("[app.js] Router Objekt und init() Methode gefunden. Rufe init() auf.");
        window.router.init(contentArea);
        console.log("[app.js] Router init() aufgerufen.");
    } else {
        console.error("[app.js] Router Objekt oder init() Methode NICHT verfügbar vor Initialisierung!");
        if (window.domUtils) {
            window.domUtils.setElementContent(contentArea.id, '<p class="text-red-600 dark:text-red-400">Anwendung konnte nicht initialisiert werden: Router fehlt oder defekt.</p>');
        } else {
            contentArea.innerHTML = '<p class="text-red-600 dark:text-red-400">Anwendung konnte nicht initialisiert werden: Router fehlt oder defekt.</p>';
        }
        return;
    }

    // --- Event Listener für Theme Toggle ---
    if (themeToggleBtn) {
        console.log("[app.js] Theme Toggle Button Listener hinzugefügt.");
        themeToggleBtn.addEventListener('click', (event) => {
            console.log("[app.js] Theme Toggle Button geklickt.");
            event.preventDefault();
            event.stopPropagation();

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
            if (header) {
                if (document.body.classList.contains('dark:bg-gray-900')) {
                    header.classList.add('dark:bg-gray-800');
                } else {
                    header.classList.remove('dark:bg-gray-800');
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
        if (header) header.classList.add('dark:bg-gray-800');
    } else {
        document.body.classList.add('bg-gray-100', 'text-gray-900');
        document.body.classList.remove('dark:bg-gray-900', 'dark:text-gray-100');
        const header = document.querySelector('header');
        if (header) header.classList.remove('dark:bg-gray-800');
    }

    // --- Event Listener für Hauptnavigation (Header - BUBBLING PHASE) ---
    const header = document.querySelector('header');
    if (header) {
        console.log("[app.js] Header Click Listener hinzugefügt (Bubbling Phase).");
        header.addEventListener('click', (event) => {
            const target = event.target;

            if (!contentArea) {
                console.error("[app.js - BUBBLING] KRITISCH: contentArea Element ist null. Die Prüfung 'clickInsideContentArea' wird fehlschlagen oder Fehler verursachen.");
            }
            console.log("[app.js - BUBBLING] Click Event auf header registriert. Target:", target);

            const clickInsideContentArea = contentArea && contentArea.contains(target);

            console.log(
                "[app.js - BUBBLING] Prüfung: clickInsideContentArea =", clickInsideContentArea,
                "; contentArea vorhanden:", !!contentArea,
                "; target:", target
            );

            if (clickInsideContentArea) {
                console.log("[app.js - BUBBLING] Klick kam aus dem Inhaltsbereich, ignoriere im Header-Listener.");
                return;
            }

            const navButton = target.closest('button[data-route]');
            console.log("[app.js - BUBBLING] Ergebnis target.closest('button[data-route]'):", navButton);

            if (navButton) {
                console.log("[app.js - BUBBLING] Navigations-Button im Header geklickt. Route:", navButton.dataset.route);
                event.preventDefault();
                event.stopPropagation();
                console.log("[app.js - BUBBLING] preventDefault() und stopPropagation() für NavButton aufgerufen.");

                const route = navButton.dataset.route;
                console.log(`[app.js - BUBBLING] Rufe window.router.navigateTo('${route}') auf.`);
                window.router.navigateTo(route);
            } else {
                console.log("[app.js - BUBBLING] Klick im Header war nicht auf einen Navigations-Button. Ignoriere.");
            }
        });
    } else {
        console.warn("[app.js] Header Element NICHT gefunden.");
    }

    console.log("[app.js] Prüfe window.router und navigateTo() Methode vor initialer Navigation...");

    // --- Anwendungsstart ---
    if (window.router && typeof window.router.navigateTo === 'function') {
        console.log("[app.js] Router.navigateTo verfügbar. Starte initiale Navigation zum Dashboard.");
        window.router.navigateTo('dashboard');
        console.log("[app.js] Initiale Navigation zum Dashboard aufgerufen.");
    } else {
        console.error("[app.js] Router Objekt oder navigateTo() Methode nach DOMContentLoaded NICHT verfügbar!");
        if (contentArea && window.domUtils) {
            window.domUtils.setElementContent(contentArea.id, '<p class="text-red-600 dark:text-red-400">Anwendung konnte nicht initialisiert werden: Router.navigateTo fehlt.</p>');
        } else if (contentArea) {
            contentArea.innerHTML = '<p class="text-red-600 dark:text-red-400">Anwendung konnte nicht initialisiert werden: Router.navigateTo fehlt.</p>';
        }
    }
});

console.log("[app.js] Skript-Ladevorgang abgeschlossen."); // Log: Skript-Ende
