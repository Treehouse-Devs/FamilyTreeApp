import { DetailedPerson, Tree } from '@/store/slices/treeSlice'
import { useStore } from '@/store/store'
import { composeTreeFromFlat, FlatTree } from '@/utils/tree-compose'
import { BaseService } from './base'

export class TreeService extends BaseService {
  static async fetchTrees() {
    return this.get<Tree[]>('/trees')
  }

  static async createTree(tree: Tree) {
    return this.post<Tree>('/trees', tree)
  }

  static async updateTree(tree: Tree) {
    // update tree in zustand store
    useStore.getState().setTree(tree)

    return this.put<Tree>(`/trees/${tree.id}`, tree)
  }

  static async deleteTree(treeId: string) {
    return this.delete(`/trees/${treeId}`)
  }

  static async fetchTreeById(treeId: string) {
    const flatTree = await this.get<FlatTree>(`/trees/${treeId}`)
    const tree = composeTreeFromFlat(flatTree)
    // Store the tree in Zustand store
    useStore.getState().setTree(tree)

    return tree
  }

  static async fetchPersonById(treeId: string, personId: string) {
    return this.get<{ person: DetailedPerson }>(`/trees/${treeId}/person/${personId}`)
  }

  static async patchPersonById(treeId: string, personId: string, person: Partial<DetailedPerson>) {
    return this.patch<{ person: DetailedPerson }>(`/trees/${treeId}/person/${personId}`, person)
  }
}
