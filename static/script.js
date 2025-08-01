// ===================================================================================
// Globale Definitionen
// ===================================================================================

// Deutsche Übersetzung für DataTables (lokal statt CDN)
const germanTranslation = {
    "decimal": ",",
    "emptyTable": "Keine Daten in der Tabelle vorhanden",
    "info": "_START_ bis _END_ von _TOTAL_ Einträgen",
    "infoEmpty": "0 bis 0 von 0 Einträgen",
    "infoFiltered": "(gefiltert von _MAX_ Einträgen)",
    "infoPostFix": "",
    "thousands": ".",
    "lengthMenu": "_MENU_ Einträge anzeigen",
    "loadingRecords": "Wird geladen...",
    "processing": "Bitte warten...",
    "search": "Suchen:",
    "searchPlaceholder": "Tabelle durchsuchen...",
    "zeroRecords": "Keine Übereinstimmungen gefunden",
    "paginate": {
        "first": "Erste",
        "last": "Letzte", 
        "next": "Nächste",
        "previous": "Zurück"
    },
    "aria": {
        "sortAscending": ": aktivieren, um Spalte aufsteigend zu sortieren",
        "sortDescending": ": aktivieren, um Spalte absteigend zu sortieren"
    },
    "buttons": {
        "copy": "Kopieren",
        "csv": "CSV",
        "excel": "Excel",
        "pdf": "PDF",
        "print": "Drucken",
        "colvis": "Spalten",
        "copyTitle": "In Zwischenablage kopieren",
        "copySuccess": {
            "_": "%d Zeilen kopiert",
            "1": "1 Zeile kopiert"
        }
    },
    "select": {
        "rows": {
            "_": "%d Zeilen ausgewählt",
            "0": "Zum Auswählen auf eine Zeile klicken",
            "1": "1 Zeile ausgewählt"
        }
    }
};

// Übersetzung der Spaltenüberschriften von technischen API-Namen auf Deutsch
const headerMapping = {
    'organizationid': 'Mandant',
    'productid': 'Produkt-ID',
    'dimensions_configid': 'Variante',
    'dimensions_sizeid': 'Größe',
    'dimensions_colorid': 'Farbe',
    'dimensions_styleid': 'Stil',
    'dimensions_inventstatusid': 'Bestandsstatus',
    'dimensions_siteid': 'Standort',
    'dimensions_locationid': 'Lagerort',
    'dimensions_wmslocationid': 'Lagerplatz',
    'dimensions_batchid': 'Charge',
    'quantities_fno_availordered': 'Verfügb. Bestellt (FNO)',
    'quantities_fno_onorder': 'Bestellt (Einkauf)',
    'quantities_fno_reservphysical': 'Physisch Reserviert',
    'quantities_fno_postedqty': 'Gebuchte Menge',
    'quantities_fno_physicalinvent': 'Physischer Bestand',
    'quantities_fno_ordered': 'Bestellt (Verkauf)',
    'quantities_fno_deducted': 'Abgebucht',
    'quantities_fno_availphysical': 'Physisch Verfügbar',
    'quantities_fno_arrived': 'Eingetroffen',
    'quantities_fno_softreserved': 'Soft Reserviert',
    'quantities_pos_inbound': 'Zulauf (POS)',
    'quantities_pos_outbound': 'Abgang (POS)',
    'quantities_pos_availquantity': 'Verfügbar (POS)',
    'quantities_iv_ordered': 'Bestellt (IV)',
    'quantities_iv_softreserved': 'Soft Reserviert (IV)',
    'quantities_iv_totalonhand': 'Gesamtbestand (IV)',
    'quantities_iv_availabletoreserve': 'Verfügbar f. Reserv.',
    'quantities_iv_totalavailable': 'Gesamt Verfügbar (IV)',
    'quantities_@iv_@allocated': '@Zugewiesen'
};

// Hilfsfunktion, um das verschachtelte JSON-Objekt in eine flache Struktur umzuwandeln
function flattenObject(obj, parentKey = '', res = {}) {
    for (let key in obj) {
        const propName = parentKey ? parentKey.toLowerCase() + '_' + key.toLowerCase() : key.toLowerCase();
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            flattenObject(obj[key], propName, res);
        } else {
            res[propName] = obj[key];
        }
    }
    return res;
}

// Hilfsfunktion für bessere Fehlerbehandlung
function showError(message, element = null) {
    console.error('Fehler:', message);
    if (element) {
        element.textContent = `Fehler: ${message}`;
        element.className = element.className.replace(/text-\w+-\d+/g, '') + ' text-red-500';
    }
}

// Hilfsfunktion für Erfolgsanzeige
function showSuccess(message, element = null) {
    console.log('Erfolg:', message);
    if (element) {
        element.textContent = message;
        element.className = element.className.replace(/text-\w+-\d+/g, '') + ' text-green-500';
    }
}

// ===================================================================================
// Hauptlogik der Anwendung
// ===================================================================================

document.addEventListener('DOMContentLoaded', () => {
    
    let dataTable; // Hält die DataTables-Instanz
    
    // --- Dark Mode Logik ---
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const htmlElement = document.documentElement;
    
    if (!darkModeToggle) { 
        console.error("Dark Mode Schalter konnte im HTML nicht gefunden werden!"); 
        return; 
    }
    
    const applyTheme = (theme) => { 
        if (theme === 'dark') { 
            htmlElement.classList.add('dark'); 
            darkModeToggle.checked = true; 
        } else { 
            htmlElement.classList.remove('dark'); 
            darkModeToggle.checked = false; 
        } 
    };
    
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);
    
    darkModeToggle.addEventListener('change', () => { 
        const theme = darkModeToggle.checked ? 'dark' : 'light'; 
        applyTheme(theme); 
        localStorage.setItem('theme', theme); 
    });

    // --- Referenzen auf UI-Elemente ---
    const queryButton = document.getElementById('queryButton');
    const statusElement = document.getElementById('status');
    const showJsonButton = document.getElementById('showJsonButton');
    const jsonModal = document.getElementById('jsonModal');
    const closeModalButton = document.getElementById('closeModalButton');
    const jsonPayloadContainer = document.getElementById('jsonPayloadContainer');
    let lastSentPayload = null;
    const inputIds = [ 'organizationId', 'productId', 'siteId', 'locationId', 'WMSLocationId', 'InventStatusId', 'ConfigId', 'SizeId', 'ColorId', 'StyleId', 'BatchId' ];

    // Überprüfung, ob alle UI-Elemente vorhanden sind
    const requiredElements = [queryButton, statusElement, showJsonButton, jsonModal, closeModalButton, jsonPayloadContainer];
    const missingElements = requiredElements.filter(el => !el);
    if (missingElements.length > 0) {
        console.error('Fehlende UI-Elemente gefunden. Anwendung kann nicht korrekt funktionieren.');
        return;
    }

    // Initialisiert eine leere DataTable beim ersten Laden
    initializeOrUpdateDataTable([]);

    // --- Event Listener für Buttons ---
    queryButton.addEventListener('click', handleQuery);
    showJsonButton.addEventListener('click', showJsonModal);
    closeModalButton.addEventListener('click', hideJsonModal);
    
    // Modal schließen beim Klick außerhalb
    jsonModal.addEventListener('click', (event) => { 
        if (event.target === jsonModal) hideJsonModal(); 
    });

    // ESC-Taste zum Schließen des Modals
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !jsonModal.classList.contains('hidden')) {
            hideJsonModal();
        }
    });

    // --- Hauptfunktionen ---
    async function handleQuery() {
        // UI für Anfrage vorbereiten
        statusElement.textContent = 'Frage Daten ab...';
        statusElement.className = 'text-sm text-gray-500 dark:text-gray-400 mt-2 h-5';
        queryButton.disabled = true;
        showJsonButton.disabled = true;
        
        const filters = {};
        inputIds.forEach(id => { 
            const element = document.getElementById(id);
            if (element) {
                filters[id] = element.value; 
            } else {
                console.warn(`Element mit ID '${id}' nicht gefunden`);
            }
        });
        
        // Den Payload für die API und die "Zeige JSON"-Funktion erstellen
        const active_dimensions = [], active_values = [];
        const dimension_keys = ["siteId", "locationId", "WMSLocationId", "ConfigId", "SizeId", "ColorId", "StyleId", "InventStatusId", "BatchId"];
        
        dimension_keys.forEach(key => {
            const value = filters[key];
            if (value && value !== "." && value !== "*") {
                active_dimensions.push(key);
                active_values.push(value);
            }
        });
        
        lastSentPayload = {
            "dimensionDataSource": "fno",
            "filters": { 
                "organizationId": [filters.organizationId], 
                "productId": [filters.productId], 
                "dimensions": active_dimensions, 
                "values": [active_values] 
            },
            "groupByValues": dimension_keys,
            "returnNegative": true
        };

        try {
            const response = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters),
            });
            
            if (!response.ok) {
                let errorMessage;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || `HTTP-Fehler: ${response.status}`;
                } catch {
                    errorMessage = `HTTP-Fehler: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            initializeOrUpdateDataTable(data); // Tabelle mit neuen Daten füllen
            showSuccess(`Erfolg! ${data.length} Ergebnis(se) geladen.`, statusElement);
            showJsonButton.disabled = false;
            
        } catch (error) {
            showError(error.message, statusElement);
        } finally {
            queryButton.disabled = false;
        }
    }
    
    function initializeOrUpdateDataTable(data) {
        // Zerstöre die alte Tabelle, falls vorhanden, um sie sauber neu aufzubauen
        if (dataTable) {
            try {
                dataTable.destroy();
                $('#resultsTable thead').empty(); // Wichtig, um alte Filter-Inputs zu entfernen
                $('#resultsTable tbody').empty();
            } catch (error) {
                console.warn('Fehler beim Zerstören der DataTable:', error);
            }
        }

        if (!data || data.length === 0) {
            $('#resultsTable').html('<thead><tr><th class="px-4 py-2">Info</th></tr></thead><tbody><tr><td class="px-4 py-2 text-center">Keine Daten für die Abfrage gefunden.</td></tr></tbody>');
            return;
        }

        try {
            // Spalten dynamisch aus den Daten erstellen
            const flatData = data.map(item => flattenObject(item));
            const columnsForDt = Object.keys(flatData[0]).map(technicalName => {
                return {
                    data: technicalName,
                    title: headerMapping[technicalName.toLowerCase()] || technicalName.replace("dimensions_","") // Fallback auf technischen Namen
                };
            });
            
            // Füge eine leere Header-Zeile für die Filter-Inputs hinzu
            $('#resultsTable thead').html('<tr></tr><tr class="filter-row"></tr>');
            $('#resultsTable thead tr:first-child').append(columnsForDt.map(c => `<th class="px-2 py-2">${c.title}</th>`).join(''));
            $('#resultsTable thead tr:last-child').append(columnsForDt.map(() => '<th class="px-2 py-1"></th>').join(''));

            // DataTables mit den neuen Daten und Spalten initialisieren
            dataTable = new DataTable('#resultsTable', {
                data: flatData,
                columns: columnsForDt.map(c => ({ data: c.data })), // Nur die 'data' Eigenschaft übergeben
                language: germanTranslation, // Lokale deutsche Übersetzung verwenden
                scrollX: true,
                destroy: true,
                orderCellsTop: true,
                pageLength: 25,
                lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "Alle"]],
                dom: '<"flex flex-col sm:flex-row justify-between items-center mb-4"<"mb-2 sm:mb-0"l><"mb-2 sm:mb-0"f>>rtip',
                initComplete: function () {
                    this.api().columns().every(function (index) {
                        let column = this;
                        let input = document.createElement('input');
                        input.placeholder = `Filter...`;
                        input.className = 'w-full px-2 py-1 text-sm border rounded focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white';
                        
                        const headerCell = $('#resultsTable thead .filter-row').children()[index];
                        $(headerCell).empty().append(input);
                        
                        $(input).on('keyup change clear', function () {
                            if (column.search() !== this.value) {
                                column.search(this.value).draw();
                            }
                        });
                    });
                },
                drawCallback: function() {
                    // Styling für Dark Mode nach jedem Neuzeichnen anwenden
                    if (document.documentElement.classList.contains('dark')) {
                        $('#resultsTable').addClass('dark-table');
                    }
                }
            });
            
            console.log('DataTable erfolgreich initialisiert mit', flatData.length, 'Datensätzen');
            
        } catch (error) {
            console.error('Fehler beim Initialisieren der DataTable:', error);
            $('#resultsTable').html('<thead><tr><th class="px-4 py-2">Fehler</th></tr></thead><tbody><tr><td class="px-4 py-2 text-center text-red-500">Fehler beim Laden der Tabelle: ' + error.message + '</td></tr></tbody>');
        }
    }
    
    function showJsonModal() {
        if (lastSentPayload) {
            jsonPayloadContainer.textContent = JSON.stringify(lastSentPayload, null, 2);
            jsonModal.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Verhindert Scrollen im Hintergrund
        }
    }
    
    function hideJsonModal() {
        jsonModal.classList.add('hidden');
        document.body.style.overflow = 'auto'; // Scrollen wieder aktivieren
    }
});