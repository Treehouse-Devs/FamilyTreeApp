import { router, Redirect } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useApp'
import { useAuth } from '@/hooks/useAuth'
import { VStack } from '@/components/ui/vstack'
import { Text } from '@/components/ui/text'
import { Button, ButtonText } from '@/components/ui/button'
import { Image } from '@/components/ui/image'
import welcomeImage from '@/assets/images/welcome2.webp'
import welcomeBackground from '@/assets/images/welcome-background.webp'
import { Image as NativeImage, StyleSheet } from 'react-native'

export default function WelcomeScreen() {
  const { t } = useTranslation()
  const { setHasSeenWelcome, hasSeenWelcome } = useApp()
  const { isLoggedIn } = useAuth()

  // Auto-redirect to authenticated area when mock data is enabled (bypasses login)
  if (isLoggedIn) {
    return <Redirect href="/(authenticated)" />
  }

  // if (hasSeenWelcome) {
  //   return <Redirect href="/auth/signin" />
  // }

  const handleSignIn = () => {
    setHasSeenWelcome(true)
    router.push('/auth/signin')
  }

  return (
    <VStack className="flex-1 items-center justify-center py-4 px-8">
      <NativeImage
        source={welcomeBackground}
        style={[StyleSheet.absoluteFillObject, { zIndex: -1 }]}
        resizeMode="cover"
      />
      <Text className="font-heading text-4xl font-bold mt-[50%] mb-4">
        {t('welcomeMessage')}
      </Text>
      <Text className="font-sans text-lg mb-8">
        {t('welcomeDescription')}
      </Text>
      <Image
        source={welcomeImage}
        className="w-full h-64 mb-6 rounded-2xl"
        resizeMode="cover"
        alt={t('welcomeMessage')}
      />
      <Button onPress={handleSignIn} className="w-full py-4 mt-auto mb-12 h-fit rounded-xl">
        <ButtonText className="font-heading text-lg font-semibold">
          {t('startCreating')}
        </ButtonText>
      </Button>
    </VStack>
  )
}
