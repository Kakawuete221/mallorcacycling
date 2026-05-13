// router.js - Navegació i Control Principal
import { initGoogleMap, assignarComarcaAdministrativa } from './map.js';
import { actualitzarInterficieUsuari, createCardHTML } from './ui.js';
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
            const destacats = puertos.slice(0, 4).map(createCardHTML).join('');

            return `
            <section id="intro" class="section fade-in">
                <div class="intro-container">
                    <img src="media/photo.jpeg" class="intro-photo">
                    <div class="intro-text">
                        <h1>Mallorca Cycling</h1>
                        <p>Discover the best mountain passes in Mallorca.</p>
                    </div>
                </div>
            </section>
            <section class="container">
                <h2 class="section-title">Featured Segments</h2>
                <div class="segment-container">${destacats}</div>
            </section>
            <section class="container">
                <div class="strava-connect-card" id="strava-card-container"></div>
            </section>`;
        }
    },
    "/map": {
        title: "Map | Mallorca Cycling",
        render: async () => `
            <section class="relative h-[calc(100vh-80px)] w-full overflow-hidden bg-gray-100">
                <div id="map" class="absolute top-0 left-0 w-full h-full z-0"></div>

                <div class="absolute top-4 left-4 z-40 flex flex-col gap-3">
                    
                    <div class="flex flex-wrap items-start gap-3">
                        <div class="relative">
                            <button data-action="toggle-filtres" id="btn-filtres-dropdown" class="bg-white rounded-lg shadow-sm border border-gray-200 h-10 px-4 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                                Filtres
                            </button>

                            <div id="panel-filtres" class="hidden absolute top-full mt-2 left-0 w-[340px] bg-white border border-gray-100 shadow-2xl rounded-xl flex flex-col overflow-hidden max-h-[75vh] overflow-y-auto">
                                <div class="flex justify-between items-center px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                                    <span class="font-bold text-gray-800 text-sm">Ajusta la cerca</span>
                                    <button data-action="netejar-filtres" class="text-xs font-semibold text-primary hover:text-orange-700">Netejar</button>
                                </div>

                                <div class="p-5 space-y-7">
                                    <div>
                                        <h4 class="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Zona Geogràfica</h4>
                                        <div class="grid grid-cols-2 gap-2">
                                            <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all" data-action="toggle-generic" data-camp="comarca" data-valor="Tramuntana">Tramuntana</button>
                                            <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all" data-action="toggle-generic" data-camp="comarca" data-valor="Raiguer">Raiguer</button>
                                            <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all" data-action="toggle-generic" data-camp="comarca" data-valor="Pla">Pla</button>
                                            <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all" data-action="toggle-generic" data-camp="comarca" data-valor="Migjorn">Migjorn</button>
                                            <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all" data-action="toggle-generic" data-camp="comarca" data-valor="Llevant">Llevant</button>
                                            <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all" data-action="toggle-generic" data-camp="comarca" data-valor="Palma">Palma</button>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 class="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Categoria</h4>
                                        <div class="grid grid-cols-4 gap-2">
                                            <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all text-center" data-action="toggle-generic" data-camp="categoria" data-valor="1">1</button>
                                            <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all text-center" data-action="toggle-generic" data-camp="categoria" data-valor="2">2</button>
                                            <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all text-center" data-action="toggle-generic" data-camp="categoria" data-valor="3">3</button>
                                            <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all text-center" data-action="toggle-generic" data-camp="categoria" data-valor="4(HC)">4</button>
                                        </div>
                                    </div>

                                    <div>
                                        <div class="flex justify-between items-end mb-2">
                                            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide">Distància Màxima</h4>
                                            <span class="text-[13px] font-bold text-primary" id="val-dist">10 km</span>
                                        </div>
                                        <input type="range" id="sl-distancia" data-camp="distanciaMax" data-val-id="val-dist" data-sufix=" km" min="1" max="10" value="10" step="0.5" class="custom-slider w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary">
                                    </div>

                                    <div>
                                        <div class="flex justify-between items-end mb-2">
                                            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide">Desnivell Màxim</h4>
                                            <span class="text-[13px] font-bold text-primary" id="val-desn">1000 m</span>
                                        </div>
                                        <input type="range" id="sl-desnivell" data-camp="desnivellMax" data-val-id="val-desn" data-sufix=" m" min="0" max="1000" value="1000" step="50" class="custom-slider w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary">
                                    </div>

                                    <div>
                                        <div class="flex justify-between items-end mb-2">
                                            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide">Pendent Màxima</h4>
                                            <span class="text-[13px] font-bold text-primary" id="val-pend">< 10 %</span>
                                        </div>
                                        <input type="range" id="sl-pendent" data-camp="pendentMax" data-val-id="val-pend" data-prefix="< " data-sufix=" %" min="2" max="10" value="10" step="0.5" class="custom-slider w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary">
                                    </div>
                                </div>
                            </div>
                        </div>  

                        <div class="relative bg-white rounded-lg shadow-sm border border-gray-200 flex items-center h-10 px-3 w-64 md:w-72">
                            <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            <input type="text" id="input-cerca" autocomplete="off" class="w-full h-full outline-none border-none ring-0 focus:ring-0 text-sm text-gray-700 placeholder-gray-400 bg-transparent" placeholder="Cerca un port...">
                            
                            <button id="btn-clear-search" data-action="netejar-cerca" class="hidden ml-2 text-gray-400 hover:text-gray-600">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>

                            <ul id="llista-suggeriments" class="absolute top-full left-0 w-full mt-1 bg-white border border-gray-100 shadow-xl rounded-lg overflow-hidden hidden z-50 max-h-60 overflow-y-auto"></ul>
                        </div>

                        <button id="btn-completats" data-action="toggle-completats" class="bg-white rounded-lg shadow-sm border border-gray-200 h-10 px-4 flex items-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                            <svg class="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                            Ja completats
                        </button>
                    </div>

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
            const puertos = await getPuertos();
            const tots = puertos.map(createCardHTML).join('');
            return `<div class="container"><div class="segment-container">${tots}</div></div>`;
        }
    }
};

export const router = async () => {
    const path = window.location.pathname;
    const route = routes[path] || routes["/"];
    document.getElementById("app-viewport").innerHTML = await route.render() + `
        <div id="puerto-modal" class="modal" style="display:none;">
            <div class="modal-content">
                <span class="close-modal" data-action="close-modal">&times;</span>
                <div id="modal-body"></div>
            </div>
        </div>`;

    actualitzarInterficieUsuari();
    document.title = route.title;

    if (path === "/map") {
        resetFiltres();
        initGoogleMap();
        
        const portsJSON = await getPuertos();
        appState.totsElsPorts = portsJSON.map(p => assignarComarcaAdministrativa(p));
        
        executarFiltre();
    }
};