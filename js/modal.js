// modal.js - Gestió de Modal
import { formatTime } from './utils.js';
import { dibuixarMiniMapa, actualitzarMunicipiReal, dibuixarPerfilElevacio } from './map.js';

export const showModal = (puerto) => {
    const modal = document.getElementById('puerto-modal');
    const modalBody = document.getElementById('modal-body');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
        <div class="flex flex-col gap-5 w-full p-0">
            <div class="relative h-[200px] rounded-t-xl overflow-hidden flex items-end p-5 text-white">
                <img src="media/${puerto.nom}.jpg" class="absolute top-0 left-0 w-full h-full object-cover z-0 brightness-75" onerror="this.src='media/photo.jpeg'">
                <div class="relative z-10">
                    <h2 class="text-3xl font-title font-bold drop-shadow-md m-0">${puerto.nom}</h2>
                    <p id="modal-municipi" class="text-sm opacity-90 m-0 mt-1">Finding location...</p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-6 px-7 pb-7">
                <div>
                    <div id="modal-mini-map" class="h-[250px] rounded-xl border border-gray-200 shadow-sm w-full"></div>
                    <div class="mt-4">
                        <canvas id="elevation-chart"></canvas>
                    </div>
                </div>

                <div>
                    <div class="mb-5">
                        <ul class="list-none p-0 columns-2 gap-5 text-sm text-gray-700">
                            <li class="mb-2">Dist: <span class="font-bold">${puerto.distancia} km</span></li>
                            <li class="mb-2">Avg Grad: <span class="font-bold">${puerto.pendent_mitja}%</span></li>
                            <li class="mb-2">Elev: <span class="font-bold">${puerto.desnivell} m</span></li>
                            <li class="mb-2">Cat: <span class="font-bold">${puerto.categoria}</span></li>
                            <li class="mb-2">Max Grad: <span class="font-bold">${puerto.pendent_max}%</span></li>
                            <li class="mb-2">Max Elev: <span class="font-bold">${puerto.altitud_max} m</span></li>
                        </ul>
                    </div>

                    <div class="bg-orange-50 p-4 rounded-xl border border-orange-100 my-5">
                        <h4 class="font-bold text-gray-700 m-0 mb-2">🚀 You vs. KOM</h4>
                        <div class="bg-gray-200 h-2.5 rounded-full my-2.5 overflow-hidden">
                            <div id="pr-progress-bar" class="bg-primary h-full rounded-full w-0 transition-all duration-[1500ms] ease-out"></div>
                        </div>
                        <p id="comparison-text" class="text-sm text-gray-600 m-0"></p>
                    </div>

                    <div class="bg-gray-50 p-4 rounded-xl mt-4 space-y-2 text-sm text-gray-700">
                        <div class="flex justify-between border-b border-gray-200 pb-2"><span>👑 KOM:</span> <strong id="modal-kom-real">--:--</strong></div>
                        <div class="flex justify-between border-b border-gray-200 pb-2"><span>👑 QOM:</span> <strong id="modal-qom-real">--:--</strong></div>
                        <div class="flex justify-between text-primary"><span>🏅 Your PR:</span> <strong id="modal-pr-real">--:--</strong></div>
                    </div>

                    <div class="grid grid-cols-2 gap-3 mt-5">
                        <button data-action="calcular-ruta" data-lat="${puerto.lat}" data-lng="${puerto.lng}" class="bg-orange-100 text-primary hover:bg-orange-200 border-none py-3 px-2 rounded-lg text-sm font-bold cursor-pointer transition-colors">📍 Route</button>
                        <button data-action="cercar-serveis" data-lat="${puerto.lat}" data-lng="${puerto.lng}" class="bg-orange-100 text-primary hover:bg-orange-200 border-none py-3 px-2 rounded-lg text-sm font-bold cursor-pointer transition-colors">☕ Services</button>
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