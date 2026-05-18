// modal.js - Gestió de Modal
import { formatTime } from './utils.js';
import { dibuixarMiniMapa, actualitzarMunicipiReal, dibuixarPerfilElevacio, cercarLlocsPropers } from './map.js';

export const showModal = (puerto) => {
    const modal = document.getElementById('puerto-modal');
    const modalBody = document.getElementById('modal-body');
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
        <div class="flex flex-col w-full p-0 flex-1">
            <!-- Hero Header -->
            <div class="relative h-[220px] md:h-[280px] shrink-0 overflow-hidden flex items-end p-5 md:p-8 text-white md:rounded-t-3xl">
                <img src="media/${puerto.nom}.jpg" class="absolute inset-0 w-full h-full object-cover z-0" onerror="this.src='media/photo.jpeg'">
                <div class="absolute inset-0 bg-gradient-to-t from-[#11131f] via-[#11131f]/40 to-transparent z-0"></div>
                <div class="relative z-10 w-full">
                    <h2 class="text-3xl md:text-5xl font-title font-bold drop-shadow-lg m-0 leading-tight">${puerto.nom}</h2>
                    <div class="flex items-center gap-2 mt-3 opacity-90">
                        <svg class="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <p id="modal-municipi" class="text-sm md:text-base m-0 font-medium tracking-wide">Finding location...</p>
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-8 p-5 md:p-8 w-full">
                <!-- Unified Horizontal Key Stats Card -->
                <div class="bg-gray-50/50 rounded-3xl p-6 border border-gray-100/80 shadow-sm grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 divide-y md:divide-y-0 lg:divide-x divide-gray-200/50">
                    <div class="flex flex-col items-center justify-center text-center px-2">
                        <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Distance</span>
                        <span class="text-xl font-title font-bold text-gray-800">${puerto.distancia} km</span>
                    </div>
                    <div class="flex flex-col items-center justify-center text-center px-2 pt-4 md:pt-0">
                        <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Avg Grad</span>
                        <span class="text-xl font-title font-bold text-gray-800">${puerto.pendent_mitja}%</span>
                    </div>
                    <div class="flex flex-col items-center justify-center text-center px-2 pt-4 md:pt-0">
                        <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Max Grad</span>
                        <span class="text-xl font-title font-bold text-gray-800">${puerto.pendent_max}%</span>
                    </div>
                    <div class="flex flex-col items-center justify-center text-center px-2 pt-4 lg:pt-0">
                        <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Elevation</span>
                        <span class="text-xl font-title font-bold text-gray-800">${puerto.desnivell} m</span>
                    </div>
                    <div class="flex flex-col items-center justify-center text-center px-2 pt-4 lg:pt-0">
                        <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Max Elev</span>
                        <span class="text-xl font-title font-bold text-gray-800">${puerto.altitud_max} m</span>
                    </div>
                    <div class="flex flex-col items-center justify-center text-center px-2 pt-4 lg:pt-0">
                        <span class="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Category</span>
                        <span class="text-xl font-title font-bold text-primary">${puerto.categoria}</span>
                    </div>
                </div>

                <!-- Map & Elevation -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div class="flex flex-col gap-2.5">
                        <div class="flex items-center gap-2 px-1">
                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                            <span class="text-xs text-gray-400 font-semibold uppercase tracking-wider">Segment Route</span>
                        </div>
                        <div id="modal-mini-map" class="h-[280px] md:h-[320px] rounded-3xl border border-gray-100 shadow-sm w-full overflow-hidden"></div>
                    </div>
                    <div class="flex flex-col gap-2.5">
                        <div class="flex items-center gap-2 px-1">
                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                            <span class="text-xs text-gray-400 font-semibold uppercase tracking-wider">Elevation Profile</span>
                            <span class="ml-auto text-xs text-gray-300 font-medium bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100 cursor-default">Hover to explore</span>
                        </div>
                        <div class="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm w-full flex flex-col h-[280px] md:h-[320px]">
                            <div class="flex-1 w-full relative">
                                <canvas id="elevation-chart" class="w-full h-full"></canvas>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Strava Performance Section -->
                <div class="bg-[#11131f] text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden gap-8 border border-gray-800/40">
                    <!-- Radial brand decoration gradient matching Home page -->
                    <div class="absolute inset-0 opacity-20 pointer-events-none" style="background: radial-gradient(circle at 100% 50%, #fc4c02 0%, transparent 60%);"></div>
                    
                    <!-- Left Column -->
                    <div class="relative z-10 flex-1 w-full text-left">
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
                                <svg class="w-6 h-6 text-[#fc4c02]" fill="currentColor" viewBox="0 0 24 24"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"></path></svg>
                            </div>
                            <div>
                                <h3 class="font-title font-bold text-white text-xl m-0 leading-tight">Strava Live Segment</h3>
                                <p class="text-xs text-gray-400 m-0 mt-0.5 font-medium tracking-wide">Leaderboard stats & personal records</p>
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Performance Index (vs KOM)</span>
                                <span id="comparison-text" class="text-xs font-bold text-[#fc4c02]">Calculating...</span>
                            </div>
                            <div class="bg-gray-800 h-2.5 rounded-full overflow-hidden p-[2px] border border-gray-800">
                                <div id="pr-progress-bar" class="bg-gradient-to-r from-[#fc4c02] to-orange-400 h-full rounded-full w-0 transition-all duration-[1500ms] ease-out">
                                </div>
                            </div>
                            <div class="flex justify-between items-center mt-2 text-[10px] text-gray-500 font-bold">
                                <span>🥇 KOM PACE</span>
                                <span>YOUR PR PACE</span>
                            </div>
                        </div>
                        <p class="text-xs text-gray-400 leading-relaxed m-0 border-l-2 border-[#fc4c02]/40 pl-3">
                            Compare your personal record directly against the segment leaders. Connect your Strava account to sync your efforts automatically.
                        </p>
                    </div>
                    
                    <!-- Right Column: Stats Card matching exact home card look -->
                    <div class="relative z-10 w-full md:w-auto flex-shrink-0">
                        <div class="bg-[#1a1c29] border border-gray-800 rounded-2xl p-6 w-full md:w-80 shadow-lg text-left">
                            <h4 class="text-white font-bold mb-4 flex items-center gap-2 text-xs tracking-wider">
                                <svg class="w-4 h-4 text-[#fc4c02]" fill="currentColor" viewBox="0 0 24 24"><path d="M4 10h3v10H4zM10 4h3v16h-3zM16 14h3v6h-3z"></path></svg>
                                SEGMENT LEADERBOARD
                            </h4>
                            <div class="grid grid-cols-1 gap-y-3.5">
                                <div class="flex justify-between items-center py-1.5 border-b border-gray-800/60">
                                    <span class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">🥇 KOM</span>
                                    <strong id="modal-kom-real" class="font-title text-white text-base">--:--</strong>
                                </div>
                                <div class="flex justify-between items-center py-1.5 border-b border-gray-800/60">
                                    <span class="text-[10px] text-gray-500 font-bold uppercase tracking-wider">👑 QOM</span>
                                    <strong id="modal-qom-real" class="font-title text-white text-base">--:--</strong>
                                </div>
                                <div class="flex justify-between items-center py-1.5">
                                    <span class="text-[10px] text-[#fc4c02] font-bold uppercase tracking-wider">🏅 Your PR</span>
                                    <strong id="modal-pr-real" class="font-title text-[#fc4c02] text-base">--:--</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Nearby Places Section with clean line separator -->
                <div class="w-full border-t border-gray-100/80 pt-8">
                    <!-- Section Header -->
                    <div class="flex items-start gap-4 mb-6">
                        <div class="w-10 h-10 rounded-2xl bg-[#fc4c02]/10 flex items-center justify-center shrink-0">
                            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <div>
                            <h4 class="font-title font-bold text-gray-900 text-xl m-0 leading-tight">Nearby Places</h4>
                            <p class="text-xs text-gray-400 m-0 mt-1">Cafes, restaurants and bike stores within 3 km of the summit — perfect for a well-deserved break after the climb.</p>
                        </div>
                    </div>
                    <div id="nearby-places-container" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div class="col-span-full flex items-center justify-center py-10 text-sm text-gray-400 gap-2">
                            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            Loading nearby places...
                        </div>
                    </div>
                    <!-- Directions & Access Section (Ultra-Clean Premium Modern Flow) -->
                    <div class="w-full border-t border-gray-100/80 pt-8 mt-8">
                        <!-- Section Header matching Nearby Places -->
                        <div class="flex items-start gap-4 mb-6">
                            <div class="w-10 h-10 rounded-2xl bg-[#fc4c02]/10 flex items-center justify-center shrink-0 border border-[#fc4c02]/20">
                                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                            </div>
                            <div class="flex-1 text-left">
                                <h4 class="font-title font-bold text-gray-900 text-xl m-0 leading-tight">Access & Directions</h4>
                                <p class="text-xs text-gray-400 m-0 mt-1">Ready to ride? Get precise coordinates for the base of the climb or launch optimized routing directly in Google Maps.</p>
                            </div>
                        </div>

                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 text-left mt-6">
                            
                            <!-- Left side: GPS label and coordinates capsule -->
                            <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                <div class="flex items-center gap-2">
                                    <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                    <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Start Coordinates</span>
                                </div>
                                
                                <div class="flex items-center gap-2.5 w-full sm:w-auto">
                                    <!-- Coordinate capsule - expands on mobile, content centered -->
                                    <div class="flex-1 sm:flex-none text-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-gray-600 shadow-sm select-all">
                                        ${puerto.lat}° N &nbsp;&middot;&nbsp; ${puerto.lng}° E
                                    </div>
                                    
                                    <!-- Minimal copy action -->
                                    <button onclick="navigator.clipboard.writeText('${puerto.lat}, ${puerto.lng}').then(() => { const b=this; const prev=b.innerHTML; b.innerHTML='✓'; b.classList.add('!text-emerald-500','!bg-emerald-50','!border-emerald-200'); setTimeout(()=>{b.innerHTML=prev; b.classList.remove('!text-emerald-500','!bg-emerald-50','!border-emerald-200')},2000); })" class="bg-white hover:bg-gray-50 border border-gray-200 text-gray-400 hover:text-gray-600 w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-sm shrink-0 active:scale-95" title="Copy GPS Coordinates">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Right side: Premium button, full width on mobile, auto on sm -->
                            <div class="w-full sm:w-auto">
                                <a href="https://www.google.com/maps/dir/?api=1&destination=${puerto.lat},${puerto.lng}&travelmode=bicycling" target="_blank" rel="noopener noreferrer" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-orange-600 text-white font-bold h-11 sm:h-10 px-5 rounded-xl text-xs tracking-wider uppercase transition-all shadow-sm hover:shadow-[0_4px_12px_rgba(252,76,2,0.25)] no-underline select-none">
                                    Get Directions
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    // Trigger smooth fade-in and scale-in animations
    const container = document.getElementById('modal-container');
    modal.classList.remove('pointer-events-none', 'bg-black/0', 'backdrop-blur-none');
    modal.classList.add('pointer-events-auto', 'bg-black/60', 'backdrop-blur-sm');
    if (container) {
        container.classList.remove('scale-95', 'opacity-0');
        container.classList.add('scale-100', 'opacity-100');
    }

    dibuixarMiniMapa(puerto); 
    actualitzarMunicipiReal(puerto.lat, puerto.lng); 
    dibuixarPerfilElevacio(puerto.polyline); 
    
    _omplirDadesStravaModal(puerto);
    _fetchAndRenderNearbyPlaces(puerto.lat, puerto.lng);
};

const _fetchAndRenderNearbyPlaces = (lat, lng) => {
    const container = document.getElementById('nearby-places-container');
    if (!container) return;

    cercarLlocsPropers(lat, lng, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
            container.innerHTML = '';
            const sorted = results.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);

            sorted.forEach(place => {
                const isCafe = place.types.includes('cafe') || place.types.includes('bakery');
                const isBike = place.types.includes('bicycle_store');
                const isHotel = place.types.includes('lodging') || place.types.includes('hotel');

                let typeName, typeBg, typeColor, typeIcon, typeAccent;
                if (isBike) {
                    typeName = 'Bike Store'; typeBg = 'bg-blue-50'; typeColor = 'text-blue-600'; typeAccent = 'bg-blue-500';
                    typeIcon = '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16a4 4 0 11-8 0 4 4 0 018 0zM9 16V9m4 7V7m-4 2h4M5 7l2 2m10-2l-2 2"/></svg>';
                } else if (isCafe) {
                    typeName = 'Cafe'; typeBg = 'bg-amber-50'; typeColor = 'text-amber-700'; typeAccent = 'bg-amber-500';
                    typeIcon = '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/></svg>';
                } else if (isHotel) {
                    typeName = 'Hotel / Lodging'; typeBg = 'bg-purple-50'; typeColor = 'text-purple-700'; typeAccent = 'bg-purple-500';
                    typeIcon = '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>';
                } else {
                    typeName = 'Restaurant'; typeBg = 'bg-emerald-50'; typeColor = 'text-emerald-700'; typeAccent = 'bg-emerald-500';
                    typeIcon = '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>';
                }

                const starsHtml = place.rating ? (() => {
                    const full = Math.floor(place.rating);
                    let s = '';
                    for (let i = 0; i < 5; i++) {
                        s += i < full
                            ? '<svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>'
                            : '<svg class="w-3 h-3 text-gray-500/80" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
                    }
                    return s;
                })() : '';

                const ratingHtml = place.rating
                    ? `<div class="flex items-center gap-1.5">
                        <div class="flex items-center gap-0.5">${starsHtml}</div>
                        <span class="text-xs font-bold text-white">${place.rating.toFixed(1)}</span>
                        ${place.user_ratings_total ? `<span class="text-[10px] text-gray-400">(${place.user_ratings_total})</span>` : ''}
                       </div>`
                    : '<span class="text-xs text-gray-400 italic">No reviews yet</span>';

                let openStatus = '';
                if (place.opening_hours) {
                    const isOpen = place.opening_hours.open_now !== undefined
                        ? place.opening_hours.open_now
                        : (typeof place.opening_hours.isOpen === 'function' ? place.opening_hours.isOpen() : false);
                    openStatus = isOpen
                        ? '<span class="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-emerald-400 bg-emerald-950/80 border border-emerald-500/20 backdrop-blur-sm shadow-sm z-10">Open</span>'
                        : '<span class="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full text-red-400 bg-red-950/80 border border-red-500/20 backdrop-blur-sm shadow-sm z-10">Closed</span>';
                }

                let photoHtml = '';
                if (place.photos && place.photos.length > 0) {
                    const photoUrl = place.photos[0].getUrl({ maxWidth: 400, maxHeight: 300 });
                    photoHtml = `<img src="${photoUrl}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="${place.name}" referrerpolicy="no-referrer">`;
                } else {
                    let gradientClass = 'from-[#2f353b] to-[#11131f]';
                    if (isCafe) gradientClass = 'from-[#3c3024] to-[#11131f]';
                    else if (isBike) gradientClass = 'from-[#1e2d42] to-[#11131f]';
                    photoHtml = `
                        <div class="absolute inset-0 w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center overflow-hidden">
                            <div class="text-white/5 transform scale-[3.5] rotate-12 transition-transform duration-700 group-hover:scale-[4.0] group-hover:rotate-6">
                                ${typeIcon}
                            </div>
                        </div>
                    `;
                }

                const placeLat = place.geometry?.location?.lat();
                const placeLng = place.geometry?.location?.lng();
                const mapsUrl = placeLat && placeLng
                    ? `https://www.google.com/maps/dir/?api=1&destination=${placeLat},${placeLng}&destination_place_id=${place.place_id}&travelmode=driving`
                    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.name)}&travelmode=driving`;

                container.insertAdjacentHTML('beforeend', `
                    <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" 
                       class="group relative rounded-3xl overflow-hidden shadow-lg aspect-[4/3] w-full cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 block no-underline border border-transparent hover:border-gray-800/10">
                        
                        <!-- Full Cover Background (Image or Themed Gradient) -->
                        ${photoHtml}
                        
                        <!-- Dark Immersive Gradient Overlay -->
                        <div class="absolute inset-0 bg-gradient-to-t from-[#11131f] via-[#11131f]/40 to-transparent opacity-95"></div>
                        
                        <!-- Category Floating Badge (Top Left) -->
                        <span class="absolute top-4 left-4 inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/60 text-white border border-white/10 backdrop-blur-sm shadow-sm z-10">
                            <span class="${typeColor}">${typeIcon}</span> ${typeName}
                        </span>
                        
                        <!-- Status Floating Badge (Top Right) -->
                        ${openStatus}
                        
                        <!-- Bottom Immersive Content Area -->
                        <div class="absolute bottom-0 left-0 p-5 text-white w-full z-10">
                            <h5 class="text-base font-title font-bold mb-1.5 leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2 pr-2" title="${place.name}">
                                ${place.name}
                            </h5>
                            <div class="flex items-center justify-between text-xs text-gray-300 font-medium mt-2">
                                ${ratingHtml}
                                <span class="flex items-center gap-1 text-[11px] font-bold text-primary group-hover:translate-x-1.5 transition-transform duration-300">
                                    Directions <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                </span>
                            </div>
                        </div>
                    </a>
                `);
            });
        } else {
            container.innerHTML = '<div class="col-span-full py-8 text-center text-sm text-gray-400">No places found nearby.</div>';
        }
    });
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
            text.innerHTML = prSec > komSec ? `You are ${formatTime(prSec - komSec)} away from the KOM` : `<span class="flex items-center gap-1.5"><svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"></path></svg> You have the KOM!</span>`;
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
    if (!modal) return;
    const container = document.getElementById('modal-container');
    if (container) {
        container.classList.remove('scale-100', 'opacity-100');
        container.classList.add('scale-95', 'opacity-0');
    }
    modal.classList.remove('pointer-events-auto', 'bg-black/60', 'backdrop-blur-sm');
    modal.classList.add('pointer-events-none', 'bg-black/0', 'backdrop-blur-none');
};