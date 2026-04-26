import type { FlatPerson } from '@/utils/tree-compose'
import type { PersonDto, DetailedPersonDto, TreeDto } from '@treely/dto'

export type Person = PersonDto
export type DetailedPerson = DetailedPersonDto
export type Tree = TreeDto

export interface TreeState {
  trees: Tree[]
  flatPersons: Record<string, Record<string, FlatPerson>>
  personDetails: Record<string, Record<string, DetailedPerson>>
  selectedTreeId?: string
  memberSortField: 'name' | 'birthYear'
  memberSortDirection: 'asc' | 'desc'
}

export interface TreeActions {
  setTrees: (trees: Tree[]) => void
  addTree: (tree: Tree) => void
  removeTree: (treeId: string) => void
  setFlatPersons: (treeId: string, persons: FlatPerson[]) => void
  setTree: (tree: Tree) => void
  selectTree: (treeId: string) => void
  getPersonFromRoot: (treeId: string, personId: string) => DetailedPerson | undefined
  addPerson: (treeId: string, person: FlatPerson, type: 'spouse' | 'children' | 'parent', originId: string) => void
  setPersonDetails: (treeId: string, personId: string, person: DetailedPerson) => void
  patchPersonDetails: (treeId: string, personId: string, person: Partial<DetailedPerson>) => void
  getPersonDetails: (treeId: string, personId: string) => DetailedPerson | undefined
  removePerson: (treeId: string, personId: string) => void
  removePersonAndAllDependents: (treeId: string, personId: string) => void
  hasSpouse: (treeId: string, personId: string) => boolean
  isRoot: (treeId: string, personId: string) => boolean
  getParentsIds: (treeId: string, personId: string) => { fatherId: string | null, motherId: string | null }
  collectAllDependents: (treeId: string, personId: string) => Person[]
  setMemberSort: (field: 'name' | 'birthYear', direction: 'asc' | 'desc') => void
}

export interface TreeSlice extends TreeState, TreeActions {}
