import type { CapacitorConfig } from '@capacitor/cli'

// NOTE: intentionally distinct from the React Native app's `com.anonymous.familytree`
// so both builds can be installed side by side during the migration. This has to be
// renamed before the Vue app takes over the Play Store listing.
const config: CapacitorConfig = {
  appId: 'com.anonymous.familytree.vue',
  appName: 'Family Tree',
  webDir: 'dist',
  android: {
    // Matches the RN app's `userInterfaceStyle: light`.
    backgroundColor: '#ffffff',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#ffffff',
      androidScaleType: 'CENTER_CROP',
    },
  },
}

export default config
