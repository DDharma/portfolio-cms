import { z } from 'zod'

export const sectionMetadataSchema = z.object({
  id: z.string().optional(),
  section_key: z.string(),
  heading: z.string().min(1, 'Heading is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  status: z.enum(['draft', 'published']).default('published'),
})

export type SectionMetadata = z.infer<typeof sectionMetadataSchema>
