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

export const getPictureHTML = (src, alt, className = '', imgClassName = '', sizes = '100vw', extraImgAttrs = '') => {
    if (!src) return '';
    
    if (!src.startsWith('media/') || src.endsWith('.svg') || src.includes('icon-') || src.includes('logo') || src.includes('Iso')) {
        return `<img src="${src}" alt="${alt}" class="${imgClassName || className}" ${extraImgAttrs}>`;
    }
    
    const basePath = src.replace(/\.[^/.]+$/, "");
    const escapeUrl = (url) => url.split('/').map(encodeURIComponent).join('/');
    
    const avifSm = escapeUrl(`${basePath}-sm.avif`);
    const avifMd = escapeUrl(`${basePath}-md.avif`);
    const avifLg = escapeUrl(`${basePath}-lg.avif`);
    
    const webpSm = escapeUrl(`${basePath}-sm.webp`);
    const webpMd = escapeUrl(`${basePath}-md.webp`);
    const webpLg = escapeUrl(`${basePath}-lg.webp`);
    
    const jpgSm = escapeUrl(`${basePath}-sm.jpg`);
    const jpgMd = escapeUrl(`${basePath}-md.jpg`);
    const jpgLg = escapeUrl(`${basePath}-lg.jpg`);
    
    const defaultOnError = `this.onerror=null; this.src='media/ColldeSoller-md.jpg';`;
    const onError = extraImgAttrs.includes('onerror=') ? '' : `onerror="${defaultOnError}"`;
    
    return `
        <picture class="${className}">
            <source srcset="${avifSm} 400w, ${avifMd} 800w, ${avifLg} 1200w" sizes="${sizes}" type="image/avif">
            <source srcset="${webpSm} 400w, ${webpMd} 800w, ${webpLg} 1200w" sizes="${sizes}" type="image/webp">
            <source srcset="${jpgSm} 400w, ${jpgMd} 800w, ${jpgLg} 1200w" sizes="${sizes}" type="image/jpeg">
            <img src="${jpgMd}" alt="${alt}" class="${imgClassName}" ${onError} ${extraImgAttrs}>
        </picture>
    `.trim().replace(/\s+/g, ' ');
};