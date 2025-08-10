import { useStore } from '@/store/store'

export const useFamilyTree = () => {
  const trees = useStore(state => state.trees)
  const addTree = useStore(state => state.addTree)
  const removeTree = useStore(state => state.removeTree)
  const setTree = useStore(state => state.setTree)
  const selectTree = useStore(state => state.selectTree)
  const selectedTreeId = useStore(state => state.selectedTreeId)
  const setRoot = useStore(state => state.setRoot)
  const getRoot = useStore(state => state.getRoot)
  const addPerson = useStore(state => state.addPerson)
  const setPerson = useStore(state => state.setPerson)

  return {
    trees,
    addTree,
    removeTree,
    setTree,
    selectTree,
    selectedTreeId,
    setRoot,
    getRoot,
    addPerson,
    setPerson,
  }
}
