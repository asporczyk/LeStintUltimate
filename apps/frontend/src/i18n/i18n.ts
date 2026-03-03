import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from './locales/en/common.json'
import plCommon from './locales/pl/common.json'
import enHome from './locales/en/home.json'
import plHome from './locales/pl/home.json'

const resources = {
  en: {
    common: enCommon,
    home: enHome,
  },
  pl: {
    common: plCommon,
    home: plHome,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pl',
    fallbackLng: 'en',
    ns: ['common', 'home'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
