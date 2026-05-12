// map.js - Module for handling Google Maps services (Maps, Directions, Places, Elevation, Geocoding)

let map;
let markers = [];
let directionsService;
let directionsRenderer;
let elevationService;
let geocoder;
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

// Function to initialize the Google Map
export function initGoogleMap() {
    const centreMallorca = { lat: 39.62, lng: 2.98 };

    /*const BALEARIC_BOUNDS = {
        north: 40.2, south: 38.3, west: 1.2, east: 4.5
    };*/

    const MALLORCA_BOUNDS = {
        north: 40.0, // Fins a Formentor
        south: 39.1, // Fins a Cabrera/Ses Salines
        west: 2.2,   // Fins a Sa Dragonera
        east: 3.6    // Fins a Capdepera
    };

    // Initialize the map centered on Mallorca with specific options
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: centreMallorca,
        mapTypeId: 'terrain',
        minZoom: 9,
        maxZoom: 18,
        restriction: {
            latLngBounds: MALLORCA_BOUNDS,
            strictBounds: false
        },
        clickableIcons: false,
        streetViewControl: false,
        fullscreenControl: true,
        mapTypeControl: true,
        scaleControl: true,
        rotateControl: false,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
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

// Function to calculate cycling routes from user location to a specific climb
export function calculateCyclingRoute(destLat, destLng) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const request = {
                origin: { lat: position.coords.latitude, lng: position.coords.longitude },
                destination: { lat: parseFloat(destLat), lng: parseFloat(destLng) },
                travelMode: google.maps.TravelMode.BICYCLING
            };

            // Request route from Directions Service
            directionsService.route(request, (result, status) => {
                if (status === google.maps.DirectionsStatus.OK) {
                    directionsRenderer.setDirections(result);
                } else {
                    console.error('Error obtenint la ruta: ' + status);
                    alert('Could not calculate route. Please check your connection and geolocation permissions.');
                }
            });
        }, error => {
            console.error('Error obtenint la ubicació de l\'usuari:', error);
            alert('Could not obtain your location. Please enable geolocation and try again.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// Function to fetch precise elevation for a given location
export function getClimbElevation(lat, lng, callback) {
    const location = { lat: parseFloat(lat), lng: parseFloat(lng) };

    elevationService.getElevationForLocations({
        locations: [location]
    }, (results, status) => {
        if (status === 'OK' && results[0]) {
            callback(results[0].elevation);
        } else {
            console.error("Elevation service failed: " + status);
        }
    });
}

// Function to get the address or municipality name from coordinates (Reverse Geocoding)
export function getAddressFromCoords(lat, lng, callback) {
    const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };

    geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
            callback(results[0].formatted_address);
        } else {
            console.error("Geocoding failed: " + status);
        }
    });
}

// Function to setup Google Places Autocomplete for the segment search input
export function initAutocomplete() {
    const input = document.getElementById("segment-search");
    if (!input) return;

    const options = {
        componentRestrictions: { country: "es" },
        fields: ["geometry", "name", "formatted_address"],
        strictBounds: false
    };

    // Initialize Autocomplete linked to the search input
    const autocomplete = new google.maps.places.Autocomplete(input, options);

    // Event listener for when a user selects a place from suggestions
    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
            map.setCenter(place.geometry.location);
            map.setZoom(14);
        }
    });
}

// Function to add climb markers to the map and link them to the application logic
export function addPortMarkers(ports) {
    if (!map) return; // Ensure the map is initialized before adding markers

    // Clear existing markers from the map
    markers.forEach(m => m.setMap(null));
    markers = [];

    ports.forEach(port => {
        const marker = new google.maps.Marker({
            position: { lat: parseFloat(port.lat), lng: parseFloat(port.lng) },
            map: map,
            title: port.nom
        });

        // Event to trigger the details modal when a marker is clicked
        marker.addListener("click", () => {
            // This function should be defined in your app.js to show climb details
            if (typeof window.showPortDetails === 'function') {
                window.showPortDetails(port);
            }
        });

        markers.push(marker);
    });
}

// Function to paint the ports from the polyline list
export function pintarPorts(ports) {

    // Netegem les línies i marcadors previs
    llistatPolylines.forEach(element => {
        if (element.setMap) element.setMap(null);
    });
    llistatPolylines = [];

    ports.forEach(port => {
        if (!port.polyline) return;

        const path = google.maps.geometry.encoding.decodePath(port.polyline);

        // 1. LA LÍNIA DE FONS (Vora Blanca)
        const borderPolyline = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#FFFFFF',
            strokeOpacity: 0.9,
            strokeWeight: 6,
            zIndex: 1,
            map: map
        });

        // 2. LA LÍNIA PRINCIPAL (Taronja Strava) - Ara amb menys opacitat inicial
        const mainPolyline = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#fc4c02',
            strokeOpacity: 0.7,     // Inicialment una mica transparent
            strokeWeight: 3,
            zIndex: 2,
            map: map
        });

        // 3. EL MARCADOR D'INICI DE SEGMENT
        const startMarker = new google.maps.Marker({
            position: path[0], // Agafem la primera coordenada de la ruta
            map: map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 4,
                fillColor: '#fc4c02', // Taronja
                fillOpacity: 1,
                strokeColor: '#ffffff', // Vora blanca
                strokeWeight: 2,
            },
            zIndex: 3 // Per sobre de les línies
        });

        // Funcions per gestionar l'efecte Hover (S'obscureix, no s'engruixa)
        const ferHover = () => {
            mainPolyline.setOptions({
                strokeOpacity: 1.0,        // Es torna 100% sòlida
                strokeColor: '#d94302',    // Taronja una mica més fosc/intens
                zIndex: 10
            });
            map.setOptions({ draggableCursor: 'pointer' });
        };

        const treureHover = () => {
            mainPolyline.setOptions({
                strokeOpacity: 0.7,        // Torna a la transparència inicial
                strokeColor: '#fc4c02',    // Taronja base
                zIndex: 2
            });
            map.setOptions({ draggableCursor: '' });
        };

        const clicarLinia = async (event) => {
            // IMPORTANT: Aquí 'port' ja és accessible pel closure, 
            // però l'hem de passar explícitament si la funció el demana
            if (activeInfoWindow) activeInfoWindow.close();

            // 1. Mostrem la MiniCard (passem l'objecte port que tenim al forEach)
            const minicardHTML = window.createMiniCardHTML(port);

            activeInfoWindow = new google.maps.InfoWindow({
                content: minicardHTML,
                position: event.latLng
            });
            activeInfoWindow.open(map);

            // 2. Petició asíncrona a Strava
            try {
                const dadesReals = await window.getSegmentDetails(port.id);
                if (dadesReals) {
                    // Refresquem contingut
                    const nouHTML = window.createMiniCardHTML(port);
                    activeInfoWindow.setContent(nouHTML);
                }
            } catch (error) {
                console.error("Error Strava:", error);
            }
        };

        // Assignem els events a LA LÍNIA TARONJA
        google.maps.event.addListener(mainPolyline, 'mouseover', ferHover);
        google.maps.event.addListener(mainPolyline, 'mouseout', treureHover);
        google.maps.event.addListener(mainPolyline, 'click', clicarLinia);

        // Assignem els events a LA LÍNIA BLANCA
        google.maps.event.addListener(borderPolyline, 'mouseover', ferHover);
        google.maps.event.addListener(borderPolyline, 'mouseout', treureHover);
        google.maps.event.addListener(borderPolyline, 'click', clicarLinia);

        // Assignem els events AL MARCADOR D'INICI
        google.maps.event.addListener(startMarker, 'mouseover', ferHover);
        google.maps.event.addListener(startMarker, 'mouseout', treureHover);
        google.maps.event.addListener(startMarker, 'click', (e) => clicarLinia(e));

        // Guardem tot per poder netejar el mapa
        llistatPolylines.push(borderPolyline, mainPolyline, startMarker);
        mainPolyline.addListener('click', clicarLinia);
        borderPolyline.addListener('click', clicarLinia);
    });
}

export const dibuixarMiniMapa = (puerto) => {
    const miniMapElement = document.getElementById('modal-mini-map');
    if (!miniMapElement) return;

    const miniMap = new google.maps.Map(miniMapElement, {
        zoom: 14, // Pugem una mica el zoom base
        center: { lat: puerto.lat, lng: puerto.lng },
        mapTypeId: 'terrain',
        disableDefaultUI: true,
        gestureHandling: 'none'
    });

    fullSegmentPath = google.maps.geometry.encoding.decodePath(puerto.polyline);

    // 1. CAPA BASE: Línia Gris (Tot el recorregut)
    new google.maps.Polyline({
        path: fullSegmentPath,
        strokeColor: '#BDC3C7', 
        strokeOpacity: 0.7,
        strokeWeight: 5,
        map: miniMap,
        zIndex: 1
    });

    // 2. CAPA MITJA: Vora Blanca (Dinàmica)
    whiteBorderPolyline = new google.maps.Polyline({
        path: fullSegmentPath,
        strokeColor: '#FFFFFF',
        strokeOpacity: 1.0,
        strokeWeight: 8, // Més gruixuda per fer de vora
        map: miniMap,
        zIndex: 5
    });

    // 3. CAPA SUPERIOR: Línia Taronja (Dinàmica)
    orangePolyline = new google.maps.Polyline({
        path: fullSegmentPath,
        strokeColor: '#fc4c02',
        strokeOpacity: 1.0,
        strokeWeight: 4,
        map: miniMap,
        zIndex: 10
    });

    // 4. PUNT D'INICI (Igual que al mapa gran)
    new google.maps.Marker({
        position: fullSegmentPath[0],
        map: miniMap,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 5,
            fillColor: "#fc4c02",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
        },
        zIndex: 20
    });

    // 5. MARCADOR BLAU DE HOVER
    hoverMarker = new google.maps.Marker({
        position: fullSegmentPath[0],
        map: miniMap,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#3498DB",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
        },
        visible: false,
        zIndex: 100
    });

    const bounds = new google.maps.LatLngBounds();
    fullSegmentPath.forEach(p => bounds.extend(p));
    miniMap.fitBounds(bounds);

    // Un cop fitBounds ha actuat, forcem un nivell de zoom més proper si el segment és curt
    google.maps.event.addListenerOnce(miniMap, 'idle', () => {
        if (miniMap.getZoom() > 15) miniMap.setZoom(15); // Evita zoom excessiu en segments molt curts
    });
    
    window.currentMiniMap = miniMap;
};


// 1. GEOCODING: Obtenir el municipi real
window.actualitzarMunicipiReal = (lat, lng) => {
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

// 2. DIRECTIONS: Calcular ruta dins la teva App
window.calcularRutaPort = (destLat, destLng) => {
    if (!navigator.geolocation) return alert("Geolocation is not supported by this browser.");

    navigator.geolocation.getCurrentPosition(pos => {
        const directionsService = new google.maps.DirectionsService();
        // Necessitaries un DirectionsRenderer vinculat al teu mapa gran
        const request = {
            origin: { lat: pos.coords.latitude, lng: pos.coords.longitude },
            destination: { lat: destLat, lng: destLng },
            travelMode: google.maps.TravelMode.BICYCLING
        };

        directionsService.route(request, (result, status) => {
            if (status === 'OK') {
                // Tanquem el modal per veure la ruta al mapa principal
                window.closeModal();
                // Assumim que 'directionsRenderer' està definit globalment al map.js
                window.directionsRenderer.setDirections(result);
            }
        });
    });
};

// 3. PLACES: Cercar serveis propers (Nearby Search)
window.cercarServeisProp = (lat, lng) => {
    const service = new google.maps.places.PlacesService(map); // 'map' és la teva variable global
    const request = {
        location: new google.maps.LatLng(lat, lng),
        radius: '2000', // 2km a la rodona
        type: ['cafe', 'bicycle_store', 'restaurant'] // Tipus de llocs interessants per ciclistes
    };

    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            console.log("Serveis trobats:", results);
            // Aquí podries pintar marcadors especials al mapa o mostrar una llista al modal
            alert("We found " + results.length + " nearby cyclist-friendly places on the map!");
            window.closeModal();
        }
    });
};

// 4. ELEVATION: Dibuixar perfil
window.dibuixarPerfilElevacio = (polyline) => {
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

                            // Retallem les dues línies (blanca i taronja)
                            const remainingPath = results.slice(index).map(r => r.location);
                            orangePolyline.setPath(remainingPath);
                            whiteBorderPolyline.setPath(remainingPath);

                        } else if (hoverMarker) {
                            hoverMarker.setVisible(false);
                            // Restaurem el camí complet
                            orangePolyline.setPath(fullSegmentPath);
                            whiteBorderPolyline.setPath(fullSegmentPath);
                        }
                    },
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (item) => `Altitud: ${item.raw.toFixed(0)} m`
                            }
                        }
                    },
                    scales: { x: { display: false }, y: { display: true } }
                }
            });
        }
    });
};

export const localitzarUsuari = (map) => {
    mapaActual = map; // Guardem la referència del mapa nou cada vegada que es crida la funció

    if (!navigator.geolocation) return;

    // Cerca ràpida
    navigator.geolocation.getCurrentPosition(
        (position) => actualitzarOcrearSistemaUbicacio(position, mapaActual),
        null,
        { enableHighAccuracy: false, timeout: 3000, maximumAge: 60000 }
    );

    // Seguiment continu
    navigator.geolocation.watchPosition(
        (position) => actualitzarOcrearSistemaUbicacio(position, mapaActual),
        null,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
};

// Funció centralitzada per gestionar tot el sistema visual
function actualitzarOcrearSistemaUbicacio(position, map) {
    userPos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };
    window.userPos = userPos;

    // SI EL MAPA HA CANVIAT (o el marcador s'ha perdut), l'hem de recrear
    // Comprovem si el marcador té el mapa actual assignat
    if (!userMarker || userMarker.getMap() !== map) {
        
        // Si hi havia marcadors vells, els netegem del tot
        if (userMarker) userMarker.setMap(null);
        if (accuracyCircle) accuracyCircle.setMap(null);
        if (pulseCircle) pulseCircle.setMap(null);

        // 1. Punt blau
        userMarker = new google.maps.Marker({
            position: userPos,
            map: map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 2,
            },
            zIndex: 1000
        });

        // 2. Aura estàtica
        accuracyCircle = new google.maps.Circle({
            map: map,
            center: userPos,
            radius: position.coords.accuracy,
            fillColor: "#4285F4",
            fillOpacity: 0.15,
            strokeWeight: 0
        });

        // 3. Aura polsant
        pulseCircle = new google.maps.Circle({
            map: map,
            center: userPos,
            radius: 0,
            fillColor: "#4285F4",
            fillOpacity: 0.4,
            strokeWeight: 0,
            clickable: false,
            zIndex: 999
        });

        iniciarAnimacioAura(position.coords.accuracy);

    } else {
        // Si el mapa és el mateix, només actualitzem posició
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