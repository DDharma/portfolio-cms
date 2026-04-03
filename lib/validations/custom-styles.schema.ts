import { z } from 'zod'

/**
 * Schema for Custom Styles (CSS class definitions)
 */
export const customStyleSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .min(1, 'Style name is required')
    .max(50, 'Style name must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed'),
  css_rules: z
    .string()
    .min(1, 'CSS rules are required')
    .max(2000, 'CSS rules must be less than 2000 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  category: z.enum(['text', 'background', 'border', 'layout', 'custom']).default('text'),
  is_active: z.boolean().default(true),
  created_by: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

export type CustomStyle = z.infer<typeof customStyleSchema>

/**
 * Schema for creating a new custom style (subset of fields)
 */
export const createCustomStyleSchema = customStyleSchema.pick({
  name: true,
  css_rules: true,
  description: true,
  category: true,
})

export type CreateCustomStyle = z.infer<typeof createCustomStyleSchema>

/**
 * Schema for updating an existing custom style
 */
export const updateCustomStyleSchema = customStyleSchema.pick({
  name: true,
  css_rules: true,
  description: true,
  category: true,
  is_active: true,
})

export type UpdateCustomStyle = z.infer<typeof updateCustomStyleSchema>
