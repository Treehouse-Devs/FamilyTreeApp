/**
 * Flat person data as returned by the API (before tree composition).
 */
export interface FlatPersonDto {
  id: string
  name: string
  birthDate: number
  isBloodRelated: boolean
  gender?: 'male' | 'female'
  deathDate?: number
  spouseId?: string
  fatherId?: string
  motherId?: string
  imageThumbnailUrl?: string
}

/**
 * Flat tree data as returned by the fetchTreeById API.
 */
export interface FlatTreeDto {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  familyImageUrl?: string
  rootId: string
  persons: FlatPersonDto[]
}

/**
 * A person node in the nested (composed) tree structure.
 */
export interface PersonDto {
  id: string
  name: string
  birthDate: number
  isBloodRelated: boolean
  deathDate?: number
  children?: PersonDto[]
  spouse?: PersonDto
  spouseId?: string
  imageThumbnailUrl?: string
  gender?: 'male' | 'female'
}

/**
 * A family tree with a nested root person.
 */
export interface TreeDto {
  id: string
  name: string
  createdAt: number
  updatedAt: number
  familyImageUrl?: string
  root?: PersonDto
}

/**
 * Response from uploading a family profile picture.
 */
export interface UploadFamilyImageResponseDto {
  familyImageUrl: string
}
