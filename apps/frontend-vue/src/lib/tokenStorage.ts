import { Preferences } from '@capacitor/preferences'

/**
 * Persistent storage for auth credentials.
 *
 * Ported from the RN app's `lib/tokenStorage.ts`, which keeps tokens in the OS
 * keystore via expo-secure-store on native and falls back to AsyncStorage on web.
 * `@capacitor/preferences` covers both: it uses native platform storage
 * (SharedPreferences / UserDefaults) inside the Capacitor shell and localStorage
 * in the browser.
 *
 * Tokens are deliberately kept out of the persisted Pinia state so they are never
 * written into the same plaintext blob as the rest of the app's storage.
 *
 * NOTE: Preferences is not an encrypted keystore. On native this is a slight
 * downgrade from expo-secure-store's Keychain/Keystore backing; swapping in a
 * secure-storage Capacitor plugin later only changes this file.
 */

export interface StoredTokens {
  accessToken: string
  refreshToken: string | null
  // Unix timestamp (seconds) when the access token expires, as returned by the backend.
  expiredAt: number | null
}

const ACCESS_TOKEN_KEY = 'auth.accessToken'
const REFRESH_TOKEN_KEY = 'auth.refreshToken'
const EXPIRED_AT_KEY = 'auth.expiredAt'

const setItem = (key: string, value: string) => Preferences.set({ key, value })
const getItem = async (key: string) => (await Preferences.get({ key })).value
const removeItem = (key: string) => Preferences.remove({ key })

export async function saveTokens(tokens: StoredTokens): Promise<void> {
  await Promise.all([
    setItem(ACCESS_TOKEN_KEY, tokens.accessToken),
    tokens.refreshToken
      ? setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
      : removeItem(REFRESH_TOKEN_KEY),
    tokens.expiredAt != null
      ? setItem(EXPIRED_AT_KEY, String(tokens.expiredAt))
      : removeItem(EXPIRED_AT_KEY),
  ])
}

export async function loadTokens(): Promise<StoredTokens | null> {
  const [accessToken, refreshToken, expiredAtRaw] = await Promise.all([
    getItem(ACCESS_TOKEN_KEY),
    getItem(REFRESH_TOKEN_KEY),
    getItem(EXPIRED_AT_KEY),
  ])

  if (!accessToken) return null

  return {
    accessToken,
    refreshToken: refreshToken ?? null,
    expiredAt: expiredAtRaw ? Number(expiredAtRaw) : null,
  }
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    removeItem(ACCESS_TOKEN_KEY),
    removeItem(REFRESH_TOKEN_KEY),
    removeItem(EXPIRED_AT_KEY),
  ])
}
