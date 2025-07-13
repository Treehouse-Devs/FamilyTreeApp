import i18n from '@/i18n/index'
import z from 'zod'

export const familyRequestSchema = z.object({
  name: z.string().trim(),
})

export const familyCreateSchema = z.object({
  name: z.string().trim().min(1, i18n.t('familyNameRequired')).max(100, i18n.t('familyNameTooLong')),
})

export type FamilyRequestSchema = z.infer<typeof familyRequestSchema>
export type FamilyCreateSchema = z.infer<typeof familyCreateSchema>
