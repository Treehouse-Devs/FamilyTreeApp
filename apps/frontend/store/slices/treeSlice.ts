import { collectAllPersons, findPersonById, setPerson } from '@/utils/tree-slice-utils'
import { StateCreator } from 'zustand'
import type { PersonDto, DetailedPersonDto, TreeDto } from '@treely/dto'

export type Person = PersonDto
export type DetailedPerson = DetailedPersonDto
export type Tree = TreeDto

export interface TreeState {
  trees: Tree[]
  persons: Record<string, Record<string, DetailedPerson>>
  selectedTreeId?: string
  memberSortField: 'name' | 'birthYear'
  memberSortDirection: 'asc' | 'desc'
}

export interface TreeActions {
  setTrees: (trees: Tree[]) => void
  addTree: (tree: Tree) => void
  removeTree: (treeId: string) => void
  setTree: (tree: Tree) => void
  selectTree: (treeId: string) => void
  setRoot: (root: Person) => void
  selectedRoot?: Person
  getPerson: (treeId: string, personId: string) => DetailedPerson | undefined
  addPerson: (person: Person, type: 'spouse' | 'children' | 'parent', originId: string) => void
  setPerson: (treeId: string, personId: string, person: DetailedPerson) => void
  addPersonDetail: (treeId: string, personId: string, person: DetailedPerson) => void
  patchPersonDetail: (treeId: string, personId: string, person: Partial<DetailedPerson>) => void
  getPersonDetail: (treeId: string, personId: string) => DetailedPerson | undefined
  getArrayOfPerson: (treeId: string) => DetailedPerson[]
  hasSpouse: (treeId: string, personId: string) => boolean
  isRoot: (treeId: string, personId: string) => boolean
  collectAllDependents: (treeId: string, personId: string) => Person[]
  setMemberSort: (field: 'name' | 'birthYear', direction: 'asc' | 'desc') => void
}

export interface TreeSlice extends TreeState, TreeActions {}

export const createTreeSlice: StateCreator<TreeSlice, [], [], TreeSlice> = (set, get) => ({
  trees: [],
  persons: {},
  memberSortField: 'birthYear',
  memberSortDirection: 'asc',

  setTrees: (trees) => {
    set({ trees })
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

  updateTree: (tree: Tree) => {
    set((state) => {
      const { trees } = state
      const updatedTrees = trees.map(t => (t.id === tree.id ? { ...t, ...tree } : t))

      return { trees: updatedTrees, root: tree.root }
    })
  },

  setRoot: (root: Person) => {
    set((state) => {
      const { trees, selectedTreeId } = state
      const selectedTree = trees.find(tree => tree.id === selectedTreeId)
      if (!selectedTree) return state

      return {
        trees: trees.map(tree =>
          tree.id === selectedTreeId ? { ...tree, root } : tree,
        ),
        selectedRoot: root,
        persons: {
          [selectedTreeId!]: get().getArrayOfPerson(selectedTreeId!).reduce((acc, person) => {
            acc[person.id] = person

            return acc
          }, {} as Record<string, DetailedPerson>),
        },
      }
    })
  },

  get selectedRoot() {
    const state = get()
    if (!state) return undefined
    const { trees, selectedTreeId } = state
    const selectedTree = trees.find(tree => tree.id === selectedTreeId)

    return selectedTree ? selectedTree.root : undefined
  },

  getPerson: (treeId, personId) => {
    const state = get()
    if (!state) return undefined
    const { trees } = state
    const selectedTree = trees.find(tree => tree.id === treeId)
    if (!selectedTree) return undefined

    return state.persons[treeId][personId] ?? undefined
  },

  addPerson: (Person, type, originId) => {
    set((state) => {
      const { trees, selectedTreeId } = state
      const selectedTree = trees.find(tree => tree.id === selectedTreeId)
      if (!selectedTree) return state

      let updatedRoot = selectedTree.root
      if (!updatedRoot) {
        return state // No root to add Person to
      }
      const foundPerson = findPersonById(updatedRoot, originId)
      if (!foundPerson) return state

      if (type === 'children') {
        foundPerson.children = foundPerson.children ? [...foundPerson.children, Person] : [Person]
      } else if (type === 'spouse') {
        foundPerson.spouse = Person
      } else if (type === 'parent') {
        // Assuming we want to add a parent, we need to create a new root
        updatedRoot = { id: Person.id, name: Person.name, birthDate: Person.birthDate, children: [updatedRoot], isBloodRelated: true }
      }

      return {
        trees: trees.map(tree =>
          tree.id === selectedTreeId ? { ...tree, root: updatedRoot } : tree,
        ),
      }
    })
  },

  setPerson: (treeId, personId, person) => {
    set((state) => {
      const { trees, selectedTreeId } = state
      const selectedTree = trees.find(tree => tree.id === selectedTreeId)
      if (!selectedTree) return state

      if (!selectedTree.root) return state // No root to update Person
      const updatedRoot = setPerson(selectedTree.root, { id: personId, name: person.name, birthDate: person.birthDate, deathDate: person.deathDate })

      return {
        trees: trees.map(tree =>
          tree.id === selectedTreeId ? { ...tree, root: updatedRoot } : tree,
        ),
        persons: {
          [treeId]: {
            ...get().persons[treeId],
            [personId]: person,
          },
        },
      }
    })
  },

  addPersonDetail: (treeId, personId, person) => {
    set((state) => {
      const { persons } = state
      const treePersons = persons[treeId] || {}
      treePersons[personId] = person

      return { persons: { ...persons, [treeId]: treePersons } }
    })
  },

  patchPersonDetail: (treeId, personId, person) => {
    set((state) => {
      const { persons } = state
      const treePersons = persons[treeId] || {}
      if (!treePersons[personId]) {
        throw new Error(`Person with ID ${personId} not found in tree ${treeId}`)
      }
      treePersons[personId] = { ...treePersons[personId], ...person }

      return { persons: { ...persons, [treeId]: treePersons } }
    })
  },

  getPersonDetail: (treeId, personId) => {
    const state = get()
    if (!state) return undefined
    const { persons } = state

    return persons[treeId]?.[personId]
  },

  getArrayOfPerson: (treeId) => {
    const state = get()
    if (!state) return []
    const { trees, persons } = state
    const tree = trees.find(t => t.id === treeId)
    if (!tree || !tree.root) return []

    const allPersons = collectAllPersons(tree.root)

    return allPersons.map((person) => {
      const detail = persons[treeId]?.[person.id]

      return {
        ...person,
        ...(detail || {}),
      }
    })
  },

  hasSpouse: (treeId, personId) => {
    const state = get()
    if (!state) return false
    const { persons } = state

    return !!persons[treeId]?.[personId]?.spouseId
  },

  isRoot: (treeId, personId) => {
    const state = get()
    if (!state) return false
    const { trees } = state
    const tree = trees.find(t => t.id === treeId)
    if (!tree || !tree.root) return false
    if (tree.root.id === personId) return true
    const person = findPersonById(tree.root, personId)
    if (!person) return false

    return person.spouseId === tree.root.id
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
