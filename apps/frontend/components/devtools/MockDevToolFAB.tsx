import React from 'react'
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { useMockDevToolStore } from '../../store/mockDevToolStore'

const __DEV__ = process.env.NODE_ENV === 'development'
const ENABLE_DEVTOOLS = __DEV__ && process.env.EXPO_PUBLIC_ENABLE_DEVTOOLS !== 'false'

export function MockDevToolFAB() {
  const { toggleVisibility, mockMode } = useMockDevToolStore()

  if (!ENABLE_DEVTOOLS) {
    return null
  }

  return (
    <TouchableOpacity
      style={[styles.fab, mockMode ? styles.fabActive : styles.fabInactive]}
      onPress={toggleVisibility}
      activeOpacity={0.7}
    >
      <View style={styles.fabContent}>
        <Text style={styles.fabText}>🛠️</Text>
        <Text style={[styles.fabStatus, mockMode ? styles.statusActive : styles.statusInactive]}>
          {mockMode ? 'MOCK' : 'LIVE'}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  fabActive: {
    backgroundColor: '#10B981', // Green when mock mode is active
  },
  fabInactive: {
    backgroundColor: '#6B7280', // Gray when live mode
  },
  fabContent: {
    alignItems: 'center',
  },
  fabText: {
    fontSize: 20,
  },
  fabStatus: {
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statusActive: {
    color: '#FFFFFF',
  },
  statusInactive: {
    color: '#FFFFFF',
  },
})
