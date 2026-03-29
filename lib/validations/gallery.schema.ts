import { z } from 'zod'

export const galleryTagSchema = z.object({
  id: z.string().optional(),
  tag: z.string().min(1, 'Tag is required'),
  sort_order: z.number().default(0),
})

export const galleryPhotoSchema = z.object({
  id: z.string().optional(),
  // Mandatory fields
  title: z.string().min(1, 'Title is required').max(200),
  image_url: z.string().min(1, 'Image is required'),
  // Optional fields
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  photo_date: z.string().nullable().optional(),
  tags: z.array(galleryTagSchema).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
  sort_order: z.number().default(0),
  is_featured: z.boolean().default(false),
})

export type GalleryPhoto = z.infer<typeof galleryPhotoSchema>
export type GalleryTag = z.infer<typeof galleryTagSchema>
