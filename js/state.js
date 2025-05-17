// js/state.js

// Simuliert eine lokale "Datenbank" mit Produktdaten
// Wird beim ersten Laden mit Beispieldaten initialisiert
let products = [
    {
        id: 'PROD-001',
        name: 'Beispiel Produkt A',
        version: '1.0',
        status: 'Freigegeben',
        lastChangeDate: '2023-10-01',
        description: 'Dies ist ein Beispielprodukt.',
        material: 'Aluminium',
        supplier: 'Lieferant X',
        drawingFileName: 'zeichnung_A.pdf',
        creationDate: '2023-09-15'
    },
    {
        id: 'PROD-002',
        name: 'Komponente B',
        version: 'A.01',
        status: 'In Entwicklung',
        lastChangeDate: '2024-01-20',
        description: 'Eine wichtige Komponente.',
        material: 'Stahl',
        supplier: 'Lieferant Y',
        drawingFileName: '', // Kein Dokument
        creationDate: '2024-01-10'
    }
    // Weitere Produkte können hier hinzugefügt werden, falls gewünscht
];

// Holt alle Produkte
function getAllProducts() {
    // Rückgabe einer Kopie, um direkte Modifikationen des Zustands von außen zu verhindern
    return [...products];
}

// Holt ein Produkt anhand seiner ID
function getProductById(id) {
    return products.find(product => product.id === id);
}

// Fügt ein neues Produkt hinzu
function addProduct(newProduct) {
    // Überprüfen, ob die Produkt-ID bereits existiert (rudimentäre Prüfung)
    if (getProductById(newProduct.id)) {
        console.error(`Produkt-ID ${newProduct.id} existiert bereits.`);
        return false; // Produkt konnte nicht hinzugefügt werden
    }
    // Fügt das neue Produkt am Anfang des Arrays hinzu, damit es im Dashboard oben erscheint
    products.unshift(newProduct);
    console.log(`Produkt ${newProduct.id} hinzugefügt.`);
    return true; // Produkt erfolgreich hinzugefügt
}

// Aktualisiert ein bestehendes Produkt anhand seiner ID
function updateProduct(updatedProduct) {
    const index = products.findIndex(product => product.id === updatedProduct.id);
    if (index !== -1) {
        // Aktualisiert alle Attribute des Produkts und stellt sicher, dass die ID nicht überschrieben wird
        // sowie das Erstelldatum (creationDate) erhalten bleibt.
        products[index] = {
            ...products[index], // Vorhandene Daten des Produkts
            ...updatedProduct, // Neue Daten überschreiben vorhandene (außer id und creationDate, die wir explizit behandeln)
            id: products[index].id, // Sicherstellen, dass die ursprüngliche ID erhalten bleibt
            creationDate: products[index].creationDate, // Sicherstellen, dass das Erstelldatum erhalten bleibt
            lastChangeDate: new Date().toISOString().slice(0, 10) // Aktualisiere das Änderungsdatum
        };
        console.log(`Produkt ${updatedProduct.id} aktualisiert.`);
        return true; // Produkt erfolgreich aktualisiert
    }
    console.error(`Produkt-ID ${updatedProduct.id} nicht gefunden.`);
    return false; // Produkt nicht gefunden
}

// Ändert den Status eines Produkts
function updateProductStatus(id, newStatus) {
     const product = getProductById(id);
     if (product) {
         product.status = newStatus;
         product.lastChangeDate = new Date().toISOString().slice(0, 10); // Aktualisiere das Änderungsdatum
         console.log(`Status von Produkt ${id} geändert zu ${newStatus}.`);
         return true;
     }
     console.error(`Produkt-ID ${id} nicht gefunden.`);
     return false;
}


// Simuliert das Archivieren eines Produkts (setzt den Status auf "Archiviert")
function archiveProduct(id) {
    return updateProductStatus(id, 'Archiviert');
}

// Löscht ein Produkt anhand seiner ID (nicht Teil der aktuellen Anforderungen, aber hier zur Vollständigkeit)
// function deleteProduct(id) {
//     const initialLength = products.length;
//     products = products.filter(product => product.id !== id);
//     if (products.length < initialLength) {
//         console.log(`Produkt ${id} gelöscht.`);
//         return true;
//     }
//     console.error(`Produkt-ID ${id} nicht gefunden.`);
//     return false;
// }

// Macht die Funktionen global verfügbar, damit sie von anderen Skripten genutzt werden können.
// Dies ahmt einen einfachen Modul-Export in einer Vanilla JS Umgebung nach.
window.state = {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    updateProductStatus,
    archiveProduct
    // , deleteProduct // ggf. auskommentieren, falls benötigt
};
