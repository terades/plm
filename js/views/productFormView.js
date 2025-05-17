// js/views/productFormView.js

// Rendert das Formular zum Erstellen oder Bearbeiten eines Produkts
// productToEdit ist optional. Wenn vorhanden, ist es der Bearbeitungsmodus.
function render(containerElement, productToEdit = null) {
    const isEditing = productToEdit !== null && productToEdit !== undefined;
    const formTitle = isEditing ? 'Produkt bearbeiten' : 'Neues Produkt anlegen';
    const submitButtonText = isEditing ? 'Änderungen speichern' : 'Produkt anlegen';

    // Standardwerte für neues Produkt
    const defaultProduct = {
        id: '',
        name: '',
        version: '',
        status: 'In Entwicklung', // Standardstatus
        description: '',
        material: '',
        supplier: '',
        drawingFileName: '',
        creationDate: new Date().toISOString().slice(0, 10) // Heutiges Datum
    };

    // Produktinformationen, entweder vom zu bearbeitenden Produkt oder Standardwerte
    const product = isEditing ? productToEdit : defaultProduct;

    const formHtml = `
        <h2 class="text-2xl font-semibold mb-4">${formTitle}</h2>
        <form id="product-form" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 dark:bg-gray-700">

            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" for="product-id">
                    Produkt-ID / Artikelnummer <span class="text-red-500">*</span>
                </label>
                 <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                       id="product-id" type="text" placeholder="Eindeutige ID" value="${product.id}" ${isEditing ? 'disabled' : ''}>
                ${isEditing ? '<p class="text-xs italic text-gray-500 dark:text-gray-400">ID kann nicht geändert werden.</p>' : '<p class="text-xs italic text-gray-500 dark:text-gray-400">Sollte eindeutig sein.</p>'}
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" for="product-name">
                    Produktname <span class="text-red-500">*</span>
                </label>
                 <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                       id="product-name" type="text" placeholder="Name des Produkts" value="${product.name}" required>
            </div>

             <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" for="product-version">
                    Version <span class="text-red-500">*</span>
                </label>
                 <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                       id="product-version" type="text" placeholder="z.B. 1.0 oder A.01" value="${product.version}" required>
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" for="product-status">
                    Status <span class="text-red-500">*</span>
                </label>
                 <select class="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        id="product-status" required>
                    <option value="In Entwicklung" ${product.status === 'In Entwicklung' ? 'selected' : ''}>In Entwicklung</option>
                    <option value="Review" ${product.status === 'Review' ? 'selected' : ''}>Review</option>
                    <option value="Freigegeben" ${product.status === 'Freigegeben' ? 'selected' : ''}>Freigegeben</option>
                    <option value="Abgekündigt" ${product.status === 'Abgekündigt' ? 'selected' : ''}>Abgekündigt</option>
                    <option value="Archiviert" ${product.status === 'Archiviert' ? 'selected' : ''}>Archiviert</option>
                </select>
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" for="product-description">
                    Produktbeschreibung
                </label>
                 <textarea class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                          id="product-description" rows="4" placeholder="Detaillierte Beschreibung">${product.description}</textarea>
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" for="product-material">
                    Material
                </label>
                 <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                       id="product-material" type="text" placeholder="Verwendetes Material" value="${product.material}">
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" for="product-supplier">
                    Lieferant
                </label>
                 <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                       id="product-supplier" type="text" placeholder="Name des Lieferanten" value="${product.supplier}">
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" for="product-drawing">
                    Technische Zeichnung / Dokument
                </label>
                 <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                       id="product-drawing" type="file">
                <p id="drawing-file-name" class="text-sm text-gray-600 mt-2 dark:text-gray-400">
                    ${product.drawingFileName ? `Ausgewählte Datei: ${product.drawingFileName}` : 'Keine Datei ausgewählt'}
                </p>
            </div>

            <div class="mb-4">
                <label class="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" for="product-creation-date">
                    Erstelldatum
                </label>
                 <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                       id="product-creation-date" type="date" value="${product.creationDate}">
            </div>

            <div class="flex items-center justify-between mt-6"> <button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition" type="submit">
                    ${submitButtonText}
                </button>
                 <button type="button" id="cancel-form" class="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition">
                    Abbrechen
                </button>
            </div>
        </form>
    `;

    window.domUtils.setElementContent(containerElement.id, formHtml);

    // Event Listener für das Formular nach dem Rendern hinzufügen
     const productFormElement = document.getElementById('product-form');
     if (productFormElement) {
        productFormElement.addEventListener('submit', (event) => {
             event.preventDefault(); // Standard-Formular-Submit verhindern

            const fieldIds = [
                 'product-id', 'product-name', 'product-version', 'product-status',
                 'product-description', 'product-material', 'product-supplier',
                 'product-drawing', 'product-creation-date'
            ];
             const values = window.domUtils.getFormValues(fieldIds);

            const id = values['product-id'];
            const name = values['product-name'];
            const version = values['product-version'];
            const status = values['product-status'];
            const description = values['product-description'];
            const material = values['product-material'];
            const supplier = values['product-supplier'];
            const drawingInput = document.getElementById('product-drawing'); // Brauchen das Input-Element, nicht nur den Namen aus getFormValues
            const drawingFileName = drawingInput.files.length > 0 ? drawingInput.files[0].name : (isEditing && productToEdit ? productToEdit.drawingFileName : ''); // Behalte alten Namen beim Bearbeiten, falls kein neuer Upload
            const creationDate = values['product-creation-date'];


             // Grundlegende Validierung
             if (!id || !name || !version || !status) {
                 alert('Bitte füllen Sie alle Pflichtfelder aus (ID, Name, Version, Status).');
                 return;
             }

             const productData = {
                 id: id,
                 name: name,
                 version: version,
                 status: status,
                 description: description,
                 material: material,
                 supplier: supplier,
                 drawingFileName: drawingFileName, // Gespeicherter Dateiname
                 creationDate: creationDate || new Date().toISOString().slice(0, 10), // Fallback
                 lastChangeDate: new Date().toISOString().slice(0, 10) // Setze Änderungsdatum beim Speichern
             };

             let success = false;
             if (isEditing) {
                 // Im Bearbeitungsmodus muss die ID vom ursprünglichen Produkt verwendet werden
                 productData.id = productToEdit.id; // Stelle sicher, dass die richtige ID verwendet wird
                 success = window.state.updateProduct(productData);
                 if (success) {
                      alert('Produkt erfolgreich aktualisiert!');
                       window.router.goBackToDetails(productData.id); // Zurück zur Detailansicht
                 } else {
                      alert('Fehler beim Aktualisieren des Produkts.');
                 }
             } else {
                 success = window.state.addProduct(productData);
                 if (success) {
                      alert('Produkt erfolgreich angelegt!');
                      window.router.goBackToDashboard(); // Zurück zum Dashboard
                 } else {
                     // Im Erstellungsmodus, wenn addProduct fehlschlägt (z.B. ID bereits existiert)
                      alert('Fehler: Produkt-ID existiert bereits oder ein anderer Fehler trat auf.');
                 }
             }
         });

         // Event Listener für Datei-Input, um Dateinamen anzuzeigen
         const drawingInput = document.getElementById('product-drawing');
         const drawingFileNameSpan = document.getElementById('drawing-file-name');
         if(drawingInput && drawingFileNameSpan) {
             drawingInput.addEventListener('change', (event) => {
                 if (event.target.files.length > 0) {
                     drawingFileNameSpan.textContent = `Ausgewählte Datei: ${event.target.files[0].name}`;
                 } else {
                     // Wenn im Bearbeitungsmodus eine Datei da war und keine neue ausgewählt wurde, alten Namen behalten
                     if (isEditing && productToEdit && productToEdit.drawingFileName) {
                         drawingFileNameSpan.textContent = `Ausgewählte Datei: ${productToEdit.drawingFileName}`;
                     } else {
                          drawingFileNameSpan.textContent = 'Keine Datei ausgewählt';
                     }
                 }
             });
              // Initialen Dateinamen beim Bearbeiten anzeigen
             if (isEditing && productToEdit && productToEdit.drawingFileName) {
                  drawingFileNameSpan.textContent = `Ausgewählte Datei: ${productToEdit.drawingFileName}`;
             }
         }


          // Event Listener für Abbrechen-Button
          const cancelFormButton = document.getElementById('cancel-form');
          if(cancelFormButton) {
             cancelFormButton.addEventListener('click', () => {
                   // Zurück zur vorherigen Ansicht (Dashboard oder Details)
                   if (isEditing && productToEdit) {
                       window.router.goBackToDetails(productToEdit.id);
                   } else {
                       window.router.goBackToDashboard();
                   }
              });
          }

     } else {
          console.error("Element #product-form nicht gefunden nach Rendering.");
     }

}

// Macht die Renderfunktion global verfügbar
window.productFormView = {
    render
};
