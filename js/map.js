// map.js - Module for handling Google Maps services
import { createMiniCardHTML } from './ui.js';

// CONSTANTS DE VISTA DEL MAPA
const CENTRE_MALLORCA = { lat: 39.62, lng: 2.98 };
const ZOOM_INICIAL = 10;

let map;
let directionsService;
let directionsRenderer;
let llistatPolylines = [];
let activeInfoWindow = null;
let hoverMarker = null;
let orangePolyline = null;
let whiteBorderPolyline = null;
let fullSegmentPath = [];
let userMarker = null;
let userPos = null;
let accuracyCircle = null;
let pulseCircle = null;
let intervalAura = null;
let mapaActual = null;
let searchMarker = null;

const MAPA_ID_COMARCA = {
    "7508462": "Tramuntana", "37982329": "Tramuntana", "653262": "Tramuntana",
    "30076170": "Tramuntana", "5983041": "Tramuntana", "8107312": "Tramuntana",
    "3288023": "Tramuntana", "5983061": "Tramuntana", "7918654": "Tramuntana",
    "6405887": "Tramuntana", "5989568": "Tramuntana", "3311546": "Tramuntana",
    "2315553": "Tramuntana", "11322769": "Tramuntana", "1842941": "Tramuntana",
    "3393236": "Tramuntana", "7853025": "Tramuntana", "1066484": "Tramuntana",
    "14410093": "Tramuntana", "652948": "Tramuntana", "7609366": "Tramuntana",
    "10182316": "Tramuntana", "686221": "Raiguer", "1940327": "Raiguer",
    "28854196": "Raiguer", "3311229": "Palma", "8091426": "Palma",
    "11203874": "Palma", "15940014": "Pla", "9078485": "Llevant",
    "3894379": "Llevant", "2690583": "Migjorn", "8167746": "Migjorn",
    "1098418": "Migjorn"
};

export const assignarComarcaAdministrativa = (port) => {
    if (MAPA_ID_COMARCA[port.id]) {
        port.comarca = MAPA_ID_COMARCA[port.id];
        return port;
    }
    const zones = {
        "Tramuntana": ["Sóller", "Valldemossa", "Deià", "Escorca", "Pollença", "Andratx", "Estellencs"],
        "Raiguer": ["Inca", "Alaró", "Bunyola", "Selva", "Campanet"],
        "Pla": ["Randa", "Petra", "Sineu", "Algaida"],
        "Llevant": ["Salvador", "Santueri", "Artà", "Manacor"],
        "Migjorn": ["Llucmajor", "Gràcia", "Montision", "Porreres"],
        "Palma": ["Palma", "Calvià"]
    };
    for (const [comarca, paraulesClau] of Object.entries(zones)) {
        if (paraulesClau.some(p => port.nom.includes(p))) {
            port.comarca = comarca;
            return port;
        }
    }
    port.comarca = "Mallorca";
    return port;
};

export function initGoogleMap() {
    const MALLORCA_BOUNDS = { north: 40.3, south: 39.1, west: 2.2, east: 3.6 };

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: ZOOM_INICIAL,
        center: CENTRE_MALLORCA,
        mapTypeId: 'terrain',
        minZoom: 9,
        maxZoom: 18,
        restriction: { latLngBounds: MALLORCA_BOUNDS, strictBounds: false },
        clickableIcons: false,
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: true,
        scaleControl: true,
        rotateControl: false,
        gestureHandling: 'greedy',
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: google.maps.ControlPosition.TOP_RIGHT
        }
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    map.addListener("click", () => {
        if (activeInfoWindow) {
            activeInfoWindow.close();
            activeInfoWindow = null;
        }
    });

    localitzarUsuari(map);
}

export function pintarPorts(ports, onSegmentClickCallback) {
    llistatPolylines.forEach(element => {
        if (element.setMap) element.setMap(null);
    });
    llistatPolylines = [];

    ports.forEach(port => {
        if (!port.polyline) return;

        const path = google.maps.geometry.encoding.decodePath(port.polyline);

        const borderPolyline = new google.maps.Polyline({
            path: path, geodesic: true, strokeColor: '#FFFFFF', strokeOpacity: 0.9, strokeWeight: 6, zIndex: 1, map: map
        });

        const mainPolyline = new google.maps.Polyline({
            path: path, geodesic: true, strokeColor: '#fc4c02', strokeOpacity: 0.7, strokeWeight: 3, zIndex: 2, map: map
        });

        const startMarker = new google.maps.Marker({
            position: path[0],
            map: map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE, scale: 4, fillColor: '#fc4c02', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 2
            },
            zIndex: 3
        });

        const ferHover = () => {
            mainPolyline.setOptions({ strokeOpacity: 1.0, strokeColor: '#d94302', zIndex: 10 });
            map.setOptions({ draggableCursor: 'pointer' });
        };

        const treureHover = () => {
            mainPolyline.setOptions({ strokeOpacity: 0.7, strokeColor: '#fc4c02', zIndex: 2 });
            map.setOptions({ draggableCursor: '' });
        };

        const clicarLinia = (event) => {
            if (activeInfoWindow) activeInfoWindow.close();

            activeInfoWindow = new google.maps.InfoWindow({
                content: createMiniCardHTML(port),
                position: event.latLng
            });
            activeInfoWindow.open(map);

            if (onSegmentClickCallback) {
                onSegmentClickCallback(port, activeInfoWindow, event.latLng);
            }
        };

        google.maps.event.addListener(mainPolyline, 'mouseover', ferHover);
        google.maps.event.addListener(mainPolyline, 'mouseout', treureHover);
        google.maps.event.addListener(mainPolyline, 'click', clicarLinia);

        google.maps.event.addListener(borderPolyline, 'mouseover', ferHover);
        google.maps.event.addListener(borderPolyline, 'mouseout', treureHover);
        google.maps.event.addListener(borderPolyline, 'click', clicarLinia);

        google.maps.event.addListener(startMarker, 'mouseover', ferHover);
        google.maps.event.addListener(startMarker, 'mouseout', treureHover);
        google.maps.event.addListener(startMarker, 'click', (e) => clicarLinia(e));

        llistatPolylines.push(borderPolyline, mainPolyline, startMarker);
    });
}

export const dibuixarMiniMapa = (puerto) => {
    const miniMapElement = document.getElementById('modal-mini-map');
    if (!miniMapElement) return;

    const miniMap = new google.maps.Map(miniMapElement, {
        zoom: 14,
        center: { lat: puerto.lat, lng: puerto.lng },
        mapTypeId: 'terrain',
        disableDefaultUI: true,
        gestureHandling: 'none'
    });

    fullSegmentPath = google.maps.geometry.encoding.decodePath(puerto.polyline);

    new google.maps.Polyline({
        path: fullSegmentPath, strokeColor: '#BDC3C7', strokeOpacity: 0.7, strokeWeight: 5, map: miniMap, zIndex: 1
    });

    whiteBorderPolyline = new google.maps.Polyline({
        path: fullSegmentPath, strokeColor: '#FFFFFF', strokeOpacity: 1.0, strokeWeight: 8, map: miniMap, zIndex: 5
    });

    orangePolyline = new google.maps.Polyline({
        path: fullSegmentPath, strokeColor: '#fc4c02', strokeOpacity: 1.0, strokeWeight: 4, map: miniMap, zIndex: 10
    });

    new google.maps.Marker({
        position: fullSegmentPath[0],
        map: miniMap,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 5, fillColor: "#fc4c02", fillOpacity: 1, strokeColor: "white", strokeWeight: 2 },
        zIndex: 20
    });

    hoverMarker = new google.maps.Marker({
        position: fullSegmentPath[0],
        map: miniMap,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: "#3498DB", fillOpacity: 1, strokeColor: "white", strokeWeight: 2 },
        visible: false,
        zIndex: 100
    });

    const bounds = new google.maps.LatLngBounds();
    fullSegmentPath.forEach(p => bounds.extend(p));
    miniMap.fitBounds(bounds);

    google.maps.event.addListenerOnce(miniMap, 'idle', () => {
        if (miniMap.getZoom() > 15) miniMap.setZoom(15);
    });
};

export const actualitzarMunicipiReal = (lat, lng) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        const muniEl = document.getElementById('modal-municipi');
        if (status === "OK" && results[0]) {
            const poble = results[0].address_components.find(c =>
                c.types.includes("locality") || c.types.includes("administrative_area_level_4")
            );
            if (poble && muniEl) muniEl.innerText = poble.long_name;
        }
    });
};

export const calcularRutaPort = (destLat, destLng) => {
    if (!navigator.geolocation) return alert("Geolocation is not supported by this browser.");

    navigator.geolocation.getCurrentPosition(pos => {
        const request = {
            origin: { lat: pos.coords.latitude, lng: pos.coords.longitude },
            destination: { lat: destLat, lng: destLng },
            travelMode: google.maps.TravelMode.BICYCLING
        };

        directionsService.route(request, (result, status) => {
            if (status === 'OK') {
                import('./modal.js').then(m => m.closeModal());
                directionsRenderer.setDirections(result);
            }
        });
    });
};

export const cercarServeisProp = (lat, lng) => {
    const service = new google.maps.places.PlacesService(map);
    const request = {
        location: new google.maps.LatLng(lat, lng),
        radius: '2000',
        type: ['cafe', 'bicycle_store', 'restaurant']
    };

    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            alert("We found " + results.length + " nearby cyclist-friendly places on the map!");
            import('./modal.js').then(m => m.closeModal());
        }
    });
};

export const dibuixarPerfilElevacio = (polyline) => {
    const elevationService = new google.maps.ElevationService();
    const path = google.maps.geometry.encoding.decodePath(polyline);

    elevationService.getElevationAlongPath({ path, samples: 100 }, (results, status) => {
        if (status === "OK") {
            const ctx = document.getElementById('elevation-chart').getContext('2d');
            if (window.currentChart) window.currentChart.destroy();

            window.currentChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: results.map((_, i) => i),
                    datasets: [{
                        data: results.map(r => r.elevation),
                        borderColor: '#fc4c02',
                        backgroundColor: 'rgba(252, 76, 2, 0.1)',
                        fill: true,
                        pointRadius: 0,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    onHover: (event, chartElement) => {
                        if (chartElement.length > 0 && hoverMarker && orangePolyline && whiteBorderPolyline) {
                            const index = chartElement[0].index;
                            const currentPoint = results[index].location;

                            hoverMarker.setPosition(currentPoint);
                            hoverMarker.setVisible(true);

                            const remainingPath = results.slice(index).map(r => r.location);
                            orangePolyline.setPath(remainingPath);
                            whiteBorderPolyline.setPath(remainingPath);

                        } else if (hoverMarker) {
                            hoverMarker.setVisible(false);
                            orangePolyline.setPath(fullSegmentPath);
                            whiteBorderPolyline.setPath(fullSegmentPath);
                        }
                    },
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { display: false },
                        tooltip: { callbacks: { label: (item) => `Altitud: ${item.raw.toFixed(0)} m` } }
                    },
                    scales: { x: { display: false }, y: { display: true } }
                }
            });
        }
    });
};

export const localitzarUsuari = (mapInstance) => {
    mapaActual = mapInstance;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
        (position) => actualitzarOcrearSistemaUbicacio(position, mapaActual),
        null,
        { enableHighAccuracy: false, timeout: 3000, maximumAge: 60000 }
    );

    navigator.geolocation.watchPosition(
        (position) => actualitzarOcrearSistemaUbicacio(position, mapaActual),
        null,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
};

function actualitzarOcrearSistemaUbicacio(position, mapInstance) {
    userPos = { lat: position.coords.latitude, lng: position.coords.longitude };

    if (!userMarker || userMarker.getMap() !== mapInstance) {
        if (userMarker) userMarker.setMap(null);
        if (accuracyCircle) accuracyCircle.setMap(null);
        if (pulseCircle) pulseCircle.setMap(null);

        userMarker = new google.maps.Marker({
            position: userPos, map: mapInstance,
            icon: { path: google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: "#4285F4", fillOpacity: 1, strokeColor: "white", strokeWeight: 2 },
            zIndex: 1000
        });

        accuracyCircle = new google.maps.Circle({
            map: mapInstance, center: userPos, radius: position.coords.accuracy, fillColor: "#4285F4", fillOpacity: 0.15, strokeWeight: 0
        });

        pulseCircle = new google.maps.Circle({
            map: mapInstance, center: userPos, radius: 0, fillColor: "#4285F4", fillOpacity: 0.4, strokeWeight: 0, clickable: false, zIndex: 999
        });

        iniciarAnimacioAura(position.coords.accuracy);
    } else {
        userMarker.setPosition(userPos);
        accuracyCircle.setCenter(userPos);
        accuracyCircle.setRadius(position.coords.accuracy);
        pulseCircle.setCenter(userPos);
    }
}

function iniciarAnimacioAura(maxRadius) {
    if (intervalAura) clearInterval(intervalAura);
    let r = 0;
    intervalAura = setInterval(() => {
        r += maxRadius / 50;
        if (r > maxRadius * 1.5) r = 0;
        if (pulseCircle) {
            pulseCircle.setRadius(r);
            const opacity = 0.4 * (1 - r / (maxRadius * 1.5));
            pulseCircle.setOptions({ fillOpacity: opacity });
        }
    }, 50);
}

export const centrarMapaEnPort = (lat, lng, nom) => {
    if (!map) return;
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const posicioOficial = { lat: latNum, lng: lngNum };

    if (searchMarker) searchMarker.setMap(null);
    searchMarker = new google.maps.Marker({
        position: posicioOficial, map: map, title: nom, animation: google.maps.Animation.DROP,
        icon: { path: google.maps.SymbolPath.CIRCLE, fillColor: '#fc4c02', fillOpacity: 1, strokeColor: '#FFFFFF', strokeWeight: 2, scale: 10 },
        zIndex: 9999
    });

    const centreActual = map.getCenter();
    const puntIntermedi = { lat: (centreActual.lat() + latNum) / 2, lng: (centreActual.lng() + lngNum) / 2 };

    map.setZoom(12);
    setTimeout(() => {
        map.panTo(puntIntermedi);
        setTimeout(() => {
            map.panTo(posicioOficial);
            const listener = map.addListener("idle", () => {
                map.setZoom(13);
                google.maps.event.removeListener(listener);
            });
        }, 400);
    }, 200);
};

export const eliminarMarcadorCerca = () => {
    if (searchMarker) {
        searchMarker.setMap(null);
        searchMarker = null;
    }
};

export const resetearVistaMapa = () => {
    if (!map) return;
    if (activeInfoWindow) activeInfoWindow.close();

    const centreActual = map.getCenter();
    const puntIntermedi = { 
        lat: (centreActual.lat() + CENTRE_MALLORCA.lat) / 2, 
        lng: (centreActual.lng() + CENTRE_MALLORCA.lng) / 2 
    };

    map.setZoom(11); 
    setTimeout(() => {
        map.panTo(puntIntermedi);
        setTimeout(() => {
            map.panTo(CENTRE_MALLORCA);
            const listener = map.addListener("idle", () => {
                map.setZoom(ZOOM_INICIAL);
                google.maps.event.removeListener(listener);
            });
        }, 400);
    }, 200);
};

export const centrarEnUsuari = () => {
    if (!map) return;
    
    if (!userPos) {
        alert("Encara no hem pogut obtenir la teva ubicació. Revisa els permisos del GPS.");
        return;
    }

    if (activeInfoWindow) activeInfoWindow.close();

    const centreActual = map.getCenter();
    const puntIntermedi = { 
        lat: (centreActual.lat() + userPos.lat) / 2, 
        lng: (centreActual.lng() + userPos.lng) / 2 
    };

    map.setZoom(12);
    setTimeout(() => {
        map.panTo(puntIntermedi);
        setTimeout(() => {
            map.panTo(userPos);
            const listener = map.addListener("idle", () => {
                map.setZoom(14);
                google.maps.event.removeListener(listener);
            });
        }, 400);
    }, 200);
};