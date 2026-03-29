import { z } from 'zod'

export const researchLinkSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Label is required'),
  href: z.string().url('Must be a valid URL'),
  sort_order: z.number().default(0),
})

export const researchTagSchema = z.object({
  id: z.string().optional(),
  tag: z.string().min(1, 'Tag is required'),
  sort_order: z.number().default(0),
})

export const researchPaperSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(1, 'Description is required'),
  content: z.string().min(1, 'Content is required'),
  featured_image: z.string().nullable().optional(),
  pdf_url: z.string().nullable().optional(),
  authors: z.array(z.string()).default([]),
  links: z.array(researchLinkSchema).default([]),
  tags: z.array(researchTagSchema).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
  sort_order: z.number().default(0),
})

export type ResearchPaper = z.infer<typeof researchPaperSchema>
export type ResearchLink = z.infer<typeof researchLinkSchema>
export type ResearchTag = z.infer<typeof researchTagSchema>
