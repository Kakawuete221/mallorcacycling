// ui.js - Interfície d'Usuari i Targetes
import { isStravaSessionValid, getAthleteStats } from './stravaApi.js';
import { formatTime } from './utils.js';
import { setValorSlider } from './filters.js';
import { t } from './translations.js';
import { appState } from './app.js';

export const createModeToggleHTML = () => {
    const isHiking = appState.mode === 'hiking';
    const cycBtnClass = isHiking ? 'text-gray-500 hover:text-gray-700' : 'bg-white shadow-sm text-[#fc4c02]';
    const hikBtnClass = isHiking ? 'bg-white shadow-sm text-[#2563eb]' : 'text-gray-500 hover:text-gray-700';

    return `
        <div class="bg-gray-100 p-1 rounded-xl flex items-center shadow-inner gap-1 w-fit">
            <button id="mode-cycling-btn" data-action="set-mode" data-mode="cycling" title="${t('mode_cycling') || 'Mode Ciclisme'}" class="mode-cycling-btn p-1.5 px-3 rounded-lg transition-colors font-bold text-xs uppercase flex items-center gap-1.5 ${cycBtnClass}" aria-label="Mode Ciclisme">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/></svg>
                <span data-i18n="mode_cycling" class="hidden sm:inline">${t('mode_cycling') || 'Cycling'}</span>
            </button>
            <button id="mode-hiking-btn" data-action="set-mode" data-mode="hiking" title="${t('mode_hiking') || 'Mode Senderisme'}" class="mode-hiking-btn p-1.5 px-3 rounded-lg transition-colors font-bold text-xs uppercase flex items-center gap-1.5 ${hikBtnClass}" aria-label="Mode Senderisme">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/><path d="M7 6c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h1v-8H7z"/></svg>
                <span data-i18n="mode_hiking" class="hidden sm:inline">${t('mode_hiking') || 'Hiking'}</span>
            </button>
        </div>
    `;
};

export function actualitzarInterficieUsuari() {
    const userStr = localStorage.getItem('strava_athlete');
    const isLoggedIn = isStravaSessionValid();
    const navArea = document.getElementById('user-nav-area');
    const connectCard = document.getElementById('strava-card-container');

    if (isLoggedIn && userStr) {
        const user = JSON.parse(userStr);
        if (navArea) {
            navArea.innerHTML = `
                <a href="/profile" data-link class="flex items-center gap-2.5 cursor-pointer hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors select-none">
                    <span class="font-bold text-secondary">${user.firstname}</span>
                    <img src="${user.profile_medium}" alt="${user.firstname} ${user.lastname}" class="w-[38px] h-[38px] rounded-full border-2 border-primary object-cover">
                </a>`;
        }

        if (connectCard) {
            connectCard.innerHTML = `
                <div class="bg-[#11131f] text-white rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden gap-10">
                    <div class="absolute inset-0 opacity-20 pointer-events-none" style="background: radial-gradient(circle at 100% 50%, #ea580c 0%, transparent 60%);"></div>
                    <div class="relative z-10 flex flex-col items-start max-w-lg text-left">
                        <div class="flex items-center gap-4 mb-6">
                            <img src="${user.profile_medium}" alt="${user.firstname} ${user.lastname}" class="w-16 h-16 rounded-full border-2 border-[#ea580c] object-cover">
                            <div>
                                <h2 class="text-2xl md:text-3xl font-bold italic font-title text-white uppercase tracking-wider">${t('strava_hello')}, <span class="text-[#ea580c]">${user.firstname.toUpperCase()}</span>!</h2>
                                <p class="text-gray-400 text-sm">${t('connected_strava')}</p>
                            </div>
                        </div>
                        <p class="text-gray-400 mb-8 text-sm md:text-base leading-relaxed">${t('connected_desc')}</p>
                        <button class="bg-[#c2410c] hover:bg-[#ea580c] text-white font-bold py-3 px-8 rounded text-sm tracking-wider transition-colors flex items-center gap-2 uppercase" data-link href="/map">${t('go_to_map')} &rarr;</button>
                    </div>
                    
                    <div id="strava-stats-container" class="relative z-10 w-full md:w-auto flex-shrink-0">
                        <div class="bg-[#1a1c29] border border-gray-800 rounded-xl p-6 w-full md:w-80 shadow-lg text-left animate-pulse">
                            <div class="h-6 w-32 bg-gray-800 rounded mb-6"></div>
                            <div class="grid grid-cols-2 gap-y-6 gap-x-4">
                                <div class="h-10 w-20 bg-gray-800 rounded"></div>
                                <div class="h-10 w-20 bg-gray-800 rounded"></div>
                                <div class="h-10 w-20 bg-gray-800 rounded"></div>
                                <div class="h-10 w-20 bg-gray-800 rounded"></div>
                                <div class="h-10 w-20 bg-gray-800 rounded"></div>
                                <div class="h-10 w-20 bg-gray-800 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>`;

            getAthleteStats(user.id).then(stats => {
                const statsContainer = document.getElementById('strava-stats-container');
                if (statsContainer && stats) {
                    const recent = stats.recent_ride_totals;
                    const ytd = stats.ytd_ride_totals;

                    statsContainer.innerHTML = `
                        <div class="bg-[#1a1c29] border border-gray-800 rounded-xl p-6 w-full md:w-80 shadow-lg text-left">
                            <h3 class="text-white font-bold mb-4 flex items-center gap-2 text-sm tracking-wider">
                                <svg class="w-5 h-5 text-[#ea580c]" fill="currentColor" viewBox="0 0 24 24"><path d="M4 10h3v10H4zM10 4h3v16h-3zM16 14h3v6h-3z"></path></svg>
                                ${t('strava_cycling_stats')}
                            </h3>
                            <div class="grid grid-cols-2 gap-y-5 gap-x-4">
                                <div>
                                    <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">${t('strava_recent_rides')}</p>
                                    <p class="text-white font-bold text-lg">${recent ? recent.count : 0}</p>
                                </div>
                                <div>
                                    <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">${t('strava_ytd_rides')}</p>
                                    <p class="text-white font-bold text-lg">${ytd ? ytd.count : 0}</p>
                                </div>
                                <div>
                                    <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">${t('strava_recent_dist')}</p>
                                    <p class="text-white font-bold text-lg">${recent ? (recent.distance / 1000).toFixed(0) : 0} <span class="text-xs text-gray-400">km</span></p>
                                </div>
                                <div>
                                    <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">${t('strava_ytd_dist')}</p>
                                    <p class="text-[#ea580c] font-bold text-lg">${ytd ? (ytd.distance / 1000).toFixed(0) : 0} <span class="text-xs">km</span></p>
                                </div>
                                <div>
                                    <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">${t('strava_recent_elev')}</p>
                                    <p class="text-white font-bold text-lg">${recent ? recent.elevation_gain.toFixed(0) : 0} <span class="text-xs text-gray-400">m</span></p>
                                </div>
                                <div>
                                    <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">${t('strava_ytd_elev')}</p>
                                    <p class="text-white font-bold text-lg">${ytd ? ytd.elevation_gain.toFixed(0) : 0} <span class="text-xs text-gray-400">m</span></p>
                                </div>
                            </div>
                        </div>
                    `;
                } else if (statsContainer) {
                    statsContainer.innerHTML = `
                        <div class="bg-[#1a1c29] border border-gray-800 rounded-xl p-6 w-full md:w-80 shadow-lg text-left flex items-center justify-center">
                        <p class="text-xs text-gray-400">${t('strava_stats_unavailable')}</p>
                        </div>
                    `;
                }
            });
        }
    } else {
        if (navArea) {
            navArea.innerHTML = `<button data-action="login-strava" class="bg-primary hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105 duration-200 text-sm">${t('connect_strava').toUpperCase()}</button>`;
        }
        if (connectCard) {
            connectCard.innerHTML = `
                <div class="bg-[#11131f] text-white rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden gap-10">
                    <div class="absolute inset-0 opacity-20 pointer-events-none" style="background: radial-gradient(circle at 100% 50%, #ea580c 0%, transparent 60%);"></div>
                    
                    <div class="relative z-10 flex flex-col items-start max-w-lg text-left">
                        <div class="w-10 h-10 bg-gray-800 rounded flex items-center justify-center mb-6">
                            <svg class="w-6 h-6 text-[#ea580c]" fill="currentColor" viewBox="0 0 24 24"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"></path></svg>
                        </div>
                        <h2 class="text-3xl md:text-4xl font-bold italic font-title text-white mb-4 tracking-wide uppercase">${t('unleash_title')}</h2>
                        <p class="text-gray-400 mb-8 text-sm md:text-base leading-relaxed">${t('unleash_desc')}</p>
                        <button class="bg-[#c2410c] hover:bg-[#ea580c] text-white font-bold py-3 px-8 rounded text-sm tracking-wider transition-colors flex items-center gap-2 uppercase" data-action="login-strava">${t('connect_strava').toUpperCase()} &rarr;</button>
                    </div>

                    <div class="relative z-10 w-full md:w-auto flex-shrink-0">
                        <div class="bg-[#1a1c29] border border-gray-800 rounded-xl p-5 w-full md:w-72 shadow-lg text-left">
                            <div class="flex items-center gap-3 mb-6">
                                <div class="w-10 h-10 bg-[#ea580c] rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M4 10h3v10H4zM10 4h3v16h-3zM16 14h3v6h-3z"></path></svg>
                                </div>
                                <div>
                                    <p class="text-[10px] text-gray-400 font-bold uppercase tracking-wider">${t('strava_recent_activity')}</p>
                                    <p class="text-white font-bold text-sm">Coll de Femenia</p>
                                </div>
                            </div>
                            <div class="flex justify-between text-xs mb-2">
                                <span class="text-gray-400">${t('strava_your_rank')}</span>
                                <span class="text-[#ea580c] font-bold">#14 / 2,451</span>
                            </div>
                            <div class="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-3">
                                <div class="bg-[#ea580c] h-full" style="width: 85%"></div>
                            </div>
                            <p class="text-[10px] text-gray-400 italic">${t('strava_top_percent')}</p>
                        </div>
                    </div>
                </div>`;

        }
    }
}

export const createCardHTML = (puerto, index = 0) => {
    const nom = puerto.nom || puerto.nombre;
    const dist = puerto.distancia || puerto.distancia_km;
    const desn = puerto.desnivell || puerto.elevacion_m;
    const portDataStr = JSON.stringify(puerto).replace(/'/g, "&apos;").replace(/"/g, "&quot;");

    const isHiking = puerto.type === 'hiking';
    const accentColor = isHiking ? 'text-[#2563eb]' : 'text-[#ea580c]';
    const catText = isHiking ? puerto.categoria : `Cat. ${puerto.categoria}`;

    return `
    <div class="group relative rounded-3xl overflow-hidden shadow-lg aspect-[4/3] w-full cursor-pointer hover:shadow-2xl transition-all duration-300" data-action="view-details" data-port="${portDataStr}" role="button" tabindex="0" aria-label="${t('view_details_of')} ${nom}">
        <img src="${puerto.imatge && puerto.imatge !== 'media/ColldeSoller.webp' ? puerto.imatge : 'media/' + nom + '.jpg'}" alt="${nom}" onerror="this.onerror=null; this.src='media/ColldeSoller.webp';" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">
        <div class="absolute inset-0 bg-gradient-to-t from-[#11131f] via-[#11131f]/40 to-transparent opacity-95"></div>
        <div class="absolute bottom-0 left-0 p-5 text-white w-full">
            <h3 class="text-xl md:text-2xl font-title font-bold mb-3 leading-tight pr-4">${nom}</h3>
            <div class="flex flex-wrap items-center gap-4 text-xs md:text-sm font-medium text-gray-300 tracking-wide">
                <span class="flex items-center gap-1.5"><svg class="w-4 h-4 ${accentColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg> ${dist} km</span>
                <span class="flex items-center gap-1.5"><svg class="w-4 h-4 ${accentColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11l7-7 7 7M5 19l7-7 7 7"></path></svg> ${desn} m</span>
                <span class="flex items-center gap-1.5"><svg class="w-4 h-4 ${accentColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> ${catText}</span>
            </div>
        </div>
    </div>`;
};

export const createMiniCardHTML = (port, dadesStrava = null) => {
    if (!port || !port.id) return `<div class="p-4">Error data</div>`;

    const getStravaHTML = (kom, qom, pr) => `
        <div class="bg-gray-50 rounded-lg p-2.5 mb-3 mt-3 border border-gray-100">
            <div class="flex justify-between items-center mb-2 text-[11px] text-gray-500">
                <span class="flex items-center gap-1.5"><svg class="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"></path></svg> <span class="font-medium">KOM:</span> <span class="font-bold text-gray-800">${kom || '--:--'}</span></span>
                <span class="flex items-center gap-1.5"><svg class="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"></path></svg> <span class="font-medium">QOM:</span> <span class="font-bold text-gray-800">${qom || '--:--'}</span></span>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-gray-200">
                <span class="flex items-center gap-1.5 text-[11px] text-primary font-bold"><svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-3V2h-8v2H5c-1.1 0-2 .9-2 2v2c0 2.2 1.8 4 4 4h.3c1.1 2.4 3.2 4.1 5.7 4.7V20H9v2h6v-2h-2v-3.3c2.5-.6 4.6-2.3 5.7-4.7H19c2.2 0 4-1.8 4-4V6c0-1.1-.9-2-2-2zM7 10c-1.1 0-2-.9-2-2V6h3v4H7zm12-2c0 1.1-.9 2-2 2h-1V6h3v2z"></path></svg> ${t('your_pr')}</span>
                <span class="font-bold text-primary text-[11px]">${formatTime(pr)}</span>
            </div>
        </div>`;

    const isHiking = port.type === 'hiking';
    let infoStrava = isHiking ? '' : `<div class="bg-gray-50 rounded-lg p-2.5 mb-3 mt-3 border border-gray-100 text-[11px] text-gray-500 italic text-center">${t('loading_strava')}</div>`;

    if (!isHiking) {
        if (dadesStrava) {
            infoStrava = getStravaHTML(dadesStrava.xoms?.kom, dadesStrava.xoms?.qom, dadesStrava.athlete_segment_stats?.pr_elapsed_time);
        } else {
            const cached = JSON.parse(localStorage.getItem(`segment_${port.id}`));
            if (cached && cached.data) {
                infoStrava = getStravaHTML(cached.data.xoms?.kom, cached.data.xoms?.qom, cached.data.athlete_segment_stats?.pr_elapsed_time);
            }
        }
    }

    const portDataStr = JSON.stringify(port).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
    const dist = port.distancia || port.distancia_km;
    const desn = port.desnivell || port.elevacion_m;
    const middleStat = isHiking ? port.categoria : `${port.pendent_mitja || 0}%`;
    const btnColor = isHiking ? 'bg-[#2563eb] hover:bg-blue-700' : 'bg-primary hover:bg-orange-600';
    const typeIconPath = isHiking 
        ? '<path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/><path d="M7 6c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h1v-8H7z"/>'
        : '<path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5.1 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h1.5v-5.5l-1.7-3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"></path>';

    return `
        <div class="font-body p-2 min-w-[260px]">
            <h3 class="m-0 text-base font-title font-bold text-gray-900 tracking-tight leading-tight pr-4">${port.nom}</h3>
            <div class="flex items-center gap-1.5 text-[12px] text-gray-500 mt-1.5 font-medium">
                <svg class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">${typeIconPath}</svg>
                <span>${dist}km · ${middleStat} · ${desn}m</span>
            </div>
            ${infoStrava}
            <button data-action="view-details" data-port="${portDataStr}" class="w-full ${btnColor} text-white border-none py-2.5 px-4 rounded-lg text-sm font-bold cursor-pointer transition-colors shadow-sm flex justify-center items-center gap-2 mt-3">
                ${t('view_details')}
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
        </div>`;
};

export const uiToggleDropdownFiltres = () => {
    const panel = document.getElementById('panel-filtres');
    const btn = document.getElementById('btn-filtres-dropdown');
    if (!panel || !btn) return;
    const isHidden = panel.classList.toggle('hidden');
    if (isHidden) {
        btn.classList.remove('bg-gray-100', 'border-gray-400');
        btn.setAttribute('aria-expanded', 'false');
    } else {
        btn.classList.add('bg-gray-100', 'border-gray-400');
        btn.setAttribute('aria-expanded', 'true');
    }
};

export const uiCercaToggle = (valor, totsElsPorts) => {
    const btnClear = document.getElementById('btn-clear-search');
    const llista = document.getElementById('llista-suggeriments');
    valor = valor.toLowerCase();

    if (valor.length > 0) btnClear.classList.remove('hidden');
    else btnClear.classList.add('hidden');

    llista.innerHTML = '';

    if (valor.length < 2) {
        llista.classList.add('hidden');
        return false;
    }

    const suggeriments = totsElsPorts.filter(port =>
        (port.nom || "").toLowerCase().includes(valor)
    ).slice(0, 5);

    if (suggeriments.length > 0) {
        llista.classList.remove('hidden');
        suggeriments.forEach(port => {
            const li = document.createElement('li');
            li.className = "px-4 py-2.5 hover:bg-orange-50 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0 transition-colors";
            li.innerHTML = `<span class="font-bold">${port.nom}</span> <span class="text-xs text-gray-500 ml-1">${port.municipi || ''}</span>`;
            li.setAttribute('data-action', 'seleccionar-suggeriment');
            li.setAttribute('data-port', JSON.stringify(port));
            llista.appendChild(li);
        });
    } else {
        llista.classList.add('hidden');
    }

    return true;
};

export const uiNetejarCercaUnica = () => {
    const input = document.getElementById('input-cerca');
    input.value = "";
    document.getElementById('btn-clear-search').classList.add('hidden');
};

export const uiToggleCompletatsBtn = (btn) => {
    const isActive = btn.classList.contains('text-primary') || btn.classList.contains('text-[#2563eb]');
    const isHiking = appState.mode === 'hiking';

    const activeText = isHiking ? 'text-[#2563eb]' : 'text-primary';
    const activeBorder = isHiking ? 'border-[#2563eb]' : 'border-primary';
    const activeBg = isHiking ? 'bg-sky-50' : 'bg-orange-50';
    const activeShadow = isHiking ? 'shadow-[0_0_15px_rgba(37,99,235,0.15)]' : 'shadow-[0_0_15px_rgba(252,76,2,0.25)]';
    const activeSwitchBg = isHiking ? '#2563eb' : 'var(--accent)';

    if (isActive) {
        btn.classList.remove(activeText, activeBorder, activeBg, activeShadow);
        btn.classList.add('text-gray-600', 'border-gray-200', 'bg-white');
        btn.setAttribute('aria-pressed', 'false'); // Accessibility
        const switchEl = btn.querySelector('#toggle-completats-switch');
        if (switchEl) {
            switchEl.classList.remove('bg-primary');
            switchEl.classList.add('bg-gray-200');
            switchEl.firstElementChild.classList.remove('translate-x-4');
            // inline style fallback for hiking switch
            if (isHiking) switchEl.style.backgroundColor = '';
        }
    } else {
        btn.classList.remove('text-gray-600', 'border-gray-200', 'text-gray-700', 'border-gray-300', 'bg-white');
        btn.classList.add(activeText, activeBorder, activeBg, activeShadow);
        btn.setAttribute('aria-pressed', 'true'); // Accessibility
        const switchEl = btn.querySelector('#toggle-completats-switch');
        if (switchEl) {
            switchEl.classList.remove('bg-gray-200');
            // prefer class for cycling, inline color for hiking
            if (isHiking) {
                switchEl.style.backgroundColor = activeSwitchBg;
            } else {
                switchEl.classList.add('bg-primary');
            }
            switchEl.firstElementChild.classList.add('translate-x-4');
        }
    }

    return !isActive;
};

export const uiToggleGeneric = (btn) => {
    const isHiking = appState.mode === 'hiking';
    const classesInactiu = ['bg-gray-50', 'text-gray-600', 'border-gray-200'];
    const classesActiu = isHiking
        ? ['bg-sky-50', 'text-[#2563eb]', 'border-[#2563eb]', 'is-selected']
        : ['bg-orange-50', 'text-primary', 'border-primary', 'is-selected'];

    const esSeleccionat = btn.classList.contains('is-selected');

    if (esSeleccionat) {
        btn.classList.remove(...classesActiu);
        btn.classList.add(...classesInactiu);
        btn.setAttribute('aria-pressed', 'false');
    } else {
        btn.classList.remove(...classesInactiu);
        btn.classList.add(...classesActiu);
        btn.setAttribute('aria-pressed', 'true');
    }
};

export const uiActualitzarSlider = (valor, idText, prefix = '', sufix = '') => {
    document.getElementById(idText).innerText = prefix + valor + sufix;
};

export const uiNetejarFiltres = () => {
    const inputCerca = document.getElementById('input-cerca');
    if (inputCerca) {
        inputCerca.value = "";
    }
    const btnClear = document.getElementById('btn-clear-search');
    if (btnClear) btnClear.classList.add('hidden');

    const btnComp = document.getElementById('btn-completats');
    if (btnComp && btnComp.classList.contains('text-primary')) {
        uiToggleCompletatsBtn(btnComp); // Will toggle it back
    }

    document.querySelectorAll('.pindola').forEach(btn => {
        btn.classList.remove(
            'bg-orange-50', 'text-primary', 'border-primary',
            'bg-sky-50', 'text-[#2563eb]', 'border-[#2563eb]',
            'is-selected'
        );
        btn.classList.add('bg-gray-50', 'text-gray-600', 'border-gray-200');
        btn.setAttribute('aria-pressed', 'false');
    });

    const sliders = [
        { id: 'sl-distancia', valId: 'val-dist', default: "15", unit: " km" },
        { id: 'sl-desnivell', valId: 'val-desn', default: "1000", unit: " m" },
        { id: 'sl-pendent', valId: 'val-pend', default: "10", unit: " %", prefix: "< " }
    ];

    sliders.forEach(s => {
        const el = document.getElementById(s.id);
        const valEl = document.getElementById(s.valId);
        if (el) el.value = s.default;
        if (valEl) valEl.innerText = (s.prefix || "") + s.default + s.unit;
    });
};

export const createFiltresHTML = () => `
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto relative sm:static">
        <!-- Search bar (displayed first on mobile using order-1, and full width) -->
        <div class="flex items-center gap-3 order-1 sm:order-2 w-full sm:w-auto">
            <div class="relative bg-white rounded-lg shadow-sm border border-gray-200 flex items-center h-10 px-3 w-full sm:w-64 md:w-72">
                <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input type="text" id="input-cerca" autocomplete="off" aria-label="${t('filter_search_placeholder')}" class="w-full h-full outline-none border-none ring-0 focus:ring-0 text-sm text-gray-700 placeholder-gray-400 bg-transparent" placeholder="${t('filter_search_placeholder')}">
                
                <button id="btn-clear-search" data-action="netejar-cerca" aria-label="${t('filter_clear')}" class="hidden ml-2 text-gray-400 hover:text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <ul id="llista-suggeriments" role="listbox" aria-label="Suggestions" class="absolute top-full left-0 w-full mt-1 bg-white border border-gray-100 shadow-xl rounded-lg overflow-hidden hidden z-50 max-h-60 overflow-y-auto"></ul>
            </div>
            ${createModeToggleHTML()}
        </div>

        <!-- Buttons area (Filters & Completed side-by-side on mobile, compact on desktop) -->
        <div class="flex items-center gap-3 order-2 sm:order-1 w-full sm:w-auto">
            <div class="flex-1 sm:flex-none sm:relative">
                <button data-action="toggle-filtres" id="btn-filtres-dropdown" aria-haspopup="true" aria-expanded="false" class="w-full justify-center bg-white rounded-lg shadow-sm border border-gray-200 h-10 px-4 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                    ${t('filter_filters')}
                </button>

                <div id="panel-filtres" class="hidden absolute top-full mt-2 left-0 w-full sm:w-[340px] max-w-[340px] bg-white border border-gray-100 shadow-2xl rounded-xl flex flex-col overflow-hidden max-h-[75vh] overflow-y-auto z-50">
                    <div class="flex justify-between items-center px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                        <span class="font-bold text-gray-800 text-sm">${t('filter_refine')}</span>
                        <button data-action="netejar-filtres" class="text-xs font-semibold text-primary hover:text-orange-700">${t('filter_clear')}</button>
                    </div>

                    <div class="p-5 space-y-5">
                        <div data-filter-group="cycling" style="display: ${appState.mode === 'cycling' ? '' : 'none'}">
                            <h4 class="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">${t('filter_region')}</h4>
                            <div class="grid grid-cols-2 gap-2">
                                <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-150" data-action="toggle-generic" data-camp="comarca" data-valor="Tramuntana">Tramuntana</button>
                                <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200" data-action="toggle-generic" data-camp="comarca" data-valor="Raiguer">Raiguer</button>
                                <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200" data-action="toggle-generic" data-camp="comarca" data-valor="Pla">Pla</button>
                                <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200" data-action="toggle-generic" data-camp="comarca" data-valor="Migjorn">Migjorn</button>
                                <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200" data-action="toggle-generic" data-camp="comarca" data-valor="Llevant">Llevant</button>
                                <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200" data-action="toggle-generic" data-camp="comarca" data-valor="Palma">Palma</button>
                            </div>
                        </div>

                        <div data-filter-group="cycling" style="display: ${appState.mode === 'cycling' ? '' : 'none'}">
                            <h4 class="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">${t('filter_category')}</h4>
                            <div class="grid grid-cols-4 gap-2">
                                <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 text-center" data-action="toggle-generic" data-camp="categoria" data-valor="1">1</button>
                                <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 text-center" data-action="toggle-generic" data-camp="categoria" data-valor="2">2</button>
                                <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 text-center" data-action="toggle-generic" data-camp="categoria" data-valor="3">3</button>
                                <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 text-center" data-action="toggle-generic" data-camp="categoria" data-valor="4">4</button>
                            </div>
                        </div>

                        <div data-filter-group="hiking" style="display: ${appState.mode === 'hiking' ? '' : 'none'}">
                            <h4 class="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Dificultat</h4>
                            <div class="grid grid-cols-3 gap-2">
                                <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-150 text-center" data-action="toggle-generic" data-camp="categoria" data-valor="Easy">Easy</button>
                                <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-150 text-center" data-action="toggle-generic" data-camp="categoria" data-valor="Moderate">Moderate</button>
                                <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-150 text-center" data-action="toggle-generic" data-camp="categoria" data-valor="Exigent">Hard</button>
                            </div>
                        </div>

                        <div>
                            <div class="flex justify-between items-end mb-2">
                                <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide">${t('filter_max_dist')}</h4>
                                <span class="text-[13px] font-bold" style="color: var(--accent-thumb)" id="val-dist">15 km</span>
                            </div>
                            <input type="range" id="sl-distancia" data-camp="distanciaMax" data-val-id="val-dist" data-sufix=" km" min="1" max="15" value="15" step="0.5" style="accent-color: var(--accent-thumb)" class="w-full h-2 bg-gray-200 rounded-full cursor-pointer appearance-none">
                        </div>

                        <div>
                            <div class="flex justify-between items-end mb-2">
                                <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide">${t('filter_max_elev')}</h4>
                                <span class="text-[13px] font-bold" style="color: var(--accent-thumb)" id="val-desn">1000 m</span>
                            </div>
                            <input type="range" id="sl-desnivell" data-camp="desnivellMax" data-val-id="val-desn" data-sufix=" m" min="0" max="1000" value="1000" step="50" style="accent-color: var(--accent-thumb)" class="w-full h-2 bg-gray-200 rounded-full cursor-pointer appearance-none">
                        </div>

                        <div data-filter-group="cycling" style="display: ${appState.mode === 'cycling' ? '' : 'none'}">
                            <div class="flex justify-between items-end mb-2">
                                <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide">${t('filter_max_grad')}</h4>
                                <span class="text-[13px] font-bold" style="color: var(--accent-thumb)" id="val-pend">< 10 %</span>
                            </div>
                            <input type="range" id="sl-pendent" data-camp="pendentMax" data-val-id="val-pend" data-prefix="< " data-sufix=" %" min="2" max="10" value="10" step="0.5" style="accent-color: var(--accent-thumb)" class="w-full h-2 bg-gray-200 rounded-full cursor-pointer appearance-none">
                        </div>
                    </div>
                </div>
            </div>  

            <button id="btn-completats" data-action="toggle-completats" class="flex-1 sm:flex-none justify-center bg-white rounded-lg shadow-sm border border-gray-200 h-10 px-4 flex items-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors">
                <svg class="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                ${t('filter_completed')}
            </button>
        </div>
    </div>
`;

export const createSidebarFiltresHTML = () => `
    <div class="sidebar-filtres-wrapper bg-white lg:bg-transparent rounded-xl lg:rounded-none shadow-sm lg:shadow-none border border-gray-100 lg:border-none p-4 lg:p-0 flex flex-col gap-4 lg:gap-6 w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-[100px]">
        
        <!-- Mobile Toggle Button (Only visible on mobile/tablet) -->
        <button data-action="toggle-sidebar-filtres" aria-expanded="false" aria-controls="sidebar-filtres-content" class="lg:hidden w-full flex items-center justify-between bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:border-gray-200 rounded-xl px-4 py-3 transition-all cursor-pointer">
            <span class="font-bold text-gray-700 flex items-center gap-2 text-sm">
                <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                ${t('filter_filters_refinements')}
            </span>
            <svg id="sidebar-filtres-caret" class="w-4 h-4 text-gray-400 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>

        <!-- Filters Content Panel (Always visible on lg, toggled on mobile) -->
        <div id="sidebar-filtres-content" class="hidden lg:flex flex-col gap-6 bg-white lg:rounded-xl lg:shadow-sm lg:border lg:border-gray-100 lg:p-5 w-full">
            <div class="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 class="hidden lg:flex font-bold text-gray-800 items-center gap-2 text-lg">
                    <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                    ${t('filter_filters')}
                </h3>
                <button data-action="netejar-filtres" class="text-sm font-semibold text-primary hover:text-orange-700 transition-colors">${t('filter_clear_all')}</button>
            </div>

            <div class="space-y-4">
                <details class="group border-b border-gray-100 pb-4" data-filter-group="cycling" style="display: ${appState.mode === 'cycling' ? '' : 'none'}">
                    <summary class="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between items-center cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                        <span>${t('filter_region')}</span>
                        <svg class="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </summary>
                    <div class="grid grid-cols-2 gap-2 mt-3">
                        <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 text-center" data-action="toggle-generic" data-camp="comarca" data-valor="Tramuntana" aria-pressed="false">Tramuntana</button>
                        <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 text-center" data-action="toggle-generic" data-camp="comarca" data-valor="Raiguer" aria-pressed="false">Raiguer</button>
                        <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 text-center" data-action="toggle-generic" data-camp="comarca" data-valor="Pla" aria-pressed="false">Pla</button>
                        <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 text-center" data-action="toggle-generic" data-camp="comarca" data-valor="Migjorn" aria-pressed="false">Migjorn</button>
                        <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 text-center" data-action="toggle-generic" data-camp="comarca" data-valor="Llevant" aria-pressed="false">Llevant</button>
                        <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 text-center" data-action="toggle-generic" data-camp="comarca" data-valor="Palma" aria-pressed="false">Palma</button>
                    </div>
                </details>

                <details class="group border-b border-gray-100 pb-4" data-filter-group="cycling" style="display: ${appState.mode === 'cycling' ? '' : 'none'}">
                    <summary class="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between items-center cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                        <span>${t('filter_category')}</span>
                        <svg class="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </summary>
                    <div class="grid grid-cols-4 gap-2 mt-3">
                        <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 text-center" data-action="toggle-generic" data-camp="categoria" data-valor="1" aria-pressed="false">1</button>
                        <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 text-center" data-action="toggle-generic" data-camp="categoria" data-valor="2" aria-pressed="false">2</button>
                        <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 text-center" data-action="toggle-generic" data-camp="categoria" data-valor="3" aria-pressed="false">3</button>
                        <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 text-center" data-action="toggle-generic" data-camp="categoria" data-valor="4" aria-pressed="false">4</button>
                    </div>
                </details>

                <details class="group border-b border-gray-100 pb-4" data-filter-group="hiking" style="display: ${appState.mode === 'hiking' ? '' : 'none'}">
                    <summary class="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between items-center cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                        <span>Dificultat</span>
                        <svg class="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </summary>
                    <div class="grid grid-cols-3 gap-2 mt-3">
                        <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-150 text-center" data-action="toggle-generic" data-camp="categoria" data-valor="Easy" aria-pressed="false">Easy</button>
                        <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-150 text-center" data-action="toggle-generic" data-camp="categoria" data-valor="Moderate" aria-pressed="false">Moderate</button>
                        <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-800 transition-all duration-150 text-center" data-action="toggle-generic" data-camp="categoria" data-valor="Exigent" aria-pressed="false">Hard</button>
                    </div>
                </details>

                <details class="group border-b border-gray-100 pb-4">
                    <summary class="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between items-center cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                        <span>${t('filter_max_dist')}</span>
                        <svg class="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </summary>
                    <div class="mt-3">
                        <div class="flex justify-end items-end mb-2">
                            <span class="text-[13px] font-bold" style="color: var(--accent-thumb)" id="val-dist">15 km</span>
                        </div>
                        <input type="range" id="sl-distancia" data-camp="distanciaMax" data-val-id="val-dist" data-sufix=" km" min="1" max="15" value="15" step="0.5" aria-label="${t('filter_max_dist')}" style="accent-color: var(--accent-thumb)" class="w-full h-2 bg-gray-200 rounded-full cursor-pointer appearance-none">
                    </div>
                </details>

                <details class="group border-b border-gray-100 pb-4">
                    <summary class="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between items-center cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                        <span>${t('filter_max_elev')}</span>
                        <svg class="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </summary>
                    <div class="mt-3">
                        <div class="flex justify-end items-end mb-2">
                            <span class="text-[13px] font-bold" style="color: var(--accent-thumb)" id="val-desn">1000 m</span>
                        </div>
                        <input type="range" id="sl-desnivell" data-camp="desnivellMax" data-val-id="val-desn" data-sufix=" m" min="0" max="1000" value="1000" step="50" aria-label="${t('filter_max_elev')}" style="accent-color: var(--accent-thumb)" class="w-full h-2 bg-gray-200 rounded-full cursor-pointer appearance-none">
                    </div>
                </details>

                <details class="group pb-2" data-filter-group="cycling" style="display: ${appState.mode === 'cycling' ? '' : 'none'}">
                    <summary class="text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between items-center cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                        <span>${t('filter_max_grad')}</span>
                        <svg class="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </summary>
                    <div class="mt-3">
                        <div class="flex justify-end items-end mb-2">
                            <span class="text-[13px] font-bold" style="color: var(--accent-thumb)" id="val-pend">< 10 %</span>
                        </div>
                        <input type="range" id="sl-pendent" data-camp="pendentMax" data-val-id="val-pend" data-prefix="< " data-sufix=" %" min="2" max="10" value="10" step="0.5" aria-label="${t('filter_max_grad')}" style="accent-color: var(--accent-thumb)" class="w-full h-2 bg-gray-200 rounded-full cursor-pointer appearance-none">
                    </div>
                </details>
            </div>
        </div>
    </div>
`;

export const createTopBarSegmentsHTML = () => `
    <div class="topbar-segments-wrapper bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-col md:flex-row gap-4 justify-between items-center w-full mb-6">
        <div class="flex items-center gap-3 w-full md:w-auto">
            <div class="relative flex-1 w-full md:w-auto max-w-md bg-white rounded-lg flex items-center h-10 px-3 border border-gray-200 hover:border-gray-300 transition-colors">
                <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input type="text" id="input-cerca" autocomplete="off" aria-label="${t('filter_segments_placeholder')}" class="w-full h-full outline-none border-none ring-0 focus:ring-0 text-sm text-gray-700 placeholder-gray-400 bg-transparent" placeholder="${t('filter_segments_placeholder')}">
                
                <button id="btn-clear-search" data-action="netejar-cerca" aria-label="${t('filter_clear')}" class="hidden ml-2 text-gray-400 hover:text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <ul id="llista-suggeriments" role="listbox" aria-label="Suggestions" class="absolute top-full left-0 w-full mt-1 bg-white border border-gray-100 shadow-xl rounded-lg overflow-hidden hidden z-50 max-h-60 overflow-y-auto"></ul>
            </div>
            ${createModeToggleHTML()}
        </div>
        
        <div class="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <button data-filter-group="cycling" id="btn-completats" data-action="toggle-completats" aria-pressed="false" class="flex-1 md:flex-none justify-center bg-white rounded-lg shadow-sm border border-gray-200 h-10 px-4 flex items-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors" style="display: ${appState.mode === 'cycling' ? '' : 'none'}">
                <svg class="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                ${t('filter_completed')}
            </button>

            <div class="relative flex-1 md:flex-none flex items-center">
                <svg class="w-4 h-4 text-gray-500 absolute left-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18M6 12h12M9 20h6"></path></svg>
                <select id="select-ordenacio" aria-label="${t('filter_refine')}" class="w-full md:w-auto bg-white border border-gray-200 hover:border-gray-300 rounded-lg h-10 pl-9 pr-3 text-sm font-medium text-gray-700 transition-colors focus:ring-0 outline-none cursor-pointer">
                    <option value="">${t('filter_default_order')}</option>
                    <option value="dist_asc">${t('filter_dist_asc')}</option>
                    <option value="dist_desc">${t('filter_dist_desc')}</option>
                    <option value="grad_asc">${appState.mode === 'hiking' ? t('filter_elev_asc') || 'Desnivell (Ascendent)' : t('filter_grad_asc')}</option>
                    <option value="grad_desc">${appState.mode === 'hiking' ? t('filter_elev_desc') || 'Desnivell (Descendent)' : t('filter_grad_desc')}</option>
                </select>
            </div>
            
            <div class="hidden sm:flex bg-gray-50 rounded-lg p-1 gap-1 border border-gray-100">
                <button data-action="view-size-2" aria-label="2 columns view" class="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors hover:bg-white view-toggle-btn" title="2 Columns">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h7v16H4zm9 0h7v16h-7z"></path></svg>
                </button>
                <button data-action="view-size-3" aria-label="3 columns view" class="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors hover:bg-white view-toggle-btn active-view shadow-sm bg-white" title="3 Columns">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h4v16H4zm6 0h4v16h-4zm6 0h4v16h-4z"></path></svg>
                </button>
                <button data-action="view-size-4" aria-label="4 columns view" class="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors hover:bg-white view-toggle-btn" title="4 Columns">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h3v16H4zm5 0h3v16H9zm5 0h3v16h-3zm5 0h3v16h-3z"></path></svg>
                </button>
            </div>
        </div>
    </div>
`;