// modal.js - Gestió de Modal
import { formatTime } from './utils.js';
import { dibuixarMiniMapa, actualitzarMunicipiReal, dibuixarPerfilElevacio } from './map.js';

export const showModal = (puerto) => {
    const modal = document.getElementById('puerto-modal');
    const modalBody = document.getElementById('modal-body');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
        <div class="flex flex-col gap-6 w-full p-0 flex-1">
            <div class="relative h-[220px] md:h-[280px] md:rounded-t-3xl shrink-0 overflow-hidden flex items-end p-5 md:p-8 text-white">
                <img src="media/${puerto.nom}.jpg" class="absolute inset-0 w-full h-full object-cover z-0" onerror="this.src='media/photo.jpeg'">
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-0"></div>
                <div class="relative z-10 w-full">
                    <h2 class="text-4xl md:text-5xl font-title font-bold drop-shadow-lg m-0 leading-tight">${puerto.nom}</h2>
                    <div class="flex items-center gap-2 mt-3 opacity-90">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <p id="modal-municipi" class="text-sm md:text-base m-0 font-medium tracking-wide">Finding location...</p>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6 md:gap-8 px-5 md:px-8 pb-8 w-full flex-1">
                <div class="flex flex-col gap-6 w-full">
                    <div id="modal-mini-map" class="h-[240px] md:h-[280px] rounded-2xl border border-gray-100 shadow-sm w-full overflow-hidden"></div>
                    <div class="bg-gray-50 rounded-2xl p-3 md:p-4 border border-gray-100 w-full relative h-[180px] md:h-[220px]">
                        <canvas id="elevation-chart" class="w-full h-full"></canvas>
                    </div>
                </div>

                <div class="flex flex-col gap-6 w-full">
                    <!-- Stats Grid -->
                    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        <div class="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Distance</span>
                            <span class="text-lg font-title font-bold text-gray-800">${puerto.distancia} km</span>
                        </div>
                        <div class="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Avg Grad</span>
                            <span class="text-lg font-title font-bold text-gray-800">${puerto.pendent_mitja}%</span>
                        </div>
                        <div class="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Elevation</span>
                            <span class="text-lg font-title font-bold text-gray-800">${puerto.desnivell} m</span>
                        </div>
                        <div class="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Category</span>
                            <span class="text-lg font-title font-bold text-gray-800">${puerto.categoria}</span>
                        </div>
                        <div class="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Max Grad</span>
                            <span class="text-lg font-title font-bold text-gray-800">${puerto.pendent_max}%</span>
                        </div>
                        <div class="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Max Elev</span>
                            <span class="text-lg font-title font-bold text-gray-800">${puerto.altitud_max} m</span>
                        </div>
                    </div>

                    <!-- KOM Section -->
                    <div class="bg-gradient-to-br from-orange-50 to-orange-100/50 p-5 rounded-2xl border border-orange-100/80 shadow-inner">
                        <div class="flex items-center gap-2 mb-3">
                            <span class="text-xl">🚀</span>
                            <h4 class="font-bold text-orange-900 m-0">You vs. KOM</h4>
                        </div>
                        <div class="bg-white/60 h-3 rounded-full overflow-hidden shadow-inner border border-orange-900/5">
                            <div id="pr-progress-bar" class="bg-gradient-to-r from-orange-500 to-primary h-full rounded-full w-0 transition-all duration-[1500ms] ease-out"></div>
                        </div>
                        <p id="comparison-text" class="text-xs font-semibold text-orange-800/80 mt-3 m-0"></p>
                    </div>

                    <!-- Times Section -->
                    <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3 text-sm text-gray-700">
                        <div class="flex justify-between items-center border-b border-gray-100 pb-3">
                            <span class="flex items-center gap-2 text-gray-500 font-medium">👑 KOM</span> 
                            <strong id="modal-kom-real" class="font-title text-gray-900 text-base">--:--</strong>
                        </div>
                        <div class="flex justify-between items-center border-b border-gray-100 pb-3">
                            <span class="flex items-center gap-2 text-gray-500 font-medium">👑 QOM</span> 
                            <strong id="modal-qom-real" class="font-title text-gray-900 text-base">--:--</strong>
                        </div>
                        <div class="flex justify-between items-center pt-1 text-primary">
                            <span class="flex items-center gap-2 font-bold">🏅 Your PR</span> 
                            <strong id="modal-pr-real" class="font-title text-lg">--:--</strong>
                        </div>
                    </div>

                    <!-- Buttons -->
                    <div class="grid grid-cols-2 gap-3 mt-auto pt-2">
                        <button data-action="calcular-ruta" data-lat="${puerto.lat}" data-lng="${puerto.lng}" class="bg-primary text-white hover:bg-orange-600 border-none py-3.5 px-4 rounded-xl text-sm font-bold cursor-pointer transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                            Route
                        </button>
                        <button data-action="cercar-serveis" data-lat="${puerto.lat}" data-lng="${puerto.lng}" class="bg-white text-gray-700 hover:bg-gray-50 hover:text-primary border border-gray-200 py-3.5 px-4 rounded-xl text-sm font-bold cursor-pointer transition-all shadow-sm flex justify-center items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            Services
                        </button>
                    </div>
                </div>
            </div>
        </div>`;

    modal.style.display = 'flex';

    dibuixarMiniMapa(puerto); 
    actualitzarMunicipiReal(puerto.lat, puerto.lng); 
    dibuixarPerfilElevacio(puerto.polyline); 
    
    _omplirDadesStravaModal(puerto);
};

const _omplirDadesStravaModal = (port) => {
    const cached = JSON.parse(localStorage.getItem(`segment_${port.id}`));
    if (cached && cached.data) {
        const d = cached.data;
        const komStr = d.xoms?.kom || "--:--";
        const prSec = d.athlete_segment_stats?.pr_elapsed_time || 0;

        document.getElementById('modal-kom-real').innerText = komStr;
        document.getElementById('modal-qom-real').innerText = d.xoms?.qom || "--:--";
        document.getElementById('modal-pr-real').innerText = formatTime(prSec);

        const komSec = _timeToSeconds(komStr);
        if (komSec > 0 && prSec > 0) {
            const bar = document.getElementById('pr-progress-bar');
            const percent = Math.min(100, (komSec / prSec) * 100);
            setTimeout(() => { bar.style.width = `${percent}%`; }, 200);

            const text = document.getElementById('comparison-text');
            text.innerText = prSec > komSec ? `You are ${formatTime(prSec - komSec)} away from the KOM` : "👑 You have the KOM!";
        }
    }
};

const _timeToSeconds = (timeStr) => {
    if (!timeStr || timeStr === "--:--") return 0;
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    if (parts.length === 2) return (parts[0] * 60) + parts[1];
    return 0;
};

export const closeModal = () => {
    const modal = document.getElementById('puerto-modal');
    if (modal) modal.style.display = 'none';
};