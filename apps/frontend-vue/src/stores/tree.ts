import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { DetailedPerson, Person, Tree } from '@/types/tree'
import type { FlatPerson } from '@/utils/tree-compose'
import {
  collectAllPersons,
  findPersonById,
  removePersonFromTree,
  updatePersonInTree,
} from './tree-utils'

export type MemberSortField = 'name' | 'birthYear'
export type MemberSortDirection = 'asc' | 'desc'

/**
 * Ported from the RN app's `store/slices/tree`, action for action.
 *
 * Not persisted — the RN store's `partialize` deliberately leaves trees out, so
 * they are refetched on launch. TanStack Query owns the request lifecycle and
 * writes results in here; this store stays the normalized cache the tree screens
 * read from, exactly as it is today.
 */
export const useTreeStore = defineStore('tree', () => {
  const trees = ref<Tree[]>([])
  const flatPersons = ref<Record<string, Record<string, FlatPerson>>>({})
  const personDetails = ref<Record<string, Record<string, DetailedPerson>>>({})
  const selectedTreeId = ref<string | undefined>(undefined)
  const memberSortField = ref<MemberSortField>('birthYear')
  const memberSortDirection = ref<MemberSortDirection>('asc')

  const selectedRoot = computed(() =>
    trees.value.find(tree => tree.id === selectedTreeId.value)?.root,
  )

  function setTrees(value: Tree[]) {
    trees.value = value
  }

  function setFlatPersons(treeId: string, persons: FlatPerson[]) {
    flatPersons.value = {
      ...flatPersons.value,
      [treeId]: persons.reduce<Record<string, FlatPerson>>((acc, person) => {
        acc[person.id] = person

        return acc
      }, {}),
    }
  }

  function addTree(tree: Tree) {
    trees.value = [...trees.value, tree]
  }

  function removeTree(treeId: string) {
    trees.value = trees.value.filter(tree => tree.id !== treeId)
    const otherTree = trees.value[0]
    if (otherTree) selectTree(otherTree.id)
  }

  function setTree(tree: Tree) {
    const found = trees.value.find(t => t.id === tree.id)
    trees.value = found
      ? trees.value.map(t => (t.id === tree.id ? { ...t, ...tree } : t))
      : [...trees.value, tree]
  }

  function selectTree(treeId: string) {
    selectedTreeId.value = treeId
  }

  function getPersonFromRoot(treeId: string, personId: string): Person | undefined {
    const root = trees.value.find(tree => tree.id === treeId)?.root
    if (!root) return undefined

    return findPersonById(root, personId)
  }

  function addPerson(
    treeId: string,
    person: FlatPerson,
    type: 'spouse' | 'children' | 'parent',
    originId: string,
  ) {
    const selectedTree = trees.value.find(tree => tree.id === selectedTreeId.value)
    const currentRoot = selectedTree?.root
    if (!selectedTree || !currentRoot) return

    let updatedRoot: Person

    if (type === 'parent') {
      // New person becomes the root; old root becomes their child.
      updatedRoot = {
        id: person.id,
        gender: person.gender,
        name: person.name,
        birthDate: person.birthDate,
        children: [currentRoot],
        isBloodRelated: true,
      }
    } else {
      if (!findPersonById(currentRoot, originId)) return

      updatedRoot = updatePersonInTree(currentRoot, originId, (node) => {
        if (type === 'children') {
          return { ...node, children: node.children ? [...node.children, person] : [person] }
        }

        // type === 'spouse'
        return { ...node, spouse: person }
      })
    }

    trees.value = trees.value.map(tree =>
      tree.id === selectedTreeId.value ? { ...tree, root: updatedRoot } : tree,
    )
    flatPersons.value = {
      ...flatPersons.value,
      [treeId]: { ...flatPersons.value[treeId], [person.id]: person },
    }
  }

  function setPersonDetails(treeId: string, personId: string, person: DetailedPerson) {
    personDetails.value = {
      ...personDetails.value,
      [treeId]: { ...personDetails.value[treeId], [personId]: person },
    }
  }

  function patchPersonDetails(treeId: string, personId: string, person: Partial<DetailedPerson>) {
    const existing = personDetails.value[treeId]?.[personId]
    if (!existing) {
      throw new Error(`Person with ID ${personId} not found in tree ${treeId}`)
    }

    personDetails.value = {
      ...personDetails.value,
      [treeId]: { ...personDetails.value[treeId], [personId]: { ...existing, ...person } },
    }
  }

  function getPersonDetails(treeId: string, personId: string): DetailedPerson | undefined {
    return personDetails.value[treeId]?.[personId]
  }

  function removePerson(treeId: string, personId: string) {
    const tree = trees.value.find(t => t.id === treeId)
    if (!tree?.root) return
    if (!findPersonById(tree.root, personId)) return

    const updatedRoot = removePersonFromTree(tree.root, personId)

    const treeFlatPersons = flatPersons.value[treeId] ?? {}
    const treePersonDetails = personDetails.value[treeId] ?? {}

    trees.value = trees.value.map(t => (t.id === treeId ? { ...t, root: updatedRoot } : t))
    flatPersons.value = {
      ...flatPersons.value,
      [treeId]: Object.fromEntries(
        Object.entries(treeFlatPersons).filter(([key]) => key !== personId),
      ),
    }
    personDetails.value = {
      ...personDetails.value,
      [treeId]: Object.fromEntries(
        Object.entries(treePersonDetails).filter(([key]) => key !== personId),
      ),
    }
  }

  function removePersonAndAllDependents(treeId: string, personId: string) {
    collectAllDependents(treeId, personId).forEach((person) => {
      removePerson(treeId, person.id)
    })
  }

  function hasSpouse(treeId: string, personId: string): boolean {
    return !!flatPersons.value[treeId]?.[personId]?.spouseId
  }

  function isRoot(treeId: string, personId: string): boolean {
    const root = trees.value.find(t => t.id === treeId)?.root
    if (!root) return false

    return root.id === personId || root.spouseId === personId
  }

  function getParentsIds(treeId: string, personId: string) {
    const person = flatPersons.value[treeId]?.[personId]
    if (!person) return { fatherId: null, motherId: null }

    return {
      fatherId: person.fatherId || null,
      motherId: person.motherId || null,
    }
  }

  function collectAllDependents(treeId: string, personId: string): Person[] {
    const root = trees.value.find(t => t.id === treeId)?.root
    if (!root) return []
    const person = findPersonById(root, personId)
    if (!person) return []

    return collectAllPersons(person)
  }

  function setMemberSort(field: MemberSortField, direction: MemberSortDirection) {
    memberSortField.value = field
    memberSortDirection.value = direction
  }

  return {
    trees,
    flatPersons,
    personDetails,
    selectedTreeId,
    memberSortField,
    memberSortDirection,
    selectedRoot,
    setTrees,
    setFlatPersons,
    addTree,
    removeTree,
    setTree,
    selectTree,
    getPersonFromRoot,
    addPerson,
    setPersonDetails,
    patchPersonDetails,
    getPersonDetails,
    removePerson,
    removePersonAndAllDependents,
    hasSpouse,
    isRoot,
    getParentsIds,
    collectAllDependents,
    setMemberSort,
  }
})
