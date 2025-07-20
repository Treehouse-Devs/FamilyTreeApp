import React, { useEffect, useState } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, RegisterSchema } from '../../validator/auth/authValidation'
import { useTranslation } from 'react-i18next'
import { AuthService } from '@/services/authService'
import { useApi } from '@/hooks/useApi'
import { FormControlErrorText, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control'
import { InputField, InputIcon, InputSlot } from '@/components/ui/input'
import FormInput from '@/components/custom/auth-form/form-input'
import { Pressable } from '@/components/ui/pressable'
import congratulation from '@/assets/images/congratulation.webp'
import { VStack } from '@/components/ui/vstack'
import HeadingText from '@/components/custom/heading-text/heading-text'
import FormControl from '@/components/custom/auth-form/form-control'
import FormActionButton from '@/components/custom/auth-form/form-action-button'
import Link from '@/components/custom/link/link'
import ImageInfo from '@/components/custom/auth-form/image-info'
import { useAuth } from '@/hooks/useAuth'
import { useAlert } from 'contexts/alert/alert'

const SignUpScreen = () => {
  const { t } = useTranslation()
  const [text, setText] = useState(t('signupTitle'))
  const [isSignUpSuccess, setIsSignUpSuccess] = useState(false)
  const [links, setLinks] = useState<{ href: string, text: string }[]>([])

  useEffect(() => {
    setText(t('signupTitle'))
  }, [])

  useEffect(() => {
    setText(isSignUpSuccess ? t('signupSuccess') : t('signupTitle'))

    if (isSignUpSuccess) {
      setLinks([])
    }
    else {
      setLinks([
        {
          text: t('signinDescription'),
          href: '/auth/signin',
        },
        {
          text: t('forgetPasswordDescription'),
          href: '/auth/forget-password',
        },
      ])
    }
  }, [isSignUpSuccess])

  return (
    <>
      <HeadingText text={text} />
      <FormControl>
        {!isSignUpSuccess ? <SignUpFormSlot setIsSignUpSuccess={setIsSignUpSuccess} /> : <SignUpSuccessSlot />}
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

const SignUpFormSlot = ({ setIsSignUpSuccess }: { setIsSignUpSuccess: (value: boolean) => void }) => {
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

  const { setVerifyEmailData, verifyEmailData } = useAuth()

  const [showPassword, setShowPassword] = useState(false)

  const showAlert = useAlert()

  const onSubmitSignUp = async (data: RegisterSchema) => {
    if (data.email === verifyEmailData?.email) {
      showAlert(t('signupError'), t('signupAlreadyExists'))
      return
    }

    const res = await api.register(data.name, data.email, data.password)
    if (res) {
      console.log('Register successful:', res)
      setIsSignUpSuccess(true)
      setVerifyEmailData({ email: data.email, token: res.token })
    }
    else if (error) {
      console.error('Register failed:', error)
      showAlert(t('signupFailed'), t('signupErrorMessage'))
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
            <FormInput isError={!!errors.name}>
              <InputField
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('namePlaceholder')}
                type="text"
                autoCapitalize="words"
                className="font-sans"
              />
            </FormInput>
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
      >
      </Controller>

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
                autoCapitalize="none"
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

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <FormControlLabel className="mt-4"><FormControlLabelText>{t('confirmPassword')}</FormControlLabelText></FormControlLabel>
            <FormInput isError={!!errors.confirmPassword}>
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
            </FormInput>
            {errors.confirmPassword && <FormControlErrorText className="mt-1">{errors.confirmPassword.message}</FormControlErrorText>}
          </>
        )}
      >
      </Controller>
      <FormActionButton
        onPress={() => void handleSubmit(onSubmitSignUp)()}
        text={loading ? t('signingup') : t('signup')}
        isDisabled={loading || !!Object.keys(errors).length}
        isLoading={loading}
      />
    </>
  )
}

const SignUpSuccessSlot = () => {
  const { t } = useTranslation()

  return (
    <ImageInfo
      image={congratulation}
      text={t('signupConfirmationMessage')}
    />
  )
}

export default SignUpScreen
