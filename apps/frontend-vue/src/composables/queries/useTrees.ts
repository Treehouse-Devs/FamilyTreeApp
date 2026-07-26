import { computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { TreeService } from '@/services/treeService'
import { useTreeStore } from '@/stores/tree'
import { queryKeys } from './keys'

/**
 * Replaces the RN app's `hooks/useFetchTrees.ts`. Results are mirrored into the
 * tree store so the screens keep reading from one normalized place.
 */
export function useTrees() {
  const treeStore = useTreeStore()

  const query = useQuery({
    queryKey: queryKeys.trees(),
    queryFn: async () => {
      const trees = await TreeService.fetchTrees()
      treeStore.setTrees(trees)

      return trees
    },
  })

  return {
    ...query,
    trees: computed(() => query.data.value ?? []),
  }
}

/**
 * Fetches one tree by id. `TreeService.fetchTreeById` composes the flat response
 * into the nested shape and writes it into the store on the way through.
 */
export function useTree(treeId: MaybeRefOrGetter<string | undefined>) {
  return useQuery({
    queryKey: computed(() => queryKeys.tree(toValue(treeId) ?? '')),
    queryFn: () => TreeService.fetchTreeById(toValue(treeId)!),
    enabled: computed(() => !!toValue(treeId)),
  })
}

export function useCreateTree() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (name: string) => TreeService.createTree(name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trees() })
    },
  })
}

export function useDeleteTree() {
  const queryClient = useQueryClient()
  const treeStore = useTreeStore()

  return useMutation({
    mutationFn: (treeId: string) => TreeService.deleteTree(treeId),
    onSuccess: (_data, treeId) => {
      treeStore.removeTree(treeId)
      void queryClient.invalidateQueries({ queryKey: queryKeys.trees() })
    },
  })
}
