import React, { useState } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react-native'
import { Alert } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterSchema } from '../../validator/auth/authValidation'
import { useTranslation } from 'react-i18next'
import { AuthService } from '@/services/authService'
import { useApi } from '@/hooks/useApi'
import { router } from 'expo-router'
import { FormControlErrorText, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control'
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input'
import { Pressable } from '@/components/ui/pressable'
import { Button, ButtonText } from '@/components/ui/button'

export default function SignUpScreen() {
  const { t } = useTranslation()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const {
    loading,
    error,
    api,
  } = useApi(AuthService)

  const [showPassword, setShowPassword] = useState(false)

  const onSubmitSignUp = async (data: RegisterSchema) => {
    const res = await api.register(data.name, data.email, data.password)
    if (res) {
      console.log('Register successful:', res)
      router.replace({ pathname: '/auth/signin', params: { from: 'signup' } })
    }
    else if (error) {
      console.error('Register failed:', error)
      Alert.alert(t('signupFailed'), t('signupErrorMessage'))
    }
  }

  return (
    <>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <FormControlLabel><FormControlLabelText>{t('name')}</FormControlLabelText></FormControlLabel>
            <Input className={`w-4/5 d-flex max-w-80 rounded-md ${errors.name ? 'border-red-500' : 'border-primary-50'}`}>
              <InputField
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('namePlaceholder')}
                type="text"
                autoCapitalize="words"
                className="font-sans"
              />
            </Input>
            {errors.name && <FormControlErrorText className="mt-1">{errors.name.message}</FormControlErrorText>}
          </>
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <FormControlLabel className="mt-4"><FormControlLabelText>{t('email')}</FormControlLabelText></FormControlLabel>
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
      >
      </Controller>

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <FormControlLabel className="mt-4"><FormControlLabelText>{t('password')}</FormControlLabelText></FormControlLabel>
            <Input className={`w-4/5 d-flex max-w-80 rounded-md ${errors.password ? 'border-red-500' : 'border-primary-50'}`}>
              <InputField
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('passwordPlaceholder')}
                type={showPassword ? 'text' : 'password'}
                className="font-sans"
                autoCapitalize="none"
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

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <FormControlLabel className="mt-4"><FormControlLabelText>{t('confirmPassword')}</FormControlLabelText></FormControlLabel>
            <Input className={`w-4/5 d-flex max-w-80 rounded-md ${errors.confirmPassword ? 'border-red-500' : 'border-primary-50'}`}>
              <InputField
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('confirmPasswordPlaceholder')}
                type={showPassword ? 'text' : 'password'}
                className="font-sans"
                autoCapitalize="none"
              />
              <InputSlot className="pe-3">
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <InputIcon as={showPassword ? EyeOffIcon : EyeIcon} />
                </Pressable>
              </InputSlot>
            </Input>
            {errors.confirmPassword && <FormControlErrorText className="mt-1">{errors.confirmPassword.message}</FormControlErrorText>}
          </>
        )}
      >
      </Controller>
      <Button onPress={() => void handleSubmit(onSubmitSignUp)()} isDisabled={loading || !!Object.keys(errors).length} className="mt-8 w-fit py-2 px-6 mx-auto rounded-md">
        <ButtonText>{t('signup')}</ButtonText>
      </Button>
    </>
  )
}
