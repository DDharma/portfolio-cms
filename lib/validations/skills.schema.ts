import { z } from 'zod'

export const PROFICIENCY_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const
export type ProficiencyLevel = (typeof PROFICIENCY_LEVELS)[number]

export const skillSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  proficiency_level: z.enum(PROFICIENCY_LEVELS).default('intermediate'),
  sort_order: z.number().default(0),
})

export const skillCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  skills: z.array(skillSchema).default([]),
  sort_order: z.number().default(0),
  status: z.enum(['draft', 'published']).default('draft'),
})

export type Skill = z.infer<typeof skillSchema>
export type SkillCategory = z.infer<typeof skillCategorySchema>
