// app.js - Orquestrador d'Esdeveniments i Lògica Central
import { loginWithStrava, logoutStrava, getSegmentDetails, checkStravaCallback, isStravaSessionValid } from './stravaApi.js';
import { aplicarFiltres, resetFiltres, setCerca, toggleFiltreGeneric, setToggleCompletats, setValorSlider, setOrdenacio } from './filters.js';
// NOU IMPORT ACTUALITZAT: S'han afegit resetearVistaMapa i centrarEnUsuari al final
import {
    initGoogleMap, pintarPorts, centrarMapaEnPort, eliminarMarcadorCerca,
    actualitzarMunicipiReal, calcularRutaPort, cercarServeisProp,
    resetearVistaMapa, centrarEnUsuari
} from './map.js';
import { showModal, closeModal } from './modal.js';
import {
    uiToggleDropdownFiltres, uiCercaToggle, uiNetejarCercaUnica,
    uiToggleCompletatsBtn, uiToggleGeneric, uiActualitzarSlider, uiNetejarFiltres,
    createMiniCardHTML, createCardHTML, createSidebarFiltresHTML, createTopBarSegmentsHTML
} from './ui.js';
import { router } from './router.js';
import { setLanguage, getActiveLanguage, translatePage, initTranslations } from './translations.js';

// Estat global de l'aplicació
export const appState = {
    mode: 'cycling', // 'cycling' o 'hiking'
    cyclingRoutes: [],
    hikingRoutes: [],
    totsElsPorts: [] // llista activa actual
};

// Canviar de mode
export const setMode = (newMode) => {
    if (appState.mode === newMode) return;
    appState.mode = newMode;
    // Toggle body class to allow CSS theme overrides for hiking
    try { document.body.classList.toggle('hiking-mode', newMode === 'hiking'); } catch (e) { /* ignore if DOM not ready */ }
    
    appState.totsElsPorts = appState.mode === 'cycling' ? appState.cyclingRoutes : appState.hikingRoutes;
    
    // Actualitzar estils dels botons
    const btnCyclings = document.querySelectorAll('.mode-cycling-btn');
    const btnHikings = document.querySelectorAll('.mode-hiking-btn');
    
    btnCyclings.forEach(btnCycling => {
        if (newMode === 'cycling') {
            btnCycling.classList.replace('text-gray-500', 'text-[#fc4c02]');
            btnCycling.classList.replace('hover:text-gray-700', 'shadow-sm');
            btnCycling.classList.add('bg-white');
        } else {
            btnCycling.classList.replace('text-[#fc4c02]', 'text-gray-500');
            btnCycling.classList.remove('bg-white', 'shadow-sm');
            btnCycling.classList.add('hover:text-gray-700');
        }
    });

    btnHikings.forEach(btnHiking => {
        if (newMode === 'cycling') {
            btnHiking.classList.replace('text-[#2563eb]', 'text-gray-500');
            btnHiking.classList.remove('bg-white', 'shadow-sm');
            btnHiking.classList.add('hover:text-gray-700');
        } else {
            btnHiking.classList.replace('text-gray-500', 'text-[#2563eb]');
            btnHiking.classList.replace('hover:text-gray-700', 'shadow-sm');
            btnHiking.classList.add('bg-white');
        }
    });
    
    // Ocultar/Mostrar filtres específics de ciclisme/senderisme
    document.querySelectorAll('[data-filter-group="cycling"]').forEach(el => {
        el.style.display = newMode === 'cycling' ? '' : 'none';
    });
    document.querySelectorAll('[data-filter-group="hiking"]').forEach(el => {
        el.style.display = newMode === 'hiking' ? '' : 'none';
    });

    // Si estem a /segments, re-renderitzar sidebar + topbar perquè
    // contenen HTML estàtic generat amb l'estat anterior del mode
    const currentPath = window.location.hash.slice(1) || '/';
    if (currentPath === '/segments') {
        const sidebarEl = document.querySelector('.sidebar-filtres-wrapper');
        if (sidebarEl) sidebarEl.outerHTML = createSidebarFiltresHTML();
        const topbarEl = document.querySelector('.topbar-segments-wrapper');
        if (topbarEl) topbarEl.outerHTML = createTopBarSegmentsHTML();
    }

    // Reiniciar filtres i executar
    resetFiltres();
    executarFiltre();

    // Si estem al mapa, el recentram
    if (currentPath === "/map") {
        resetearVistaMapa();
    }
};

export const executarFiltre = () => {
    if (appState.totsElsPorts.length > 0) {
        const portsFiltrats = aplicarFiltres(appState.totsElsPorts);
        let path = window.location.hash.slice(1);
        if (!path) path = "/";

        if (path === "/map") {
            pintarPorts(portsFiltrats, handlePortClick);
        } else if (path === "/segments") {
            const grid = document.getElementById('segments-grid');
            if (grid) {
                grid.innerHTML = portsFiltrats.map((p, i) => createCardHTML(p, i)).join('');
            }
        }
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
    const link = e.target.closest("[data-link]");
    if (link) {
        e.preventDefault();

        // Tancar menú mòbil si està obert
        const menu = document.querySelector('.nav-menu');
        const toggleBtn = document.querySelector('.nav-toggle');
        if (menu && menu.classList.contains('active')) {
            menu.classList.remove('active');
            if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
        }

        // Tancar dropdown de perfil
        const userDropdown = document.getElementById('user-dropdown');
        if (userDropdown) userDropdown.style.display = 'none';

        const href = link.getAttribute('href') || link.href;
        window.location.hash = href;
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

    // 4. Tancar user-dropdown si es clica fora
    const userDropdown = document.getElementById('user-dropdown');
    const userToggle = e.target.closest('[data-action="toggle-user-dropdown"]');
    if (userDropdown && userDropdown.style.display === 'block' && !userDropdown.contains(e.target) && !userToggle) {
        userDropdown.style.display = 'none';
    }

    // Close modal if clicking directly on the blurred background overlay (outside container limits)
    if (e.target.id === 'puerto-modal') {
        closeModal();
    }

    // 4. Accions específiques
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;

    switch (action) {
        case 'set-mode':
            setMode(target.dataset.mode);
            break;
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
        case 'toggle-sidebar-filtres':
            const sidebarContent = document.getElementById('sidebar-filtres-content');
            const sidebarCaret = document.getElementById('sidebar-filtres-caret');
            if (sidebarContent && sidebarCaret) {
                const isHidden = sidebarContent.classList.toggle('hidden');
                sidebarCaret.classList.toggle('rotate-180');
                target.setAttribute('aria-expanded', String(!isHidden));
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
            setCerca(portSugg.nom);
            document.getElementById('llista-suggeriments').classList.add('hidden');
            document.getElementById('btn-clear-search').classList.remove('hidden');
            
            const currentHash = window.location.hash.slice(1);
            if (currentHash === "/map" || currentHash === "") {
                centrarMapaEnPort(portSugg.lat, portSugg.lng, portSugg.nom);
            }
            executarFiltre();
            break;
        case 'calcular-ruta':
            calcularRutaPort(parseFloat(target.dataset.lat), parseFloat(target.dataset.lng));
            break;

        // NOUS CASOS PER ALS BOTONS DEL MAPA
        case 'reset-map-view':
            resetearVistaMapa();
            break;
        case 'center-on-user':
            centrarEnUsuari();
            break;

        case 'view-size-2':
        case 'view-size-3':
        case 'view-size-4':
            const grid = document.getElementById('segments-grid');
            if (!grid) break;

            document.querySelectorAll('.view-toggle-btn').forEach(b => {
                b.classList.remove('active-view', 'shadow-sm', 'bg-white', 'text-gray-800');
                b.classList.add('text-gray-400');
            });

            const btnToggle = target.closest('.view-toggle-btn');
            if (btnToggle) {
                btnToggle.classList.add('active-view', 'shadow-sm', 'bg-white', 'text-gray-800');
                btnToggle.classList.remove('text-gray-400');
            }

            grid.className = 'grid gap-6 pb-20 transition-all duration-500';
            if (action === 'view-size-2') {
                grid.classList.add('grid-cols-1', 'md:grid-cols-2');
            } else if (action === 'view-size-3') {
                grid.classList.add('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
            } else if (action === 'view-size-4') {
                grid.classList.add('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
            }
            break;
    }
});

// Lògica de debounce per evitar parpellejos al filtrar
let filtreTimeout;
const debouncedExecutarFiltre = (delay = 250) => {
    clearTimeout(filtreTimeout);
    filtreTimeout = setTimeout(() => {
        executarFiltre();
    }, delay);
};

// Escoltar inputs (cerca i sliders)
document.addEventListener('input', (e) => {
    if (e.target.id === 'input-cerca') {
        const textCerca = e.target.value;
        setCerca(textCerca);
        const teCaractersValids = uiCercaToggle(textCerca, appState.totsElsPorts);

        if (!teCaractersValids) {
            eliminarMarcadorCerca();
        }
        debouncedExecutarFiltre(250);
    } else if (['sl-distancia', 'sl-desnivell', 'sl-pendent'].includes(e.target.id)) {
        const target = e.target;
        uiActualitzarSlider(
            target.value,
            target.dataset.valId,
            target.dataset.prefix || '',
            target.dataset.sufix || ''
        );
        setValorSlider(target.dataset.camp, target.value);
        debouncedExecutarFiltre(250);
    }
});

// Toggle custom language dropdown
document.addEventListener('click', (e) => {
    const btn = document.getElementById('language-dropdown-btn');
    const menu = document.getElementById('language-dropdown-menu');
    const chevron = document.getElementById('language-dropdown-chevron');

    if (btn && menu) {
        if (btn.contains(e.target)) {
            const isHidden = menu.classList.toggle('hidden');
            if (chevron) chevron.classList.toggle('rotate-180');
            btn.setAttribute('aria-expanded', String(!isHidden));
        } else {
            menu.classList.add('hidden');
            if (chevron) chevron.classList.remove('rotate-180');
            btn.setAttribute('aria-expanded', 'false');
        }
    }
});

// Escoltar canvis (selects)
document.addEventListener('change', (e) => {
    if (e.target.id === 'select-ordenacio') {
        setOrdenacio(e.target.value);
        executarFiltre();
    }
});

// Escoltar clicks en opcions d'idioma
document.addEventListener('click', (e) => {
    const langBtn = e.target.closest('[data-lang]');
    if (langBtn) {
        const lang = langBtn.dataset.lang;
        setLanguage(lang);
    }
});

// Global Keyboard Orchestration for Accessibility (WCAG compliance)
document.addEventListener('keydown', (e) => {
    // 1. Escape Key Closing (Modals and Dropdowns)
    if (e.key === 'Escape') {
        const modal = document.getElementById('puerto-modal');
        if (modal && !modal.classList.contains('pointer-events-none')) {
            closeModal();
            return;
        }
        const langDropdown = document.getElementById('language-dropdown-menu');
        const langChevron = document.getElementById('language-dropdown-chevron');
        if (langDropdown && !langDropdown.classList.contains('hidden')) {
            langDropdown.classList.add('hidden');
            if (langChevron) langChevron.classList.remove('rotate-180');
            const langBtn = document.getElementById('language-dropdown-btn');
            if (langBtn) {
                langBtn.setAttribute('aria-expanded', 'false');
                langBtn.focus();
            }
            return;
        }
    }

    // 2. Keyboard Focus Trap (Tab and Shift+Tab cycling inside the Details Modal)
    const modal = document.getElementById('puerto-modal');
    if (modal && !modal.classList.contains('pointer-events-none')) {
        if (e.key === 'Tab') {
            const container = document.getElementById('modal-container');
            if (container) {
                const focusableElements = Array.from(container.querySelectorAll(
                    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )).filter(el => {
                    const style = window.getComputedStyle(el);
                    return style.display !== 'none' && style.visibility !== 'hidden';
                });

                if (focusableElements.length > 0) {
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];

                    if (e.shiftKey) { // Shift + Tab
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            e.preventDefault();
                        }
                    } else { // Tab
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                            e.preventDefault();
                        }
                    }
                }
            }
        }
    }

    // 3. Keyboard Activation (Enter or Space on custom role="button" elements)
    const roleButton = e.target.closest('[role="button"]');
    if (roleButton) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            roleButton.click();
        }
    }
});

// Inicialització principal
document.addEventListener("DOMContentLoaded", async () => {
    await checkStravaCallback();
    if (!isStravaSessionValid()) logoutStrava();

    // Carreguem dinàmicament el fitxer JSON d'idioma preferit
    await initTranslations();

    // Set the language label to the stored preference
    const activeLang = getActiveLanguage();
    const label = document.getElementById('current-lang-label');
    if (label) label.textContent = activeLang.toUpperCase();
    translatePage();

    // Botons de Mode Ciclisme / Senderisme
    const modeCyclingBtn = document.getElementById('mode-cycling-btn');
    if (modeCyclingBtn) {
        modeCyclingBtn.addEventListener('click', () => setMode('cycling'));
    }
    const modeHikingBtn = document.getElementById('mode-hiking-btn');
    if (modeHikingBtn) {
        modeHikingBtn.addEventListener('click', () => setMode('hiking'));
    }

    window.addEventListener("hashchange", router);
    router();
});