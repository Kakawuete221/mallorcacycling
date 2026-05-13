// app.js - Orquestrador d'Esdeveniments i Lògica Central
import { loginWithStrava, logoutStrava, getSegmentDetails, checkStravaCallback, isStravaSessionValid } from './stravaApi.js';
import { aplicarFiltres, resetFiltres, setCerca, toggleFiltreGeneric, setToggleCompletats, setValorSlider } from './filters.js';
// NOU IMPORT ACTUALITZAT: S'han afegit resetearVistaMapa i centrarEnUsuari al final
import { 
    initGoogleMap, pintarPorts, centrarMapaEnPort, eliminarMarcadorCerca, 
    actualitzarMunicipiReal, calcularRutaPort, cercarServeisProp, 
    resetearVistaMapa, centrarEnUsuari 
} from './map.js';
import { showModal, closeModal } from './modal.js';
import { 
    uiToggleDropdownFiltres, uiCercaToggle, uiNetejarCercaUnica, 
    uiToggleCompletatsBtn, uiToggleGeneric, uiActualitzarSlider, uiNetejarFiltres, createMiniCardHTML 
} from './ui.js';
import { router } from './router.js';

// Estat global de l'aplicació
export const appState = {
    totsElsPorts: []
};

// Funció central per executar filtres i repintar
export const executarFiltre = () => {
    if (appState.totsElsPorts.length > 0) {
        pintarPorts(aplicarFiltres(appState.totsElsPorts), handlePortClick);
    }
};

// Connexió entre Mapa, API i UI quan es clica un port
const handlePortClick = async (port, infowindow, latLng) => {
    try {
        const dadesReals = await getSegmentDetails(port.id);
        if (dadesReals) {
            infowindow.setContent(createMiniCardHTML(port, dadesReals));
        }
    } catch (error) {
        console.error("Error obtenint detalls de Strava:", error);
    }
};

// GESTIÓ GLOBAL D'ESDEVENIMENTS (Event Delegation)
document.addEventListener('click', async (e) => {
    // 1. Navegació del Router
    if (e.target.matches("[data-link]")) {
        e.preventDefault();
        window.history.pushState(null, null, e.target.href);
        router();
        return;
    }

    // 2. Tancar menú mòbil si es clica fora
    const menu = document.querySelector('.nav-menu');
    const toggleBtn = document.querySelector('.nav-toggle');
    if (menu && toggleBtn && menu.classList.contains('active') && !e.target.closest('.nav-container')) {
        menu.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
    }

    // 3. Tancar panells de filtres si es clica fora
    const panelFiltres = document.getElementById('panel-filtres');
    const btnFiltres = document.getElementById('btn-filtres-dropdown');
    const llistaSugg = document.getElementById('llista-suggeriments');
    const inputCerca = document.getElementById('input-cerca');

    if (panelFiltres && !panelFiltres.classList.contains('hidden') && !panelFiltres.contains(e.target) && !btnFiltres.contains(e.target)) {
        panelFiltres.classList.add('hidden');
        btnFiltres.classList.remove('bg-gray-100', 'border-gray-400');
    }

    if (llistaSugg && !llistaSugg.classList.contains('hidden') && !llistaSugg.contains(e.target) && e.target !== inputCerca) {
        llistaSugg.classList.add('hidden');
    }

    // 4. Accions específiques
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;

    switch (action) {
        case 'login-strava':
            loginWithStrava();
            break;
        case 'logout-strava':
            logoutStrava();
            window.location.href = "/";
            break;
        case 'toggle-user-dropdown':
            const d = document.getElementById('user-dropdown');
            if (d) d.style.display = d.style.display === 'none' ? 'block' : 'none';
            break;
        case 'toggle-mobile-menu':
            if (menu && toggleBtn) {
                const isActive = menu.classList.toggle('active');
                toggleBtn.setAttribute('aria-expanded', String(isActive));
            }
            break;
        case 'view-details':
            const portData = JSON.parse(target.dataset.port);
            showModal(portData);
            break;
        case 'close-modal':
            closeModal();
            break;
        case 'toggle-filtres':
            uiToggleDropdownFiltres();
            break;
        case 'netejar-filtres':
            uiNetejarFiltres();
            resetFiltres();
            executarFiltre();
            break;
        case 'netejar-cerca':
            uiNetejarCercaUnica();
            setCerca("");
            eliminarMarcadorCerca();
            executarFiltre();
            break;
        case 'toggle-completats':
            const nouEstatComp = uiToggleCompletatsBtn(target); 
            setToggleCompletats(nouEstatComp); 
            executarFiltre();
            break;
        case 'toggle-generic':
            uiToggleGeneric(target);
            toggleFiltreGeneric(target.dataset.camp, target.dataset.valor);
            executarFiltre();
            break;
        case 'seleccionar-suggeriment':
            const portSugg = JSON.parse(target.dataset.port);
            document.getElementById('input-cerca').value = portSugg.nom;
            document.getElementById('llista-suggeriments').classList.add('hidden');
            document.getElementById('btn-clear-search').classList.remove('hidden');
            centrarMapaEnPort(portSugg.lat, portSugg.lng, portSugg.nom);
            break;
        case 'calcular-ruta':
            calcularRutaPort(parseFloat(target.dataset.lat), parseFloat(target.dataset.lng));
            break;
        case 'cercar-serveis':
            cercarServeisProp(parseFloat(target.dataset.lat), parseFloat(target.dataset.lng));
            break;
        
        // NOUS CASOS PER ALS BOTONS DEL MAPA
        case 'reset-map-view':
            resetearVistaMapa();
            break;
        case 'center-on-user':
            centrarEnUsuari();
            break;
    }
});

// Escoltar inputs (cerca i sliders)
document.addEventListener('input', (e) => {
    if (e.target.id === 'input-cerca') {
        const textCerca = e.target.value;
        const teCaractersValids = uiCercaToggle(textCerca, appState.totsElsPorts);
        
        if (!teCaractersValids) {
            setCerca("");
            eliminarMarcadorCerca();
            executarFiltre();
        }
    } else if (e.target.classList.contains('custom-slider')) {
        const target = e.target;
        uiActualitzarSlider(
            target.value, 
            target.dataset.valId, 
            target.dataset.prefix || '', 
            target.dataset.sufix || ''
        );
        setValorSlider(target.dataset.camp, target.value);
        executarFiltre();
    }
});

// Inicialització principal
document.addEventListener("DOMContentLoaded", async () => {
    await checkStravaCallback();
    if (!isStravaSessionValid()) logoutStrava();
    window.addEventListener("popstate", router);
    router();
});