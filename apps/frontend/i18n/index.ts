import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'

import en from './resources/en/translation.json'
import id from './resources/id/translation.json'

const resources = {
  en: { translation: en },
  id: { translation: id },
}

const locale = Localization.getLocales()[0]?.languageCode || 'en' // Fallback to English if no locale is found

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: locale,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  }).catch((error) => {
    console.error('i18n initialization failed:', error)
  })

export default i18n
