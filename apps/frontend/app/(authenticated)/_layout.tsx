import { Slot, Redirect } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { StatusBar } from 'expo-status-bar'

export default function AppLayout() {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    return <Redirect href="/" />
  }

  return (
    <>
      <StatusBar style="auto" />
      <Slot />
    </>
  )
}
