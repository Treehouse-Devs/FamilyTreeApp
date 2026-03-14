import React, { useState } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerStep1Schema } from '@/validator/auth/authValidation'
import type { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { FormControlErrorText, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control'
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input'
import { Pressable } from '@/components/ui/pressable'
import { Button, ButtonText } from '@/components/ui/button'
import { buttonStyle, buttonTextStyle, inputStyle } from '@/components/auth/shared-styles'

export type Step1Data = z.infer<typeof registerStep1Schema>

type SignUpStep1Props = {
  onNext: (data: Step1Data) => void
}

export default function SignUpStep1({ onNext }: SignUpStep1Props) {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Step1Data>({
    resolver: zodResolver(registerStep1Schema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

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
            <Input className={inputStyle(!!errors.confirmPassword)}>
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

      <Button
        action="secondary"
        onPress={() => void handleSubmit(onNext)()}
        className={buttonStyle(!isValid)}
      >
        <ButtonText className={buttonTextStyle(!isValid)}>{t('next')}</ButtonText>
      </Button>
    </>
  )
}
