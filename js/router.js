// router.js – Hash-basiertes Routing für SPA

console.log("[router.js] Skript wird geladen.");

let _contentArea = null;

// Initialisierung mit Content-Bereich
function init(areaElement) {
    if (areaElement instanceof HTMLElement) {
        _contentArea = areaElement;
        handleRoute(); // Initiales Routing
    } else {
        console.error("[router.js] Ungültiges Element für init:", areaElement);
    }
}

// Routen-Definitionen
const routes = {
    dashboard: () => window.dashboardView.render(_contentArea),
    create: () => window.productFormView.render(_contentArea),
    details: ([productId]) => window.productDetailsView.render(_contentArea, productId),
    edit: ([productId]) => window.productFormView.render(_contentArea, window.state.getProductById(productId)),
    bom: (pathArr) => window.bomView.render(_contentArea, null, pathArr),
    documents: () => window.documentsView.render(_contentArea),
    settings: () => window.settingsView.render(_contentArea),
    '404': () => {
        if (_contentArea && window.domUtils) {
            window.domUtils.setElementContent(_contentArea.id, '<h2 class="text-2xl font-semibold mb-4">Seite nicht gefunden</h2><p class="text-red-600 dark:text-red-400">Die angeforderte Seite existiert nicht.</p>');
        }
    }
};

// Hash parsen: #route/param1/param2/...
function parseHash() {
    const hash = window.location.hash.replace(/^#/, '');
    const [route, ...params] = hash.split('/');
    return { route: route || 'dashboard', params };
}

// Navigation: Setzt den Hash
function navigate(route, params = []) {
    window.location.hash = '#' + [route, ...params].join('/');
}

// Routing-Handler
function handleRoute() {
    if (!_contentArea) return;
    const { route, params } = parseHash();
    if (routes[route]) {
        routes[route](params);
    } else {
        routes['404']();
    }
}

// Globale Router-API
window.router = {
    init,
    navigateTo: (route, params = []) => navigate(route, params),
    goBackToDashboard: () => navigate('dashboard'),
    goToBom: (pathArr = []) => navigate('bom', pathArr),
    goToDetails: (productId) => navigate('details', [productId])
};

// Events
window.addEventListener('hashchange', handleRoute);
window.addEventListener('DOMContentLoaded', handleRoute);

console.log("[router.js] Routing initialisiert.");
