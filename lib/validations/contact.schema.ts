import { z } from 'zod'

export const socialSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  href: z.string().url('Must be a valid URL'),
})

export const contactSettingsSchema = z.object({
  id: z.string().optional(),
  email: z.string().email('Invalid email address'),
  location: z.string().min(1, 'Location is required'),
  availability: z.string().min(1, 'Availability is required'),
  resume_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  socials: z.array(socialSchema),
  callouts: z.array(z.string().min(1, 'Callout cannot be empty')),
})

export type ContactSettings = z.infer<typeof contactSettingsSchema>
