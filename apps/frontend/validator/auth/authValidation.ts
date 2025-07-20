import i18n from '@/i18n/index'
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email({ message: i18n.t('emailInvalid') }).min(1, { message: i18n.t('emailRequired') }),
  password: z.string().min(8, { message: i18n.t('passwordSigninMinLength') }),
})

export type LoginSchema = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  email: z.string().email({ message: i18n.t('emailInvalid') }).min(1, { message: i18n.t('emailRequired') }),
  password: z.string().min(8, { message: i18n.t('passwordSignupMinLength') }),
  name: z.string().min(1, { message: i18n.t('nameRequired') }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: i18n.t('passwordsDoNotMatch'),
  path: ['confirmPassword'],
})

export type RegisterSchema = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: i18n.t('emailInvalid') }).min(1, { message: i18n.t('emailRequired') }),
})

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: i18n.t('passwordResetMinLength') }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: i18n.t('passwordsDoNotMatch'),
  path: ['confirmPassword'],
})

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
