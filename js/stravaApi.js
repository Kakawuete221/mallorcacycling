// stravaApi.js - Module for interacting with the Strava API

const CLIENT_ID = '236654';
const CLIENT_SECRET = '312e7c7c712a8af0e55af705e2d2e6a163d5b563';

const REDIRECT_URI = 'http://127.0.0.1:5500/index.html'

export function loginWithStrava() {
    console.log("Iniciant procés d'autenticació amb Strava...");
    const url = `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&approval_prompt=force&scope=read_all,activity:read_all,profile:read_all`;
    window.location.href = url;
}

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
                
                window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);   
                return data;
            }
        } catch (error) {
            console.error("Error obtenint el token:", error);
            return null;
        }
    }        
    return null;
}

export function isStravaSessionValid() {
    const token = localStorage.getItem('strava_access_token');
    const expiresAt = localStorage.getItem('strava_expires_at');

    if (!token || !expiresAt) return false;

    const currentTime = Math.floor(Date.now() / 1000); 
    return currentTime < parseInt(expiresAt);
}

export function logoutStrava() {
    localStorage.removeItem('strava_access_token');
    localStorage.removeItem('strava_athlete');
    localStorage.removeItem('strava_expires_at');
}

export function getAccessToken() {
    return localStorage.getItem('strava_access_token');
}

export async function getSegmentDetails(segmentId) {
    if (!segmentId) return null;

    const cacheKey = `segment_${segmentId}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
            console.log(`📦 Usant dades de caché per al segment ${segmentId}`);
            return parsed.data;
        }
    }

    const token = localStorage.getItem('strava_access_token');
    if (!token) {
        console.warn("No s'ha trobat cap token de Strava.");
        return null;
    }

    try {
        const response = await fetch(`https://www.strava.com/api/v3/segments/${segmentId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error en la resposta de Strava');

        const data = await response.json();

        localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            data: data
        }));

        return data;
    } catch (error) {
        console.error("Error petició Strava:", error);
        return null;
    }
}

export async function getAthleteStats(athleteId) {
    if (!athleteId) return null;

    const cacheKey = `stats_${athleteId}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
        const parsed = JSON.parse(cachedData);
        if (Date.now() - parsed.timestamp < 60 * 60 * 1000) { // 1 hora de caché
            return parsed.data;
        }
    }

    const token = localStorage.getItem('strava_access_token');
    if (!token) return null;

    try {
        const response = await fetch(`https://www.strava.com/api/v3/athletes/${athleteId}/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Error fetching stats');

        const data = await response.json();

        localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            data: data
        }));

        return data;
    } catch (error) {
        console.error("Error getting athlete stats:", error);
        return null;
    }
}

export async function getStarredSegments() {
    const token = localStorage.getItem('strava_access_token');
    if (!token) return [];

    try {
        const response = await fetch(`https://www.strava.com/api/v3/segments/starred?per_page=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) return [];

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error getting starred segments:", error);
        return [];
    }
}

export async function getRecentActivities(perPage = 30) {
    const token = localStorage.getItem('strava_access_token');
    if (!token) return [];

    try {
        const response = await fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) return [];

        const data = await response.json();
        // Filtrar només activitats de tipus Ride, VirtualRide, etc.
        return data.filter(a => a.type === 'Ride' || a.type === 'VirtualRide');
    } catch (error) {
        console.error("Error getting recent activities:", error);
        return [];
    }
}