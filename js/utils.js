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