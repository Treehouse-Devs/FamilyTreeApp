import { z } from 'zod'
import { Gender } from '@treely/dto/client'
import type { TranslateFn } from '@/utils/date'

/**
 * Ported from the RN app's `validator/auth/authValidation.ts`, with one fix.
 *
 * There the schemas are built at module scope and call `i18n.t(...)` inline, so
 * every message is frozen to whichever language happened to be loaded when the
 * module was first imported — switching language in Settings does not update
 * them. Here each schema is a factory taking `t`, so calling it inside a
 * `computed` re-evaluates the messages whenever the locale changes.
 */

export const makeLoginSchema = (t: TranslateFn) => z.object({
  email: z.string().email({ message: t('emailInvalid') }).min(1, { message: t('emailRequired') }),
  password: z.string().min(8, { message: t('passwordSigninMinLength') }),
})

export type LoginSchema = z.infer<ReturnType<typeof makeLoginSchema>>

export const makeRegisterStep1Schema = (t: TranslateFn) => z.object({
  email: z.string().email({ message: t('emailInvalid') }).min(1, { message: t('emailRequired') }),
  password: z.string().min(8, { message: t('passwordSignupMinLength') }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: t('passwordsDoNotMatch'),
  path: ['confirmPassword'],
})

export const makeRegisterStep2Schema = (t: TranslateFn) => z.object({
  name: z.string().min(1, { message: t('nameRequired') }),
  gender: z.enum([Gender.MALE, Gender.FEMALE]),
  birthDate: z.coerce
    .number({ invalid_type_error: t('birthDateInvalid') })
    .int({ message: t('birthDateInvalid') })
    .positive({ message: t('birthDateRequired') })
    .finite({ message: t('birthDateInvalid') })
    .max(Date.now(), { message: t('birthDateInFuture') }),
})

export type RegisterSchema =
  z.infer<ReturnType<typeof makeRegisterStep1Schema>>
  & z.infer<ReturnType<typeof makeRegisterStep2Schema>>

export const makeForgotPasswordSchema = (t: TranslateFn) => z.object({
  email: z.string().email({ message: t('emailInvalid') }).min(1, { message: t('emailRequired') }),
})

export type ForgotPasswordSchema = z.infer<ReturnType<typeof makeForgotPasswordSchema>>

export const makeChangePasswordSchema = (t: TranslateFn) => z.object({
  oldPassword: z.string().min(8, { message: t('passwordSigninMinLength') }),
  newPassword: z.string().min(8, { message: t('passwordSignupMinLength') }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: t('passwordsDoNotMatch'),
  path: ['confirmPassword'],
})

export type ChangePasswordSchema = z.infer<ReturnType<typeof makeChangePasswordSchema>>
