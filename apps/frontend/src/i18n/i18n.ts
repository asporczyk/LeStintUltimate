import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from './locales/en/common.json'
import plCommon from './locales/pl/common.json'
import enHome from './locales/en/home.json'
import plHome from './locales/pl/home.json'
import enRaceDetails from './locales/en/race-details.json'
import plRaceDetails from './locales/pl/race-details.json'

const resources = {
  en: {
    common: enCommon,
    home: enHome,
    raceDetails: enRaceDetails,
  },
  pl: {
    common: plCommon,
    home: plHome,
    raceDetails: plRaceDetails,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pl',
    fallbackLng: 'en',
    ns: ['common', 'home', 'raceDetails'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
