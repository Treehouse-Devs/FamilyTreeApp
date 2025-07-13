import { StyleSheet, RefreshControl, View } from 'react-native'
import FamilyList from '@/components/list'
import { FamilyService } from '@/services/familiyService'
import { useApi } from '@/hooks/useApi'
import { useState } from 'react'
import { FamilyNode } from '@/components/list.type'

export default function App() {
  const {
    loading,
    result,
    api,
  } = useApi<FamilyService, { families: FamilyNode[] }>(new FamilyService())

  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await api.fetchFamiliesList()
    }
    catch (error) {
      console.error('Refresh failed:', error)
    }
    finally {
      setRefreshing(false)
    }
  }

  return (
    <View style={styles.container}>
      <FamilyList
        data={result?.families || []}
        onSelect={family => console.log('Selected family:', family)}
        loading={loading}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingInline: 16,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 10,
  },
})
