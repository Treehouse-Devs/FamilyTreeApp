import { collectAllPersons, findPersonById, removePersonFromTree, updatePersonInTree } from '@/store/slices/tree/utils'
import type { StateCreator } from 'zustand'
import type { TreeSlice, Person } from './types'
import type { FlatPerson } from '@/utils/tree-compose'

export const createTreeSlice: StateCreator<TreeSlice, [], [], TreeSlice> = (set, get) => ({
  trees: [],
  flatPersons: {},
  personDetails: {},
  memberSortField: 'birthYear',
  memberSortDirection: 'asc',

  setTrees: (trees) => {
    set({ trees })
  },

  setFlatPersons: (treeId, persons) => {
    const personsObj = persons.reduce((acc, person) => {
      acc[person.id] = person

      return acc
    }, {} as Record<string, FlatPerson>)

    set({ flatPersons: { ...get().flatPersons, [treeId]: personsObj } })
  },

  addTree: (tree) => {
    set(state => ({ trees: [...state.trees, tree] }))
  },

  removeTree: (treeId) => {
    set(state => ({ trees: state.trees.filter(tree => tree.id !== treeId) }))
  },

  setTree: (tree) => {
    set((state) => {
      const { trees } = state
      const found = trees.find(t => t.id === tree.id)
      if (found) {
        return {
          trees: trees.map(t => (t.id === tree.id ? { ...t, ...tree } : t)),
        }
      } else {
        const updatedTrees = [...trees, tree]

        return { trees: updatedTrees }
      }
    })
  },

  selectTree: (treeId: string) => {
    set({ selectedTreeId: treeId })
  },

  get selectedRoot() {
    const state = get()
    if (!state) return undefined
    const { trees, selectedTreeId } = state
    const selectedTree = trees.find(tree => tree.id === selectedTreeId)

    return selectedTree ? selectedTree.root : undefined
  },

  getPersonFromRoot: (treeId, personId) => {
    const state = get()
    if (!state) return undefined
    const { trees } = state
    const selectedTree = trees.find(tree => tree.id === treeId)
    if (!selectedTree?.root) return undefined

    return findPersonById(selectedTree.root, personId)
  },

  addPerson: (treeId, person, type, originId) => {
    set((state) => {
      const { trees, selectedTreeId } = state
      const selectedTree = trees.find(tree => tree.id === selectedTreeId)
      if (!selectedTree) return state

      const currentRoot = selectedTree.root
      if (!currentRoot) return state

      let updatedRoot: Person

      if (type === 'parent') {
        // New person becomes the root; old root becomes their child
        updatedRoot = {
          id: person.id,
          gender: person.gender,
          name: person.name,
          birthDate: person.birthDate,
          children: [currentRoot],
          isBloodRelated: true,
        }
      } else {
        if (!findPersonById(currentRoot, originId)) return state

        updatedRoot = updatePersonInTree(currentRoot, originId, (node) => {
          if (type === 'children') {
            return { ...node, children: node.children ? [...node.children, person] : [person] }
          }

          // type === 'spouse'
          return { ...node, spouse: person }
        })
      }

      return {
        trees: trees.map(tree =>
          tree.id === selectedTreeId ? { ...tree, root: updatedRoot } : tree,
        ),
        flatPersons: {
          [treeId]: {
            ...get().flatPersons[treeId],
            [person.id]: person,
          },
        },
      }
    })
  },

  setPersonDetails: (treeId, personId, person) => {
    set((state) => {
      const { personDetails } = state
      const treePersons = personDetails[treeId] || {}
      treePersons[personId] = person

      return { personDetails: { ...personDetails, [treeId]: treePersons } }
    })
  },

  patchPersonDetails: (treeId, personId, person) => {
    set((state) => {
      const { personDetails } = state
      const treePersons = personDetails[treeId] || {}
      if (!treePersons[personId]) {
        throw new Error(`Person with ID ${personId} not found in tree ${treeId}`)
      }
      treePersons[personId] = { ...treePersons[personId], ...person }

      return { personDetails: { ...personDetails, [treeId]: treePersons } }
    })
  },

  getPersonDetails: (treeId, personId) => {
    const state = get()
    if (!state) return undefined
    const { personDetails } = state

    return personDetails[treeId]?.[personId]
  },

  removePerson: (treeId, personId) => {
    set((state) => {
      const { trees } = state
      const tree = trees.find(t => t.id === treeId)
      if (!tree || !tree.root) return state
      const person = findPersonById(tree.root, personId)
      if (!person) return state
      const updatedRoot = removePersonFromTree(tree.root, personId)

      const flatPersons = state.flatPersons[treeId] || {}
      const filteredFlatPersons = Object.fromEntries(
        Object.entries(flatPersons).filter(([key]) => key !== personId),
      )

      const personDetails = state.personDetails[treeId] || {}
      const filteredPersonDetails = Object.fromEntries(
        Object.entries(personDetails).filter(([key]) => key !== personId),
      )

      return {
        trees: trees.map(tree =>
          tree.id === treeId ? { ...tree, root: updatedRoot } : tree,
        ),
        flatPersons: { ...state.flatPersons, [treeId]: filteredFlatPersons },
        personDetails: { ...state.personDetails, [treeId]: filteredPersonDetails },
      }
    })
  },

  removePersonAndAllDependents: (treeId, personId) => {
    const allDependents = get().collectAllDependents(treeId, personId).map(person => person.id)

    allDependents.forEach((personId) => {
      get().removePerson(treeId, personId)
    })
  },

  hasSpouse: (treeId, personId) => {
    const state = get()
    if (!state) return false
    const { flatPersons } = state

    return !!flatPersons[treeId]?.[personId]?.spouseId
  },

  isRoot: (treeId, personId) => {
    const state = get()
    if (!state) return false
    const { trees } = state
    const tree = trees.find(t => t.id === treeId)
    if (!tree || !tree.root) return false
    if (tree.root.id === personId || tree.root.spouseId === personId) return true

    return false
  },

  getParentsIds: (treeId, personId) => {
    const state = get()
    if (!state) return { fatherId: null, motherId: null }
    const { flatPersons } = state
    const person = flatPersons[treeId]?.[personId]

    if (!person) return { fatherId: null, motherId: null }

    return {
      fatherId: person.fatherId || null,
      motherId: person.motherId || null,
    }
  },

  collectAllDependents: (treeId, personId) => {
    const state = get()
    if (!state) return []
    const { trees } = state
    const tree = trees.find(t => t.id === treeId)
    if (!tree || !tree.root) return []
    const person = findPersonById(tree.root, personId)
    if (!person) return []

    // recursively find all dependents
    const dependents = collectAllPersons(person)

    return dependents
  },

  setMemberSort: (field, direction) => {
    set({ memberSortField: field, memberSortDirection: direction })
  },
})
