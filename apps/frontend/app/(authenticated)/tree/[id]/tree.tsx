import { useFamilyTree } from '@/hooks/useFamilyTree'
import { TreeService } from '@/services/treeService'
import { useLocalSearchParams } from 'expo-router'
import { useEffect } from 'react'

const TreeScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { getRoot, setRoot } = useFamilyTree()

  if (!getRoot()) {
    useEffect(() => {
      const fetchTree = async () => {
        if (id) {
          const tree = await TreeService.fetchTreeById(id)
          if (tree && tree.root) {
            setRoot(tree.root)
          }
        }
      }

      void fetchTree()
    }, [id, setRoot])
  }

  return (
    <div>
      {/* Render your tree UI here */}
      <h1>Family Tree</h1>
      {/* Additional components and logic for displaying the tree */}
    </div>
  )
}

export default TreeScreen
