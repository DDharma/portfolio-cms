import { z } from 'zod'

export const projectLinkSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['live', 'github', 'other']),
  label: z.string().min(1, 'Label is required'),
  href: z.string().url('Must be a valid URL'),
  sort_order: z.number().default(0),
})

export const projectTagSchema = z.object({
  id: z.string().optional(),
  tag: z.string().min(1, 'Tag is required'),
  sort_order: z.number().default(0),
})

export const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(1, 'Description is required'),
  featured_image: z.string().nullable().optional(),
  thumbnail_image: z.string().nullable().optional(),
  links: z.array(projectLinkSchema).default([]),
  tags: z.array(projectTagSchema).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
  sort_order: z.number().default(0),
})

export type Project = z.infer<typeof projectSchema>
export type ProjectLink = z.infer<typeof projectLinkSchema>
export type ProjectTag = z.infer<typeof projectTagSchema>
