import type { FlatPersonDto, PersonDto } from '@treely/dto/index'
import type { FamilyMember } from './entities/family-member.entity'

export function mapMemberToFlatPersonDto(member: FamilyMember): FlatPersonDto {
  return {
    id: member.id,
    name: member.fullName,
    gender: member.gender,
    birthDate: member.birthDate != null ? Number(member.birthDate) : undefined,
    birthOrder: member.birthOrder ?? undefined,
    deathDate: member.deathDate ? Number(member.deathDate) : undefined,
    isBloodRelated: member.isBloodRelated,
    imageThumbnailUrl: member.imageThumbnailUrl ?? undefined,
    fatherId: member.fatherId ?? undefined,
    motherId: member.motherId ?? undefined,
    spouseId: member.spouseId ?? undefined,
  }
}

export function mapMemberToPersonDto(member: FamilyMember): PersonDto {
  return {
    id: member.id,
    name: member.fullName,
    birthDate: member.birthDate != null ? Number(member.birthDate) : undefined,
    birthOrder: member.birthOrder ?? undefined,
    deathDate: member.deathDate ? Number(member.deathDate) : undefined,
    isBloodRelated: member.isBloodRelated,
    spouseId: member.spouseId ?? undefined,
    imageThumbnailUrl: member.imageThumbnailUrl ?? undefined,
    gender: member.gender,
  }
}
