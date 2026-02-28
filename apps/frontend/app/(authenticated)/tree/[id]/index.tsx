import { TreeScreenButtons } from '@/components/custom/family-tree/button'
import { HStack } from '@/components/ui/hstack'
import { useFamilyTree } from '@/hooks/useFamilyTree'
import { TreeService } from '@/services/treeService'
import { useLocalSearchParams, router } from 'expo-router'
import { ChevronLeft, Menu, Minus, Plus } from 'lucide-react-native'
import { useEffect, useState, useCallback } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { LinearGradient } from 'expo-linear-gradient'
import { asHex, getVar, useCurrentMode } from '@/utils/color-token'
import { FamilyTreeSkia } from '@/components/custom/family-tree/skia'
import { Person } from '@/store/slices/treeSlice'

import { ButtonIcon } from '@/components/ui/button'
import { FamilyMenuActionSheet } from '@/components/custom/family-tree/action-sheet'
import { MemberType, PersonTooltip } from '@/components/custom/family-tree/tooltip'
import { useZoomLevel } from '@/hooks/useZoomLevel'

const TreeScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { selectTree, selectedRoot, setRoot, setTree, trees } = useFamilyTree()
  const [loading, setLoading] = useState(true)
  const { zoomLevel, setZoomLevel } = useZoomLevel()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)

  const mode = useCurrentMode()
  // Resolve colors for gradient
  const colorPrimary0 = asHex(getVar(mode, 'primary', '0'))
  const colorPrimary50 = asHex(getVar(mode, 'primary', '50'))

  // Callback for pinch gesture zoom changes
  const handleZoomChange = useCallback((newScale: number) => {
    setZoomLevel(newScale)
  }, [])

  // Callback for person card press
  const handlePersonPress = useCallback((person: Person) => {
    setSelectedPerson(person)
  }, [])

  useEffect(() => {
    if (!id) return
    let cancelled = false

    selectTree(id)

    // Check if tree already exists in store by looking up directly
    const existingTree = trees.find(t => t.id === id)

    if (existingTree && existingTree.root) {
      setRoot(existingTree.root)
      setLoading(false)

      return
    }

    const fetchTree = async () => {
      setLoading(true)
      try {
        const tree = await TreeService.fetchTreeById(id)
        if (!cancelled && tree) {
          setTree(tree)
          if (tree.root) {
            setRoot(tree.root)
          }
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
  }, [id]) // Only re-fetch when id changes

  if (loading) {
    return (
      <LinearGradient
        colors={[colorPrimary0, colorPrimary50]}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <ActivityIndicator size="large" />
      </LinearGradient>
    )
  }

  if (!selectedRoot) return null

  const onPress = (type: 'back' | 'zoomIn' | 'zoomOut' | 'menu') => () => {
    switch (type) {
      case 'back':
        router.back()
        break
      case 'zoomIn': {
        // Limit zoom level to 200%
        const newZoomLevel = Math.min(zoomLevel + 0.4, 2)
        setZoomLevel(newZoomLevel)
        break
      }
      case 'zoomOut': {
        // Limit zoom level to 50%
        const newZoomLevelOut = Math.max(zoomLevel - 0.4, 0.5)
        setZoomLevel(newZoomLevelOut)
        break
      }
      case 'menu': {
        setIsMenuOpen(true)
        break
      }
    }
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LinearGradient
        colors={[colorPrimary0, colorPrimary50]}
        style={{ flex: 1 }}
      >
        {/* Canvas layer - full screen */}
        <View style={{ flex: 1, marginTop: 48 }}>
          <FamilyTreeSkia
            root={selectedRoot}
            scale={zoomLevel}
            minScale={0.5}
            maxScale={2}
            onZoomChange={handleZoomChange}
            onPressNode={handlePersonPress}
          />
        </View>
        {/* Header layer - overlays canvas but allows touch passthrough */}
        <View
          style={{ position: 'absolute', top: 48, left: 0, right: 0, zIndex: 10 }}
          pointerEvents="box-none"
        >
          <HStack className="items-center p-2 w-screen px-4" space="md" pointerEvents="box-none">
            <TreeScreenButtons
              button={{
                icon: <ButtonIcon as={ChevronLeft} className="text-secondary-900 w-8 h-8" />,
                onPress: onPress('back'),
              }}
            />
            <TreeScreenButtons
              buttons={[
                {
                  icon: <ButtonIcon as={Minus} className="text-secondary-900 w-8 h-8" pointerEvents="none" />,
                  onPress: onPress('zoomOut'),
                },
                {
                  label: `${Math.round(zoomLevel * 100)}%`,
                },
                {
                  icon: <ButtonIcon as={Plus} className="text-secondary-900 w-8 h-8" pointerEvents="none" />,
                  onPress: onPress('zoomIn'),
                },
              ]}
              className="mx-auto"
            />
            <TreeScreenButtons
              button={{
                icon: <ButtonIcon as={Menu} className="text-secondary-900 w-8 h-8" />,
                onPress: onPress('menu'),
              }}
            />
          </HStack>
        </View>
      </LinearGradient>
      <FamilyMenuActionSheet isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Person Card Menu */}
      {selectedPerson && (
        <PersonTooltip
          person={selectedPerson}
          visible={selectedPerson !== null}
          treeId={id}
          onClose={() => setSelectedPerson(null)}
          onAddMember={(type: MemberType) => {
            // TODO: Implement add member based on type
            console.log('Add member type:', type)
          }}
          onViewDetails={() => {
            router.push(`/tree/${id}/details/${selectedPerson.id}`)
          }}
        />
      )}
    </GestureHandlerRootView>
  )
}

export default TreeScreen
