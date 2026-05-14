// router.js - Navegació i Control Principal
import { initGoogleMap, assignarComarcaAdministrativa } from './map.js';
import { actualitzarInterficieUsuari, createCardHTML, createFiltresHTML, createSidebarFiltresHTML, createTopBarSegmentsHTML } from './ui.js';
import { resetFiltres } from './filters.js';
import { appState, executarFiltre } from './app.js';

const getPuertos = async () => {
    try {
        const r = await fetch('data/puertos.json');
        return await r.json();
    } catch (e) { return []; }
};

const routes = {
    "/": {
        title: "Home | Mallorca Cycling",
        render: async () => {
            const puertos = await getPuertos();
            const destacats = puertos.slice(0, 4).map((p, i) => createCardHTML(p, i)).join('');

            return `
            <section id="intro" class="fade-in">
                <div class="relative w-full h-[70vh] overflow-hidden">
                    <img src="media/photo.jpeg" class="w-full h-full object-cover">
                    <div class="absolute inset-0 flex flex-col justify-center items-center text-white bg-black/40 text-center p-5">
                        <h1 class="font-title text-4xl md:text-5xl font-bold mb-4">Mallorca Cycling</h1>
                        <p class="text-lg md:text-xl">Discover the best mountain passes in Mallorca.</p>
                    </div>
                </div>
            </section>
            <section class="max-w-[80%] mx-auto py-16 px-5">
                <h2 class="text-3xl font-bold font-title text-secondary mb-8 text-center">Featured Segments</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 py-5">${destacats}</div>
            </section>
            <section class="max-w-[1200px] w-[90%] mx-auto py-16 px-5">
                <div id="strava-card-container"></div>
            </section>`;
        }
    },
    "/map": {
        title: "Map | Mallorca Cycling",
        render: async () => `
            <section class="relative h-[calc(100vh-80px)] w-full overflow-hidden bg-gray-100">
                <div id="map" class="absolute top-0 left-0 w-full h-full z-0"></div>

                <div class="absolute top-4 left-4 z-40 flex flex-col gap-3">
                    ${createFiltresHTML()}

                    <div class="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-10 mt-1">
                        <button data-action="center-on-user" title="La meva ubicació" class="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors border-b border-gray-100 focus:outline-none">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v2m0 12v2m8-8h-2M6 12H4m12 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        </button>
                        <button data-action="reset-map-view" title="Restablir vista" class="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors focus:outline-none">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                        </button>
                    </div>

                </div>
            </section>`
    },
    "/segments": {
        title: "Segments | Mallorca Cycling",
        render: async () => {
            return `
            <div class="w-full xl:max-w-[1400px] mx-auto py-12 px-5 fade-in">
                <div class="flex flex-col lg:flex-row gap-8 items-start relative">
                    <!-- Sidebar Filtres -->
                    ${createSidebarFiltresHTML()}

                    <!-- Main Content -->
                    <div class="flex-1 w-full flex flex-col">
                        <!-- Top Bar -->
                        ${createTopBarSegmentsHTML()}

                        <!-- Grid de Segments -->
                        <div id="segments-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 transition-all duration-500">
                            <!-- Es carregarà mitjançant app.js executarFiltre() -->
                        </div>
                    </div>
                </div>
            </div>`;
        }
    }
};

export const router = async () => {
    let path = window.location.hash.slice(1);
    if (!path) path = "/";
    const route = routes[path] || routes["/"];
    document.getElementById("app-viewport").innerHTML = await route.render() + `
        <div id="puerto-modal" class="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all duration-300" style="display:none;">
            <div class="bg-white w-full h-full md:w-[95%] md:h-auto md:rounded-3xl max-w-[1200px] max-h-[100dvh] md:max-h-[90vh] overflow-y-auto relative shadow-2xl fade-in flex flex-col">
                <button class="absolute top-4 right-4 w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur z-[2100] transition-colors" data-action="close-modal">
                    <svg class="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div id="modal-body" class="flex-1 w-full flex flex-col"></div>
            </div>
        </div>`;

    actualitzarInterficieUsuari();
    document.title = route.title;

    // Assegurem que appState.totsElsPorts estigui inicialitzat
    if (appState.totsElsPorts.length === 0) {
        const portsJSON = await getPuertos();
        appState.totsElsPorts = portsJSON.map(p => assignarComarcaAdministrativa(p));
    }

    if (path === "/map") {
        resetFiltres();
        initGoogleMap();
    } else if (path === "/segments") {
        resetFiltres();
    }

    // Sempre s'executa per a que actualitzi els elements (ja sigui mapa o grid)
    executarFiltre();
};