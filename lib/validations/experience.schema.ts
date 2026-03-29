import { z } from 'zod'

export const achievementSchema = z.object({
  id: z.string().optional(),
  achievement: z.string().min(1, 'Achievement is required'),
  sort_order: z.number().default(0),
})

export const techStackSchema = z.object({
  id: z.string().optional(),
  technology: z.string().min(1, 'Technology is required'),
  sort_order: z.number().default(0),
})

export const experienceItemSchema = z.object({
  id: z.string().optional(),
  // Mandatory fields
  title: z.string().min(1, 'Job Title is required'),
  company: z.string().min(1, 'Company is required'),
  location: z.string().min(1, 'Location is required'),
  start_date: z.string().min(1, 'Start Date is required'),
  description: z.string().min(1, 'Description is required'),
  // Optional fields
  end_date: z.string().nullable().optional(),
  is_current: z.boolean().default(false),
  featured_image: z.string().nullable().optional(),
  achievements: z.array(achievementSchema).default([]),
  tech_stack: z.array(techStackSchema).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
  sort_order: z.number().default(0),
})

export type ExperienceItem = z.infer<typeof experienceItemSchema>
export type Achievement = z.infer<typeof achievementSchema>
export type TechStack = z.infer<typeof techStackSchema>
