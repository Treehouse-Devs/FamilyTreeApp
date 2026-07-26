import type { Router } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

/**
 * Replaces the two redirect gates the RN app implements as components:
 *   - `app/(authenticated)/_layout.tsx` — `if (!isLoggedIn) <Redirect href="/" />`
 *   - `app/index.tsx` — logged in -> `/(authenticated)`, else seen welcome -> signin
 *
 * Doing it in a navigation guard rather than during render means an unauthenticated
 * deep link never mounts the protected page at all.
 */
export function installGuards(router: Router) {
  router.beforeEach((to) => {
    const auth = useAuthStore()
    const app = useAppStore()

    // Bootstrap reads tokens from storage before mounting, so `hydrated` is
    // already true here; the check guards against a navigation racing ahead of
    // that if bootstrap order ever changes.
    if (!app.hydrated) return true

    if (to.meta.requiresAuth && !auth.isLoggedIn) {
      return { name: 'welcome' }
    }

    // The entry screen is a router, not a destination.
    if (to.name === 'welcome') {
      if (auth.isLoggedIn) return { name: 'trees' }
      if (app.hasSeenWelcome) return { name: 'signin' }
    }

    // A signed-in user has no reason to see the auth screens.
    if (to.meta.public && !to.meta.standalone && to.name !== 'welcome' && auth.isLoggedIn) {
      return { name: 'trees' }
    }

    return true
  })
}
