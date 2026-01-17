import { collectAllPersons, findPersonById, setPerson } from '@/utils/tree-slice-utils'
import { StateCreator } from 'zustand'

// TODO use DTO
export interface Person {
  id: string
  name: string
  birthDate: number
  isBloodRelated: boolean
  deathDate?: number
  children?: Person[]
  spouse?: Person
  imageThumbnailUrl?: string
}

export interface DetailedPerson extends Person {
  gender?: 'male' | 'female'
  nationality?: string
  addresses?: {
    hometown?: string
    residence?: string
  }
  contact?: {
    mobile?: string
    home?: string
  }
  job?: {
    title?: string
    officeAddress?: string
  }
  fullImageUrl?: string
}

export interface Tree {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  familyImageUrl?: string
  root?: Person
}

export interface TreeState {
  trees: Tree[]
  persons: Record<string, Record<string, DetailedPerson>>
  selectedTreeId?: string
}

export interface TreeActions {
  setTrees: (trees: Tree[]) => void
  addTree: (tree: Tree) => void
  removeTree: (treeId: string) => void
  setTree: (tree: Tree) => void
  selectTree: (treeId: string) => void
  setRoot: (root: Person) => void
  selectedRoot?: Person
  addPerson: (Person: Person, type: 'spouse' | 'children' | 'parent', originId: string) => void
  setPerson: (Person: Person) => void
  addPersonDetail: (treeId: string, personId: string, person: DetailedPerson) => void
  patchPersonDetail: (treeId: string, personId: string, person: Partial<DetailedPerson>) => void
  getPersonDetail: (treeId: string, personId: string) => DetailedPerson | undefined
  getArrayOfPerson: (treeId: string) => DetailedPerson[]
}

export interface TreeSlice extends TreeState, TreeActions {}

export const createTreeSlice: StateCreator<TreeSlice, [], [], TreeSlice> = (set, get) => ({
  trees: [],
  persons: {},

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

  setPerson: (Person) => {
    set((state) => {
      const { trees, selectedTreeId } = state
      const selectedTree = trees.find(tree => tree.id === selectedTreeId)
      if (!selectedTree) return state

      if (!selectedTree.root) return state // No root to update Person
      const updatedRoot = setPerson(selectedTree.root, Person)

      return {
        trees: trees.map(tree =>
          tree.id === selectedTreeId ? { ...tree, root: updatedRoot } : tree,
        ),
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
})
