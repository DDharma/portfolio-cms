import { z } from 'zod'

export const socialSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  href: z.string().url('Must be a valid URL'),
})

export const contactSettingsSchema = z.object({
  id: z.string().optional(),
  site_name: z.string().min(1, 'Site name is required'),
  site_title: z.string().min(1, 'Site title is required'),
  site_description: z.string().min(1, 'Site description is required'),
  site_logo: z.string().min(1, 'Site logo is required').max(10, 'Keep it short — initials or emoji'),
  email: z.string().email('Invalid email address'),
  location: z.string().min(1, 'Location is required'),
  availability: z.string().min(1, 'Availability is required'),
  resume_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  socials: z.array(socialSchema),
  callouts: z.array(z.string().min(1, 'Callout cannot be empty')),
})

export type ContactSettings = z.infer<typeof contactSettingsSchema>
