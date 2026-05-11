// map.js - Module for handling Google Maps services (Maps, Directions, Places, Elevation, Geocoding)

let map;
let markers = [];
let directionsService;
let directionsRenderer;
let elevationService;
let geocoder;
let llistatPolylines = [];

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
}

// Function to calculate cycling routes from user location to a specific climb
export function calculateCyclingRoute(destLat, destLng) {
    if(navigator.geolocation) {
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
                    alert('No s\'ha pogut calcular la ruta. Si us plau, comprova la teva connexió i permisos de geolocalització.');
                }
            });
        }, error => {
            console.error('Error obtenint la ubicació de l\'usuari:', error);
            alert('No s\'ha pogut obtenir la teva ubicació. Si us plau, activa la geolocalització i torna-ho a intentar.');
        });
    } else {
        alert('La geolocalització no és compatible amb aquest navegador.');
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

    console.log("1. La funció s'executa! Quants ports he rebut?", ports.length);
    console.log("2. Com és el primer port?", ports[0]);
    
    // Clear existing polylines from the map
    llistatPolylines.forEach(polyline => polyline.setMap(null));
    llistatPolylines = [];

    // Loop through the ports and create polylines for each climb
    ports.forEach(port => {

        if(!port.polyline) return;

        const path = google.maps.geometry.encoding.decodePath(port.polyline);

        // Create a polyline for the climb and add it to the map
        const polyline = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#fc4c02',
            strokeOpacity: 0.5,
            strokeWeight: 4,
            zIndex: 1,
            map: map
        });

        polyline.portData = port;

        // Event to trigger the details modal when a polyline is hovered
        google.maps.event.addListener(polyline, 'mouseover', function() {
            this.setOptions({
                strokeOpacity: 1.0,
                strokeWeight: 7,    
                zIndex: 100         
            });
            map.setOptions({ draggableCursor: 'pointer' });
        });

        // Event to reset the polyline style when the mouse leaves
        google.maps.event.addListener(polyline, 'mouseout', function() {
            this.setOptions({
                strokeOpacity: 0.5, 
                strokeWeight: 4,    
                zIndex: 1           
            });
            // Reset the cursor to default when not hovering over a climb
            map.setOptions({ draggableCursor: '' });
        });

        // Event to trigger the details modal when a polyline is clicked
        google.maps.event.addListener(polyline, 'click', function() {
            console.log("Has clicat al port:", this.portData.nom);
            // Aquí cridarem a la funció: obrirModalPort(this.portData);
        });

        // Add the polyline to the list for future reference and management
        llistatPolylines.push(polyline);
    });
}