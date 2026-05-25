// router.js - Navegació i Control Principal
import { initGoogleMap, assignarComarcaAdministrativa } from './map.js';
import { actualitzarInterficieUsuari, createCardHTML, createFiltresHTML, createSidebarFiltresHTML, createTopBarSegmentsHTML } from './ui.js';
import { resetFiltres } from './filters.js';
import { appState, executarFiltre } from './app.js';
import { getAthleteStats, getStarredSegments, getRecentActivities } from './stravaApi.js';
import { formatTime, loadScript } from './utils.js';
import { t } from './translations.js';

const getPuertos = async () => {
    try {
        const r = await fetch('data/puertos.json');
        const data = await r.json();
        return data["@graph"] || data;
    } catch (e) { return []; }
};

const mapHikingRoutes = (hikingData) => {
    if (!hikingData || !hikingData.itemListElement) return [];
    return hikingData.itemListElement.map(item => {
        const props = item.additionalProperty || [];
        const getProp = (name) => props.find(p => p.name === name)?.value || '';

        const polyline = item.itinerary.geo.line;
        let lat = 0, lng = 0;
        if (polyline) {
            const coords = polyline.trim().split(/\s+/)[0].split(',');
            if (coords.length >= 2) {
                lat = parseFloat(coords[0]);
                lng = parseFloat(coords[1]);
            }
        }

        return {
            id: item['@id'].split('/').pop(),
            nom: item.name,
            descripcio: item.description,
            distancia_km: parseFloat(getProp('Distance').replace(' km', '')),
            elevacion_m: parseFloat(getProp('Elevation gain').replace(' m', '')),
            categoria: getProp('Technical difficulty'),
            polyline: polyline,
            lat: lat,
            lng: lng,
            imatge: 'media/mallorcaCyclingLogo.webp',
            type: 'hiking'
        }
    });
};

const getHikingRoutes = async () => {
    try {
        const r = await fetch('data/rutasmallorca_provisional.json');
        const data = await r.json();
        return mapHikingRoutes(data);
    } catch (e) { return []; }
};

const routes = {
    "/": {
        title: () => `${t('nav_home')} | Mallorca Cycling`,
        render: async () => {
            const puertos = await getPuertos();
            const p1 = puertos[0];
            const p2 = puertos[1];
            const rest = puertos.slice(2, 5);

            const p1Str = JSON.stringify(p1).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
            const p2Str = JSON.stringify(p2).replace(/'/g, "&apos;").replace(/"/g, "&quot;");

            const bentoHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
                <!-- Columna Esquerra (2 segments) -->
                <div class="lg:col-span-8 flex flex-col gap-6 h-full">
                    <!-- Segment of the Month (Gran) -->
                    <div data-action="view-details" data-port="${p1Str}" role="button" tabindex="0" aria-label="${t('view_details_of')} ${p1.nom || p1.nombre}" class="group relative rounded-3xl overflow-hidden shadow-2xl flex-1 min-h-[400px] md:min-h-[450px] cursor-pointer block">
                        <img src="${p1.imatge && p1.imatge !== 'media/ColldeSoller.webp' ? p1.imatge : 'media/' + (p1.nom || p1.nombre) + '.jpg'}" alt="${p1.nom || p1.nombre}" onerror="this.src='media/ColldeSoller.webp'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                        <div class="absolute inset-0 bg-gradient-to-t from-[#11131f] via-[#11131f]/40 to-transparent"></div>
                        <div class="absolute bottom-0 left-0 p-6 md:p-10 text-white w-full">
                            <span class="bg-[#cf4002] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block shadow-lg">${t('segment_of_month')}</span>
                            <h3 class="text-4xl md:text-6xl font-title font-bold mb-4 tracking-tight">${p1.nom || p1.nombre}</h3>
                            <div class="flex items-center gap-6 md:gap-8 text-sm md:text-base font-medium">
                                <span class="flex items-center gap-2"><svg class="w-5 h-5 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg> ${p1.distancia || p1.distancia_km} km</span>
                                <span class="flex items-center gap-2"><svg class="w-5 h-5 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11l7-7 7 7M5 19l7-7 7 7"></path></svg> ${p1.desnivell || p1.elevacion_m} m</span>
                                <span class="flex items-center gap-2"><svg class="w-5 h-5 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Cat. ${p1.categoria}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Segment Secundari Inferior -->
                    <div data-action="view-details" data-port="${p2Str}" role="button" tabindex="0" aria-label="${t('view_details_of')} ${p2.nom || p2.nombre}" class="group relative rounded-3xl overflow-hidden shadow-lg h-[180px] md:h-[220px] flex-shrink-0 cursor-pointer block">
                        <img src="${p2.imatge && p2.imatge !== 'media/ColldeSoller.webp' ? p2.imatge : 'media/' + (p2.nom || p2.nombre) + '.jpg'}" alt="${p2.nom || p2.nombre}" onerror="this.src='media/ColldeSoller.webp'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                        <div class="absolute inset-0 bg-gradient-to-t from-[#11131f] via-[#11131f]/30 to-transparent opacity-90"></div>
                        <div class="absolute bottom-0 left-0 p-6 text-white w-full">
                            <h3 class="text-2xl md:text-3xl font-title font-bold mb-3">${p2.nom || p2.nombre}</h3>
                            <div class="flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm font-medium text-gray-300 tracking-wide">
                                <span class="flex items-center gap-1.5"><svg class="w-4 h-4 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg> ${p2.distancia || p2.distancia_km} km</span>
                                <span class="flex items-center gap-1.5"><svg class="w-4 h-4 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11l7-7 7 7M5 19l7-7 7 7"></path></svg> ${p2.desnivell || p2.elevacion_m} m</span>
                                <span class="flex items-center gap-1.5"><svg class="w-4 h-4 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Cat. ${p2.categoria}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Columna Dreta (3 segments) -->
                <div class="lg:col-span-4 flex flex-col gap-6 h-full">
                    ${rest.map(p => {
                const pStr = JSON.stringify(p).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
                return `
                        <div data-action="view-details" data-port="${pStr}" role="button" tabindex="0" aria-label="${t('view_details_of')} ${p.nom || p.nombre}" class="group relative rounded-3xl overflow-hidden shadow-lg flex-1 min-h-[160px] cursor-pointer block">
                            <img src="${p.imatge && p.imatge !== 'media/ColldeSoller.webp' ? p.imatge : 'media/' + (p.nom || p.nombre) + '.jpg'}" alt="${p.nom || p.nombre}" onerror="this.src='media/ColldeSoller.webp'" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                            <div class="absolute inset-0 bg-gradient-to-t from-[#11131f] via-[#11131f]/40 to-transparent opacity-95"></div>
                            <div class="absolute bottom-0 left-0 p-5 text-white w-full">
                                <h3 class="text-xl md:text-2xl font-title font-bold mb-3 leading-tight">${p.nom || p.nombre}</h3>
                                <div class="flex flex-wrap items-center gap-3 md:gap-5 text-xs font-medium text-gray-300 tracking-wide">
                                    <span class="flex items-center gap-1.5"><svg class="w-3.5 h-3.5 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg> ${p.distancia || p.distancia_km} km</span>
                                    <span class="flex items-center gap-1.5"><svg class="w-3.5 h-3.5 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11l7-7 7 7M5 19l7-7 7 7"></path></svg> ${p.desnivell || p.elevacion_m} m</span>
                                    <span class="flex items-center gap-1.5"><svg class="w-3.5 h-3.5 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Cat. ${p.categoria}</span>
                                </div>
                            </div>
                        </div>
                        `;
            }).join('')}
                </div>
            </div>
            `;

            return `
            <section id="intro" class="fade-in">
                <div class="relative w-full h-[calc(100vh-40px)] overflow-hidden bg-[#11131f]">
                    <!-- Slideshow Images -->
                    <img src="media/ColldeSoller.webp" alt="Coll de Sóller" class="hero-slideshow-img">
                    <img src="media/PuigMajorVertienteLluc.webp" alt="Puig Major" class="hero-slideshow-img">
                    <img src="media/ColldesGrauEsporles.webp" alt="Coll des Grau" class="hero-slideshow-img">
                    <img src="media/ColldesaCreuCalvia.webp" alt="Coll de sa Creu" class="hero-slideshow-img">
                    
                    <div class="absolute inset-0 flex flex-col justify-center items-center text-white bg-black/40 text-center p-5 z-10 pointer-events-none">
                        <h1 class="font-title text-4xl md:text-5xl lg:text-7xl font-bold mb-4">Mallorca Cycling</h1>
                        <p class="text-lg md:text-2xl opacity-90 tracking-wide">${t('hero_subtitle')}</p>
                    </div>
                </div>
            </section>
            <section class="max-w-[1400px] w-[95%] mx-auto pb-12 pt-24 px-5">
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <h2 class="text-4xl md:text-5xl font-bold font-title text-secondary tracking-tight">${t('featured_segments')}</h2>
                        <p class="text-gray-500 mt-2 text-lg">${t('home_handpicked')}</p>
                    </div>
                    <a href="/segments" data-link class="hidden md:block text-[#cf4002] font-bold tracking-wider hover:text-orange-700 transition-colors uppercase text-sm">${t('home_view_all')} &rarr;</a>
                </div>
                ${bentoHTML}
                
                <!-- Mobile only View All Segments button -->
                <div class="mt-8 flex justify-center md:hidden w-full">
                    <a href="/segments" data-link class="w-full text-center bg-white border border-gray-200 text-[#cf4002] font-bold py-3.5 px-6 rounded-2xl text-sm transition-all hover:bg-orange-50 hover:border-[#ea580c] uppercase tracking-wider shadow-sm">
                        ${t('home_view_all')} &rarr;
                    </a>
                </div>
            </section>
            
            <section class="max-w-[1200px] w-[90%] mx-auto pb-24 pt-12 px-5">
                <div class="text-center mb-10 fade-in">
                    <h2 class="text-3xl md:text-4xl font-bold font-title text-secondary tracking-tight">${t('hub_title')}</h2>
                    <p class="text-gray-500 mt-3 text-lg max-w-2xl mx-auto">${t('hub_desc')}</p>
                </div>
                <div id="strava-card-container"></div>
            </section>
            <section class="max-w-[1200px] w-[90%] mx-auto py-20 px-5 border-t border-gray-100 fade-in">
                <div class="flex flex-col md:flex-row items-center gap-12">
                    <div class="flex-1 flex flex-col justify-center text-left">
                        <h2 class="text-3xl md:text-4xl font-bold font-title text-secondary tracking-tight mb-6" data-i18n="about_title">${t('about_title')}</h2>
                        <p class="text-gray-600 text-lg mb-4 leading-relaxed" data-i18n="about_p1">${t('about_p1')}</p>
                        <p class="text-gray-600 text-lg leading-relaxed" data-i18n="about_p2">${t('about_p2')}</p>
                    </div>
                    <div class="flex-1 w-full aspect-video rounded-3xl overflow-hidden shadow-xl">
                        <img src="media/mallorcaCyclingLogo.webp" alt="Logotip de Mallorca Cycling" class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700">
                    </div>
                </div>
            </section>

            <!-- Modernized Team/Creators Section with fallbacks and social tags -->
            <section class="max-w-[1250px] w-[95%] mx-auto pb-32 px-5 fade-in">
                <div class="text-center mb-16">
                    <h2 class="text-4xl md:text-5xl font-black font-title text-secondary tracking-tight mb-4" data-i18n="creators_title">${t('creators_title')}</h2>
                    <p class="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed" data-i18n="creators_subtitle">${t('creators_subtitle')}</p>
                </div>
                
                <div class="flex flex-wrap justify-center gap-10 md:gap-16">
                    <!-- Creator 1: Pau Antich -->
                    <div class="team-card w-full max-w-[320px] aspect-[3/4] bg-white rounded-3xl overflow-hidden shadow-md border border-gray-150 hover:shadow-2xl hover:border-[#fc4c02]/30 transition-all duration-300 relative group flex flex-col">
                        <!-- Image Container with fallback systems -->
                        <div class="relative w-full h-full">
                            <img src="media/pau.jpg" alt="Pau Antich" onerror="this.classList.add('hidden'); this.nextElementSibling.classList.remove('hidden');" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                            
                            <!-- Initials Gradient Fallback (Pau Theme: Cycling Orange) -->
                            <div class="hidden absolute inset-0 bg-gradient-to-br from-[#ff7e40] to-[#fc4c02] flex flex-col items-center justify-center text-white p-6">
                                <div class="w-20 h-20 rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center text-3xl font-black font-title tracking-wider mb-4 shadow-inner">PA</div>
                                <svg class="w-12 h-12 opacity-35 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/></svg>
                            </div>
                        </div>

                        <!-- Card text overlays sitting cleanly inside photo view -->
                        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-6 text-white text-left flex flex-col justify-end">
                            <span class="bg-[#fc4c02]/25 border border-[#fc4c02]/45 text-[#ff8e5e] text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2.5 inline-block w-fit glow-orange" data-i18n="creators_role">${t('creators_role')}</span>
                            <h3 class="font-black text-white text-2xl font-title leading-tight mb-1">Pau Antich</h3>
                            
                            <!-- Floating Social Bar on hover -->
                            <div class="flex items-center gap-3 mt-4">
                                <a href="https://strava.com" target="_blank" aria-label="${t('creators_strava')}" class="creator-social-btn social-delay-1 w-9 h-9 rounded-full bg-white/10 hover:bg-[#fc4c02] text-white border border-white/10 hover:border-transparent flex items-center justify-center transition-all shadow-md">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/></svg>
                                </a>
                                <a href="https://github.com" target="_blank" aria-label="${t('creators_github')}" class="creator-social-btn social-delay-2 w-9 h-9 rounded-full bg-white/10 hover:bg-black text-white border border-white/10 hover:border-transparent flex items-center justify-center transition-all shadow-md">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.646.64.699 1.026 1.592 1.026 2.683 0 3.842-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                                </a>
                                <a href="https://linkedin.com" target="_blank" aria-label="${t('creators_linkedin')}" class="creator-social-btn social-delay-3 w-9 h-9 rounded-full bg-white/10 hover:bg-[#0077b5] text-white border border-white/10 hover:border-transparent flex items-center justify-center transition-all shadow-md">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Creator 2: Jaume Ribas -->
                    <div class="team-card w-full max-w-[320px] aspect-[3/4] bg-white rounded-3xl overflow-hidden shadow-md border border-gray-150 hover:shadow-2xl hover:border-blue-500/30 transition-all duration-300 relative group flex flex-col">
                        <!-- Image Container with fallback systems -->
                        <div class="relative w-full h-full">
                            <img src="media/jaume.jpg" alt="Jaume Ribas" onerror="this.classList.add('hidden'); this.nextElementSibling.classList.remove('hidden');" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
                            
                            <!-- Initials Gradient Fallback (Jaume Theme: Hiking Blue) -->
                            <div class="hidden absolute inset-0 bg-gradient-to-br from-[#60a5fa] to-[#2563eb] flex flex-col items-center justify-center text-white p-6">
                                <div class="w-20 h-20 rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center text-3xl font-black font-title tracking-wider mb-4 shadow-inner">JR</div>
                                <svg class="w-12 h-12 opacity-35 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/><path d="M7 6c-1.1 0-2 .9-2 2 v4c0 1.1.9 2 2 2h1v-8H7z"/></svg>
                            </div>
                        </div>

                        <!-- Card text overlays sitting cleanly inside photo view -->
                        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-6 text-white text-left flex flex-col justify-end">
                            <span class="bg-blue-600/25 border border-blue-500/45 text-blue-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2.5 inline-block w-fit glow-blue" data-i18n="creators_role">${t('creators_role')}</span>
                            <h3 class="font-black text-white text-2xl font-title leading-tight mb-1">Jaume Ribas</h3>
                            
                            <!-- Floating Social Bar on hover -->
                            <div class="flex items-center gap-3 mt-4">
                                <a href="https://strava.com" target="_blank" aria-label="${t('creators_strava')}" class="creator-social-btn social-delay-1 w-9 h-9 rounded-full bg-white/10 hover:bg-[#fc4c02] text-white border border-white/10 hover:border-transparent flex items-center justify-center transition-all shadow-md">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/></svg>
                                </a>
                                <a href="https://github.com" target="_blank" aria-label="${t('creators_github')}" class="creator-social-btn social-delay-2 w-9 h-9 rounded-full bg-white/10 hover:bg-black text-white border border-white/10 hover:border-transparent flex items-center justify-center transition-all shadow-md">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.646.64.699 1.026 1.592 1.026 2.683 0 3.842-2.337 4.687-4.565 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                                </a>
                                <a href="https://linkedin.com" target="_blank" aria-label="${t('creators_linkedin')}" class="creator-social-btn social-delay-3 w-9 h-9 rounded-full bg-white/10 hover:bg-[#0077b5] text-white border border-white/10 hover:border-transparent flex items-center justify-center transition-all shadow-md">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                </a>
                            </div>
                        </div>
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

                <div class="absolute top-4 left-4 right-4 sm:right-auto z-40 flex flex-col gap-3 items-start">
                    ${createFiltresHTML()}

                    <div class="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-10 mt-1">
                        <button data-action="center-on-user" title="${t('center_on_user')}" aria-label="${t('center_on_user')}" class="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors border-b border-gray-100 focus:outline-none">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v2m0 12v2m8-8h-2M6 12H4m12 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        </button>
                        <button data-action="reset-map-view" title="${t('reset_map_view')}" aria-label="${t('reset_map_view')}" class="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors focus:outline-none">
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
            if (appState.cyclingRoutes.length > 0) {
                appState.cyclingRoutes.forEach(port => {
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
                    ${t('profile_conquered')}
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="trophies-container">
                    ${visibleTrophies.map(tr => `
                    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group block">
                        <div class="relative rounded-xl overflow-hidden h-36 mb-2">
                            <img src="${tr.port.imatge && tr.port.imatge !== 'media/ColldeSoller.webp' ? tr.port.imatge : 'media/' + (tr.port.nom || tr.port.nombre) + '.jpg'}" alt="${tr.port.nom || tr.port.nombre}" onerror="this.src='media/ColldeSoller.webp'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                            <div class="absolute inset-0 bg-gradient-to-t from-[#11131f]/90 via-transparent to-transparent"></div>
                            <div class="absolute bottom-3 left-4 right-4">
                                <h3 class="font-bold font-title text-white text-lg leading-tight truncate drop-shadow-md">${tr.port.nom || tr.port.nombre}</h3>
                            </div>
                        </div>
                        <div class="px-2 pb-2">
                            <div class="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5 border border-gray-100 group-hover:bg-orange-50 group-hover:border-orange-100 transition-colors">
                                <div class="flex-1 pl-1">
                                    <span class="text-[9px] text-gray-550 font-bold uppercase tracking-widest block mb-0.5 group-hover:text-primary transition-colors">${t('your_pr')}</span>
                                    <span class="text-lg font-bold font-title text-gray-800 flex items-center gap-1.5 group-hover:text-primary transition-colors">
                                        <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                                        ${formatTime(tr.pr)}
                                    </span>
                                </div>
                                <div class="w-px h-8 bg-gray-200 mx-1 group-hover:bg-orange-200 transition-colors"></div>
                                <div class="text-center px-3">
                                    <span class="text-[9px] text-gray-550 font-bold uppercase tracking-widest block mb-0.5 group-hover:text-primary transition-colors">${t('profile_efforts')}</span>
                                    <span class="text-lg font-bold text-gray-700 group-hover:text-primary transition-colors">${tr.efforts}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                    
                    ${hiddenTrophies.map(tr => `
                    <div class="hidden-trophy hidden bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group block">
                        <div class="relative rounded-xl overflow-hidden h-36 mb-2">
                            <img src="${tr.port.imatge && tr.port.imatge !== 'media/ColldeSoller.webp' ? tr.port.imatge : 'media/' + (tr.port.nom || tr.port.nombre) + '.jpg'}" alt="${tr.port.nom || tr.port.nombre}" onerror="this.src='media/ColldeSoller.webp'" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
                            <div class="absolute inset-0 bg-gradient-to-t from-[#11131f]/90 via-transparent to-transparent"></div>
                            <div class="absolute bottom-3 left-4 right-4">
                                <h3 class="font-bold font-title text-white text-lg leading-tight truncate drop-shadow-md">${tr.port.nom || tr.port.nombre}</h3>
                            </div>
                        </div>
                        <div class="px-2 pb-2">
                            <div class="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5 border border-gray-100 group-hover:bg-orange-50 group-hover:border-orange-100 transition-colors">
                                <div class="flex-1 pl-1">
                                    <span class="text-[9px] text-gray-550 font-bold uppercase tracking-widest block mb-0.5 group-hover:text-primary transition-colors">${t('your_pr')}</span>
                                    <span class="text-lg font-bold font-title text-gray-800 flex items-center gap-1.5 group-hover:text-primary transition-colors">
                                        <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                                        ${formatTime(tr.pr)}
                                    </span>
                                </div>
                                <div class="w-px h-8 bg-gray-200 mx-1 group-hover:bg-orange-200 transition-colors"></div>
                                <div class="text-center px-3">
                                    <span class="text-[9px] text-gray-550 font-bold uppercase tracking-widest block mb-0.5 group-hover:text-primary transition-colors">Efforts</span>
                                    <span class="text-lg font-bold text-gray-700 group-hover:text-primary transition-colors">${tr.efforts}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
                ${hiddenTrophies.length > 0 ? `
                <div class="flex justify-center mt-8">
                    <button onclick="document.querySelectorAll('.hidden-trophy').forEach(el => { el.classList.remove('hidden'); el.classList.add('block'); }); this.remove();" class="bg-white border border-gray-200 text-gray-600 hover:text-primary hover:border-primary hover:bg-orange-50 font-bold py-2.5 px-6 rounded-full text-sm transition-colors shadow-sm flex items-center gap-2">
                        ${t('profile_load_more')} (${hiddenTrophies.length})
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
                    ${t('profile_starred_segments')}
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
                        <img src="${user.profile_medium}" alt="${user.firstname} ${user.lastname}" class="w-32 h-32 rounded-full border-4 border-[#ea580c] object-cover shadow-md">
                        <div class="text-center md:text-left flex-1">
                            <h1 class="text-4xl font-bold font-title text-secondary mb-2">${user.firstname} ${user.lastname}</h1>
                            <p class="text-gray-500 flex items-center justify-center md:justify-start gap-2 mb-6">
                                <svg class="w-5 h-5 text-[#ea580c]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                ${user.city || 'Mallorca'}, ${user.country || 'Spain'}
                            </p>
                            <div class="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <a href="https://www.strava.com/athletes/${user.id}" target="_blank" class="bg-[#fc4c02] text-white px-6 py-2.5 rounded-full font-bold text-sm tracking-wide hover:bg-[#e34402] transition-colors inline-flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"></path></svg>
                                    ${t('profile_view_strava')}
                                </a>
                                <button data-action="logout-strava" class="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-full font-bold text-sm tracking-wide hover:bg-gray-200 hover:text-red-600 transition-colors inline-flex items-center gap-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                    ${t('profile_logout')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 class="text-3xl font-bold font-title text-secondary mb-6 px-4">${t('profile_cycling_stats')}</h2>
                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Recent Stats -->
                    <div class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -mr-8 -mt-8 z-0 transition-transform group-hover:scale-110"></div>
                        <div class="relative z-10">
                            <div class="flex items-center gap-3 mb-8">
                                <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <h3 class="font-title font-bold text-xl text-secondary">${t('stats_recent')} <span class="text-sm font-normal text-gray-550 block">${t('stats_recent_sub')}</span></h3>
                            </div>
                            <div class="space-y-6">
                                <div>
                                    <p class="text-sm text-gray-500 font-medium mb-1">${t('stats_distance')}</p>
                                    <p class="text-4xl font-bold font-title text-gray-800">${formatDistance(recent.distance)}<span class="text-lg text-gray-550 ml-1">km</span></p>
                                </div>
                                <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                    <div>
                                        <p class="text-sm text-gray-500 font-medium mb-1">${t('stats_elevation')}</p>
                                        <p class="text-2xl font-bold text-gray-800">${formatElevation(recent.elevation_gain)}<span class="text-sm text-gray-550 ml-1">m</span></p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-gray-500 font-medium mb-1">${t('stats_rides')}</p>
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
                                <h3 class="font-title font-bold text-xl text-white">${t('stats_ytd')} <span class="text-sm font-normal text-gray-400 block">${t('stats_ytd_sub')}</span></h3>
                            </div>
                            <div class="space-y-6">
                                <div>
                                    <p class="text-sm text-gray-400 font-medium mb-1">${t('stats_distance')}</p>
                                    <p class="text-5xl font-bold font-title text-[#ea580c] drop-shadow-sm">${formatDistance(ytd.distance)}<span class="text-lg text-gray-400 ml-2">km</span></p>
                                </div>
                                <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                                    <div>
                                        <p class="text-sm text-gray-400 font-medium mb-1">${t('stats_elevation')}</p>
                                        <p class="text-2xl font-bold text-white">${formatElevation(ytd.elevation_gain)}<span class="text-sm text-gray-400 ml-1">m</span></p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-gray-400 font-medium mb-1">${t('stats_rides')}</p>
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
                                <h3 class="font-title font-bold text-xl text-secondary">${t('stats_alltime')} <span class="text-sm font-normal text-gray-550 block">${t('stats_alltime_sub')}</span></h3>
                            </div>
                            <div class="space-y-6">
                                <div>
                                    <p class="text-sm text-gray-500 font-medium mb-1">${t('stats_distance')}</p>
                                    <p class="text-4xl font-bold font-title text-gray-800">${formatDistance(all.distance)}<span class="text-lg text-gray-550 ml-1">km</span></p>
                                </div>
                                <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                    <div>
                                        <p class="text-sm text-gray-500 font-medium mb-1">${t('stats_elevation')}</p>
                                        <p class="text-2xl font-bold text-gray-800">${formatElevation(all.elevation_gain)}<span class="text-sm text-gray-550 ml-1">m</span></p>
                                    </div>
                                    <div>
                                        <p class="text-sm text-gray-500 font-medium mb-1">${t('stats_rides')}</p>
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
                        ${t('profile_recent_activity_vol')}
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

            // Carreguem Chart.js dinàmicament només quan cal
            if (typeof Chart === 'undefined') {
                try {
                    await loadScript('https://cdn.jsdelivr.net/npm/chart.js');
                } catch (e) {
                    console.error("No s'ha pogut carregar Chart.js", e);
                    return;
                }
            }

            const activities = await getRecentActivities(30);
            if (!activities || activities.length === 0) {
                canvas.parentElement.innerHTML = `<p class="text-gray-550 text-center mt-10">${t('profile_no_activities')}</p>`;
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
                        label: t('stats_distance'),
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
        <div id="puerto-modal" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="modal-title" class="fixed inset-0 z-[2000] bg-black/0 backdrop-blur-none flex items-center justify-center pointer-events-none transition-all duration-300 ease-in-out">
            <div id="modal-container" class="bg-white w-full h-full md:w-[95%] md:h-auto md:rounded-3xl max-w-[1200px] max-h-[100dvh] md:max-h-[90vh] overflow-y-auto relative shadow-2xl flex flex-col transform scale-95 opacity-0 transition-all duration-300 ease-out">
                <button class="absolute top-4 right-4 w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur z-[2100] transition-colors" data-action="close-modal" aria-label="${t('close_modal')}">
                    <svg class="w-6 h-6 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div id="modal-body" class="flex-1 w-full flex flex-col"></div>
            </div>
        </div>`;

    window.scrollTo(0, 0);

    actualitzarInterficieUsuari();
    document.title = typeof route.title === 'function' ? route.title() : route.title;

    // Assegurem que appState estigui inicialitzat
    if (appState.cyclingRoutes.length === 0) {
        const portsJSON = await getPuertos();
        appState.cyclingRoutes = portsJSON.map(p => { p.type = 'cycling'; return assignarComarcaAdministrativa(p); });

        const hikingJSON = await getHikingRoutes();
        appState.hikingRoutes = hikingJSON.map(p => assignarComarcaAdministrativa(p));

        appState.totsElsPorts = appState.mode === 'cycling' ? appState.cyclingRoutes : appState.hikingRoutes;
    }

    const footer = document.querySelector('footer');
    if (path === "/map") {
        if (footer) footer.style.display = 'none';
        document.body.style.overflow = 'hidden';
        resetFiltres();
        await initGoogleMap();
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

    // Re-apply translations to any data-i18n elements rendered into the viewport
    const { translatePage } = await import('./translations.js');
    translatePage();

    // Sync language selector value after navigation
    const { getActiveLanguage } = await import('./translations.js');
    const langSelect = document.getElementById('language-select');
    if (langSelect) langSelect.value = getActiveLanguage();

    // Sempre s'executa per a que actualitzi els elements (ja sigui mapa o grid)
    executarFiltre();
};