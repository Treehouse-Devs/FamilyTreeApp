import { useStore } from '@/store/store'

export const useFamilyTree = () => {
  const trees = useStore(state => state.trees)
  const addTree = useStore(state => state.addTree)
  const removeTree = useStore(state => state.removeTree)
  const setTree = useStore(state => state.setTree)
  const selectTree = useStore(state => state.selectTree)
  const selectedTreeId = useStore(state => state.selectedTreeId)
  const setRoot = useStore(state => state.setRoot)
  const selectedRoot = useStore(state => state.selectedRoot)
  const selectedTree = useStore(state =>
    state.trees.find(tree => tree.id === state.selectedTreeId),
  )
  const getPerson = useStore(state => state.getPerson)
  const addPerson = useStore(state => state.addPerson)
  const setPerson = useStore(state => state.setPerson)
  const getArrayOfPerson = useStore(state => state.getArrayOfPerson)
  const hasSpouse = useStore(state => state.hasSpouse)
  const isRoot = useStore(state => state.isRoot)
  const collectAllDependents = useStore(state => state.collectAllDependents)
  const getArrayOfPersons = (treeId: string) => useStore(state => state.persons[treeId] ?? {})
  const memberSortField = useStore(state => state.memberSortField)
  const memberSortDirection = useStore(state => state.memberSortDirection)
  const setMemberSort = useStore(state => state.setMemberSort)

  return {
    trees,
    addTree,
    removeTree,
    setTree,
    selectTree,
    selectedTreeId,
    setRoot,
    selectedRoot,
    selectedTree,
    getPerson,
    addPerson,
    setPerson,
    getArrayOfPerson,
    hasSpouse,
    isRoot,
    collectAllDependents,
    getArrayOfPersons,
    memberSortField,
    memberSortDirection,
    setMemberSort,
  }
}
