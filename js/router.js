// router.js - Navegació i Control Principal
import { initGoogleMap, assignarComarcaAdministrativa } from './map.js';
import { actualitzarInterficieUsuari, createCardHTML, createFiltresHTML, createSidebarFiltresHTML, createTopBarSegmentsHTML } from './ui.js';
import { resetFiltres } from './filters.js';
import { appState, executarFiltre } from './app.js';
import { getAthleteStats, getStarredSegments, getRecentActivities } from './stravaApi.js';
import { formatTime } from './utils.js';

const getPuertos = async () => {
    try {
        const r = await fetch('data/puertos.json');
        const data = await r.json();
        return data["@graph"] || data;
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
                        <img src="media/mallorcaCyclingLogo.png" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700">
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
            const stats = await getAthleteStats(user.id);
            const starredSegments = await getStarredSegments();

            const formatDistance = (m) => m ? (m / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0';
            const formatElevation = (m) => m ? m.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0';

            const recent = stats?.recent_ride_totals || {};
            const ytd = stats?.ytd_ride_totals || {};
            const all = stats?.all_ride_totals || {};

            let trophies = [];
            if (appState.totsElsPorts.length > 0) {
                appState.totsElsPorts.forEach(port => {
                    const cache = localStorage.getItem('segment_' + port.id);
                    if (cache) {
                        try {
                            const parsed = JSON.parse(cache);
                            if (parsed.data?.athlete_segment_stats?.pr_elapsed_time) {
                                trophies.push({
                                    port: port,
                                    pr: parsed.data.athlete_segment_stats.pr_elapsed_time,
                                    efforts: parsed.data.athlete_segment_stats.effort_count || 1
                                });
                            }
                        } catch (e) { }
                    }
                });
            }

            let trophiesHTML = '';
            if (trophies.length > 0) {
                const visibleTrophies = trophies.slice(0, 3);
                const hiddenTrophies = trophies.slice(3);

                trophiesHTML = `
                <h2 class="text-3xl font-bold font-title text-secondary mt-16 mb-6 px-4 flex items-center gap-3">
                    <svg class="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"></path></svg>
                    Your Conquered Classics
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="trophies-container">
                    ${visibleTrophies.map(t => `
                    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group block">
                        <div class="relative rounded-xl overflow-hidden h-36 mb-2">
                            <img src="media/${t.port.nom || t.port.nombre}.jpg" onerror="this.src='media/photo.jpeg'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                            <div class="absolute inset-0 bg-gradient-to-t from-[#11131f]/90 via-transparent to-transparent"></div>
                            <div class="absolute bottom-3 left-4 right-4">
                                <h3 class="font-bold font-title text-white text-lg leading-tight truncate drop-shadow-md">${t.port.nom || t.port.nombre}</h3>
                            </div>
                        </div>
                        <div class="px-2 pb-2">
                            <div class="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5 border border-gray-100 group-hover:bg-orange-50 group-hover:border-orange-100 transition-colors">
                                <div class="flex-1 pl-1">
                                    <span class="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mb-0.5 group-hover:text-primary transition-colors">Personal Record</span>
                                    <span class="text-lg font-bold font-title text-gray-800 flex items-center gap-1.5 group-hover:text-primary transition-colors">
                                        <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                                        ${formatTime(t.pr)}
                                    </span>
                                </div>
                                <div class="w-px h-8 bg-gray-200 mx-1 group-hover:bg-orange-200 transition-colors"></div>
                                <div class="text-center px-3">
                                    <span class="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mb-0.5 group-hover:text-primary transition-colors">Efforts</span>
                                    <span class="text-lg font-bold text-gray-700 group-hover:text-primary transition-colors">${t.efforts}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                    
                    ${hiddenTrophies.map(t => `
                    <div class="hidden-trophy hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group block">
                        <div class="relative rounded-xl overflow-hidden h-36 mb-2">
                            <img src="media/${t.port.nom || t.port.nombre}.jpg" onerror="this.src='media/photo.jpeg'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                            <div class="absolute inset-0 bg-gradient-to-t from-[#11131f]/90 via-transparent to-transparent"></div>
                            <div class="absolute bottom-3 left-4 right-4">
                                <h3 class="font-bold font-title text-white text-lg leading-tight truncate drop-shadow-md">${t.port.nom || t.port.nombre}</h3>
                            </div>
                        </div>
                        <div class="px-2 pb-2">
                            <div class="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5 border border-gray-100 group-hover:bg-orange-50 group-hover:border-orange-100 transition-colors">
                                <div class="flex-1 pl-1">
                                    <span class="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mb-0.5 group-hover:text-primary transition-colors">Personal Record</span>
                                    <span class="text-lg font-bold font-title text-gray-800 flex items-center gap-1.5 group-hover:text-primary transition-colors">
                                        <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                                        ${formatTime(t.pr)}
                                    </span>
                                </div>
                                <div class="w-px h-8 bg-gray-200 mx-1 group-hover:bg-orange-200 transition-colors"></div>
                                <div class="text-center px-3">
                                    <span class="text-[9px] text-gray-400 font-bold uppercase tracking-widest block mb-0.5 group-hover:text-primary transition-colors">Efforts</span>
                                    <span class="text-lg font-bold text-gray-700 group-hover:text-primary transition-colors">${t.efforts}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
                ${hiddenTrophies.length > 0 ? `
                <div class="flex justify-center mt-8">
                    <button onclick="document.querySelectorAll('.hidden-trophy').forEach(el => { el.classList.remove('hidden'); el.classList.add('block'); }); this.remove();" class="bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary hover:bg-orange-50 font-bold py-2.5 px-6 rounded-full text-sm transition-colors shadow-sm flex items-center gap-2">
                        Load More (${hiddenTrophies.length})
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                </div>
                ` : ''}
                `;
            }

            let starredHTML = '';
            if (starredSegments && starredSegments.length > 0) {
                starredHTML = `
                <h2 class="text-3xl font-bold font-title text-secondary mt-16 mb-6 px-4 flex items-center gap-3">
                    <svg class="w-8 h-8 text-[#ea580c]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                    Starred Segments
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${starredSegments.slice(0, 9).map(s => `
                    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div class="absolute -right-4 -top-4 text-gray-50 opacity-50 group-hover:scale-110 transition-transform">
                            <svg class="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                        </div>
                        <div class="relative z-10">
                            <h3 class="font-bold font-title text-gray-800 text-lg leading-tight mb-4 pr-6">${s.name}</h3>
                            <div class="flex items-center gap-5 text-sm text-gray-600 font-medium">
                                <span class="flex items-center gap-1.5"><svg class="w-4 h-4 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg> ${(s.distance / 1000).toFixed(1)} km</span>
                                <span class="flex items-center gap-1.5"><svg class="w-4 h-4 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11l7-7 7 7M5 19l7-7 7 7"></path></svg> ${s.total_elevation_gain.toFixed(0)} m</span>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>`;
            }

            return `
            <div class="w-full max-w-[1200px] mx-auto py-16 px-5 fade-in min-h-[70vh]">
                <div class="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 md:p-12 mb-8">
                    <div class="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <img src="${user.profile_medium}" class="w-32 h-32 rounded-full border-4 border-[#ea580c] object-cover shadow-md">
                        <div class="text-center md:text-left flex-1">
                            <h1 class="text-4xl font-bold font-title text-secondary mb-2">${user.firstname} ${user.lastname}</h1>
                            <p class="text-gray-500 flex items-center justify-center md:justify-start gap-2 mb-6">
                                <svg class="w-5 h-5 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                ${user.city || 'Mallorca'}, ${user.country || 'Spain'}
                            </p>
                            <div class="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <a href="https://www.strava.com/athletes/${user.id}" target="_blank" class="bg-[#fc4c02] text-white px-6 py-2.5 rounded-full font-bold text-sm tracking-wide hover:bg-[#e34402] transition-colors inline-flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"></path></svg>
                                    View on Strava
                                </a>
                                <button data-action="logout-strava" class="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-full font-bold text-sm tracking-wide hover:bg-gray-200 hover:text-red-600 transition-colors inline-flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                    Log out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 class="text-3xl font-bold font-title text-secondary mb-6 px-4">Your Cycling Stats</h2>
                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Recent Stats -->
                    <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -mr-8 -mt-8 z-0 transition-transform group-hover:scale-110"></div>
                        <div class="relative z-10">
                            <div class="flex items-center gap-3 mb-8">
                                <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <h3 class="font-title font-bold text-xl text-secondary">Recent <span class="text-sm font-normal text-gray-400 block">Last 4 weeks</span></h3>
                            </div>
                            <div class="space-y-6">
                                <div>
                                    <p class="text-sm text-gray-500 font-medium mb-1">Distance</p>
                                    <p class="text-4xl font-bold font-title text-gray-800">${formatDistance(recent.distance)}<span class="text-lg text-gray-400 ml-1">km</span></p>
                                </div>
                                <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                    <div>
                                        <p class="text-sm text-gray-500 font-medium mb-1">Elevation</p>
                                        <p class="text-2xl font-bold text-gray-800">${formatElevation(recent.elevation_gain)}<span class="text-sm text-gray-400 ml-1">m</span></p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-gray-500 font-medium mb-1">Rides</p>
                                        <p class="text-2xl font-bold text-gray-800">${recent.count || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- YTD Stats -->
                    <div class="bg-[#11131f] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all transform hover:-translate-y-1">
                        <div class="absolute inset-0 opacity-20 pointer-events-none transition-opacity group-hover:opacity-30" style="background: radial-gradient(circle at 100% 0%, #ea580c 0%, transparent 70%);"></div>
                        <div class="relative z-10">
                            <div class="flex items-center gap-3 mb-8">
                                <div class="w-10 h-10 rounded-full bg-[#ea580c] flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                </div>
                                <h3 class="font-title font-bold text-xl text-white">This Year <span class="text-sm font-normal text-gray-400 block">Year to date</span></h3>
                            </div>
                            <div class="space-y-6">
                                <div>
                                    <p class="text-sm text-gray-400 font-medium mb-1">Distance</p>
                                    <p class="text-5xl font-bold font-title text-[#ea580c] drop-shadow-sm">${formatDistance(ytd.distance)}<span class="text-lg text-gray-500 ml-2">km</span></p>
                                </div>
                                <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                                    <div>
                                        <p class="text-sm text-gray-400 font-medium mb-1">Elevation</p>
                                        <p class="text-2xl font-bold text-white">${formatElevation(ytd.elevation_gain)}<span class="text-sm text-gray-500 ml-1">m</span></p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-gray-400 font-medium mb-1">Rides</p>
                                        <p class="text-2xl font-bold text-white">${ytd.count || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- All Time Stats -->
                    <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -mr-8 -mt-8 z-0 transition-transform group-hover:scale-110"></div>
                        <div class="relative z-10">
                            <div class="flex items-center gap-3 mb-8">
                                <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                                </div>
                                <h3 class="font-title font-bold text-xl text-secondary">All Time <span class="text-sm font-normal text-gray-400 block">Since joining</span></h3>
                            </div>
                            <div class="space-y-6">
                                <div>
                                    <p class="text-sm text-gray-500 font-medium mb-1">Distance</p>
                                    <p class="text-4xl font-bold font-title text-gray-800">${formatDistance(all.distance)}<span class="text-lg text-gray-400 ml-1">km</span></p>
                                </div>
                                <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                    <div>
                                        <p class="text-sm text-gray-500 font-medium mb-1">Elevation</p>
                                        <p class="text-2xl font-bold text-gray-800">${formatElevation(all.elevation_gain)}<span class="text-sm text-gray-400 ml-1">m</span></p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-gray-500 font-medium mb-1">Rides</p>
                                        <p class="text-2xl font-bold text-gray-800">${all.count || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Chart Container -->
                <div class="mt-8 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 class="font-title font-bold text-xl text-secondary mb-6 flex items-center gap-2">
                        <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                        Recent Activity Volume
                    </h3>
                    <div class="w-full h-[300px] relative">
                        <canvas id="activitiesChart"></canvas>
                    </div>
                </div>
                
                ${trophiesHTML}
                ${starredHTML}
            </div>`;
        },
        init: async () => {
            const canvas = document.getElementById('activitiesChart');
            if (!canvas) return;

            // Si Chart.js no està carregat al window, esperem o avisem
            if (typeof Chart === 'undefined') {
                console.error("Chart.js not loaded.");
                return;
            }

            const activities = await getRecentActivities(30);
            if (!activities || activities.length === 0) {
                canvas.parentElement.innerHTML = '<p class="text-gray-400 text-center mt-10">No recent activities found to display.</p>';
                return;
            }

            // Prepare data: group by date
            // Start from 30 days ago to today? Or just plot the last 15 activities
            const recent = activities.slice(0, 15).reverse();

            const labels = recent.map(a => {
                const d = new Date(a.start_date_local);
                return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
            });
            const dataDistance = recent.map(a => (a.distance / 1000).toFixed(1));

            const ctx = canvas.getContext('2d');

            // Create gradient for the area under the line
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(234, 88, 12, 0.5)'); // #ea580c
            gradient.addColorStop(1, 'rgba(234, 88, 12, 0.0)');

            new Chart(canvas, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Distance',
                        data: dataDistance,
                        fill: true,
                        backgroundColor: gradient,
                        borderColor: '#ea580c',
                        borderWidth: 3,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#ea580c',
                        pointBorderWidth: 2,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHitRadius: 15,
                        tension: 0.4 // Smooth curves
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(17, 19, 31, 0.9)',
                            titleColor: '#9ca3af',
                            bodyColor: '#ffffff',
                            padding: 12,
                            titleFont: { family: 'Inter', size: 12, weight: 'normal' },
                            bodyFont: { family: 'Inter', size: 15, weight: 'bold' },
                            displayColors: false,
                            cornerRadius: 8,
                            callbacks: {
                                title: function (context) {
                                    return context[0].label;
                                },
                                label: function (context) {
                                    return context.parsed.y + ' km';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: '#f3f4f6', drawBorder: false, borderDash: [5, 5] },
                            ticks: { font: { family: 'Inter' }, color: '#9ca3af', maxTicksLimit: 5 }
                        },
                        x: {
                            grid: { display: false, drawBorder: false },
                            ticks: { font: { family: 'Inter' }, color: '#9ca3af', maxTicksLimit: 8 }
                        }
                    }
                }
            });
        }
    }
};

export const router = async () => {
    let path = window.location.hash.slice(1);
    if (!path) path = "/";
    const route = routes[path] || routes["/"];
    document.getElementById("app-viewport").innerHTML = await route.render() + `
        <div id="puerto-modal" class="fixed inset-0 z-[2000] bg-black/0 backdrop-blur-none flex items-center justify-center pointer-events-none transition-all duration-300 ease-in-out">
            <div id="modal-container" class="bg-white w-full h-full md:w-[95%] md:h-auto md:rounded-3xl max-w-[1200px] max-h-[100dvh] md:max-h-[90vh] overflow-y-auto relative shadow-2xl flex flex-col transform scale-95 opacity-0 transition-all duration-300 ease-out">
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

    const footer = document.querySelector('footer');
    if (path === "/map") {
        if (footer) footer.style.display = 'none';
        document.body.style.overflow = 'hidden';
        resetFiltres();
        initGoogleMap();
    } else {
        if (footer) footer.style.display = 'block';
        document.body.style.overflow = '';
        if (path === "/segments") {
            resetFiltres();
        }
    }

    if (route.init) {
        await route.init();
    }

    // Sempre s'executa per a que actualitzi els elements (ja sigui mapa o grid)
    executarFiltre();
};