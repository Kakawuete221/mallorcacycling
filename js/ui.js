// ui.js - Interfície d'Usuari i Targetes
import { isStravaSessionValid } from './stravaApi.js';
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
                <div class="user-dropdown-container">
                    <div data-action="toggle-user-dropdown" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                        <span style="font-weight: 700; color: var(--secondary-color);">${user.firstname}</span>
                        <img src="${user.profile_medium}" style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid var(--primary-color);">
                    </div>
                    <div id="user-dropdown" style="display: none; position: absolute; background: white; box-shadow: 0 5px 15px rgba(0,0,0,0.1); z-index: 2000;">
                        <button data-action="logout-strava" style="padding: 10px; border: none; background: none; cursor: pointer; width: 100%; text-align: left;">Log out</button>
                    </div>
                </div>`;
        }
        
        if (connectCard) {
            connectCard.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <img src="${user.profile_medium}" style="width: 70px; border-radius: 50%; border: 3px solid var(--primary-color);">
                    <h2>Hello, ${user.firstname}!</h2>
                    <p>You are already connected to Strava.</p>
                    <button class="strava-connect-btn" data-link href="/map">GO TO MAP</button>
                </div>`;
        }
    } else {
        if (navArea) {
            navArea.innerHTML = `<button data-action="login-strava" class="strava-connect-btn">LOGIN</button>`;
        }
        if (connectCard) {
            connectCard.innerHTML = `
                <h2>Connect with Strava</h2>
                <p>Connect to view your real-time times and PRs on segments.</p>
                <button class="strava-connect-btn" data-action="login-strava">CONNECT ACCOUNT</button>`;
        }
    }
}

export const createCardHTML = (puerto) => {
    const nom = puerto.nom || puerto.nombre;
    const dist = puerto.distancia || puerto.distancia_km;
    const desn = puerto.desnivell || puerto.elevacion_m;
    const portDataStr = JSON.stringify(puerto).replace(/'/g, "&apos;").replace(/"/g, "&quot;");

    return `
    <div class="segment">
        <div class="card-img-wrapper">
            <img src="media/${nom}.jpg" onerror="this.onerror=null; this.src='media/photo.jpeg';">
        </div>
        <div class="segment-content">
            <h3>${nom}</h3>
            <p>Distance: ${dist} km | Elevation: ${desn} m</p>
            <button class="view-details-btn" data-action="view-details" data-port="${portDataStr}">View Details</button>
        </div>
    </div>`;
};

export const createMiniCardHTML = (port, dadesStrava = null) => {
    if (!port || !port.id) return `<div style="padding:10px;">Error data</div>`;

    let infoStrava = `<div style="border-top: 1px solid #eee; padding-top: 8px; margin-top: 8px; font-size: 11px; color: #888; font-style: italic;">Loading Strava data...</div>`;

    if (dadesStrava) {
        infoStrava = `
            <div style="border-top: 1px solid #eee; padding-top: 8px; margin-top: 8px; font-size: 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>👑 <strong>KOM:</strong> ${dadesStrava.xoms?.kom || '--:--'}</span>
                    <span>👑 <strong>QOM:</strong> ${dadesStrava.xoms?.qom || '--:--'}</span>
                </div>
                <div style="color: #fc4c02; font-weight: bold;">🏅 PR: ${formatTime(dadesStrava.athlete_segment_stats?.pr_elapsed_time)}</div>
            </div>`;
    } else {
        const cached = JSON.parse(localStorage.getItem(`segment_${port.id}`));
        if (cached && cached.data) {
            infoStrava = `
                <div style="border-top: 1px solid #eee; padding-top: 8px; margin-top: 8px; font-size: 12px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span>👑 <strong>KOM:</strong> ${cached.data.xoms?.kom || '--:--'}</span>
                        <span>👑 <strong>QOM:</strong> ${cached.data.xoms?.qom || '--:--'}</span>
                    </div>
                    <div style="color: #fc4c02; font-weight: bold;">🏅 PR: ${formatTime(cached.data.athlete_segment_stats?.pr_elapsed_time)}</div>
                </div>`;
        }
    }

    const portDataStr = JSON.stringify(port).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
    return `
        <div style="font-family: 'Inter', sans-serif; padding: 5px; min-width: 240px;">
            <h3 style="margin: 0; font-size: 15px;">${port.nom}</h3>
            <div style="font-size: 12px; color: #666; margin-bottom: 8px;">🚲 ${port.distancia}km · ${port.pendent_mitja}% · ${port.desnivell}m</div>
            ${infoStrava}
            <button data-action="view-details" data-port="${portDataStr}" style="width: 100%; background: #fc4c02; color: white; border: none; padding: 8px; border-radius: 4px; font-weight: bold; cursor: pointer; margin-top: 10px;">View Details</button>
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
    } else {
        btn.classList.remove('text-gray-700', 'border-gray-300', 'bg-white');
        btn.classList.add('text-primary', 'border-primary', 'bg-orange-50');
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
        
        const btnComp = document.getElementById('btn-completats');
        if (btnComp) {
            btnComp.classList.remove('text-primary', 'border-primary', 'bg-orange-50');
            btnComp.classList.add('text-gray-700', 'border-gray-300', 'bg-white');
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
    }
};