import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { clearTokens, loadTokens, saveTokens } from '@/lib/tokenStorage'

/**
 * Ported from the RN app's `store/slices/auth`.
 *
 * One deliberate change: the RN auth slice holds the whole login payload under
 * `user: unknown`, which collides with the user slice's `user: UserResponseDto`
 * in the merged zustand store — both slices declare the same key, and the user
 * slice is spread last so it silently wins. The only thing auth actually needs
 * from that payload is `uid` (for the refresh-token call), so this store keeps
 * `uid` and nothing else. The profile lives in `stores/user.ts`.
 *
 * Tokens are mirrored into secure storage on every write and are never part of
 * the persisted Pinia blob.
 */
export const useAuthStore = defineStore('auth', () => {
  const uid = ref<string | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const expiredAt = ref<number | null>(null)

  const isLoggedIn = computed(() => !!accessToken.value)

  function login(payload: {
    uid: string
    accessToken: string
    refreshToken?: string | null
    expiredAt?: number | null
  }) {
    const normalizedRefresh = payload.refreshToken ?? null
    const normalizedExpiry = payload.expiredAt ?? null

    uid.value = payload.uid
    accessToken.value = payload.accessToken
    refreshToken.value = normalizedRefresh
    expiredAt.value = normalizedExpiry

    void saveTokens({
      accessToken: payload.accessToken,
      refreshToken: normalizedRefresh,
      expiredAt: normalizedExpiry,
    })
  }

  /** Updates just the tokens (e.g. after a silent refresh) without touching `uid`. */
  function setTokens(tokens: {
    accessToken: string
    refreshToken: string | null
    expiredAt: number | null
  }) {
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    expiredAt.value = tokens.expiredAt

    void saveTokens(tokens)
  }

  function logout() {
    uid.value = null
    accessToken.value = null
    refreshToken.value = null
    expiredAt.value = null

    void clearTokens()
  }

  /**
   * Pulls tokens out of secure storage into memory. Replaces the RN store's
   * `onRehydrateStorage` hook; called once during app bootstrap.
   */
  async function initFromStorage() {
    try {
      const tokens = await loadTokens()
      if (tokens) {
        accessToken.value = tokens.accessToken
        refreshToken.value = tokens.refreshToken
        expiredAt.value = tokens.expiredAt
      }
    } catch (error) {
      console.error('Failed to load tokens from secure storage:', error)
    }
  }

  /**
   * `uid` is not persisted (it comes back with the profile fetch), so a session
   * restored from storage needs it re-seeded before a token refresh can run.
   */
  function setUid(value: string | null) {
    uid.value = value
  }

  return {
    uid,
    accessToken,
    refreshToken,
    expiredAt,
    isLoggedIn,
    login,
    setTokens,
    setUid,
    logout,
    initFromStorage,
  }
})
