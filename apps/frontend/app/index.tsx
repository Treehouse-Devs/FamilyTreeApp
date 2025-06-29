import { router } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'

export default function WelcomeScreen() {
  const { t } = useTranslation()

  const handleSignIn = () => {
    router.push('/signin')
  }

  const handleSignUp = () => {
    router.push('/signup')
  }

  return (
    <View style={styles.containerStyle}>
      <Text style={styles.titleStyle}>{t('welcomeMessage')}</Text>
      <View style={styles.buttonGroupStyle}>
        <TouchableOpacity
          style={styles.signInButtonStyle}
          onPress={handleSignIn}
        >
          <Text style={styles.signInButtonTextStyle}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.signUpButtonStyle}
          onPress={handleSignUp}
        >
          <Text style={styles.signUpButtonTextStyle}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },
  titleStyle: {
    marginBottom: 24,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
  },
  buttonGroupStyle: {
    flexDirection: 'row',
    gap: 16,
  },
  signInButtonStyle: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    fontSize: 16,
    borderRadius: 6,
    backgroundColor: '#1976d2',
    marginRight: 8,
  },
  signInButtonTextStyle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  signUpButtonStyle: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    fontSize: 16,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  signUpButtonTextStyle: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
})
