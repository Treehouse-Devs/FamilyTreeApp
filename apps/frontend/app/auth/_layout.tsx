import React from 'react'
import { router, Slot, useLocalSearchParams, usePathname } from 'expo-router'

import '@/global.css'
import { FormControl } from '@/components/ui/form-control'
import { VStack } from '@/components/ui/vstack'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui/text'
import { Pressable } from '@/components/ui/pressable'

export default function RootLayout() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const { from } = useLocalSearchParams()

  let text = ''
  if (pathname === '/auth/signin') {
    text = from === 'signup'
      ? t('signinAfterSignup')
      : from === 'resetPassword' ? t('signinAfterResetPasswordTitle') : t('signinTitle')
  }
  else if (pathname === '/auth/signup') {
    text = t('signupTitle')
  }
  else if (pathname === '/auth/forget-password') {
    text = t('forgetPasswordTitle')
  }

  const onNavigationClick = () => {
    if (pathname === '/auth/signin') {
      router.push('/auth/signup')
    }
    else if (pathname === '/auth/signup') {
      router.replace('/auth/signin')
    }
    else if (pathname === '/auth/forget-password') {
      router.push('/auth/signup')
    }
  }

  const onSignInClick = () => {
    router.push('/auth/signin')
  }

  const onForgetPasswordClick = () => {
    if (pathname === '/auth/signin') {
      router.push('/auth/forget-password')
    }
  }

  return (
    <VStack
      className="px-14 py-6 w-full h-full items-center justify-center bg-background-50"
    >
      <Text className="font-heading text-2xl text-primary-500 mb-4 mx-4">{text}</Text>
      <FormControl className="d-flex flex-column p-4 border rounded-xl border-primary-50 bg-white">
        <Slot />
      </FormControl>
      <VStack className="w-full mt-4 gap-2">
        {pathname === '/auth/forget-password' && (
          <Pressable onPress={onSignInClick}>
            <Text className="font-medium text-md text-center text-underline text-primary-500">
              {t('rememberPasswordDescription')}
            </Text>
          </Pressable>
        )}
        <Pressable onPress={onNavigationClick}>
          <Text className="font-medium text-md text-center text-underline text-primary-500">
            {t(pathname === '/auth/signin' || pathname === '/auth/forget-password' ? 'signupDescription' : 'signinDescription')}
          </Text>
        </Pressable>
        {pathname === '/auth/signin' && (
          <Pressable onPress={onForgetPasswordClick}>
            <Text className="font-medium text-md text-center text-underline text-primary-500">
              {t('forgetPasswordDescription')}
            </Text>
          </Pressable>
        )}
      </VStack>
    </VStack>
  )
}
