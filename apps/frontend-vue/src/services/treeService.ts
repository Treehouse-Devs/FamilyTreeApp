import type {
  CreateFamilyMemberDto,
  FlatPersonDto,
  UploadFamilyImageResponseDto,
  UploadMemberImageResponseDto,
} from '@treely/dto/client'
import type { DetailedPerson, Tree } from '@/types/tree'
import type { FlatPerson, FlatTree } from '@/utils/tree-compose'
import { composeTreeFromFlat } from '@/utils/tree-compose'
import { useTreeStore } from '@/stores/tree'
import { BaseService } from './base'

/**
 * Ported from the RN app's `services/treeService.ts`.
 *
 * `createTree` and `fetchTreeById` still write straight into the store as a side
 * effect, as they do today — the tree store remains the normalized cache the
 * screens read from, with TanStack Query wrapping the request lifecycle around it.
 */
export class TreeService extends BaseService {
  static async fetchTrees() {
    return this.get<Tree[]>('/trees')
  }

  static async createTree(name: string) {
    const flatTree = await this.post<FlatTree>('/trees', { name })
    const { tree, persons } = composeTreeFromFlat(flatTree)
    const store = useTreeStore()
    store.setTree(tree)
    store.setFlatPersons(tree.id, persons)

    return tree
  }

  static async updateTree(tree: Tree) {
    const response = await this.put<{ success: boolean }>(`/trees/${tree.id}`, tree)
    if (response.success) {
      useTreeStore().setTree(tree)
    }

    return response
  }

  static async deleteTree(treeId: string) {
    return this.delete(`/trees/${treeId}`)
  }

  static async fetchTreeById(treeId: string) {
    const flatTree = await this.get<FlatTree>(`/trees/${treeId}`)
    const { tree, persons } = composeTreeFromFlat(flatTree)
    const store = useTreeStore()
    store.setTree(tree)
    store.setFlatPersons(tree.id, persons)

    return tree
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
    image: Blob,
  ): Promise<UploadMemberImageResponseDto> {
    return this.uploadImage<UploadMemberImageResponseDto>(
      `/trees/${treeId}/person/${personId}/image`,
      image,
      'profile.webp',
    )
  }

  static async updateTreeImageById(
    treeId: string,
    image: Blob,
  ): Promise<UploadFamilyImageResponseDto> {
    return this.uploadImage<UploadFamilyImageResponseDto>(
      `/trees/${treeId}/image`,
      image,
      'family.webp',
    )
  }
}
