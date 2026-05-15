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
            const p1 = puertos[0];
            const p2 = puertos[1];
            const rest = puertos.slice(2, 5);

            const bentoHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
                <!-- Columna Esquerra (2 segments) -->
                <div class="lg:col-span-8 flex flex-col gap-6 h-full">
                    <!-- Segment of the Month (Gran) -->
                    <a href="/map" data-link class="group relative rounded-3xl overflow-hidden shadow-2xl flex-1 min-h-[400px] md:min-h-[450px] cursor-pointer block">
                        <img src="media/${p1.nom || p1.nombre}.jpg" onerror="this.src='media/photo.jpeg'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                        <div class="absolute inset-0 bg-gradient-to-t from-[#11131f] via-[#11131f]/40 to-transparent"></div>
                        <div class="absolute bottom-0 left-0 p-6 md:p-10 text-white w-full">
                            <span class="bg-[#ea580c] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block shadow-lg">Segment of the Month</span>
                            <h3 class="text-4xl md:text-6xl font-title font-bold mb-4 tracking-tight">${p1.nom || p1.nombre}</h3>
                            <div class="flex items-center gap-6 md:gap-8 text-sm md:text-base font-medium">
                                <span class="flex items-center gap-2"><svg class="w-5 h-5 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg> ${p1.distancia || p1.distancia_km} km</span>
                                <span class="flex items-center gap-2"><svg class="w-5 h-5 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11l7-7 7 7M5 19l7-7 7 7"></path></svg> ${p1.desnivell || p1.elevacion_m} m</span>
                                <span class="flex items-center gap-2"><svg class="w-5 h-5 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Cat. ${p1.categoria}</span>
                            </div>
                        </div>
                    </a>
                    
                    <!-- Segment Secundari Inferior -->
                    <a href="/map" data-link class="group relative rounded-3xl overflow-hidden shadow-lg h-[180px] md:h-[220px] flex-shrink-0 cursor-pointer block">
                        <img src="media/${p2.nom || p2.nombre}.jpg" onerror="this.src='media/photo.jpeg'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                        <div class="absolute inset-0 bg-gradient-to-t from-[#11131f] via-[#11131f]/30 to-transparent opacity-90"></div>
                        <div class="absolute bottom-0 left-0 p-6 text-white w-full">
                            <h3 class="text-2xl md:text-3xl font-title font-bold mb-3">${p2.nom || p2.nombre}</h3>
                            <div class="flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm font-medium text-gray-300 tracking-wide">
                                <span class="flex items-center gap-1.5"><svg class="w-4 h-4 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg> ${p2.distancia || p2.distancia_km} km</span>
                                <span class="flex items-center gap-1.5"><svg class="w-4 h-4 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11l7-7 7 7M5 19l7-7 7 7"></path></svg> ${p2.desnivell || p2.elevacion_m} m</span>
                                <span class="flex items-center gap-1.5"><svg class="w-4 h-4 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Cat. ${p2.categoria}</span>
                            </div>
                        </div>
                    </a>
                </div>

                <!-- Columna Dreta (3 segments) -->
                <div class="lg:col-span-4 flex flex-col gap-6 h-full">
                    ${rest.map(p => `
                    <a href="/map" data-link class="group relative rounded-3xl overflow-hidden shadow-lg flex-1 min-h-[160px] cursor-pointer block">
                        <img src="media/${p.nom || p.nombre}.jpg" onerror="this.src='media/photo.jpeg'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                        <div class="absolute inset-0 bg-gradient-to-t from-[#11131f] via-[#11131f]/40 to-transparent opacity-95"></div>
                        <div class="absolute bottom-0 left-0 p-5 text-white w-full">
                            <h3 class="text-xl md:text-2xl font-title font-bold mb-3 leading-tight">${p.nom || p.nombre}</h3>
                            <div class="flex flex-wrap items-center gap-3 md:gap-5 text-xs font-medium text-gray-300 tracking-wide">
                                <span class="flex items-center gap-1.5"><svg class="w-3.5 h-3.5 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg> ${p.distancia || p.distancia_km} km</span>
                                <span class="flex items-center gap-1.5"><svg class="w-3.5 h-3.5 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11l7-7 7 7M5 19l7-7 7 7"></path></svg> ${p.desnivell || p.elevacion_m} m</span>
                                <span class="flex items-center gap-1.5"><svg class="w-3.5 h-3.5 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Cat. ${p.categoria}</span>
                            </div>
                        </div>
                    </a>
                    `).join('')}
                </div>
            </div>
            `;

            return `
            <section id="intro" class="fade-in">
                <div class="relative w-full h-[calc(100vh-40px)] overflow-hidden">
                    <img src="media/photo.jpeg" class="w-full h-full object-cover">
                    <div class="absolute inset-0 flex flex-col justify-center items-center text-white bg-black/40 text-center p-5">
                        <h1 class="font-title text-4xl md:text-5xl lg:text-7xl font-bold mb-4">Mallorca Cycling</h1>
                        <p class="text-lg md:text-2xl opacity-90 tracking-wide">Discover the best mountain passes in Mallorca.</p>
                    </div>
                </div>
            </section>
            <section class="max-w-[1400px] w-[95%] mx-auto pb-12 pt-24 px-5">
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <h2 class="text-4xl md:text-5xl font-bold font-title text-secondary tracking-tight">Featured Segments</h2>
                        <p class="text-gray-500 mt-2 text-lg">Hand-picked classic climbs you must ride.</p>
                    </div>
                    <a href="/segments" data-link class="hidden md:block text-[#ea580c] font-bold tracking-wider hover:text-orange-700 transition-colors uppercase text-sm">View All Segments &rarr;</a>
                </div>
                ${bentoHTML}
            </section>
            
            <section class="max-w-[1200px] w-[90%] mx-auto pb-24 pt-12 px-5">
                <div class="text-center mb-10 fade-in">
                    <h2 class="text-3xl md:text-4xl font-bold font-title text-secondary tracking-tight">Your Cycling Hub</h2>
                    <p class="text-gray-500 mt-3 text-lg max-w-2xl mx-auto">Connect your Strava account to analyze your segment efforts, track your yearly progress, and discover your personal records.</p>
                </div>
                <div id="strava-card-container"></div>
            </section>
            
            <section class="max-w-[1200px] w-[90%] mx-auto py-20 px-5 border-t border-gray-100 fade-in">
                <div class="flex flex-col md:flex-row items-center gap-12">
                    <div class="flex-1">
                        <h2 class="text-3xl md:text-4xl font-bold font-title text-secondary tracking-tight mb-6">About Mallorca Cycling</h2>
                        <p class="text-gray-600 text-lg mb-4 leading-relaxed">
                            Born out of a deep passion for the mountains and the unique cycling culture of the island, Mallorca Cycling is dedicated to mapping the most challenging and beautiful climbs.
                        </p>
                        <p class="text-gray-600 text-lg leading-relaxed">
                            Our goal is to provide cyclists with an interactive, modern platform to explore HC and categorized segments, track their efforts, and connect with the global cycling community.
                        </p>
                    </div>
                    <div class="flex-1 w-full aspect-video rounded-3xl overflow-hidden shadow-xl">
                        <img src="media/photo.jpeg" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700">
                    </div>
                </div>
            </section>

            <section class="max-w-[1200px] w-[90%] mx-auto pb-24 px-5 fade-in">
                <div class="text-center mb-12">
                    <h2 class="text-3xl md:text-4xl font-bold font-title text-secondary tracking-tight">Meet the Creators</h2>
                    <p class="text-gray-500 mt-3 text-lg">The team behind Mallorca Cycling.</p>
                </div>
                <div class="flex flex-wrap justify-center gap-12 md:gap-24">
                    <div class="flex flex-col items-center group">
                        <div class="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-xl border-4 border-white ring-4 ring-[#ea580c]/20 group-hover:ring-[#ea580c] transition-all duration-500 mb-5">
                            <img src="media/photo.jpeg" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Pau">
                        </div>
                        <h4 class="font-bold text-gray-800 text-2xl font-title">Pau Antich</h4>
                        <p class="text-sm text-[#ea580c] uppercase tracking-widest font-bold mt-1">Co-Creator</p>
                    </div>
                    <div class="flex flex-col items-center group">
                        <div class="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shadow-xl border-4 border-white ring-4 ring-[#ea580c]/20 group-hover:ring-[#ea580c] transition-all duration-500 mb-5">
                            <img src="media/photo.jpeg" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Creator 2">
                        </div>
                        <h4 class="font-bold text-gray-800 text-2xl font-title">Jaume Ribas</h4>
                        <p class="text-sm text-[#ea580c] uppercase tracking-widest font-bold mt-1">Co-Creator</p>
                    </div>
                </div>
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
    },
    "/profile": {
        title: "My Profile | Mallorca Cycling",
        render: async () => {
            const userStr = localStorage.getItem('strava_athlete');
            if (!userStr) {
                window.location.hash = "/";
                return ``;
            }
            const user = JSON.parse(userStr);
            return `
            <div class="w-full max-w-[1000px] mx-auto py-16 px-5 fade-in min-h-[70vh]">
                <div class="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 md:p-12">
                    <div class="flex flex-col md:flex-row items-center md:items-start gap-8 border-b border-gray-100 pb-10">
                        <img src="${user.profile_medium}" class="w-32 h-32 rounded-full border-4 border-[#ea580c] object-cover shadow-md">
                        <div class="text-center md:text-left">
                            <h1 class="text-4xl font-bold font-title text-secondary mb-2">${user.firstname} ${user.lastname}</h1>
                            <p class="text-gray-500 flex items-center justify-center md:justify-start gap-2 mb-6">
                                <svg class="w-5 h-5 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                ${user.city || 'Mallorca'}, ${user.country || 'Spain'}
                            </p>
                            <a href="https://www.strava.com/athletes/${user.id}" target="_blank" class="bg-[#fc4c02] text-white px-6 py-2.5 rounded-full font-bold text-sm tracking-wide hover:bg-[#e34402] transition-colors inline-flex items-center gap-2">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"></path></svg>
                                View on Strava
                            </a>
                        </div>
                    </div>
                    <div class="py-16 text-center">
                        <h3 class="text-2xl font-bold text-gray-800 mb-4">Under Construction 🚧</h3>
                        <p class="text-gray-500 max-w-lg mx-auto text-lg">This profile section is being prepared. Soon you'll be able to see your conquered segments, personal goals, and detailed climbing statistics here.</p>
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

    window.scrollTo(0, 0);

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