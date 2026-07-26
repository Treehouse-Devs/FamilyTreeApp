import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { UserResponseDto } from '@treely/dto/client'
import { capacitorStorage } from '@/lib/persistedStorage'

export type User = UserResponseDto

/**
 * Ported from the RN app's `store/slices/user`. Owns the user's profile — and,
 * unlike the RN store, is now the only place a `user` lives (see `stores/auth.ts`).
 */
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)

  function setUser(value: User) {
    user.value = value
  }

  function clearUser() {
    user.value = null
  }

  return { user, setUser, clearUser }
}, {
  persist: {
    key: 'user-storage',
    storage: capacitorStorage,
    pick: ['user'],
  },
})
