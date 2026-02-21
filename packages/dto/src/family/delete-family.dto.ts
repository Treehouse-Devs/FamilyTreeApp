import { IsUUID } from 'class-validator'

export class DeleteFamilyDto {
  @IsUUID()
  familyId!: string
}
