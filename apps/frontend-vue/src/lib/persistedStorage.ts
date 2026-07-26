import { Preferences } from '@capacitor/preferences'
import type { StorageLike } from 'pinia-plugin-persistedstate'

/**
 * Bridges `@capacitor/preferences` to the synchronous `StorageLike` interface
 * pinia-plugin-persistedstate expects.
 *
 * The RN app has the same shape of problem — zustand's `persist` needs storage,
 * AsyncStorage is async — and solves it by hydrating asynchronously. Here we keep
 * an in-memory mirror that is filled once by `hydratePersistedStorage()` before
 * the app mounts, so reads are synchronous while writes fan out to Preferences.
 */

const cache = new Map<string, string>()

/** Keys the persisted stores use. Must match each store's `persist.key`. */
export const PERSISTED_KEYS = ['app-storage', 'user-storage'] as const

/**
 * Loads persisted values into the synchronous cache. Must be awaited before
 * `app.use(pinia)` so stores read real values on first access instead of
 * initialising empty and flashing default state.
 */
export async function hydratePersistedStorage(): Promise<void> {
  await Promise.all(
    PERSISTED_KEYS.map(async (key) => {
      const { value } = await Preferences.get({ key })
      if (value !== null) cache.set(key, value)
    }),
  )
}

export const capacitorStorage: StorageLike = {
  getItem: (key: string) => cache.get(key) ?? null,

  setItem: (key: string, value: string) => {
    cache.set(key, value)
    void Preferences.set({ key, value })
  },
}

/** Clears a persisted key from both the cache and device storage. */
export function clearPersistedKey(key: string): void {
  cache.delete(key)
  void Preferences.remove({ key })
}
