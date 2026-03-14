import React, { createContext, useContext, useState } from 'react'
import { router, Slot, usePathname } from 'expo-router'

import '@/global.css'
import { FormControl } from '@/components/ui/form-control'
import { VStack } from '@/components/ui/vstack'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui/text'
import { Pressable } from '@/components/ui/pressable'
import authBackground from '@/assets/images/auth-background.webp'
import { Image, StyleSheet } from 'react-native'
import { Alert, AlertIcon, AlertText } from '@/components/ui/alert'
import { CheckCircle, Info } from 'lucide-react-native'

type AlertProps = {
  type: 'success' | 'error' | 'warning' | 'info' | 'muted'
  message: string
}

type AlertContextType = {
  alert: AlertProps | null
  setAlert: (alert: AlertProps | null) => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

export const useAlert = () => {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider')
  }

  return context
}

export default function RootLayout() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const [alert, setAlert] = useState<AlertProps | null>(null)

  let text = ''
  if (pathname === '/auth/signin') {
    text = t('signinTitle')
  } else if (pathname === '/auth/signup') {
    text = t('signupTitle')
  } else if (pathname === '/auth/forget-password') {
    text = t('forgetPasswordTitle')
  }

  const onNavigationClick = () => {
    setAlert(null)
    if (pathname === '/auth/signin') {
      router.push('/auth/signup')
    } else if (pathname === '/auth/signup') {
      router.replace('/auth/signin')
    } else if (pathname === '/auth/forget-password') {
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
    <AlertContext.Provider value={{ alert, setAlert }}>
      <VStack className="relative flex-1 w-full px-14 py-6 items-center justify-center">
        <Image
          source={authBackground}
          style={[StyleSheet.absoluteFillObject, { zIndex: -1 }]}
          resizeMode="cover"
        />
        <Text className="font-heading text-2xl text-primary-700 mb-8 mx-4">
          {text}
        </Text>
        {alert && (
          <Alert variant="solid" action={alert.type} className="mb-6">
            <AlertIcon as={alert.type === 'success' ? CheckCircle : Info} className={`text-${alert.type}-500`} />
            <AlertText>{alert.message}</AlertText>
          </Alert>
        )}
        <FormControl className="d-flex flex-column p-4 rounded-xl border-secondary-300 border-2 bg-secondary-0">
          <Slot />
        </FormControl>
        <VStack className="w-full mt-8 gap-2">
          {pathname === '/auth/forget-password' && (
            <Pressable onPress={onSignInClick}>
              <Text className="font-medium text-md text-center text-underline text-primary-700">
                {t('rememberPasswordDescription')}
              </Text>
            </Pressable>
          )}
          <Pressable onPress={onNavigationClick}>
            <Text className="font-medium text-md text-center text-underline text-primary-700">
              {t(
                pathname === '/auth/signin' || pathname === '/auth/forget-password'
                  ? 'signupDescription'
                  : 'signinDescription',
              )}
            </Text>
          </Pressable>
          {pathname === '/auth/signin' && (
            <Pressable onPress={onForgetPasswordClick}>
              <Text className="font-medium text-md text-center text-underline text-primary-700">
                {t('forgetPasswordDescription')}
              </Text>
            </Pressable>
          )}
        </VStack>
      </VStack>
    </AlertContext.Provider>
  )
}
