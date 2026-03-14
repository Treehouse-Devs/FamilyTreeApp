import React, { useEffect, useRef } from 'react'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { AuthService } from '@/services/authService'
import { useApi } from '@/hooks/useApi'
import { useAlert } from './_layout'
import SignUpStep1, { type Step1Data } from '@/components/auth/SignUpStep1'
import SignUpStep2, { type Step2Data } from '@/components/auth/SignUpStep2'
import { useState } from 'react'

export default function SignUpScreen() {
  const { t } = useTranslation()
  const { setAlert } = useAlert()
  const { loading, error, api } = useApi(AuthService)

  const [step, setStep] = useState<1 | 2>(1)
  const step1DataRef = useRef<Step1Data | null>(null)

  useEffect(() => {
    if (error) {
      setAlert({ type: 'error', message: error.message.startsWith('409') ? t('emailAlreadyExists') : error.message })
    }
  }, [error, setAlert])

  const handleStep1Next = (data: Step1Data) => {
    step1DataRef.current = data
    setStep(2)
  }

  const handleStep2Submit = async (data: Step2Data) => {
    const step1 = step1DataRef.current
    if (!step1) return

    const res = await api.register({
      ...step1,
      ...data,
    })

    if (res) {
      setAlert({ type: 'success', message: t('signupSuccess') })
      router.replace({ pathname: '/auth/signin' })
    }
  }

  if (step === 1) {
    return <SignUpStep1 onNext={handleStep1Next} />
  }

  return <SignUpStep2 onSubmit={handleStep2Submit} loading={loading} />
}
