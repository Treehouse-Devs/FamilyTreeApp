import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerStep2Schema } from '@/validator/auth/authValidation'
import type { z } from 'zod'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg'
import { FormControlErrorText, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control'
import { Input, InputField } from '@/components/ui/input'
import { RadioGroup, RadioIndicator, RadioIcon, RadioLabel, Radio } from '@/components/ui/radio'
import { Button, ButtonText } from '@/components/ui/button'
import { buttonStyle, buttonTextStyle, inputStyle } from '@/components/auth/shared-styles'
import { HStack } from '@/components/ui/hstack'
import { ThemedDatePicker } from '@/components/custom/date-picker'
import { Modal } from '@/components/custom/modals/modal'

/** Filled dot with a radial gradient: solid secondary-800 at center, fading to transparent at the rim */
const RadioDot = () => (
  <Svg width={12} height={12} viewBox="0 0 12 12">
    <Defs>
      <RadialGradient id="radioDotGrad" cx="50%" cy="50%" r="50%">
        <Stop offset="0%" stopColor="rgb(118,79,59)" stopOpacity={1} />
        <Stop offset="80%" stopColor="rgb(118,79,59)" stopOpacity={1} />
        <Stop offset="100%" stopColor="rgb(118,79,59)" stopOpacity={0} />
      </RadialGradient>
    </Defs>
    <Circle cx={6} cy={6} r={6} fill="url(#radioDotGrad)" />
  </Svg>
)

export type Step2Data = z.infer<typeof registerStep2Schema>

type SignUpStep2Props = {
  onSubmit: (data: Step2Data) => void | Promise<void>
  loading: boolean
}

export default function SignUpStep2({ onSubmit, loading }: SignUpStep2Props) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const { t } = useTranslation()

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Step2Data>({
    resolver: zodResolver(registerStep2Schema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      gender: undefined,
      birthDate: undefined,
    },
  })

  return (
    <>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <FormControlLabel><FormControlLabelText>{t('name')}</FormControlLabelText></FormControlLabel>
            <Input className={inputStyle(!!errors.name)}>
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
        name="gender"
        render={({ field: { onChange, value } }) => (
          <>
            <FormControlLabel className="mt-4"><FormControlLabelText>{t('gender')}</FormControlLabelText></FormControlLabel>
            <RadioGroup value={value} onChange={onChange} className="flex-row mt-1">
              <HStack className="gap-6">
                <Radio value="male">
                  <RadioIndicator>
                    <RadioIcon as={RadioDot} />
                  </RadioIndicator>
                  <RadioLabel>{t('male')}</RadioLabel>
                </Radio>
                <Radio value="female">
                  <RadioIndicator>
                    <RadioIcon as={RadioDot} />
                  </RadioIndicator>
                  <RadioLabel>{t('female')}</RadioLabel>
                </Radio>
              </HStack>
            </RadioGroup>
            {errors.gender && <FormControlErrorText className="mt-1">{errors.gender.message}</FormControlErrorText>}
          </>
        )}
      />

      <Controller
        control={control}
        name="birthDate"
        render={({ field: { onChange, value } }) => (
          <>
            <FormControlLabel className="mt-4"><FormControlLabelText>{t('birthDate')}</FormControlLabelText></FormControlLabel>
            <Input
              className={`${inputStyle(!!errors.birthDate)} cursor-pointer`}
              onTouchEnd={() => setPickerOpen(true)}
            >
              <InputField
                value={value ? dayjs(value).format('DD MMMM YYYY') : ''}
                placeholder={t('birthDatePlaceholder')}
                editable={false}
                className="font-sans"
              />
            </Input>
            <Modal
              visible={pickerOpen}
              onClose={() => setPickerOpen(false)}
              title={t('birthDate')}
              button={{
                text: t('close'),
                onPress: () => setPickerOpen(false),
                isDisabled: false,
              }}
            >
              <ThemedDatePicker
                value={value ?? Date.now()}
                onChange={(date) => {
                  onChange(date.getTime())
                  setPickerOpen(false)
                }}
                maximumDate={new Date()}
              />
            </Modal>
            {errors.birthDate && <FormControlErrorText className="mt-1">{errors.birthDate.message}</FormControlErrorText>}
          </>
        )}
      />

      <Button
        action="secondary"
        onPress={() => void handleSubmit(onSubmit)()}
        className={buttonStyle(loading || !isValid)}
      >
        <ButtonText className={buttonTextStyle(loading || !isValid)}>{t('signup')}</ButtonText>
      </Button>
    </>
  )
}
