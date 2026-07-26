import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { UserService } from '@/services/userService'
import { useUserStore, type User } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import { queryKeys } from './keys'

/**
 * Replaces the RN app's `hooks/useFetchUser.ts`, which hand-rolled a "fetch once"
 * ref. TanStack Query's cache does that job, and the authenticated route guard
 * awaits this query instead of gating render on a `setIsUserFetched` callback.
 */
export function useProfile() {
  const userStore = useUserStore()
  const authStore = useAuthStore()

  return useQuery({
    queryKey: queryKeys.profile(),
    queryFn: async () => {
      const profile = await UserService.getProfile()
      userStore.setUser(profile)
      // `uid` is not persisted, so a session restored from storage needs it
      // re-seeded here before a token refresh can run.
      authStore.setUid(profile.id)

      return profile
    },
    enabled: () => authStore.isLoggedIn,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const userStore = useUserStore()

  return useMutation({
    mutationFn: (profile: Partial<User>) => UserService.updateProfile(profile),
    onSuccess: (updated) => {
      userStore.setUser(updated)
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile() })
    },
  })
}
