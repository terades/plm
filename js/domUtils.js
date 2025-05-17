// js/domUtils.js

// Hilfsfunktion zum Leeren eines HTML-Elements
function clearElement(element) {
    if (element) {
        element.innerHTML = '';
    }
}

// Hilfsfunktion zum Setzen des Inhalts eines HTML-Elements
function setElementContent(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = content;
    } else {
        console.warn(`Element mit ID "${elementId}" nicht gefunden.`);
    }
}

// Hilfsfunktion zum Abrufen der Werte aus einem Formular anhand der Element-IDs
function getFormValues(fieldIds) {
    const values = {};
    fieldIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            // Berücksichtige verschiedene Eingabetypen (z.B. Input, Select, Textarea)
            if (element.type === 'checkbox') {
                values[id] = element.checked;
            } else if (element.type === 'file') {
                 // Für Dateifeld, nur den Dateinamen speichern
                 values[id] = element.files.length > 0 ? element.files[0].name : '';
            }
            else {
                values[id] = element.value;
            }
        } else {
            console.warn(`Formularfeld mit ID "${id}" nicht gefunden.`);
             values[id] = null; // Oder undefined, je nach gewünschtem Verhalten
        }
    });
    return values;
}


// Hilfsfunktion zur Bestimmung der Tailwind-Klasse basierend auf dem Status
// Kopiert aus der ursprünglichen app.js, da sie nützlich ist
function getStatusBadgeClass(status) {
    switch (status) {
        case 'In Entwicklung': return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
        case 'Review': return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
        case 'Freigegeben': return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
        case 'Abgekündigt': return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
        case 'Archiviert': return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-400 text-gray-800 dark:bg-gray-500 dark:text-gray-200';
        default: return 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-200 text-gray-800 dark:bg-gray-500 dark:text-gray-200';
    }
}

// Da wir kein Modul-System verwenden, hängen wir die Funktionen an das globale window-Objekt
// oder ein spezifisches globales Objekt, um sie zugänglich zu machen.
// Ein spezifisches Objekt ist sauberer.
window.domUtils = {
    clearElement,
    setElementContent,
    getFormValues,
    getStatusBadgeClass
};
