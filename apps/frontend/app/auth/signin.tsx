import React, { useEffect, useState } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginSchema } from '../../validator/auth/authValidation'
import { useTranslation } from 'react-i18next'
import { AuthService } from '@/services/authService'
import { useApi } from '@/hooks/useApi'
import { router, useLocalSearchParams } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { FormControlErrorText, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control'
import { InputField, InputIcon, InputSlot } from '@/components/ui/input'
import FormInput from '@/components/custom/auth-form/form-input'
import { Pressable } from '@/components/ui/pressable'
import HeadingText from '@/components/custom/heading-text/heading-text'
import FormControl from '@/components/custom/auth-form/form-control'
import { VStack } from '@/components/ui/vstack'
import Link from '@/components/custom/link/link'
import FormActionButton from '@/components/custom/auth-form/form-action-button'
import { useAlert } from 'contexts/alert/alert'

export default function SignInScreen() {
  const { t } = useTranslation()
  const { from } = useLocalSearchParams()
  const { login } = useAuth()
  const [text, setText] = useState(t('signinTitle'))

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

  const links: { href: string, text: string }[] = [
    {
      text: t('signupDescription'),
      href: '/auth/signup',
    },
    {
      text: t('forgetPasswordDescription'),
      href: '/auth/forget-password',
    },
  ]

  useEffect(() => {
    const text = from === 'signup'
      ? t('signinAfterSignup')
      : from === 'resetPassword' ? t('signinAfterResetPasswordTitle') : t('signinTitle')

    setText(text)
  }, [from])

  const [showPassword, setShowPassword] = useState(false)

  const showAlert = useAlert()

  const onSubmitSignIn = async (data: LoginSchema) => {
    const res = await api.login(data.email, data.password)
    if (res) {
      console.log('Login successful:', res)
      login(res.user, res.token)
      router.replace('/(authenticated)')
    }
    else if (error) {
      console.error('Login failed:', error)
      showAlert(t('loginFailed'), t('loginErrorMessage'))
    }
  }

  return (
    <>
      <HeadingText text={text} />
      <FormControl>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <FormControlLabel><FormControlLabelText>{t('email')}</FormControlLabelText></FormControlLabel>
              <FormInput isError={!!errors.email}>
                <InputField
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={t('emailPlaceholder')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="font-sans"
                />
              </FormInput>
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
              <FormInput isError={!!errors.password}>
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
              </FormInput>
              {errors.password && <FormControlErrorText className="mt-1">{errors.password.message}</FormControlErrorText>}
            </>
          )}
        >
        </Controller>
        <FormActionButton onPress={() => void handleSubmit(onSubmitSignIn)()} isDisabled={loading || !!Object.keys(errors).length} text={t('signin')} />
      </FormControl>
      <VStack className="w-full mt-4 gap-2">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            text={link.text}
          />
        ))}
      </VStack>
    </>
  )
}
