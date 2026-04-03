import { z } from 'zod'

export const aboutHighlightSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().nullable().optional(),
  sort_order: z.number().default(0),
})

export const aboutPrincipleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  sort_order: z.number().default(0),
})

export const aboutContentSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'), // Now accepts HTML, no max length
  description: z.string().min(1, 'Description is required'),
  featured_image: z.string().nullable().optional(),
  custom_style_ids: z.array(z.string().uuid()).optional().nullable().default(null), // Track which custom styles are used
  highlights: z.array(aboutHighlightSchema).default([]),
  principles: z.array(aboutPrincipleSchema).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
})

export type AboutContent = z.infer<typeof aboutContentSchema>
export type AboutHighlight = z.infer<typeof aboutHighlightSchema>
export type AboutPrinciple = z.infer<typeof aboutPrincipleSchema>
