import { useCallback, useEffect } from 'react'
import { TreeService } from '@/services/treeService'
import { useFamilyTree } from '@/hooks/useFamilyTree'

export const useFetchTrees = ({ setIsTreeFetched }: { setIsTreeFetched: (value: boolean) => void }) => {
  const { trees, setTrees } = useFamilyTree()

  useEffect(() => {
    // Only fetch if store is empty
    if (trees.length > 0) {
      setIsTreeFetched(true)

      return
    }

    const fetchTrees = async () => {
      try {
        const treesData = await TreeService.fetchTrees()
        setTrees(treesData)
      } catch (error) {
        console.error('Failed to fetch trees:', error)
      } finally {
        setIsTreeFetched(true)
      }
    }

    void fetchTrees()
  }, [trees.length, setTrees, setIsTreeFetched])

  const createTree = useCallback(async (name: string) => {
    try {
      const treeData = await TreeService.createTree(name)
      setTrees([treeData])

      return treeData
    } catch (error) {
      console.error('Failed to create tree:', error)
    }
  }, [setTrees])

  return { trees, createTree }
}
