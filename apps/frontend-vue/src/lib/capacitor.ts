import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { SplashScreen } from '@capacitor/splash-screen'
import { StatusBar, Style } from '@capacitor/status-bar'
import type { Router } from 'vue-router'

/**
 * Native shell wiring. Replaces the RN root layout's `SplashScreen.hide()` and
 * `<StatusBar />`, plus the hardware back-button handling expo-router did for free.
 *
 * Every call is guarded by `isNativePlatform()` so the same bootstrap runs
 * unchanged in a desktop browser.
 */
export async function initNativeShell(router: Router): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  // The RN app pins `userInterfaceStyle: light`, so dark status bar content.
  await StatusBar.setStyle({ style: Style.Light }).catch(() => undefined)

  // Android's hardware back should walk router history and only then exit —
  // without this the default is to close the app from any screen.
  await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack && router.currentRoute.value.name !== 'welcome') {
      router.back()
    } else {
      void CapacitorApp.exitApp()
    }
  })

  // Deep links for the `familytree://` scheme the RN app registers in app.json.
  await CapacitorApp.addListener('appUrlOpen', ({ url }) => {
    const path = url.split('://').pop()
    if (path) void router.push(`/${path.replace(/^\/+/, '')}`)
  })
}

/** Called once the first view is ready, mirroring the RN app's post-font hide. */
export async function hideSplash(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  await SplashScreen.hide().catch(() => undefined)
}
