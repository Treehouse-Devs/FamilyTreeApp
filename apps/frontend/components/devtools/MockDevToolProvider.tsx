import React from 'react'
import { MockDevToolFAB } from './MockDevToolFAB'
import { MockDevToolPanel } from './MockDevToolPanel'

const ENABLE_DEVTOOLS = process.env.EXPO_PUBLIC_ENABLE_DEVTOOLS === 'true'

interface MockDevToolProviderProps {
  children: React.ReactNode
}

export function MockDevToolProvider({ children }: MockDevToolProviderProps) {
  if (!ENABLE_DEVTOOLS) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      <MockDevToolFAB />
      <MockDevToolPanel />
    </>
  )
}
