import i18n from '@/i18n/index'
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email({ message: i18n.t('emailInvalid') }).min(1, { message: i18n.t('emailRequired') }),
  password: z.string().min(8, { message: i18n.t('passwordMinLength') }),
})

export type LoginSchema = z.infer<typeof loginSchema>
