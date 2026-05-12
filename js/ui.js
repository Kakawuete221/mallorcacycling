// ui.js - Interfície d'Usuari i Targetes
import { isStravaSessionValid } from './stravaApi.js';

export function actualitzarInterficieUsuari() {
    const userStr = localStorage.getItem('strava_athlete');
    const isLoggedIn = isStravaSessionValid();
    const navArea = document.getElementById('user-nav-area');
    
    // Busquem el contenidor de la targeta (el que hem posat a la home)
    const connectCard = document.getElementById('strava-card-container');

    // 1. Gestió del NavArea (la part de dalt)
    if (isLoggedIn && userStr) {
        const user = JSON.parse(userStr);
        if (navArea) {
            navArea.innerHTML = `
                <div class="user-dropdown-container">
                    <div onclick="window.toggleDropdown(event)" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                        <span style="font-weight: 700; color: var(--secondary-color);">${user.firstname}</span>
                        <img src="${user.profile_medium}" style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid var(--primary-color);">
                    </div>
                    <div id="user-dropdown" style="display: none; position: absolute; background: white; box-shadow: 0 5px 15px rgba(0,0,0,0.1); z-index: 2000;">
                        <button onclick="window.ferLogout()" style="padding: 10px; border: none; background: none; cursor: pointer; width: 100%; text-align: left;">🚪 Tancar sessió</button>
                    </div>
                </div>`;
        }
        
        // Si estem loguejats i som a la Home, mostrem benvinguda
        if (connectCard) {
            connectCard.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <img src="${user.profile_medium}" style="width: 70px; border-radius: 50%; border: 3px solid var(--primary-color);">
                    <h2>Hola, ${user.firstname}!</h2>
                    <p>Ja estàs connectat amb Strava.</p>
                    <button class="strava-connect-btn" onclick="window.location.href='/map'">ANAR AL MAPA</button>
                </div>`;
        }
    } else {
        // 2. Estat no loguejat
        if (navArea) {
            navArea.innerHTML = `<button onclick="window.loginAmbStrava()" class="strava-connect-btn">LOGIN</button>`;
        }
        if (connectCard) {
            connectCard.innerHTML = `
                <h2>Conecta con Strava</h2>
                <p>Connecta per veure els teus temps reals i PRs als segments.</p>
                <button class="strava-connect-btn" onclick="window.loginAmbStrava()">CONNECT ACCOUNT</button>`;
        }
    }
}

export const createCardHTML = (puerto) => {
    const nom = puerto.nom || puerto.nombre;
    const dist = puerto.distancia || puerto.distancia_km;
    const desn = puerto.desnivell || puerto.elevacion_m;

    return `
    <div class="segment">
        <div class="card-img-wrapper">
            <img src="media/${nom}.jpg" onerror="this.onerror=null; this.src='media/photo.jpeg';">
        </div>
        <div class="segment-content">
            <h3>${nom}</h3>
            <p>Distància: ${dist} km | Desnivell: ${desn} m</p>
            <button class="view-details-btn" onclick='window.handleVerSegmento(${JSON.stringify(puerto).replace(/'/g, "&apos;")})'>Veure més</button>
        </div>
    </div>`;
};