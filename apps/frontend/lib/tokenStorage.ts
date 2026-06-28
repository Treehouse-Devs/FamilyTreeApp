import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

/**
 * Secure, persistent storage for auth credentials.
 *
 * On native (iOS/Android) tokens are kept in the OS keystore via
 * expo-secure-store (Keychain / Keystore). On web — where SecureStore is not
 * available — we fall back to AsyncStorage. Tokens are intentionally kept out
 * of the AsyncStorage-backed zustand persist layer so they are never written
 * to plaintext app storage on a real device.
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

const isWeb = Platform.OS === 'web'

const setItem = (key: string, value: string) =>
  isWeb ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value)

const getItem = (key: string) =>
  isWeb ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key)

const removeItem = (key: string) =>
  isWeb ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key)

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
