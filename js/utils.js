// utils.js - Funcions d'ajuda transversals

export const formatTime = (seconds) => {
    if (!seconds) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

export const calcularVelocitat = (distanciaKm, tempsMmSs) => {
    if (!tempsMmSs || tempsMmSs === "--:--") return "0";
    const parts = tempsMmSs.split(':');
    const segons = parts.length === 3 
        ? (+parts[0] * 3600) + (+parts[1] * 60) + (+parts[2]) 
        : (+parts[0] * 60) + (+parts[1]);
    if (segons === 0) return "0";
    return ((distanciaKm / (segons / 3600))).toFixed(1);
};

export const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
    });
};

export const updateJSONLD = (schemaData) => {
    let script = document.getElementById('dynamic-json-ld');
    if (!script) {
        script = document.createElement('script');
        script.id = 'dynamic-json-ld';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schemaData);
};