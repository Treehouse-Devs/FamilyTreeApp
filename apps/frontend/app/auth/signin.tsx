import React, { useEffect, useState } from 'react'
import { router } from 'expo-router'
import { EyeIcon, EyeOffIcon } from 'lucide-react-native'
import { Alert } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginSchema } from '../../validator/auth/authValidation'
import { useTranslation } from 'react-i18next'
import { AuthService } from '@/services/authService'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/hooks/useAuth'
import { FormControlErrorText, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control'
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input'
import { Pressable } from '@/components/ui/pressable'
import { Button, ButtonText } from '@/components/ui/button'
import { buttonStyle, buttonTextStyle, inputStyle } from '@/components/auth/shared-styles'
import { useAlert } from './_layout'

export default function SignInScreen() {
  const { t } = useTranslation()
  const { setAlert } = useAlert()
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const {
    loading,
    error,
    api,
  } = useApi(AuthService)
  const { login } = useAuth()

  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (error) {
      setAlert({ type: 'error', message: error.message.startsWith('403') ? t('emailNotVerified') : error.message })
    }
  }, [error])

  const onSubmitSignIn = async (data: LoginSchema) => {
    const res = await api.login(data.email, data.password)
    if (res?.accessToken) {
      console.log('Login successful:', res)
      login(res.user, res.accessToken, res.refreshToken)
      router.replace('/(authenticated)')
    } else if (error) {
      console.error('Login failed:', error)
      Alert.alert(t('loginFailed'), t('loginErrorMessage'))
    }
  }

  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <FormControlLabel><FormControlLabelText>{t('email')}</FormControlLabelText></FormControlLabel>
            <Input className={inputStyle(!!errors.email)}>
              <InputField
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('emailPlaceholder')}
                keyboardType="email-address"
                autoCapitalize="none"
                className="font-sans"
              />
            </Input>
            {errors.email && <FormControlErrorText className="mt-1">{errors.email.message}</FormControlErrorText>}
          </>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <FormControlLabel className="mt-4"><FormControlLabelText>{t('password')}</FormControlLabelText></FormControlLabel>
            <Input className={inputStyle(!!errors.password)}>
              <InputField
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('passwordPlaceholder')}
                type={showPassword ? 'text' : 'password'}
                className="font-sans"
              />
              <InputSlot className="pe-3">
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <InputIcon as={showPassword ? EyeOffIcon : EyeIcon} />
                </Pressable>
              </InputSlot>
            </Input>
            {errors.password && <FormControlErrorText className="mt-1">{errors.password.message}</FormControlErrorText>}
          </>
        )}
      >
      </Controller>

      <Button action="secondary" onPress={() => void handleSubmit(onSubmitSignIn)()} className={buttonStyle(loading || !isValid)}>
        <ButtonText className={buttonTextStyle(loading || !isValid)}>{t('signin')}</ButtonText>
      </Button>
    </>
  )
}
