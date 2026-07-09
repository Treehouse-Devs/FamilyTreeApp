import { useStore } from '@/store/store'

export const useFamilyTree = () => {
  const trees = useStore(state => state.trees)
  const setTrees = useStore(state => state.setTrees)
  const addTree = useStore(state => state.addTree)
  const removeTree = useStore(state => state.removeTree)
  const setTree = useStore(state => state.setTree)
  const selectTree = useStore(state => state.selectTree)
  const selectedTreeId = useStore(state => state.selectedTreeId)
  const selectedTree = useStore(state =>
    state.trees.find(tree => tree.id === state.selectedTreeId),
  )
  const selectedRoot = useStore(state => state.trees.find(tree => tree.id === state.selectedTreeId)?.root)
  const selectedRoots = useStore(state => state.trees.find(tree => tree.id === state.selectedTreeId)?.roots)
  const flatPersons = useStore(state => state.flatPersons)
  const getPersonDetails = useStore(state => state.getPersonDetails)
  const setPersonDetails = useStore(state => state.setPersonDetails)
  const removePersonAndAllDependents = useStore(state => state.removePersonAndAllDependents)
  const getPersonFromRoot = useStore(state => state.getPersonFromRoot)
  const addPerson = useStore(state => state.addPerson)
  const hasSpouse = useStore(state => state.hasSpouse)
  const isRoot = useStore(state => state.isRoot)
  const getParentsIds = useStore(state => state.getParentsIds)
  const collectAllDependents = useStore(state => state.collectAllDependents)
  const memberSortField = useStore(state => state.memberSortField)
  const memberSortDirection = useStore(state => state.memberSortDirection)
  const setMemberSort = useStore(state => state.setMemberSort)

  return {
    trees,
    setTrees,
    addTree,
    removeTree,
    setTree,
    selectTree,
    selectedTreeId,
    selectedTree,
    selectedRoot,
    selectedRoots,
    flatPersons,
    getPersonDetails,
    setPersonDetails,
    removePersonAndAllDependents,
    getPersonFromRoot,
    addPerson,
    hasSpouse,
    isRoot,
    getParentsIds,
    collectAllDependents,
    memberSortField,
    memberSortDirection,
    setMemberSort,
  }
}
