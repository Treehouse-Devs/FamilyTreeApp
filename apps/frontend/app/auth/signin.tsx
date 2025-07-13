import React, { useState } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react-native'
import { Alert } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginSchema } from '../../validator/auth/authValidation'
import { useTranslation } from 'react-i18next'
import { AuthService } from '@/services/authService'
import { useApi } from '@/hooks/useApi'
import { Redirect, router } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { FormControlErrorText, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control'
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input'
import { Pressable } from '@/components/ui/pressable'
import { Button, ButtonText } from '@/components/ui/button'

export default function SignInScreen() {
  const { t } = useTranslation()
  const {
    control,
    handleSubmit,
    formState: { errors },
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
  const { login, isLoggedIn } = useAuth()

  const [showPassword, setShowPassword] = useState(false)

  if (isLoggedIn) {
    return <Redirect href="/(authenticated)" />
  }

  const onSubmitSignIn = async (data: LoginSchema) => {
    const res = await api.login(data.email, data.password)
    if (res) {
      console.log('Login successful:', res)
      login(res.data.user, res.data.token)
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
            <Input className={`w-4/5 d-flex max-w-80 rounded-md ${errors.email ? 'border-red-500' : 'border-primary-50'}`}>
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
            <Input className={`w-4/5d-flex max-w-80 rounded-md ${errors.password ? 'border-red-500' : 'border-primary-50'}`}>
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

      <Button onPress={() => void handleSubmit(onSubmitSignIn)()} isDisabled={loading || !!Object.keys(errors).length} className="mt-6 w-fit py-2 px-6 mx-auto rounded-md">
        <ButtonText>{t('signin')}</ButtonText>
      </Button>
    </>
  )
}
