import React from 'react'
import { Slot } from 'expo-router'
import SplashScreen from './splash'
import { StatusBar } from 'expo-status-bar'
import { useApp } from '@/hooks/useApp'

import '@/global.css'
import { GluestackUIProvider } from '../components/ui/gluestack-ui-provider'

export default function RootLayout() {
  const { hydrated } = useApp()

  if (!hydrated) {
    return (
      <SplashScreen />
    )
  }

  return (
    <GluestackUIProvider mode="light">
      <StatusBar style="auto" />
      <Slot />
    </GluestackUIProvider>
  )
}
