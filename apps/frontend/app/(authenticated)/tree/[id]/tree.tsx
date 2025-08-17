import { TreeScreenButtons } from '@/components/custom/family-tree/button'
import { HStack } from '@/components/ui/hstack'
import { useFamilyTree } from '@/hooks/useFamilyTree'
import { TreeService } from '@/services/treeService'
import { useLocalSearchParams } from 'expo-router'
import { ChevronLeft, Menu, Minus, Plus } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { View } from 'react-native'

const TreeScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { selectTree, selectedRoot, setRoot } = useFamilyTree()
  const [loading, setLoading] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(1)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    selectTree(id)

    const fetchTree = async () => {
      if (selectedRoot) return

      setLoading(true)
      try {
        const tree = await TreeService.fetchTreeById(id)
        if (!cancelled && tree?.root) {
          setRoot(tree.root)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch tree:', err)
          // TODO show alert
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void fetchTree()

    return () => {
      cancelled = true
    }
  }, [id, selectedRoot, selectTree, setRoot])

  if (!selectedRoot) return null

  const onPress = (type: 'back' | 'zoomIn' | 'zoomOut' | 'menu') => () => {
    switch (type) {
      case 'back':
        // Handle back navigation
        break
      case 'zoomIn':
        // Limit zoom level to 300%
        setZoomLevel(prev => Math.min(prev * 1.2, 3))
        break
      case 'zoomOut':
        // Limit zoom level to 50%
        setZoomLevel(prev => Math.max(prev / 1.2, 0.5))
        break
      case 'menu':
        // Handle menu action
        break
    }
  }

  return (
    <View className="flex-1 bg-gradient-to-b from-primary-0 to-primary-50">
      <HStack className="items-center">
        <TreeScreenButtons button={{
          icon: <ChevronLeft className="text-secondary-900" />,
          onPress: onPress('back'),
        }}
        />
        <TreeScreenButtons buttons={[
          {
            icon: <Minus className="text-secondary-900" />,
            onPress: onPress('zoomOut'),
          },
          {
            label: `${zoomLevel * 100}%`,
          },
          {
            icon: <Plus className="text-secondary-900" />,
            onPress: onPress('zoomIn'),
          },
        ]}
        />
        <TreeScreenButtons
          button={{
            icon: <Menu className="text-secondary-900" />,
            onPress: onPress('menu'),
          }}
          className="ml-auto"
        />
      </HStack>
    </View>
  )
}

export default TreeScreen
