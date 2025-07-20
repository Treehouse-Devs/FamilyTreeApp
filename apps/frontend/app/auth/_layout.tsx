import React from 'react'
import { Slot } from 'expo-router'
import { VStack } from '@/components/ui/vstack'

import '@/global.css'

export default function RootLayout() {
  return (
    <VStack
      className="px-14 py-6 w-full h-full items-center justify-center bg-background-50 relative"
    >
      <Slot />
    </VStack>
  )
}
