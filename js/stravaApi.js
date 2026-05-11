// stravaApi.js - Module for interacting with the Strava API

const CLIENT_ID = '236654';
const CLIENT_SECRET = '312e7c7c712a8af0e55af705e2d2e6a163d5b563';

// For development, we use localhost. For production, we would switch to the live URL. Make sure to update this in both the loginWithStrava function and the Strava app settings.
const REDIRECT_URI = 'http://127.0.0.1:5500/index.html'
// const REDIRECT_URI = 'https://www.mallorcacycling.online/index.html';

// Function to initiate Strava OAuth flow
export function loginWithStrava() {
    console.log("Iniciant procés d'autenticació amb Strava...");
    const url = `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&approval_prompt=force&scope=read_all`;
    window.location.href = url;
}

// Function to exchange authorization code for access token (i dades de l'usuari)
export async function checkStravaCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        try {
            const response = await fetch('https://www.strava.com/oauth/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    code: code,
                    grant_type: 'authorization_code'
                })
            });

            const data = await response.json();

            if (data.access_token) {
                localStorage.setItem('strava_access_token', data.access_token);
                localStorage.setItem('strava_athlete', JSON.stringify(data.athlete));
                
                localStorage.setItem('strava_expires_at', data.expires_at);
                
                console.log("Sessió iniciada. Expira el:", new Date(data.expires_at * 1000).toLocaleString());
                
                window.history.replaceState({}, document.title, window.location.pathname);   
                return data;
            }
        } catch (error) {
            console.error("Error obtenint el token:", error);
            return null;
        }
    }        
    return null;
}

// Function to calculate if the Strava session is still valid based on the stored expiration time
export function isStravaSessionValid() {
    const token = localStorage.getItem('strava_access_token');
    const expiresAt = localStorage.getItem('strava_expires_at');

    if (!token || !expiresAt) return false;

    const currentTime = Math.floor(Date.now() / 1000); 
    
    // Return true if current time is less than the expiration time, meaning the session is still valid
    return currentTime < parseInt(expiresAt);
}

// Function to log out the user by clearing stored tokens and data
export function logoutStrava() {
    localStorage.removeItem('strava_access_token');
    localStorage.removeItem('strava_athlete');
    localStorage.removeItem('strava_expires_at');
}

// Function to get the stored access token
export function getAccessToken() {
    return localStorage.getItem('strava_access_token');
}

// Function to fetch segment details
export async function getSegmentDetails(segmentId) {
    const accessToken = localStorage.getItem('strava_access_token');
    
    try {
        const response = await fetch(`https://www.strava.com/api/v3/segments/${segmentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            console.error(`Error HTTP ${response.status}: ${response.statusText}`);
            throw new Error(`Error al connectar (Codi: ${response.status})`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error consultant el segment a Strava:', error);
        throw error;
    }
}


