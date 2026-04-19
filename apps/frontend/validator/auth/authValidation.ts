import i18n from '@/i18n/index'
import { Gender } from '@/store/slices/userSlice'
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email({ message: i18n.t('emailInvalid') }).min(1, { message: i18n.t('emailRequired') }),
  password: z.string().min(8, { message: i18n.t('passwordSigninMinLength') }),
})

export type LoginSchema = z.infer<typeof loginSchema>

export const registerStep1Schema = z.object({
  email: z.string().email({ message: i18n.t('emailInvalid') }).min(1, { message: i18n.t('emailRequired') }),
  password: z.string().min(8, { message: i18n.t('passwordSignupMinLength') }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: i18n.t('passwordsDoNotMatch'),
  path: ['confirmPassword'],
})

export const registerStep2Schema = z.object({
  name: z.string().min(1, { message: i18n.t('nameRequired') }),
  gender: z.enum([Gender.MALE, Gender.FEMALE]),
  birthDate: z.coerce
    .number({ invalid_type_error: i18n.t('birthDateInvalid') })
    .int({ message: i18n.t('birthDateInvalid') })
    .positive({ message: i18n.t('birthDateRequired') })
    .finite({ message: i18n.t('birthDateInvalid') })
    .max(Date.now(), { message: i18n.t('birthDateInFuture') }),
})

export type RegisterSchema = z.infer<typeof registerStep1Schema> & z.infer<typeof registerStep2Schema>

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: i18n.t('emailInvalid') }).min(1, { message: i18n.t('emailRequired') }),
})

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(8, { message: i18n.t('passwordSigninMinLength') }),
  newPassword: z.string().min(8, { message: i18n.t('passwordSignupMinLength') }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: i18n.t('passwordsDoNotMatch'),
  path: ['confirmPassword'],
})

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>
