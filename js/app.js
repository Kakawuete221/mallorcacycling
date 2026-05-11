// app.js - Main JavaScript for the SPA

// Import Strava API functions and Map functions
import { loginWithStrava, checkStravaCallback, isStravaSessionValid, logoutStrava } from './stravaApi.js';
import { loadSegments } from './segments.js';
// Updated imports to include the new Google Maps functionalities
import { initGoogleMap, initAutocomplete, addPortMarkers, calculateCyclingRoute, pintarPorts } from './map.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded and ready for interaction');

    // Element selectors
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('.page-section');
    const loginBtn = document.getElementById('btn-strava-login');
    const userProfileArea = document.getElementById('user-profile');
    const routeBtn = document.getElementById('btn-calculate-route');

    // Variable to store segments globally once loaded
    let globalSegments = [];

    // Initialize segments and markers if user is already logged in
    async function initializeAppData() {
        console.log("🔄 Iniciant càrrega de dades...");

        const ports = await loadSegments();
        globalSegments = ports || [];

        console.log(`✅ Dades carregades: ${globalSegments.length} ports.`);

        // Instead of pintarPorts, we call the functions that integrate with the map
        if (globalSegments.length > 0) {
            console.log("Cridant a les funcions del mapa...");
            addPortMarkers(globalSegments);
            pintarPorts(globalSegments);
        } else {
            console.log("No hi ha ports per pintar!");
        }
    }

    // SPA Routing engine
    function navigateTo(hash) {
        const targetId = hash.replace('#', '') || 'home';

        // Hide all sections
        sections.forEach(section => {
            section.style.display = 'none';
        });

        // Show the target section
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Logical initialization based on section
        if (targetId === 'mapa') {
            setTimeout(() => {
                initGoogleMap();
                initAutocomplete();
                if (globalSegments.length > 0) {
                    addPortMarkers(globalSegments);
                }
            }, 100);
        }

        if (targetId === 'segments') {
            setTimeout(() => {
                initAutocomplete();
            }, 100);
        }

        // Update active link in navbar
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + targetId) {
                link.classList.add('active');
            }
        });
    }

    // Handle hash change for navigation
    window.addEventListener('hashchange', () => {
        navigateTo(window.location.hash);
    });

    // Initial navigation check
    navigateTo(window.location.hash);

    // Initial data load
    await initializeAppData();

    // Event listener for the "Calculate Route" button in the modal
    if (routeBtn) {
        routeBtn.addEventListener('click', () => {
            // 'window.currentPort' should be set inside your showPortDetails function
            if (window.currentPort) {
                // Close the modal
                document.getElementById('port-modal').style.display = 'none';

                // Navigate to the map
                window.location.hash = '#mapa';

                // Calculate the route once the map is initialized
                setTimeout(() => {
                    calculateCyclingRoute(window.currentPort.lat, window.currentPort.lng);
                }, 500);
            }
        });
    }

    // Strava Login logic
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            loginWithStrava();
        });
    }

    // Check for Strava callback (after redirect)
    try {
        const data = await checkStravaCallback();
        if (data && data.athlete) {
            showUserLoggedIn(data.athlete);
        }
    } catch (err) {
        console.error("Error during Strava callback:", err);
    }

    // Check for existing session
    const storedAthlete = localStorage.getItem('strava_athlete');
    if (storedAthlete) {
        showUserLoggedIn(JSON.parse(storedAthlete));
    }

    // Update UI for logged in user
    function showUserLoggedIn(user) {
        if (!user) return;
        if (loginBtn) loginBtn.style.display = 'none';
        if (userProfileArea) userProfileArea.style.display = 'flex';
        if (document.getElementById('user-name')) {
            document.getElementById('user-name').textContent = user.firstname;
        }
        if (document.getElementById('user-avatar')) {
            document.getElementById('user-avatar').src = user.profile_medium;
        }
    }

    // Close modal event
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.onclick = () => {
            document.getElementById('port-modal').style.display = "none";
        };
    }

    if (isStravaSessionValid()) {
        const user = JSON.parse(localStorage.getItem('strava_athlete'));
        showUserLoggedIn(user);
    } else {
        logoutStrava();
        console.log("Sessió no vàlida o caducada.");
    }
});

// Global function to show port details in the modal, called from map.js when a marker is clicked
window.showPortDetails = function (port) {
    // Save to global variable for the route button
    window.currentPort = port;

    document.getElementById('modal-title').textContent = port.nom;
    document.getElementById('modal-municipi').textContent = port.municipi || 'Mallorca';
    document.getElementById('modal-distancia').textContent = port.distancia;
    document.getElementById('modal-desnivell').textContent = port.desnivell;
    document.getElementById('modal-pendent').textContent = port.pendent;

    // Show the modal
    document.getElementById('port-modal').style.display = "block";
};