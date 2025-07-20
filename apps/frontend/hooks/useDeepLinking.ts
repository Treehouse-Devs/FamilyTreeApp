// hooks/useDeepLinking.ts
import { useEffect, useState, useCallback } from 'react'
import * as Linking from 'expo-linking'
import { Linking as RNLinking } from 'react-native'

interface DeepLinkData {
  url: string
  path: string | null
  queryParams: Linking.QueryParams | null
}

export function useDeepLinking(onLink?: (data: DeepLinkData) => void) {
  const [lastLink, setLastLink] = useState<DeepLinkData | null>(null)

  const handleUrl = useCallback((url: string) => {
    const { path, queryParams } = Linking.parse(url)
    const data: DeepLinkData = { url, path, queryParams }
    setLastLink(data)

    if (onLink) {
      onLink(data)
    }
  }, [onLink])

  useEffect(() => {
    // Listen for links while app is running
    const subscription = RNLinking.addEventListener('url', ({ url }) => {
      handleUrl(url)
    })

    // Handle initial URL when app launches from a deep link
    const checkInitialUrl = async () => {
      const initialUrl = await RNLinking.getInitialURL()
      if (initialUrl) {
        handleUrl(initialUrl)
      }
    }

    void checkInitialUrl()

    return () => {
      subscription.remove()
    }
  }, [handleUrl])

  return lastLink
}
