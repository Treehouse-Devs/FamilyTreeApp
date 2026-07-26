import { createI18n } from 'vue-i18n'
import en from './resources/en/translation.json'
import id from './resources/id/translation.json'

export const SUPPORTED_LOCALES = ['en', 'id'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

type Messages = Record<string, string>

/**
 * Rewrites i18next's `{{name}}` interpolation to vue-i18n's `{name}`.
 *
 * The resource files are copied byte-for-byte from the RN app, which uses
 * i18next — and vue-i18n rejects `{{name}}` outright ("Not allowed nest
 * placeholder"), breaking keys like `age` and `deceased`. Converting at load time
 * rather than editing the JSON keeps both apps on identical resources, which is
 * what makes the eventual extraction to `packages/i18n` a straight move.
 */
function convertInterpolation(messages: Messages): Messages {
  return Object.fromEntries(
    Object.entries(messages).map(([key, value]) => [
      key,
      typeof value === 'string' ? value.replace(/\{\{\s*(\w+)\s*\}\}/g, '{$1}') : value,
    ]),
  )
}

/**
 * Ported from the RN app's `i18n/index.ts`, using the same flat-key JSON resources.
 *
 * Two differences worth knowing:
 *   - the device locale comes from `navigator.language` instead of expo-localization
 *   - this module is initialised explicitly from `main.ts`. In the RN app it is only
 *     imported incidentally (via the auth validator's import chain), which makes
 *     initialisation order accidental.
 */
function detectLocale(): Locale {
  const language = navigator.language?.split('-')[0]

  return SUPPORTED_LOCALES.includes(language as Locale) ? (language as Locale) : 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: {
    en: convertInterpolation(en),
    id: convertInterpolation(id),
  },
})

export function setLocale(locale: Locale) {
  i18n.global.locale.value = locale
}

export default i18n
