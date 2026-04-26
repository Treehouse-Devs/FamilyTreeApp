import type { DetailedPerson, Tree } from '@/store/slices/tree/types'
import { useStore } from '@/store/store'
import type { FlatPerson } from '@/utils/tree-compose'
import { composeTreeFromFlat, type FlatTree } from '@/utils/tree-compose'
import { BaseService } from './base'
import type { UploadFamilyImageResponseDto, UploadMemberImageResponseDto, CreateFamilyMemberDto, FlatPersonDto } from '@treely/dto'

export class TreeService extends BaseService {
  static async fetchTrees() {
    return this.get<Tree[]>('/trees')
  }

  static async createTree(name: string) {
    const flatTree = await this.post<FlatTree>('/trees', { name })
    const { tree, persons } = composeTreeFromFlat(flatTree)
    // Store the tree in Zustand store
    useStore.getState().setTree(tree)
    useStore.getState().setFlatPersons(tree.id, persons)

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
    const { tree, persons } = composeTreeFromFlat(flatTree)
    // Store the tree in Zustand store
    useStore.getState().setTree(tree)
    useStore.getState().setFlatPersons(tree.id, persons)
  }

  static async createPerson(treeId: string, person: CreateFamilyMemberDto) {
    return this.post<{ person: FlatPerson }>(`/trees/${treeId}/person`, person)
  }

  static async fetchPersonById(treeId: string, personId: string) {
    return this.get<{ person: DetailedPerson }>(`/trees/${treeId}/person/${personId}`)
  }

  static async patchPersonById(treeId: string, personId: string, person: Partial<FlatPersonDto>) {
    return this.patch<{ person: DetailedPerson }>(`/trees/${treeId}/person/${personId}`, person)
  }

  static async deletePersonById(treeId: string, personId: string) {
    return this.delete(`/trees/${treeId}/person/${personId}`)
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
