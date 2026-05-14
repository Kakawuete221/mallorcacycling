// ui.js - Interfície d'Usuari i Targetes
import { isStravaSessionValid, getAthleteStats } from './stravaApi.js';
import { formatTime } from './utils.js';
import { setValorSlider } from './filters.js';

export function actualitzarInterficieUsuari() {
    const userStr = localStorage.getItem('strava_athlete');
    const isLoggedIn = isStravaSessionValid();
    const navArea = document.getElementById('user-nav-area');
    const connectCard = document.getElementById('strava-card-container');

    if (isLoggedIn && userStr) {
        const user = JSON.parse(userStr);
        if (navArea) {
            navArea.innerHTML = `
                <div class="relative user-dropdown-container">
                    <div data-action="toggle-user-dropdown" class="flex items-center gap-2.5 cursor-pointer hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors select-none">
                        <span class="font-bold text-secondary">${user.firstname}</span>
                        <img src="${user.profile_medium}" class="w-[38px] h-[38px] rounded-full border-2 border-primary object-cover">
                        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                    <div id="user-dropdown" class="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-md z-[2000] border border-gray-100 overflow-hidden" style="display: none;">
                        <button data-action="logout-strava" class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">Log out</button>
                    </div>
                </div>`;
        }
        
        if (connectCard) {
            connectCard.innerHTML = `
                <div class="bg-[#11131f] text-white rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden gap-10">
                    <div class="absolute inset-0 opacity-20 pointer-events-none" style="background: radial-gradient(circle at 100% 50%, #ea580c 0%, transparent 60%);"></div>
                    <div class="relative z-10 flex flex-col items-start max-w-lg text-left">
                        <div class="flex items-center gap-4 mb-6">
                            <img src="${user.profile_medium}" class="w-16 h-16 rounded-full border-2 border-[#ea580c] object-cover">
                            <div>
                                <h2 class="text-2xl md:text-3xl font-bold italic font-title text-white uppercase tracking-wider">HELLO, ${user.firstname}!</h2>
                                <p class="text-gray-400 text-sm">You are connected to Strava.</p>
                            </div>
                        </div>
                        <p class="text-gray-400 mb-8 text-sm md:text-base leading-relaxed">Your account is fully linked. Head over to the map to see your segment efforts and real-time PRs.</p>
                        <button class="bg-[#c2410c] hover:bg-[#ea580c] text-white font-bold py-3 px-8 rounded text-sm tracking-wider transition-colors flex items-center gap-2 uppercase" data-link href="/map">GO TO MAP &rarr;</button>
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
                                CYCLING STATS
                            </h3>
                            <div class="grid grid-cols-2 gap-y-5 gap-x-4">
                                <div>
                                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Recent Rides</p>
                                    <p class="text-white font-bold text-lg">${recent ? recent.count : 0}</p>
                                </div>
                                <div>
                                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">YTD Rides</p>
                                    <p class="text-white font-bold text-lg">${ytd ? ytd.count : 0}</p>
                                </div>
                                <div>
                                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Recent Dist</p>
                                    <p class="text-white font-bold text-lg">${recent ? (recent.distance / 1000).toFixed(0) : 0} <span class="text-xs text-gray-500">km</span></p>
                                </div>
                                <div>
                                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">YTD Dist</p>
                                    <p class="text-[#ea580c] font-bold text-lg">${ytd ? (ytd.distance / 1000).toFixed(0) : 0} <span class="text-xs">km</span></p>
                                </div>
                                <div>
                                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Recent Elev</p>
                                    <p class="text-white font-bold text-lg">${recent ? recent.elevation_gain.toFixed(0) : 0} <span class="text-xs text-gray-500">m</span></p>
                                </div>
                                <div>
                                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">YTD Elev</p>
                                    <p class="text-white font-bold text-lg">${ytd ? ytd.elevation_gain.toFixed(0) : 0} <span class="text-xs text-gray-500">m</span></p>
                                </div>
                            </div>
                        </div>
                    `;
                } else if (statsContainer) {
                    statsContainer.innerHTML = `
                        <div class="bg-[#1a1c29] border border-gray-800 rounded-xl p-6 w-full md:w-80 shadow-lg text-left flex items-center justify-center">
                            <p class="text-xs text-gray-500">Stats unavailable</p>
                        </div>
                    `;
                }
            });
        }
    } else {
        if (navArea) {
            navArea.innerHTML = `<button data-action="login-strava" class="bg-primary hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105 duration-200 text-sm">LOGIN</button>`;
        }
        if (connectCard) {
            connectCard.innerHTML = `
                <div class="bg-[#11131f] text-white rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden gap-10">
                    <div class="absolute inset-0 opacity-20 pointer-events-none" style="background: radial-gradient(circle at 100% 50%, #ea580c 0%, transparent 60%);"></div>
                    
                    <div class="relative z-10 flex flex-col items-start max-w-lg text-left">
                        <div class="w-10 h-10 bg-gray-800 rounded flex items-center justify-center mb-6">
                            <svg class="w-6 h-6 text-[#ea580c]" fill="currentColor" viewBox="0 0 24 24"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"></path></svg>
                        </div>
                        <h2 class="text-3xl md:text-4xl font-bold italic font-title text-white mb-4 tracking-wide uppercase">Unleash the athlete within</h2>
                        <p class="text-gray-400 mb-8 text-sm md:text-base leading-relaxed">Connect your Strava account to automatically track segments, compete on leaderboards, and visualize your progress on our precision maps.</p>
                        <button class="bg-[#c2410c] hover:bg-[#ea580c] text-white font-bold py-3 px-8 rounded text-sm tracking-wider transition-colors flex items-center gap-2 uppercase" data-action="login-strava">CONNECT WITH STRAVA &rarr;</button>
                    </div>

                    <div class="relative z-10 w-full md:w-auto flex-shrink-0">
                        <div class="bg-[#1a1c29] border border-gray-800 rounded-xl p-5 w-full md:w-72 shadow-lg text-left">
                            <div class="flex items-center gap-3 mb-6">
                                <div class="w-10 h-10 bg-[#ea580c] rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M4 10h3v10H4zM10 4h3v16h-3zM16 14h3v6h-3z"></path></svg>
                                </div>
                                <div>
                                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Recent Activity</p>
                                    <p class="text-white font-bold text-sm">Coll de Femenia</p>
                                </div>
                            </div>
                            <div class="flex justify-between text-xs mb-2">
                                <span class="text-gray-500">Your Rank</span>
                                <span class="text-[#ea580c] font-bold">#14 / 2,451</span>
                            </div>
                            <div class="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mb-3">
                                <div class="bg-[#ea580c] h-full" style="width: 85%"></div>
                            </div>
                            <p class="text-[10px] text-gray-600 italic">You are in the top 10% of all riders this month.</p>
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

    return `
    <div class="bg-white rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col h-full relative group hover:shadow-xl transition-all duration-300">
        <div class="absolute top-3 right-3 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-md backdrop-blur shadow-sm z-10 border border-white/10">
            Cat. ${puerto.categoria}
        </div>
        <div class="w-full aspect-[4/3] overflow-hidden">
            <img src="media/${nom}.jpg" onerror="this.onerror=null; this.src='media/photo.jpeg';" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
        </div>
        <div class="p-5 flex-1 flex flex-col bg-white">
            <h3 class="font-title font-bold text-xl text-secondary mb-2">${nom}</h3>
            <p class="text-gray-600 text-sm mb-4">Distance: ${dist} km | Elevation: ${desn} m</p>
            <button class="mt-auto w-full py-3 bg-primary hover:bg-orange-600 text-white font-bold rounded-lg transition-colors" data-action="view-details" data-port="${portDataStr}">View Details</button>
        </div>
    </div>`;
};

export const createMiniCardHTML = (port, dadesStrava = null) => {
    if (!port || !port.id) return `<div class="p-2.5">Error data</div>`;

    let infoStrava = `<div class="border-t border-gray-100 pt-2 mt-2 text-[11px] text-gray-400 italic">Loading Strava data...</div>`;

    if (dadesStrava) {
        infoStrava = `
            <div class="border-t border-gray-100 pt-2 mt-2 text-xs">
                <div class="flex justify-between mb-1 text-gray-600">
                    <span>👑 <strong>KOM:</strong> ${dadesStrava.xoms?.kom || '--:--'}</span>
                    <span>👑 <strong>QOM:</strong> ${dadesStrava.xoms?.qom || '--:--'}</span>
                </div>
                <div class="text-primary font-bold">🏅 PR: ${formatTime(dadesStrava.athlete_segment_stats?.pr_elapsed_time)}</div>
            </div>`;
    } else {
        const cached = JSON.parse(localStorage.getItem(`segment_${port.id}`));
        if (cached && cached.data) {
            infoStrava = `
                <div class="border-t border-gray-100 pt-2 mt-2 text-xs">
                    <div class="flex justify-between mb-1 text-gray-600">
                        <span>👑 <strong>KOM:</strong> ${cached.data.xoms?.kom || '--:--'}</span>
                        <span>👑 <strong>QOM:</strong> ${cached.data.xoms?.qom || '--:--'}</span>
                    </div>
                    <div class="text-primary font-bold">🏅 PR: ${formatTime(cached.data.athlete_segment_stats?.pr_elapsed_time)}</div>
                </div>`;
        }
    }

    const portDataStr = JSON.stringify(port).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
    return `
        <div class="font-body p-1.5 min-w-[240px]">
            <h3 class="m-0 text-[15px] font-bold text-secondary">${port.nom}</h3>
            <div class="text-xs text-gray-500 mb-2">🚲 ${port.distancia}km · ${port.pendent_mitja}% · ${port.desnivell}m</div>
            ${infoStrava}
            <button data-action="view-details" data-port="${portDataStr}" class="w-full bg-primary hover:bg-orange-600 text-white border-none p-2 rounded text-sm font-bold cursor-pointer mt-2.5 transition-colors">View Details</button>
        </div>`;
};

export const uiToggleDropdownFiltres = () => {
    const panel = document.getElementById('panel-filtres');
    const btn = document.getElementById('btn-filtres-dropdown');
    panel.classList.toggle('hidden');
    if (panel.classList.contains('hidden')) {
        btn.classList.remove('bg-gray-100', 'border-gray-400');
    } else {
        btn.classList.add('bg-gray-100', 'border-gray-400');
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
            li.innerHTML = `<span class="font-bold">${port.nom}</span> <span class="text-xs text-gray-400 ml-1">${port.municipi || ''}</span>`;
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
    const isActive = btn.classList.contains('text-primary');

    if (isActive) {
        btn.classList.remove('text-primary', 'border-primary', 'bg-orange-50');
        btn.classList.add('text-gray-700', 'border-gray-300', 'bg-white');
        const switchEl = btn.querySelector('#toggle-completats-switch');
        if (switchEl) {
            switchEl.classList.remove('bg-primary');
            switchEl.classList.add('bg-gray-200');
            switchEl.firstElementChild.classList.remove('translate-x-4');
        }
    } else {
        btn.classList.remove('text-gray-700', 'border-gray-300', 'bg-white');
        btn.classList.add('text-primary', 'border-primary', 'bg-orange-50');
        const switchEl = btn.querySelector('#toggle-completats-switch');
        if (switchEl) {
            switchEl.classList.remove('bg-gray-200');
            switchEl.classList.add('bg-primary');
            switchEl.firstElementChild.classList.add('translate-x-4');
        }
    }
    
    return !isActive; 
};

export const uiToggleGeneric = (btn) => {
    const classesInactiu = ['bg-gray-50', 'text-gray-600', 'border-gray-200'];
    const classesActiu = ['bg-orange-50', 'text-primary', 'border-primary'];

    const esSeleccionat = btn.classList.contains('bg-orange-50');

    if (esSeleccionat) {
        btn.classList.remove(...classesActiu);
        btn.classList.add(...classesInactiu);
    } else {
        btn.classList.remove(...classesInactiu);
        btn.classList.add(...classesActiu);
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
        btn.classList.remove('bg-orange-50', 'text-primary', 'border-primary');
        btn.classList.add('bg-gray-50', 'text-gray-600', 'border-gray-200');
    });

    const sliders = [
        {id: 'sl-distancia', valId: 'val-dist', default: "10", unit: " km"},
        {id: 'sl-desnivell', valId: 'val-desn', default: "1000", unit: " m"},
        {id: 'sl-pendent', valId: 'val-pend', default: "10", unit: " %", prefix: "< "}
    ];

    sliders.forEach(s => {
        const el = document.getElementById(s.id);
        const valEl = document.getElementById(s.valId);
        if (el) el.value = s.default;
        if (valEl) valEl.innerText = (s.prefix || "") + s.default + s.unit;
    });
};

export const createFiltresHTML = () => `
    <div class="flex flex-wrap items-start gap-3">
        <div class="relative">
            <button data-action="toggle-filtres" id="btn-filtres-dropdown" class="bg-white rounded-lg shadow-sm border border-gray-200 h-10 px-4 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                Filters
            </button>

            <div id="panel-filtres" class="hidden absolute top-full mt-2 left-0 w-[340px] bg-white border border-gray-100 shadow-2xl rounded-xl flex flex-col overflow-hidden max-h-[75vh] overflow-y-auto z-50">
                <div class="flex justify-between items-center px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                    <span class="font-bold text-gray-800 text-sm">Refine search</span>
                    <button data-action="netejar-filtres" class="text-xs font-semibold text-primary hover:text-orange-700">Clear</button>
                </div>

                <div class="p-5 space-y-7">
                    <div>
                        <h4 class="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Region</h4>
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
                        <h4 class="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Category</h4>
                        <div class="grid grid-cols-4 gap-2">
                            <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all text-center" data-action="toggle-generic" data-camp="categoria" data-valor="1">1</button>
                            <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all text-center" data-action="toggle-generic" data-camp="categoria" data-valor="2">2</button>
                            <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all text-center" data-action="toggle-generic" data-camp="categoria" data-valor="3">3</button>
                            <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all text-center" data-action="toggle-generic" data-camp="categoria" data-valor="4">4</button>
                        </div>
                    </div>

                    <div>
                        <div class="flex justify-between items-end mb-2">
                            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide">Max Distance</h4>
                            <span class="text-[13px] font-bold text-primary" id="val-dist">10 km</span>
                        </div>
                        <input type="range" id="sl-distancia" data-camp="distanciaMax" data-val-id="val-dist" data-sufix=" km" min="1" max="10" value="10" step="0.5" class="custom-slider w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary">
                    </div>

                    <div>
                        <div class="flex justify-between items-end mb-2">
                            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide">Max Elevation Gain</h4>
                            <span class="text-[13px] font-bold text-primary" id="val-desn">1000 m</span>
                        </div>
                        <input type="range" id="sl-desnivell" data-camp="desnivellMax" data-val-id="val-desn" data-sufix=" m" min="0" max="1000" value="1000" step="50" class="custom-slider w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary">
                    </div>

                    <div>
                        <div class="flex justify-between items-end mb-2">
                            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide">Max Gradient</h4>
                            <span class="text-[13px] font-bold text-primary" id="val-pend">< 10 %</span>
                        </div>
                        <input type="range" id="sl-pendent" data-camp="pendentMax" data-val-id="val-pend" data-prefix="< " data-sufix=" %" min="2" max="10" value="10" step="0.5" class="custom-slider w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary">
                    </div>
                </div>
            </div>
        </div>  

        <div class="relative bg-white rounded-lg shadow-sm border border-gray-200 flex items-center h-10 px-3 w-64 md:w-72">
            <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" id="input-cerca" autocomplete="off" class="w-full h-full outline-none border-none ring-0 focus:ring-0 text-sm text-gray-700 placeholder-gray-400 bg-transparent" placeholder="Search for a segment...">
            
            <button id="btn-clear-search" data-action="netejar-cerca" class="hidden ml-2 text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <ul id="llista-suggeriments" class="absolute top-full left-0 w-full mt-1 bg-white border border-gray-100 shadow-xl rounded-lg overflow-hidden hidden z-50 max-h-60 overflow-y-auto"></ul>
        </div>

        <button id="btn-completats" data-action="toggle-completats" class="bg-white rounded-lg shadow-sm border border-gray-200 h-10 px-4 flex items-center gap-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <svg class="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            Completed
        </button>
    </div>
`;

export const createSidebarFiltresHTML = () => `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-6 w-full lg:w-72 flex-shrink-0 sticky top-[100px]">
        <div class="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 class="font-bold text-gray-800 flex items-center gap-2 text-lg">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                Filtres
            </h3>
            <button data-action="netejar-filtres" class="text-sm font-semibold text-primary hover:text-orange-700 transition-colors">Clear</button>
        </div>

        <div class="space-y-4">
            <details class="group border-b border-gray-100 pb-4">
                <summary class="text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <span>Region</span>
                    <svg class="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </summary>
                <div class="grid grid-cols-2 gap-2 mt-3">
                    <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all text-center" data-action="toggle-generic" data-camp="comarca" data-valor="Tramuntana">Tramuntana</button>
                    <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all text-center" data-action="toggle-generic" data-camp="comarca" data-valor="Raiguer">Raiguer</button>
                    <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all text-center" data-action="toggle-generic" data-camp="comarca" data-valor="Pla">Pla</button>
                    <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all text-center" data-action="toggle-generic" data-camp="comarca" data-valor="Migjorn">Migjorn</button>
                    <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all text-center" data-action="toggle-generic" data-camp="comarca" data-valor="Llevant">Llevant</button>
                    <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all text-center" data-action="toggle-generic" data-camp="comarca" data-valor="Palma">Palma</button>
                </div>
            </details>

            <details class="group border-b border-gray-100 pb-4">
                <summary class="text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <span>Category</span>
                    <svg class="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </summary>
                <div class="grid grid-cols-4 gap-2 mt-3">
                    <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all text-center" data-action="toggle-generic" data-camp="categoria" data-valor="1">1</button>
                    <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all text-center" data-action="toggle-generic" data-camp="categoria" data-valor="2">2</button>
                    <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all text-center" data-action="toggle-generic" data-camp="categoria" data-valor="3">3</button>
                    <button class="pindola py-2 rounded-lg text-[13px] font-medium bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all text-center" data-action="toggle-generic" data-camp="categoria" data-valor="4">4</button>
                </div>
            </details>

            <details class="group border-b border-gray-100 pb-4">
                <summary class="text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <span>Max Distance</span>
                    <svg class="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </summary>
                <div class="mt-3">
                    <div class="flex justify-end items-end mb-2">
                        <span class="text-[13px] font-bold text-primary" id="val-dist">10 km</span>
                    </div>
                    <input type="range" id="sl-distancia" data-camp="distanciaMax" data-val-id="val-dist" data-sufix=" km" min="1" max="10" value="10" step="0.5" class="custom-slider w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary">
                </div>
            </details>

            <details class="group border-b border-gray-100 pb-4">
                <summary class="text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <span>Max Elevation Gain</span>
                    <svg class="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </summary>
                <div class="mt-3">
                    <div class="flex justify-end items-end mb-2">
                        <span class="text-[13px] font-bold text-primary" id="val-desn">1000 m</span>
                    </div>
                    <input type="range" id="sl-desnivell" data-camp="desnivellMax" data-val-id="val-desn" data-sufix=" m" min="0" max="1000" value="1000" step="50" class="custom-slider w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary">
                </div>
            </details>

            <details class="group">
                <summary class="text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <span>Max Gradient</span>
                    <svg class="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </summary>
                <div class="mt-3">
                    <div class="flex justify-end items-end mb-2">
                        <span class="text-[13px] font-bold text-primary" id="val-pend">< 10 %</span>
                    </div>
                    <input type="range" id="sl-pendent" data-camp="pendentMax" data-val-id="val-pend" data-prefix="< " data-sufix=" %" min="2" max="10" value="10" step="0.5" class="custom-slider w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary">
                </div>
            </details>
        </div>
    </div>
`;

export const createTopBarSegmentsHTML = () => `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-col md:flex-row gap-4 justify-between items-center w-full mb-6">
        <div class="relative flex-1 w-full md:w-auto max-w-md bg-white rounded-lg flex items-center h-10 px-3 border border-gray-200 hover:border-gray-300 transition-colors">
            <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" id="input-cerca" autocomplete="off" class="w-full h-full outline-none border-none ring-0 focus:ring-0 text-sm text-gray-700 placeholder-gray-400 bg-transparent" placeholder="Search segments...">
            
            <button id="btn-clear-search" data-action="netejar-cerca" class="hidden ml-2 text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <ul id="llista-suggeriments" class="absolute top-full left-0 w-full mt-1 bg-white border border-gray-100 shadow-xl rounded-lg overflow-hidden hidden z-50 max-h-60 overflow-y-auto"></ul>
        </div>
        
        <div class="flex items-center gap-3">
            <div class="relative flex items-center">
                <svg class="w-4 h-4 text-gray-500 absolute left-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18M6 12h12M9 20h6"></path></svg>
                <select id="select-ordenacio" class="bg-white border border-gray-200 hover:border-gray-300 rounded-lg h-10 pl-9 pr-3 text-sm font-medium text-gray-700 transition-colors focus:ring-0 outline-none cursor-pointer">
                    <option value="">Default order</option>
                    <option value="dist_asc">Distance (Ascending)</option>
                    <option value="dist_desc">Distance (Descending)</option>
                    <option value="grad_asc">Gradient (Ascending)</option>
                    <option value="grad_desc">Gradient (Descending)</option>
                </select>
            </div>
            
            <div class="flex bg-gray-50 rounded-lg p-1 gap-1 border border-gray-100">
                <button data-action="view-size-2" class="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors hover:bg-white view-toggle-btn" title="2 Columns">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h7v16H4zm9 0h7v16h-7z"></path></svg>
                </button>
                <button data-action="view-size-3" class="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors hover:bg-white view-toggle-btn active-view shadow-sm bg-white" title="3 Columns">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h4v16H4zm6 0h4v16h-4zm6 0h4v16h-4z"></path></svg>
                </button>
                <button data-action="view-size-4" class="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors hover:bg-white view-toggle-btn" title="4 Columns">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h3v16H4zm5 0h3v16H9zm5 0h3v16h-3zm5 0h3v16h-3z"></path></svg>
                </button>
            </div>
        </div>
    </div>
`;