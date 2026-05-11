// segments.js - Module for handling Strava segments and related UI interactions

import { getSegmentDetails } from './stravaApi.js';
import { addPortMarkers } from './map.js';

// Function to load segments from local JSON and display them
export async function loadSegments() {
    const segmentList = document.getElementById('segment-list');
    if (!segmentList) return;

    try {
        const response = await fetch('data/puertos.json');
        const ports = await response.json();

        segmentList.innerHTML = ''; // Clear existing list

        // Draw each segment card
        ports.forEach(port => {
            const stravaId = port.id || "0";
            const imatgePerDefecte = "media/photo.jpeg";
            const imatgePort = port.imagen || imatgePerDefecte;

            const cardHTML = `
                <div class="segment">
                    <div class="card-img-wrapper">
                        <img src="${imatgePort}" alt="${port.nombre}">
                    </div>
                    <div class="segment-content">
                        <h3 style="color: #fc4c02; margin-bottom: 10px;">${port.nombre}</h3>
                        <p><strong>Municipi:</strong> ${port.municipio}</p>
                        <p><strong>Distància:</strong> ${port.distancia_km} km</p>
                        <p><strong>Desnivell:</strong> ${port.elevacion_m} m</p>
                        <p><strong>Pendent mitjà:</strong> ${port.pendiente_media_pct}%</p>
                        <p><strong>Categoria:</strong> Cat. ${port.categoria}</p>
                        <p><strong>Temps KOM:</strong> ${port.tiempo_kom || 'No disponible'}</p>
                        <p><strong>Temps QOM:</strong> ${port.tiempo_qom || 'No disponible'}</p>
                        
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button class="btn-details" data-id="${stravaId}">Veure detalls</button>
                            <button class="btn-save" data-id="${stravaId}" style="background-color: #2f353b;">Guardar</button>
                        </div>
                    </div>
                </div>
            `;
            segmentList.innerHTML += cardHTML;
        });

        // Add event listeners for "Veure detalls" buttons after the cards have been rendered
        const detailButtons = document.querySelectorAll('.btn-details');
        detailButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const portId = e.target.getAttribute('data-id');
                showPortDetails(portId, ports);
            });
        });

        // Initialize map markers for the segments
        addPortMarkers(ports);

    } catch (error) {
        console.error("Error loading ports:", error);
        segmentList.innerHTML = '<p style="color: red;">Hi ha hagut un error carregant el catàleg de ports.</p>';
    }
}

// Function to show port details in a modal
export async function showPortDetails(portId, ports) {
    const modal = document.getElementById('port-modal');
    const port = ports.find(p => p.id === portId);

    if (port) {
        const modalContent = modal.querySelector('.modal-content');

        // Build all the detailed content of the modal
        modalContent.innerHTML = `
            <span class="close-modal" style="color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
            <h2 id="modal-title" style="color: #fc4c02; margin-bottom: 15px;">${port.nombre}</h2>
            <p><strong>Municipi:</strong> <span>${port.municipio}</span></p>
            <p><strong>Distància:</strong> <span>${port.distancia_km} km</span></p>
            <p><strong>Desnivell:</strong> <span>${port.elevacion_m} m</span></p>
            <p><strong>Pendent mitjà:</strong> <span>${port.pendiente_media_pct}%</span></p>
            <p><strong>Pendent màxim:</strong> <span>${port.pendiente_maxima_pct || 'N/A'}%</span></p>
            <p><strong>Categoria:</strong> <span>Cat. ${port.categoria}</span></p>
            
            <hr style="border: 0; border-top: 1px solid #ddd; margin: 15px 0;">
            
            <h3 style="color: #2f353b; margin-bottom: 10px;">Dades del Segment i Strava</h3>
            <p><strong>Temps KOM:</strong> <span id="modal-temps-kom">Carregant...</span></p>
            <p><strong>Titular KOM:</strong> <span id="modal-nom-kom">Carregant...</span></p>
            <p><strong>Velocitat mitjana KOM:</strong> <span>${port.velocidad_media_kom ? port.velocidad_media_kom + ' km/h' : 'No disponible'}</span></p>
            <p><strong>Potència mitjana KOM:</strong> <span>${port.potencia_media_kom ? port.potencia_media_kom + ' W' : 'No disponible'}</span></p>
            
            <p><strong>Temps QOM:</strong> <span id="modal-temps-qom">Carregant...</span></p>
            <p><strong>Titular QOM:</strong> <span id="modal-nom-qom">Carregant...</span></p>
            <p><strong>Velocitat mitjana QOM:</strong> <span>${port.velocidad_media_qom ? port.velocidad_media_qom + ' km/h' : 'No disponible'}</span></p>
            <p><strong>Potència mitjana QOM:</strong> <span>${port.potencia_qom ? port.potencia_qom + ' W' : 'No disponible'}</span></p>
            
            <p><strong>El teu temps personal:</strong> <span id="modal-temps-usuari">Carregant dades...</span></p>
        `;

        modal.style.display = 'flex';

        try {
            const cacheKey = `strava_segment_${portId}`;
            const cachedData = sessionStorage.getItem(cacheKey);
            
            let stravaData;

            if (cachedData) {
                stravaData = JSON.parse(cachedData);
            } else {
                stravaData = await getSegmentDetails(portId);
                if (stravaData) {
                    sessionStorage.setItem(cacheKey, JSON.stringify(stravaData));
                }
            }

            if (stravaData) {
                if (stravaData.kom_in_seconds) {
                    const komSeconds = stravaData.kom_in_seconds;
                    const komMin = Math.floor(komSeconds / 60);
                    const komSeg = komSeconds % 60;
                    document.getElementById('modal-temps-kom').textContent = `${komMin}m ${komSeg}s`;
                    document.getElementById('modal-nom-kom').textContent = stravaData.kom_holder_name || 'Desconegut';
                } else {
                    document.getElementById('modal-temps-kom').textContent = port.tiempo_kom || 'No disponible';
                    document.getElementById('modal-nom-kom').textContent = port.titular_kom || port.kom || 'Desconegut';
                }

                if (stravaData.qom_in_seconds) {
                    const qomSeconds = stravaData.qom_in_seconds;
                    const qomMin = Math.floor(qomSeconds / 60);
                    const qomSeg = qomSeconds % 60;
                    document.getElementById('modal-temps-qom').textContent = `${qomMin}m ${qomSeg}s`;
                    document.getElementById('modal-nom-qom').textContent = stravaData.qom_holder_name || 'Desconegut';
                } else {
                    document.getElementById('modal-temps-qom').textContent = port.tiempo_qom || 'No disponible';
                    document.getElementById('modal-nom-qom').textContent = port.titular_qom || port.qom || 'Desconegut';
                }

                if (stravaData.athlete_segment_stats && stravaData.athlete_segment_stats.pr_elapsed_time) {
                    const prSeconds = stravaData.athlete_segment_stats.pr_elapsed_time;
                    const prMin = Math.floor(prSeconds / 60);
                    const prSeg = prSeconds % 60;
                    document.getElementById('modal-temps-usuari').textContent = `${prMin}m ${prSeg}s`;
                } else {
                    document.getElementById('modal-temps-usuari').textContent = 'Sense temps registrat';
                }
            } else {
                document.getElementById('modal-temps-kom').textContent = port.tiempo_kom || 'No disponible';
                document.getElementById('modal-nom-kom').textContent = port.titular_kom || port.kom || 'Desconegut';
                document.getElementById('modal-temps-qom').textContent = port.tiempo_qom || 'No disponible';
                document.getElementById('modal-nom-qom').textContent = port.titular_qom || port.qom || 'Desconegut';
                document.getElementById('modal-temps-usuari').textContent = 'Sense temps registrat';
            }
        } catch (err) {
            console.error('Error loading Strava data in modal:', err);
            
            document.getElementById('modal-temps-kom').textContent = port.tiempo_kom || 'Error al connectar';
            document.getElementById('modal-nom-kom').textContent = port.titular_kom || port.kom || 'Desconegut';
            document.getElementById('modal-temps-qom').textContent = port.tiempo_qom || 'Error al connectar';
            document.getElementById('modal-nom-qom').textContent = port.titular_qom || port.qom || 'Desconegut';
            document.getElementById('modal-temps-usuari').textContent = 'Inicia sessió per veure el teu temps';
        }
    }

    const closeModal = modal.querySelector('.close-modal');
    if (closeModal) {
        closeModal.onclick = () => {
            modal.style.display = 'none';
        };
    }

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}