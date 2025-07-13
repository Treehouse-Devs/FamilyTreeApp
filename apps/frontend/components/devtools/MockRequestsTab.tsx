import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { useMockDevToolStore } from '../../store/mockDevToolStore'
import { RequestLog } from '../../types/mockDevTool'

export function MockRequestsTab() {
  const { requestHistory } = useMockDevToolStore()
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null)

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatResponseTime = (time: number) => {
    return `${time}ms`
  }

  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return '#10B981' // Green
    if (statusCode >= 400 && statusCode < 500) return '#F59E0B' // Yellow
    return '#EF4444' // Red
  }

  const renderRequestLog = (log: RequestLog) => {
    const isSelected = selectedRequest === log.id

    return (
      <View
        key={log.id}
        style={[styles.requestCard, isSelected && styles.requestCardSelected]}
      >
        <TouchableOpacity
          onPress={() => setSelectedRequest(isSelected ? null : log.id)}
          style={styles.requestHeader}
        >
          <View style={styles.requestTitleRow}>
            <Text
              style={[
                styles.requestMethod,
                { color: getStatusColor(log.statusCode) },
              ]}
            >
              {log.method.toUpperCase()}
            </Text>
            <Text style={styles.requestUrl} numberOfLines={1}>
              {log.url}
            </Text>
            <View style={styles.requestBadges}>
              {log.isMocked && (
                <View style={styles.mockBadge}>
                  <Text style={styles.mockBadgeText}>MOCK</Text>
                </View>
              )}
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(log.statusCode) },
                ]}
              >
                <Text style={styles.statusBadgeText}>{log.statusCode}</Text>
              </View>
            </View>
          </View>

          <View style={styles.requestMeta}>
            <Text style={styles.metaText}>
              {formatTimestamp(log.timestamp)}
            </Text>
            <Text style={styles.metaText}>
              {formatResponseTime(log.responseTime)}
            </Text>
            {log.error && <Text style={styles.errorText}>ERROR</Text>}
          </View>
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.requestDetails}>
            {log.requestData && (
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Request Data:</Text>
                <ScrollView style={styles.dataScroll} nestedScrollEnabled>
                  <Text style={styles.dataText}>
                    {JSON.stringify(log.requestData, null, 2)}
                  </Text>
                </ScrollView>
              </View>
            )}

            {log.responseData && (
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Response Data:</Text>
                <ScrollView style={styles.dataScroll} nestedScrollEnabled>
                  <Text style={styles.dataText}>
                    {JSON.stringify(log.responseData, null, 2)}
                  </Text>
                </ScrollView>
              </View>
            )}

            {log.error && (
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Error:</Text>
                <ScrollView style={styles.dataScroll} nestedScrollEnabled>
                  <Text style={styles.errorDataText}>
                    {log.error.message}
                    {'\n'}
                    {log.error.stack}
                  </Text>
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>
          Request History (
          {requestHistory.length}
          )
        </Text>
        {requestHistory.length > 0 && (
          <Text style={styles.subtitle}>Tap a request to view details</Text>
        )}
      </View>

      {requestHistory.length === 0
        ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No requests logged yet</Text>
            <Text style={styles.emptySubtext}>
              Make some API calls to see request logs here
            </Text>
          </View>
        )
        : (
          <View style={styles.requestsList}>
            {requestHistory.map(renderRequestLog)}
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  requestsList: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  requestCardSelected: {
    borderColor: '#10B981',
  },
  requestHeader: {
    padding: 16,
  },
  requestTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestMethod: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 50,
  },
  requestUrl: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  requestBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  mockBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mockBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  requestMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  requestDetails: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    backgroundColor: '#0F172A',
  },
  detailSection: {
    marginBottom: 16,
  },
  detailTitle: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dataScroll: {
    maxHeight: 200,
    backgroundColor: '#000000',
    borderRadius: 4,
    padding: 8,
  },
  dataText: {
    color: '#10B981',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  errorDataText: {
    color: '#EF4444',
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
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
})
