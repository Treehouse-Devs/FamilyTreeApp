import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { VueQueryPlugin } from '@tanstack/vue-query'

import './assets/styles/main.css'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { queryClient } from './lib/queryClient'
import { hydratePersistedStorage } from './lib/persistedStorage'
import { hideSplash, initNativeShell } from './lib/capacitor'
import { useAppStore } from './stores/app'
import { useAuthStore } from './stores/auth'

/**
 * Bootstrap order matters here, and mirrors what the RN app does across its
 * store's `onRehydrateStorage` hook and root layout:
 *
 *   1. read persisted state out of device storage into the synchronous cache
 *   2. install Pinia, so stores initialise from that cache rather than defaults
 *   3. pull auth tokens out of secure storage
 *   4. flip `hydrated` — only now may route guards make a redirect decision
 *   5. mount
 *
 * Doing 3 and 4 before mount is what stops a logged-in user from being bounced to
 * the welcome screen for a frame while their session is still loading.
 */
async function bootstrap() {
  await hydratePersistedStorage()

  const app = createApp(App)

  const pinia = createPinia()
  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)

  const authStore = useAuthStore()
  const appStore = useAppStore()

  await authStore.initFromStorage()
  appStore.setHydrated(true)

  app.use(router)
  app.use(i18n)
  app.use(VueQueryPlugin, { queryClient })

  await initNativeShell(router)

  await router.isReady()
  app.mount('#app')

  void hideSplash()
}

void bootstrap()
