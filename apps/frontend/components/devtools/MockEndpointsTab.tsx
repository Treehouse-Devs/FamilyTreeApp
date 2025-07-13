import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native'
import { useMockDevToolStore } from '../../store/mockDevToolStore'
import { MockConfig } from '../../types/mockDevTool'

export function MockEndpointsTab() {
  const { getEndpointGroups, updateConfiguration, updateDynamicCount, loadDefaultConfigurations, toggleGroupExpansion } = useMockDevToolStore()
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null)

  const endpointGroups = getEndpointGroups()

  const toggleGroup = (groupName: string) => {
    toggleGroupExpansion(groupName)
  }

  const handleToggleConfig = (id: string, enabled: boolean) => {
    updateConfiguration(id, { enabled })
  }

  const handleDelayChange = (id: string, delay: string) => {
    const numDelay = parseInt(delay, 10) || 0
    updateConfiguration(id, { delay: Math.max(0, Math.min(5000, numDelay)) })
  }

  const handleDynamicCountChange = (id: string, count: string) => {
    const numCount = parseInt(count, 10) || 0
    updateDynamicCount(id, Math.max(0, Math.min(100, numCount)))
  }

  const renderConfig = (config: MockConfig) => {
    const isSelected = selectedConfig === config.id

    return (
      <View key={config.id} style={[styles.configCard, isSelected && styles.configCardSelected]}>
        <TouchableOpacity
          onPress={() => setSelectedConfig(isSelected ? null : config.id)}
          style={styles.configHeader}
        >
          <View style={styles.configTitleRow}>
            <Text style={styles.configMethod}>
              {config.method.toUpperCase()}
            </Text>
            <Text style={styles.configEndpoint}>
              /
              {config.endpoint}
              {config.isDynamic && (
                <Text style={styles.dynamicIndicator}>
                  {' '}
                  (
                  {config.dynamicCount || 0}
                  {' '}
                  items)
                </Text>
              )}
            </Text>
            <View style={styles.configControls}>
              <Switch
                value={config.enabled}
                onValueChange={enabled => handleToggleConfig(config.id, enabled)}
                trackColor={{ false: '#374151', true: '#10B981' }}
                thumbColor={config.enabled ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
          </View>

          <View style={styles.configStatus}>
            <View style={[
              styles.statusBadge,
              config.responseType === 'error' ? styles.statusError : styles.statusSuccess,
            ]}
            >
              <Text style={styles.statusText}>
                {config.responseType === 'error'
                  ? `${config.statusCode} ERROR`
                  : `${config.statusCode} SUCCESS`}
              </Text>
            </View>
            <Text style={styles.delayText}>
              {config.delay}
              ms
            </Text>
          </View>
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.configDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Delay (ms):</Text>
              <TextInput
                style={styles.delayInput}
                value={config.delay.toString()}
                onChangeText={text => handleDelayChange(config.id, text)}
                keyboardType="numeric"
                placeholder="0-5000"
                placeholderTextColor="#6B7280"
              />
            </View>

            {config.isDynamic && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Item Count:</Text>
                <TextInput
                  style={styles.delayInput}
                  value={(config.dynamicCount || 0).toString()}
                  onChangeText={text => handleDynamicCountChange(config.id, text)}
                  keyboardType="numeric"
                  placeholder="0-100"
                  placeholderTextColor="#6B7280"
                />
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Response Type:</Text>
              <Text style={styles.detailValue}>{config.responseType}</Text>
            </View>

            {config.conditions && config.conditions.length > 0 && (
              <View style={styles.conditionsSection}>
                <Text style={styles.detailLabel}>Conditions:</Text>
                {config.conditions.map((condition, index) => (
                  <View key={index} style={styles.conditionCard}>
                    <Text style={styles.conditionText}>
                      {condition.field}
                      {' '}
                      {condition.operator}
                      {' "'}
                      {condition.value}
                      "
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.responseSection}>
              <Text style={styles.detailLabel}>Response Data:</Text>
              <ScrollView style={styles.responseScroll} nestedScrollEnabled>
                <Text style={styles.responseText}>
                  {JSON.stringify(config.responseData, null, 2)}
                </Text>
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    )
  }

  const renderGroupHeader = (group: {
    name: string
    displayName: string
    configs: MockConfig[]
    expanded: boolean
  }) => {
    const isExpanded = group.expanded
    const enabledCount = group.configs.filter(config => config.enabled).length

    return (
      <TouchableOpacity
        key={`header-${group.name}`}
        style={styles.groupHeader}
        onPress={() => toggleGroup(group.name)}
      >
        <View style={styles.groupHeaderContent}>
          <Text style={styles.groupTitle}>
            {isExpanded ? '▼' : '▶'}
            {' '}
            {group.displayName}
          </Text>
          <View style={styles.groupInfo}>
            <Text style={styles.groupCount}>
              {enabledCount}
              /
              {group.configs.length}
              {' '}
              enabled
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const renderGroup = (group: {
    name: string
    displayName: string
    configs: MockConfig[]
    expanded: boolean
  }) => {
    const isExpanded = group.expanded

    return (
      <View key={group.name} style={styles.groupContainer}>
        {renderGroupHeader(group)}
        {isExpanded && (
          <View style={styles.groupContent}>
            {group.configs.map(renderConfig)}
          </View>
        )}
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Mock Endpoints</Text>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={loadDefaultConfigurations}
        >
          <Text style={styles.resetButtonText}>Reset to Defaults</Text>
        </TouchableOpacity>
      </View>

      {endpointGroups.length === 0
        ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No configurations found</Text>
            <TouchableOpacity
              style={styles.loadDefaultsButton}
              onPress={loadDefaultConfigurations}
            >
              <Text style={styles.loadDefaultsText}>Load Default Configs</Text>
            </TouchableOpacity>
          </View>
        )
        : (
          <View style={styles.groupsList}>
            {endpointGroups.map(renderGroup)}
          </View>
        )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#374151',
    borderRadius: 6,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  configsList: {
    padding: 16,
  },
  configCard: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  configCardSelected: {
    borderColor: '#10B981',
  },
  configHeader: {
    padding: 16,
  },
  configTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  configMethod: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 50,
  },
  configEndpoint: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  dynamicIndicator: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  configControls: {
    marginLeft: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#10B981',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  radioInnerSelected: {
    backgroundColor: '#10B981',
  },
  configStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusSuccess: {
    backgroundColor: '#10B981',
  },
  statusError: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  delayText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  configDetails: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    backgroundColor: '#0F172A',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    minWidth: 80,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 12,
    flex: 1,
  },
  delayInput: {
    backgroundColor: '#374151',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    minWidth: 60,
    textAlign: 'center',
  },
  conditionsSection: {
    marginBottom: 12,
  },
  conditionCard: {
    backgroundColor: '#374151',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  conditionText: {
    color: '#F3F4F6',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  responseSection: {
    marginTop: 8,
  },
  responseScroll: {
    maxHeight: 150,
    backgroundColor: '#000000',
    borderRadius: 4,
    padding: 8,
    marginTop: 4,
  },
  responseText: {
    color: '#10B981',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginBottom: 16,
  },
  loadDefaultsButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#10B981',
    borderRadius: 8,
  },
  loadDefaultsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  groupsList: {
    padding: 16,
  },
  groupContainer: {
    marginBottom: 16,
  },
  groupHeader: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  groupHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupCount: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  groupContent: {
    paddingLeft: 8,
  },
})
