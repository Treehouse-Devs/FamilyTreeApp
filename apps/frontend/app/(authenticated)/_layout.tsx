import { Slot, Redirect } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import { useFetchUser } from '@/hooks/useFetchUser'
import { ActivityIndicator, View } from 'react-native'

export default function AppLayout() {
  const { isLoggedIn } = useAuth()
  const [isUserFetched, setIsUserFetched] = useState(false)

  useFetchUser({ setIsUserFetched })

  if (!isLoggedIn) {
    return <Redirect href="/" />
  }

  if (!isUserFetched) {
    return (
      <View className="flex-1 items-center justify-center bg-primary-0">
        <ActivityIndicator />
      </View>
    )
  }

  return <Slot />
}
