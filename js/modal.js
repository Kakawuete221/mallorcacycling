// modal.js - Gestió de Modal i MiniCard
import { getSegmentDetails } from './stravaApi.js';
import { formatTime, calcularVelocitat } from './utils.js';
import { dibuixarMiniMapa } from './map.js';

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
                        <button onclick="window.calcularRuta(${puerto.lat}, ${puerto.lng})" class="modal-btn">📍 How to get there</button>
                        <button onclick="window.cercarServeis(${puerto.lat}, ${puerto.lng})" class="modal-btn">☕ Nearby Services</button>
                    </div>
                </div>
            </div>
        </div>`;

    modal.style.display = 'flex';

    // Execució de les funcions d'API
    dibuixarMiniMapa(puerto); // Pinta el mapa
    window.actualitzarMunicipiReal(puerto.lat, puerto.lng); // Pinta el poble (Geocoding)
    window.dibuixarPerfilElevacio(puerto.polyline); // Pinta l'altimetria (Elevation API)
};

window.handleVerSegmento = (port) => {
    showModal(port); // Genera l'HTML i crida les APIs de Google

    const cached = JSON.parse(localStorage.getItem(`segment_${port.id}`));
    if (cached && cached.data) {
        const d = cached.data;
        const komStr = d.xoms?.kom || "--:--";
        const prSec = d.athlete_segment_stats?.pr_elapsed_time || 0;

        document.getElementById('modal-kom-real').innerText = komStr;
        document.getElementById('modal-qom-real').innerText = d.xoms?.qom || "--:--";
        document.getElementById('modal-pr-real').innerText = formatTime(prSec);

        // Actualitzem la barra de comparativa
        const komSec = timeToSeconds(komStr);
        if (komSec > 0 && prSec > 0) {
            const bar = document.getElementById('pr-progress-bar');
            const percent = Math.min(100, (komSec / prSec) * 100);
            setTimeout(() => { bar.style.width = `${percent}%`; }, 200);

            const text = document.getElementById('comparison-text');
            text.innerText = prSec > komSec ? `You are ${formatTime(prSec - komSec)} away from the KOM` : "👑 You have the KOM!";
        }
    }
};

window.createMiniCardHTML = (port) => {
    if (!port || !port.id) return `<div style="padding:10px;">Error data</div>`;

    const cached = JSON.parse(localStorage.getItem(`segment_${port.id}`));
    let infoStrava = `<div style="border-top: 1px solid #eee; padding-top: 8px; margin-top: 8px; font-size: 11px; color: #888; font-style: italic;">Loading Strava data...</div>`;

    if (cached && cached.data) {
        const d = cached.data;
        infoStrava = `
            <div style="border-top: 1px solid #eee; padding-top: 8px; margin-top: 8px; font-size: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>👑 <strong>KOM:</strong> ${d.xoms?.kom || '--:--'}</span>
                    <span>👑 <strong>QOM:</strong> ${d.xoms?.qom || '--:--'}</span>
                </div>
                <div style="color: #fc4c02; font-weight: bold;">🏅 PR: ${formatTime(d.athlete_segment_stats?.pr_elapsed_time)}</div>
            </div>`;
    }

    const portData = JSON.stringify(port).replace(/'/g, "&apos;");
    return `
        <div style="font-family: 'Inter', sans-serif; padding: 5px; min-width: 240px;">
            <h3 style="margin: 0; font-size: 15px;">${port.nom}</h3>
            <div style="font-size: 12px; color: #666; margin-bottom: 8px;">🚲 ${port.distancia}km · ${port.pendent_mitja}% · ${port.desnivell}m</div>
            ${infoStrava}
            <button onclick='window.handleVerSegmento(${portData})' style="width: 100%; background: #fc4c02; color: white; border: none; padding: 8px; border-radius: 4px; font-weight: bold; cursor: pointer; margin-top: 10px;">View Details</button>
        </div>`;
};

window.closeModal = () => {
    const modal = document.getElementById('puerto-modal');
    if (modal) modal.style.display = 'none';
};