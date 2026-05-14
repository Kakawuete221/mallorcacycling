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
                <div class="relative group user-dropdown-container">
                    <div data-action="toggle-user-dropdown" class="flex items-center gap-2.5 cursor-pointer">
                        <span class="font-bold text-secondary">${user.firstname}</span>
                        <img src="${user.profile_medium}" class="w-[38px] h-[38px] rounded-full border-2 border-primary object-cover">
                    </div>
                    <div id="user-dropdown" class="hidden absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-md z-[2000] border border-gray-100 overflow-hidden group-focus-within:block">
                        <button data-action="logout-strava" class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">Log out</button>
                    </div>
                </div>`;
        }
        
        if (connectCard) {
            connectCard.innerHTML = `
                <div class="flex flex-col items-center justify-center p-5">
                    <img src="${user.profile_medium}" class="w-[70px] h-[70px] rounded-full border-[3px] border-primary mb-4 object-cover shadow-sm">
                    <h2 class="text-2xl font-bold font-title text-secondary mb-2">Hello, ${user.firstname}!</h2>
                    <p class="text-gray-600 mb-6">You are already connected to Strava.</p>
                    <button class="bg-primary hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 duration-200" data-link href="/map">GO TO MAP</button>
                </div>`;
        }
    } else {
        if (navArea) {
            navArea.innerHTML = `<button data-action="login-strava" class="bg-primary hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-transform hover:scale-105 duration-200 text-sm">LOGIN</button>`;
        }
        if (connectCard) {
            connectCard.innerHTML = `
                <h2 class="text-2xl font-bold font-title text-secondary mb-4">Connect with Strava</h2>
                <p class="text-gray-600 mb-6">Connect to view your real-time times and PRs on segments.</p>
                <button class="bg-primary hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 duration-200" data-action="login-strava">CONNECT ACCOUNT</button>`;
        }
    }
}

export const createCardHTML = (puerto) => {
    const nom = puerto.nom || puerto.nombre;
    const dist = puerto.distancia || puerto.distancia_km;
    const desn = puerto.desnivell || puerto.elevacion_m;
    const portDataStr = JSON.stringify(puerto).replace(/'/g, "&apos;").replace(/"/g, "&quot;");

    return `
    <div class="bg-white rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.08)] hover:-translate-y-[5px] transition-transform duration-300 overflow-hidden flex flex-col h-full">
        <div class="w-full h-[200px]">
            <img src="media/${nom}.jpg" onerror="this.onerror=null; this.src='media/photo.jpeg';" class="w-full h-full object-cover">
        </div>
        <div class="p-5 flex-1 flex flex-col">
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