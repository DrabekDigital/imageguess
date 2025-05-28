// Translations for different languages
const translations = {
    en: {
        welcome: 'Welcome to ImageGuess',
        selectFolder: 'Select a folder with images',
        imageCount: 'Image {current} of {total}',
        reveal: 'Reveal',
        fullscreen: 'Fullscreen',
        exitFullscreen: 'Exit Fullscreen',
        start: 'Start',
        buttonCount: 'Number of buttons',
        noImagesFound: 'No image files found in the selected folder',
        alreadyAtLast: 'Already at last image',
        alreadyAtFirst: 'Already at first image',
        noImagesAvailable: 'No images available for navigation',
        enterPositiveNumber: 'Please enter a positive number',
        maxButtonsAllowed: 'Maximum 100 buttons allowed',
        enterPerfectSquare: 'Please enter a perfect square (try {lower} or {higher})',
        perfectGrid: 'Perfect! {size}×{size} grid',
        menuFile: 'File',
        menuOpen: 'Open Folder',
        menuClose: 'Close Folder',
        menuQuit: 'Quit',
        menuView: 'View',
        menuNext: 'Next Image',
        menuPrevious: 'Previous Image',
        menuReveal: 'Reveal Image',
        menuDevTools: 'Toggle Developer Tools',
        menuReload: 'Reload',
        menuAbout: 'About ImageGuess',
        aboutVersion: 'Version {version}',
        aboutCopyright: '© 2025 ImageGuess',
        open: 'Open',
        close: 'Close'
    },
    cs: {
        welcome: 'Vítejte v ImageGuess',
        selectFolder: 'Vyberte složku s obrázky',
        imageCount: 'Obrázek {current} z {total}',
        reveal: 'Odkrýt',
        fullscreen: 'Na celou obrazovku',
        exitFullscreen: 'Ukončit celou obrazovku',
        start: 'Start',
        buttonCount: 'Počet tlačítek',
        noImagesFound: 'Ve vybrané složce nebyly nalezeny žádné obrázky',
        alreadyAtLast: 'Již jste na posledním obrázku',
        alreadyAtFirst: 'Již jste na prvním obrázku',
        noImagesAvailable: 'Žádné obrázky nejsou k dispozici pro navigaci',
        enterPositiveNumber: 'Zadejte kladné číslo',
        maxButtonsAllowed: 'Maximálně 100 tlačítek',
        enterPerfectSquare: 'Zadejte čtvercové číslo (zkuste {lower} nebo {higher})',
        perfectGrid: 'Výborně! Mřížka {size}×{size}',
        menuFile: 'Soubor',
        menuOpen: 'Otevřít složku',
        menuClose: 'Zavřít složku',
        menuQuit: 'Ukončit',
        menuView: 'Zobrazení',
        menuNext: 'Další obrázek',
        menuPrevious: 'Předchozí obrázek',
        menuReveal: 'Odkrýt obrázek',
        menuDevTools: 'Přepnout vývojářské nástroje',
        menuReload: 'Obnovit',
        menuAbout: 'O aplikaci ImageGuess',
        aboutVersion: 'Verze {version}',
        aboutCopyright: '© 2025 ImageGuess',
        open: 'Otevřít',
        close: 'Zavřít'
    },
    sk: {
        welcome: 'Vitajte v ImageGuess',
        selectFolder: 'Vyberte priečinok s obrázkami',
        imageCount: 'Obrázok {current} z {total}',
        reveal: 'Odkryť',
        fullscreen: 'Na celú obrazovku',
        exitFullscreen: 'Ukončiť celú obrazovku',
        start: 'Start',
        buttonCount: 'Počet tlačidiel',
        noImagesFound: 'Vo vybranom priečinku neboli nájdené žiadne obrázky',
        alreadyAtLast: 'Už ste na poslednom obrázku',
        alreadyAtFirst: 'Už ste na prvom obrázku',
        noImagesAvailable: 'Žiadne obrázky nie sú k dispozícii pre navigáciu',
        enterPositiveNumber: 'Zadajte kladné číslo',
        maxButtonsAllowed: 'Maximálne 100 tlačidiel',
        enterPerfectSquare: 'Zadajte štvorcové číslo (skúste {lower} alebo {higher})',
        perfectGrid: 'Výborne! Mriežka {size}×{size}',
        menuFile: 'Súbor',
        menuOpen: 'Otvoriť priečinok',
        menuClose: 'Zavrieť priečinok',
        menuQuit: 'Ukončiť',
        menuView: 'Zobrazenie',
        menuNext: 'Ďalší obrázok',
        menuPrevious: 'Predchádzajúci obrázok',
        menuReveal: 'Odkryť obrázok',
        menuDevTools: 'Prepínať vývojárske nástroje',
        menuReload: 'Obnoviť',
        menuAbout: 'O aplikácii ImageGuess',
        aboutVersion: 'Verzia {version}',
        aboutCopyright: '© 2025 ImageGuess',
        open: 'Otvoriť',
        close: 'Zavrieť'
    }
};

// Get user's preferred language
function getPreferredLanguage() {
    let userLang;
    
    // Check if we're in Node.js environment (main process)
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        const { app } = require('electron');
        userLang = app.getLocale();
    } else {
        // Browser environment (renderer process)
        userLang = navigator.language || navigator.userLanguage;
    }
    
    const shortLang = userLang.split('-')[0];
    
    // Check if we support the user's language
    if (translations[shortLang]) {
        return shortLang;
    }
    
    // Default to English if language not supported
    return 'en';
}

// Get translation for a key
function getTranslation(key, params = {}) {
    const lang = getPreferredLanguage();
    let text = translations[lang][key] || translations['en'][key];
    
    // Replace parameters in the text
    Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
}

// Export the functions and translations
if (typeof window !== 'undefined') {
    // Browser environment
    window.getTranslation = getTranslation;
} else {
    // Node.js environment
    module.exports = {
        translations,
        getPreferredLanguage,
        getTranslation
    };
} 