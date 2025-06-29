import React from 'react'
import { View, Button, Alert, Text } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginSchema } from '../validator/auth/authValidation'
import { Input } from '@/components/Input'
import { useTranslation } from 'react-i18next'
import { AuthService } from '@/services/authService'
import { useApi } from '@/hooks/useApi'
import { router } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'

export default function LoginScreen() {
  const { t } = useTranslation()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
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
  const { login } = useAuth()

  const onSubmit = async (data: LoginSchema) => {
    const res = await api.login(data.email, data.password)
    if (res) {
      console.log('Login successful:', res)
      login(res.user, res.token)
      router.replace('/(authenticated)')
    }
    else if (error) {
      console.error('Login failed:', error)
      Alert.alert(t('loginFailed'), t('loginErrorMessage'))
    }
  }

  const handleSignUp = () => {
    router.push('/signup')
  }

  return (
    <View style={{ padding: 20 }}>
      {error && <Text style={{ color: 'red' }}>{error.message}</Text>}

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <Input
            label={t('email')}
            value={value}
            onChangeText={onChange}
            placeholder={t('emailPlaceholder')}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <Input
            label={t('password')}
            value={value}
            onChangeText={onChange}
            secureTextEntry
            placeholder={t('passwordPlaceholder')}
            error={errors.password?.message}
          />
        )}
      />

      <Button
        title={t('signin')}
        onPress={() => void handleSubmit(onSubmit)()}
        disabled={loading}
      />

      <Text
        onPress={handleSignUp}
        style={{ color: 'blue', marginTop: 10, textAlign: 'center' }}
        disabled={loading}
      >
        {t('signup')}
      </Text>
    </View>
  )
}
