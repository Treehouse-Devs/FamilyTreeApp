import { IsUUID } from 'class-validator'

export class DeleteFamilyMemberDto {
  @IsUUID()
  familyId!: string

  @IsUUID()
  memberId!: string
}
