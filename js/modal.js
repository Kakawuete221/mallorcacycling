// modal.js - Gestió de Modal
import { formatTime } from './utils.js';
import { dibuixarMiniMapa, actualitzarMunicipiReal, dibuixarPerfilElevacio } from './map.js';

export const showModal = (puerto) => {
    const modal = document.getElementById('puerto-modal');
    const modalBody = document.getElementById('modal-body');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
        <div class="modal-container">
            <div class="modal-header">
                <img src="media/${puerto.nom}.jpg" class="header-img" onerror="this.src='media/photo.jpeg'">
                <div class="header-text">
                    <h2>${puerto.nom}</h2>
                    <p id="modal-municipi">Finding location...</p>
                </div>
            </div>

            <div class="modal-grid">
                <div class="visual-col">
                    <div id="modal-mini-map" class="mini-map-box"></div>
                    <div class="chart-box">
                        <canvas id="elevation-chart"></canvas>
                    </div>
                </div>

                <div class="data-col">
                    <div class="basic-stats">
                        <ul>
                            <li>Dist: ${puerto.distancia} km</li>
                            <li>Avg Grad: ${puerto.pendent_mitja}%</li>
                            <li>Elevation: ${puerto.desnivell} m</li>
                            <li>Category: ${puerto.categoria}</li>
                            <li>Max Grad: ${puerto.pendent_max}%</li>
                            <li>Max Elev: ${puerto.altitud_max} m</li>
                        </ul>
                    </div>

                    <div class="comparison-card">
                        <h4>🚀 You vs. KOM</h4>
                        <div class="bar-bg"><div id="pr-progress-bar" class="bar-fill"></div></div>
                        <p id="comparison-text"></p>
                    </div>

                    <div class="leaderboard">
                        <div class="entry"><span>👑 KOM:</span> <strong id="modal-kom-real">--:--</strong></div>
                        <div class="entry"><span>👑 QOM:</span> <strong id="modal-qom-real">--:--</strong></div>
                        <div class="entry pr"><span>🏅 Your PR:</span> <strong id="modal-pr-real">--:--</strong></div>
                    </div>

                    <div class="action-grid">
                        <button data-action="calcular-ruta" data-lat="${puerto.lat}" data-lng="${puerto.lng}" class="modal-btn">📍 How to get there</button>
                        <button data-action="cercar-serveis" data-lat="${puerto.lat}" data-lng="${puerto.lng}" class="modal-btn">☕ Nearby Services</button>
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