import { DetailedPerson, Tree } from '@/store/slices/treeSlice'
import { useStore } from '@/store/store'
import { composeTreeFromFlat, FlatTree } from '@/utils/tree-compose'
import { BaseService } from './base'
import type { UploadFamilyImageResponseDto, UploadMemberImageResponseDto } from '@treely/dto'

export class TreeService extends BaseService {
  static async fetchTrees() {
    return this.get<Tree[]>('/trees')
  }

  static async createTree(name: string) {
    const flatTree = await this.post<FlatTree>('/trees', { name })
    const tree = composeTreeFromFlat(flatTree)
    // Store the tree in Zustand store
    useStore.getState().setTree(tree)

    return tree
  }

  static async updateTree(tree: Tree) {
    const response = await this.put<{ success: boolean }>(`/trees/${tree.id}`, tree)
    if (response.success) {
      useStore.getState().setTree(tree)
    }

    return response
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

  static async updatePersonImageById(
    treeId: string,
    personId: string,
    imageUri: string,
  ): Promise<UploadMemberImageResponseDto> {
    return this.uploadImage<UploadMemberImageResponseDto>(
      `/trees/${treeId}/person/${personId}/image`,
      imageUri,
      'profile.webp',
    )
  }

  static async updateTreeImageById(
    treeId: string,
    imageUri: string,
  ): Promise<UploadFamilyImageResponseDto> {
    return this.uploadImage<UploadFamilyImageResponseDto>(
      `/trees/${treeId}/image`,
      imageUri,
      'family.webp',
    )
  }
}
