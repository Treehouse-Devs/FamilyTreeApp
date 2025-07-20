import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ForgotPasswordSchema, forgotPasswordSchema } from '../../validator/auth/authValidation'
import { useTranslation } from 'react-i18next'
import { AuthService } from '@/services/authService'
import { useApi } from '@/hooks/useApi'
import { FormControlErrorText, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control'
import { InputField } from '@/components/ui/input'
import HeadingText from '@/components/custom/heading-text/heading-text'
import FormControl from '@/components/custom/auth-form/form-control'
import FormInput from '@/components/custom/auth-form/form-input'
import FormActionButton from '@/components/custom/auth-form/form-action-button'
import Link from '@/components/custom/link/link'
import { VStack } from '@/components/ui/vstack'
import ImageInfo from '@/components/custom/auth-form/image-info'
import Success from '@/assets/images/success.webp'
import { useAlert } from 'contexts/alert/alert'

const ForgetPasswordScreen = () => {
  const { t } = useTranslation()
  const [text, setText] = useState(t('forgetPasswordTitle'))
  const [isForgetPasswordSuccess, setIsForgetPasswordSuccess] = useState(false)
  const [links, setLinks] = useState<{ href: string, text: string }[]>([])

  useEffect(() => {
    setText(t('forgetPasswordTitle'))

    if (isForgetPasswordSuccess) {
      setLinks([])
    }
    else {
      setLinks([
        {
          text: t('rememberPasswordDescription'),
          href: '/auth/signin',
        },
        {
          text: t('signupDescription'),
          href: '/auth/signup',
        },
      ])
    }
  }, [isForgetPasswordSuccess])

  return (
    <>
      <HeadingText text={text} />
      <FormControl>
        {!isForgetPasswordSuccess ? <ForgetPasswordFormSlot setIsForgetPasswordSuccess={setIsForgetPasswordSuccess} /> : <ForgetPasswordSuccessSlot /> }
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

const ForgetPasswordFormSlot = ({ setIsForgetPasswordSuccess }: { setIsForgetPasswordSuccess: (value: boolean) => void }) => {
  const { t } = useTranslation()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  })

  const {
    loading,
    error,
    api,
  } = useApi(AuthService)

  const showAlert = useAlert()

  const onSubmitForgetPassword = async (data: ForgotPasswordSchema) => {
    console.log('Reset password:', data)
    const res = await api.forgetPassword(data.email)
    if (res) {
      console.log('Reset password successful:', res)
      setIsForgetPasswordSuccess(true)
    }
    else if (error) {
      console.error('Reset password failed:', error)
      showAlert(t('resetPasswordFailed'), t('resetPasswordErrorMessage'))
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

      <FormActionButton onPress={() => void handleSubmit(onSubmitForgetPassword)()} isDisabled={loading || !!Object.keys(errors).length} text={t('resetPassword')} />
    </>
  )
}

const ForgetPasswordSuccessSlot = () => {
  const { t } = useTranslation()

  return (
    <ImageInfo
      image={Success}
      text={t('forgetPasswordSuccessTitle')}
    />
  )
}

export default ForgetPasswordScreen
