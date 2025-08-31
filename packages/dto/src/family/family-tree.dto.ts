export class FamilyTreeResponseDto {
  tree!: {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    root: FamilyMemberNodeDto
  }
}

export class FamilyMemberNodeDto {
  id!: string
  name!: string
  birthDate!: Date
  deathDate?: Date | null
  children?: FamilyMemberNodeDto[]
  spouse?: FamilyMemberNodeDto | null
}
