// translations.js - Sistema de traduccions multilingüe dinàmic (CA / ES / EN)

let activeTranslations = {};
let currentLang = localStorage.getItem('preferredLanguage') || 'en';

export const getActiveLanguage = () => currentLang;

// Càrrega asíncrona des dels fitxers JSON de traducció
export const loadTranslations = async (lang) => {
    try {
        const response = await fetch(`./data/${lang}.json`);
        if (!response.ok) throw new Error(`Could not load translations for ${lang}`);
        activeTranslations = await response.json();
        currentLang = lang;
        localStorage.setItem('preferredLanguage', lang);
        document.documentElement.lang = lang; // Accessibility: Update language attribute dynamically
    } catch (error) {
        console.error("Error carregant les traduccions:", error);
        activeTranslations = {};
    }
};

export const initTranslations = async () => {
    const lang = localStorage.getItem('preferredLanguage') || 'en';
    await loadTranslations(lang);
};

export const t = (key) => {
    return activeTranslations[key] !== undefined ? activeTranslations[key] : key;
};

export const translatePage = () => {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const text = t(key);
        if (text) el.textContent = text;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        const text = t(key);
        if (text) el.placeholder = text;
    });
    // Accessibility: Support translating elements with dynamic aria-labels
    document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
        const key = el.dataset.i18nAriaLabel;
        const text = t(key);
        if (text) el.setAttribute('aria-label', text);
    });
};

export const setLanguage = async (lang) => {
    await loadTranslations(lang);

    // Update the custom language selector label
    const label = document.getElementById('current-lang-label');
    if (label) label.textContent = lang.toUpperCase();

    // Translate static DOM
    translatePage();

    // Re-render router view (dynamic content)
    const { router } = await import('./router.js');
    router();

    // Re-render filters/cards if on map or segments
    const { executarFiltre } = await import('./app.js');
    executarFiltre();
};
