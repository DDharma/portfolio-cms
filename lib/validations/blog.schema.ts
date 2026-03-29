import { z } from 'zod'

export const blogTagSchema = z.object({
  id: z.string().optional(),
  tag: z.string().min(1, 'Tag is required'),
  sort_order: z.number().default(0),
})

export const blogPostSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be 2000 characters or less'),
  content: z.string().min(1, 'Content is required'),
  featured_image: z.string().nullable().optional(),
  reading_time: z.string().optional(),
  tags: z.array(blogTagSchema).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
  sort_order: z.number().default(0),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  created_by: z.string().optional(),
})

export type BlogPost = z.infer<typeof blogPostSchema>
export type BlogTag = z.infer<typeof blogTagSchema>
