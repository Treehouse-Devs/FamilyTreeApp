import { useUser } from '@/hooks/useUser'
import { useEffect, useRef } from 'react'
import { UserService } from '@/services/userService'

export const useFetchUser = ({ setIsUserFetched }: { setIsUserFetched: (value: boolean) => void }) => {
  const { user, setUser } = useUser()
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current) {
      setIsUserFetched(true)

      return
    }

    const fetchUser = async () => {
      try {
        const freshUser = await UserService.getProfile()
        setUser(freshUser)
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        hasFetched.current = true
        setIsUserFetched(true)
      }
    }

    void fetchUser()
  }, [setUser, setIsUserFetched])

  return { user }
}
