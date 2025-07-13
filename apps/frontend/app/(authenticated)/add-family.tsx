import React from 'react'
import { ToastAndroid, View } from 'react-native'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { familyCreateSchema, FamilyCreateSchema } from '@/validator/family/familyValidation'
import { Input, InputField } from '@/components/ui/input'
import { Button, ButtonText } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import { FormControl, FormControlErrorText, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control'
import { useApi } from '@/hooks/useApi'
import { FamilyService } from '@/services/familiyService'
import { FamilyNode } from '@/components/family/list.type'

export default function AddFamily() {
  const { t } = useTranslation()

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FamilyCreateSchema>({
    resolver: zodResolver(familyCreateSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
    },
  })

  const {
    loading,
    api,
  } = useApi<FamilyService, { data: FamilyNode }>(new FamilyService())

  const onSubmit = async (data: FamilyCreateSchema) => {
    try {
      const response = await api.createFamily(data)
      if (response.data) {
        // Handle successful family creation
        ToastAndroid.show(t('familyCreatedSuccess'), ToastAndroid.SHORT)
        reset()
        router.back()
      }
      else {
        // Handle case where family creation did not return data
        ToastAndroid.show(t('familyCreatedFailed'), ToastAndroid.SHORT)
      }
    }
    catch (error) {
      console.error('Failed to create family:', error)
      ToastAndroid.show(t('familyCreatedFailed'), ToastAndroid.SHORT)
    }
  }

  const onCancel = () => {
    reset()
    router.back()
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      {/* Main Card */}
      <View className="bg-orange-100 rounded-xl p-0 shadow-sm border border-orange-600">
        {/* Family Name Section */}
        <View className="p-4 border-b border-gray-100">
          <Text className="text-base font-medium text-gray-900 mb-1">
            {t('familyName')}
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormControl>
                <Input className={`w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-200'} bg-gray-50`}>
                  <InputField
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t('familyNamePlaceholder')}
                    autoCapitalize="words"
                    autoCorrect={false}
                    className="font-sans text-gray-900"
                  />
                </Input>
                {errors.name && (
                  <FormControlErrorText className="mt-1">
                    {errors.name.message || t('familyNameRequired')}
                  </FormControlErrorText>
                )}
              </FormControl>
            )}
          />
        </View>

        {/* Bottom Action Buttons */}
        <View className="flex-row justify-center mb-3 gap-4">
          <Button
            onPress={onCancel}
            className="bg-red-100 border border-red-200 rounded-2xl px-8 min-w-[100px]"
          >
            <ButtonText className="text-red-600 font-medium active:text-red-700">
              {t('cancel')}
            </ButtonText>
          </Button>
          <Button
            onPress={() => void handleSubmit(onSubmit)()}
            isDisabled={loading || !!Object.keys(errors).length}
            className="bg-green-100 border border-green-200 rounded-2xl px-8 min-w-[100px] disabled:opacity-50"
          >
            <ButtonText className="text-green-600 font-medium active:text-green-700 disabled:text-green-400">
              {loading ? t('creating') : t('save')}
            </ButtonText>
          </Button>
        </View>
      </View>
    </View>
  )
}
