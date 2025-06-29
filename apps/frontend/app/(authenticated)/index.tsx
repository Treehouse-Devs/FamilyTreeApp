import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { useAuth } from '@/hooks/useAuth'
import { router } from 'expo-router'

export default function App() {
  const { t } = useTranslation()
  const { logout } = useAuth()

  const handleLogout = () => {
    try {
      logout()
      router.replace('/signin')
    }
    catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>{t('welcomeMessage')}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
