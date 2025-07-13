import React, { useState } from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView } from 'react-native'
import { useMockDevToolStore } from '../../store/mockDevToolStore'
import { MockEndpointsTab } from './MockEndpointsTab'
import { MockRequestsTab } from './MockRequestsTab'

const ENABLE_DEVTOOLS = process.env.EXPO_PUBLIC_ENABLE_DEVTOOLS === 'true'

type TabType = 'endpoints' | 'requests'

export function MockDevToolPanel() {
  const { isVisible, toggleVisibility, mockMode, setMockMode, clearHistory, clearLocalStorage } = useMockDevToolStore()
  const [activeTab, setActiveTab] = useState<TabType>('endpoints')

  if (!ENABLE_DEVTOOLS || !isVisible) {
    return null
  }

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={toggleVisibility}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mock DevTool</Text>
          <View style={styles.headerControls}>
            <TouchableOpacity
              style={[styles.modeToggle, mockMode ? styles.modeActive : styles.modeInactive]}
              onPress={() => setMockMode(!mockMode)}
            >
              <Text style={styles.modeText}>
                {mockMode ? '🟢 MOCK' : '🔴 LIVE'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={toggleVisibility}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'endpoints' && styles.tabActive]}
            onPress={() => setActiveTab('endpoints')}
          >
            <Text style={[styles.tabText, activeTab === 'endpoints' && styles.tabTextActive]}>
              Endpoints
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
            onPress={() => setActiveTab('requests')}
          >
            <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
              Requests
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.content}>
          {activeTab === 'endpoints' && <MockEndpointsTab />}
          {activeTab === 'requests' && <MockRequestsTab />}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearHistory}
            >
              <Text style={styles.clearButtonText}>Clear History</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.clearButton, styles.clearStorageButton]}
              onPress={clearLocalStorage}
            >
              <Text style={styles.clearButtonText}>Clear Storage</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.footerText}>
            Mock Mode:
            {' '}
            {mockMode ? 'Enabled' : 'Disabled'}
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modeToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  modeActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  modeInactive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  modeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#374151',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#4B5563',
    borderBottomWidth: 2,
    borderBottomColor: '#10B981',
  },
  tabText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#111827',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    backgroundColor: '#1F2937',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
  },
  clearStorageButton: {
    backgroundColor: '#F59E0B',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
})
