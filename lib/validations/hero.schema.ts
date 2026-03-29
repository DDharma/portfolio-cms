import { z } from 'zod'

export const heroCtaSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Label is required'),
  href: z.string(),
  variant: z.enum(['default', 'secondary']).default('default'),
  sort_order: z.number().default(0),
})

export const heroStatSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Label is required'),
  value: z.string().min(1, 'Value is required'),
  sort_order: z.number().default(0),
})

export const heroMarqueeItemSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, 'Text is required'),
  icon: z.string().optional(),
  sort_order: z.number().default(0),
})

export const heroContentSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),  // Now accepts HTML, no max length restriction
  subtitle: z.any().optional(),
  description: z.any().optional(),
  featured_image: z.any().optional(),
  heading: z.any().optional(),
  custom_style_ids: z.array(z.string().uuid()).optional().nullable().default(null),  // Track which custom styles are used
  ctas: z.array(heroCtaSchema).optional().default([]),
  stats: z.array(heroStatSchema).optional().default([]),
  marquee_items: z.array(heroMarqueeItemSchema).optional().default([]),
  status: z.enum(['draft', 'published']).default('draft'),
})

export type HeroContent = z.infer<typeof heroContentSchema>
export type HeroCta = z.infer<typeof heroCtaSchema>
export type HeroStat = z.infer<typeof heroStatSchema>
export type HeroMarqueeItem = z.infer<typeof heroMarqueeItemSchema>
