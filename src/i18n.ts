import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationAR from './locales/ar/translation.json';
import translationEN from './locales/en/translation.json';

const resources = {
    ar: {
        translation: translationAR,
    },
    en: {
        translation: translationEN,
    },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        lng: 'ar', // Set default language to Arabic
        fallbackLng: 'ar',
        debug: false,
        interpolation: {
            escapeValue: false,
        },
    });

// Handle RTL/LTR based on language
i18n.on('languageChanged', (lng) => {
    document.documentElement.dir = i18n.dir(lng);
    document.documentElement.lang = lng;
});

export default i18n;
