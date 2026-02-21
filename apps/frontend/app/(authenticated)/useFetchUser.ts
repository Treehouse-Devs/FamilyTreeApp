import { useUser } from '@/hooks/useUser'
import { useEffect } from 'react'
import { UserService } from '@/services/userService'

export const useFetchUser = ({ setIsUserFetched }: { setIsUserFetched: (value: boolean) => void }) => {
  const { user, setUser } = useUser()

  useEffect(() => {
    if (user) {
      setIsUserFetched(true)

      return
    }

    const fetchUser = async () => {
      try {
        const user = await UserService.getProfile()
        setUser(user)
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setIsUserFetched(true)
      }
    }

    void fetchUser()
  }, [user, setUser, setIsUserFetched])

  return { user }
}
