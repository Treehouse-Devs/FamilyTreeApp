import React, { useEffect } from 'react'
import { Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useApp } from '@/hooks/useApp'
import { useColorMode } from '@/hooks/useColorMode'
import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans'
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated'

import '@/global.css'
import { GluestackUIProvider } from '../components/ui/gluestack-ui-provider'

// Suppress false positive warning from nativewind's useColorScheme reading
// a shared value during render (library-level issue, not app code)
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
})

export default function RootLayout() {
  const { hydrated } = useApp()
  const { colorMode } = useColorMode()
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  })

  useEffect(() => {
    if (loaded || error || !hydrated) {
      SplashScreen.hide()
    }
  }, [loaded, error])

  if (!loaded && !error) {
    return null
  }

  return (
    <GluestackUIProvider mode={colorMode}>
      <StatusBar style="auto" />
      <Slot />
    </GluestackUIProvider>
  )
}
