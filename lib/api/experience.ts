import { createClient } from '@/lib/supabase/server'
import { ExperienceItem } from '@/lib/validations/experience.schema'

export async function getPublishedExperience() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('experience_items')
    .select(
      `
      *,
      experience_achievements(*, sort_order),
      experience_tech_stack(*, sort_order)
    `
    )
    .eq('status', 'published')
    .order('sort_order')

  if (error) return []
  return data || []
}

export async function getExperienceItemById(id: string) {
  const supabase = await createClient()
  const { data: experienceData, error: experienceError } = await supabase
    .from('experience_items')
    .select('*')
    .eq('id', id)
    .single()

  if (experienceError) throw new Error(experienceError.message)

  const [achievements, techStack] = await Promise.all([
    supabase
      .from('experience_achievements')
      .select('*')
      .eq('experience_id', id)
      .order('sort_order'),
    supabase.from('experience_tech_stack').select('*').eq('experience_id', id).order('sort_order'),
  ])

  return {
    ...experienceData,
    achievements: achievements.data || [],
    tech_stack: techStack.data || [],
  }
}

export async function createExperienceItem(data: ExperienceItem) {
  const supabase = await createClient()
  const { achievements, tech_stack, ...experienceData } = data

  const { data: newExperience, error: experienceError } = await supabase
    .from('experience_items')
    .insert({
      ...experienceData,
      created_by: (await supabase.auth.getUser()).data.user?.id,
      published_at: experienceData.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (experienceError) throw new Error(experienceError.message)

  if (achievements.length > 0) {
    const { error } = await supabase
      .from('experience_achievements')
      .insert(
        achievements.map((achievement, i) => ({
          ...achievement,
          experience_id: newExperience.id,
          sort_order: i,
        }))
      )

    if (error) throw new Error(error.message)
  }

  if (tech_stack.length > 0) {
    const { error } = await supabase
      .from('experience_tech_stack')
      .insert(
        tech_stack.map((tech, i) => ({ ...tech, experience_id: newExperience.id, sort_order: i }))
      )

    if (error) throw new Error(error.message)
  }

  return newExperience
}

export async function updateExperienceItem(id: string, data: ExperienceItem) {
  const supabase = await createClient()
  const { achievements, tech_stack, ...experienceData } = data

  const { error: experienceError } = await supabase
    .from('experience_items')
    .update({
      ...experienceData,
      published_at: experienceData.status === 'published' ? new Date().toISOString() : null,
    })
    .eq('id', id)

  if (experienceError) throw new Error(experienceError.message)

  // Delete and recreate child records
  await Promise.all([
    supabase.from('experience_achievements').delete().eq('experience_id', id),
    supabase.from('experience_tech_stack').delete().eq('experience_id', id),
  ])

  if (achievements.length > 0) {
    const { error } = await supabase
      .from('experience_achievements')
      .insert(
        achievements.map((achievement, i) => ({ ...achievement, experience_id: id, sort_order: i }))
      )

    if (error) throw new Error(error.message)
  }

  if (tech_stack.length > 0) {
    const { error } = await supabase
      .from('experience_tech_stack')
      .insert(tech_stack.map((tech, i) => ({ ...tech, experience_id: id, sort_order: i })))

    if (error) throw new Error(error.message)
  }
}

export async function deleteExperienceItem(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('experience_items').delete().eq('id', id)

  if (error) throw new Error(error.message)
}
