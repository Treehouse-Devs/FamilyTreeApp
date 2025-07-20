import React, { useEffect } from 'react'
import { Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useApp } from '@/hooks/useApp'
import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, useFonts } from '@expo-google-fonts/plus-jakarta-sans'
import { GluestackUIProvider } from '../components/ui/gluestack-ui-provider'
import { CustomAlertProvider } from 'contexts/alert/alert'

import '@/global.css'

export default function RootLayout() {
  const { hydrated } = useApp()
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
    <GluestackUIProvider mode="light">
      <CustomAlertProvider>
        <StatusBar style="auto" />
        <Slot />
      </CustomAlertProvider>
    </GluestackUIProvider>
  )
}
