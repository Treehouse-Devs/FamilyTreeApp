import z from 'zod'

export const familyRequestSchema = z.object({
  name: z.string(),
})
