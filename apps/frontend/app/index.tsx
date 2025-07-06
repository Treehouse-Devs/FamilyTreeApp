import { router } from 'expo-router'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useApp } from '@/hooks/useApp'
import { VStack } from '@/components/ui/vstack'
import { Text } from '@/components/ui/text'
import { Button, ButtonText } from '@/components/ui/button'
import { Image } from '@/components/ui/image'
import welcomeImage from '@/assets/images/welcome.webp'

export default function WelcomeScreen() {
  const { t } = useTranslation()
  const { setHasSeenWelcome, hasSeenWelcome } = useApp()

  // if (hasSeenWelcome) {
  //   return <Redirect href="/auth/signin" />
  // }

  useEffect(() => {
    console.log('WelcomeScreen mounted')
  }, [])

  const handleSignIn = () => {
    setHasSeenWelcome(true)
    router.push('/auth/signin')
  }

  return (
    <VStack className="flex-1 items-center justify-center bg-background-00 mt-[50%] py-4 px-8">
      <Text className="font-heading text-4xl font-bold mb-4">
        {t('welcomeMessage')}
      </Text>
      <Text className="font-sans text-lg mb-6">
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
