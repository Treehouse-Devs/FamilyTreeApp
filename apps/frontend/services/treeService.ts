import { DetailedPerson, Tree } from '@/store/slices/treeSlice'
import { useStore } from '@/store/store'
import { composeTreeFromFlat, FlatTree } from '@/utils/tree-compose'
import { BaseService } from './base'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'

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

  private static async uploadImage<T>(
    endpoint: string,
    imageUri: string,
    defaultFilename: string = 'image.webp',
  ): Promise<T> {
    // Convert image to WebP format for better compression
    // Note: manipulateAsync is deprecated in favor of useImageManipulator hook,
    // but the hook only works in React components. This static service requires manipulateAsync.
    const result = await manipulateAsync(
      imageUri,
      [], // No actions - just format conversion
      {
        compress: 0.85, // 85% quality
        format: SaveFormat.WEBP,
      },
    )

    const formData = new FormData()

    // Extract filename from URI and change extension to .webp
    const originalFilename = imageUri.split('/').pop() || defaultFilename
    const filename = originalFilename.replace(/\.[^.]+$/, '.webp')

    // Create file object for upload (React Native FormData accepts this format)
    const fileBlob = {
      uri: result.uri,
      type: 'image/webp',
      name: filename,
    }

    formData.append('image', fileBlob as unknown as Blob)

    return await this.postFormData<T>(endpoint, formData)
  }

  static async updatePersonImageById(
    treeId: string,
    personId: string,
    imageUri: string,
  ): Promise<{ fullImageUrl: string, imageThumbnailUrl: string }> {
    return this.uploadImage<{ fullImageUrl: string, imageThumbnailUrl: string }>(
      `/trees/${treeId}/person/${personId}/image`,
      imageUri,
      'profile.webp',
    )
  }

  static async updateTreeImageById(
    treeId: string,
    imageUri: string,
  ): Promise<{ familyImageUrl: string }> {
    return this.uploadImage<{ familyImageUrl: string }>(
      `/trees/${treeId}/image`,
      imageUri,
      'family.webp',
    )
  }
}
