import type { PersonDto } from '../family/family-response.dto'

/**
 * A person with full detail fields, as returned by the fetchPersonById API.
 */
export interface DetailedPersonDto extends PersonDto {
  location?: {
    nationality: string
    hometown: string
    domicile: string
  }
  contact?: {
    phoneNumber: number | null
    homeNumber: number | null
  }
  occupation?: {
    occupation: string
    officeAddress: string
  }
  fullImageUrl?: string
}

/**
 * Response from uploading a member profile picture.
 */
export interface UploadMemberImageResponseDto {
  fullImageUrl: string
  imageThumbnailUrl: string
}
