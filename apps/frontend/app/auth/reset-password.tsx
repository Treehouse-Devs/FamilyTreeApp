import FormActionButton from '@/components/custom/auth-form/form-action-button'
import FormControl from '@/components/custom/auth-form/form-control'
import FormInput from '@/components/custom/auth-form/form-input'
import HeadingText from '@/components/custom/heading-text/heading-text'
import { FormControlErrorText, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control'
import { InputField, InputSlot } from '@/components/ui/input'
import { InputIcon } from '@/components/ui/input/index'
import { Pressable } from '@/components/ui/pressable'
import { useApi } from '@/hooks/useApi'
import { AuthService } from '@/services/authService'
import { resetPasswordSchema, ResetPasswordSchema } from '@/validator/auth/authValidation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAlert } from 'contexts/alert/alert'
import { router, useLocalSearchParams } from 'expo-router'
import { EyeIcon, EyeOffIcon } from 'lucide-react-native'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

const ResetPasswordScreen = () => {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const { email, token } = useLocalSearchParams<{ email: string, token: string }>()

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const { loading, error, api } = useApi(AuthService)

  const showAlert = useAlert()

  const onSubmitResetPassword = async (data: ResetPasswordSchema) => {
    console.log('Reset password:', data)
    const res = await api.resetPassword(email, data.password, token)
    if (res) {
      console.log('Reset password successful:', res)
      router.push({ pathname: '/auth/signin', params: { from: 'resetPassword' } })
    }
    else if (error) {
      console.error('Reset password failed')
      showAlert(t('resetPasswordErrorTitle'), t('resetPasswordErrorMessage'))
    }
  }

  return (
    <>
      <HeadingText text={t('resetPasswordTitle')} />
      <FormControl>
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
          onPress={() => void handleSubmit(onSubmitResetPassword)()}
          text={loading ? t('resettingPassword') : t('resetPassword')}
          isDisabled={loading || !!Object.keys(errors).length}
          isLoading={loading}
        />
      </FormControl>
    </>
  )
}

export default ResetPasswordScreen
