// router.js - Navegació i Control Principal
import { loginWithStrava, checkStravaCallback, isStravaSessionValid, logoutStrava } from './stravaApi.js';
import { initGoogleMap, pintarPorts } from './map.js';
import { actualitzarInterficieUsuari, createCardHTML } from './ui.js';
import './modal.js'; // Importem per registrar els windows.handleVerSegmento

window.loginAmbStrava = loginWithStrava;
window.ferLogout = () => { logoutStrava(); window.location.href = "/"; };

window.toggleDropdown = (event) => {
    event.stopPropagation();
    const d = document.getElementById('user-dropdown');
    if (d) d.style.display = d.style.display === 'none' ? 'block' : 'none';
};

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
        // Generem les targetes destacades usant la funció de ui.js
        const destacats = puertos.slice(0, 4).map(createCardHTML).join('');
        
        return `
            <section id="intro" class="section fade-in">
                <div class="intro-container">
                    <img src="media/photo.jpeg" class="intro-photo">
                    <div class="intro-text">
                        <h1>Mallorca Cycling</h1>
                        <p>Discover the best mountain passes in Mallorca.</p>
                    </div>
                </div>
            </section>
            <section class="container">
                <h2 class="section-title">Featured Segments</h2>
                <div class="segment-container">${destacats}</div>
            </section>
            <section class="container">
                <div class="strava-connect-card" id="strava-card-container">
                    </div>
            </section>`;
    }
},
    "/map": {
        title: "Map | Mallorca Cycling",
        render: async () => `
            <section class="map-section fade-in">
                <div id="map" class="full-map"></div>
            </section>`
    },
    "/segments": {
        title: "Segments | Mallorca Cycling",
        render: async () => {
            const puertos = await getPuertos();
            const tots = puertos.map(createCardHTML).join('');
            return `<div class="container"><div class="segment-container">${tots}</div></div>`;
        }
    }
};

const router = async () => {
    const path = window.location.pathname;
    const route = routes[path] || routes["/"];
    document.getElementById("app-viewport").innerHTML = await route.render() + `
        <div id="puerto-modal" class="modal" style="display:none;">
            <div class="modal-content">
                <span class="close-modal" onclick="closeModal()">&times;</span>
                <div id="modal-body"></div>
            </div>
        </div>`;

    actualitzarInterficieUsuari();
    document.title = route.title;

    if (path === "/map") {
        initGoogleMap();
        const p = await getPuertos();
        pintarPorts(p);
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    await checkStravaCallback();
    if (!isStravaSessionValid()) logoutStrava();
    
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            window.history.pushState(null, null, e.target.href);
            router();
        }
    });
    window.addEventListener("popstate", router);
    router();
});

window.getSegmentDetails = getSegmentDetails;