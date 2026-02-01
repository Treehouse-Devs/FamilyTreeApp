import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import { useAuth } from '@/hooks/useAuth'
import { useFamilyTree } from '@/hooks/useFamilyTree'
import { router } from 'expo-router'
import { Tree } from '@/store/slices/treeSlice'
import { TreeService } from '@/services/treeService'
import { useEffect, useState } from 'react'
import { useStore } from '@/store/store'

export default function App() {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const { trees } = useFamilyTree()
  const setTrees = useStore(state => state.setTrees)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only fetch if store is empty
    if (trees.length > 0) {
      setLoading(false)
      return
    }

    const fetchTrees = async () => {
      try {
        const treesData = await TreeService.fetchTrees()
        setTrees(treesData)
      } catch (error) {
        console.error('Failed to fetch trees:', error)
      } finally {
        setLoading(false)
      }
    }

    void fetchTrees()
  }, [trees.length, setTrees])

  const handleLogout = () => {
    try {
      logout()
      router.replace('/signin')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const navigateToTree = (treeId: string) => {
    router.push(`/tree/${treeId}/tree-screen`)
  }

  const renderTreeItem = ({ item }: { item: Tree }) => (
    <TouchableOpacity
      style={styles.treeItem}
      onPress={() => navigateToTree(item.id)}
    >
      <Text style={styles.treeName}>{item.name}</Text>
      <Text style={styles.treeDate}>
        Created:
        {' '}
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading trees...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>{t('welcomeMessage')}</Text>

      <Text style={styles.sectionTitle}>Your Family Trees</Text>

      {trees.length === 0
        ? (
            <Text style={styles.emptyText}>No family trees yet</Text>
          )
        : (
            <FlatList
              data={trees}
              keyExtractor={item => item.id}
              renderItem={renderTreeItem}
              style={styles.list}
            />
          )}

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
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  centered: {
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  list: {
    width: '100%',
    flexGrow: 0,
    maxHeight: 300,
  },
  treeItem: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
  },
  treeName: {
    fontSize: 16,
    fontWeight: '500',
  },
  treeDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  demoButton: {
    backgroundColor: '#4a90d9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 15,
  },
  demoButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 'auto',
    marginBottom: 30,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
})
