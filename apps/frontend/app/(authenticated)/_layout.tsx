import { Slot, Redirect } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'

export default function AppLayout() {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    return <Redirect href="/" />
  }

  return <Slot />
}
