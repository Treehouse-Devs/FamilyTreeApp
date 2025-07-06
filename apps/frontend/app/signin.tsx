import React from 'react'
import { View, Button, Alert, Text, StyleSheet } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginSchema } from '../validator/auth/authValidation'
import { useTranslation } from 'react-i18next'
import { AuthService } from '@/services/authService'
import { useApi } from '@/hooks/useApi'
import { router } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { Input, InputField } from '@/components/ui/input'

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
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error.message}</Text>}

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value, onBlur } }) => (
          <View style={styles.inputContainer}>
            <Input>
              <InputField
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('emailPlaceholder')}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                accessibilityLabel={t('email')}
              />
            </Input>
            {errors.email?.message && (
              <Text style={styles.errorTextField}>{errors.email.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value, onBlur } }) => (
          <View style={styles.inputContainer}>
            <Input>
              <InputField
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={t('passwordPlaceholder')}
                secureTextEntry
                returnKeyType="done"
                accessibilityLabel={t('password')}
              />
            </Input>
            {errors.password?.message && (
              <Text style={styles.errorTextField}>{errors.password.message}</Text>
            )}
          </View>
        )}
      />

      <Button
        title={t('signin')}
        onPress={() => void handleSubmit(onSubmit)()}
        disabled={loading}
      />

      <Text
        onPress={handleSignUp}
        style={styles.signupText}
        disabled={loading}
      >
        {t('signup')}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorTextField: {
    color: 'red',
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  signupText: {
    color: 'blue',
    marginTop: 10,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 10,
  },
})
