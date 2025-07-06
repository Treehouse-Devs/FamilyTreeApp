import React from 'react'
import { Alert } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, ForgotPasswordSchema } from '../../validator/auth/authValidation'
import { useTranslation } from 'react-i18next'
import { AuthService } from '@/services/authService'
import { useApi } from '@/hooks/useApi'
import { router } from 'expo-router'
import { FormControlErrorText, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control'
import { Input, InputField } from '@/components/ui/input'
import { Button, ButtonText } from '@/components/ui/button'

export default function ForgetPasswordScreen() {
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

  const onSubmitForgetPassword = async (data: ForgotPasswordSchema) => {
    console.log('Reset password:', data)
    const res = await api.resetPassword(data.email)
    if (res) {
      console.log('Reset password successful:', res)
      router.replace({ pathname: '/auth/signin', params: { from: 'resetPassword' } })
    }
    else if (error) {
      console.error('Reset password failed:', error)
      Alert.alert(t('resetPasswordFailed'), t('resetPasswordErrorMessage'))
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

      <Button onPress={() => void handleSubmit(onSubmitForgetPassword)()} isDisabled={loading || !!Object.keys(errors).length} className="mt-6 w-fit py-2 px-6 mx-auto rounded-md">
        <ButtonText>{t('resetPassword')}</ButtonText>
      </Button>
    </>
  )
}
