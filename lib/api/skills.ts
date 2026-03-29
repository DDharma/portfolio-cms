import { createClient } from '@/lib/supabase/server'
import { SkillCategory } from '@/lib/validations/skills.schema'

export async function getPublishedSkills() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('skill_categories')
    .select(`
      *,
      skills(*, sort_order)
    `)
    .eq('status', 'published')
    .order('sort_order')

  if (error) return []
  return data || []
}

export async function getSkillCategoryById(id: string) {
  const supabase = await createClient()
  const { data: categoryData, error: categoryError } = await supabase
    .from('skill_categories')
    .select('*')
    .eq('id', id)
    .single()

  if (categoryError) throw new Error(categoryError.message)

  const { data: skills, error: skillsError } = await supabase
    .from('skills')
    .select('*')
    .eq('category_id', id)
    .order('sort_order')

  if (skillsError) throw new Error(skillsError.message)

  return {
    ...categoryData,
    skills: skills || [],
  }
}

export async function createSkillCategory(data: SkillCategory) {
  const supabase = await createClient()
  const { skills, ...categoryData } = data

  const { data: newCategory, error: categoryError } = await supabase
    .from('skill_categories')
    .insert({
      ...categoryData,
      created_by: (await supabase.auth.getUser()).data.user?.id,
      published_at: categoryData.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (categoryError) throw new Error(categoryError.message)

  if (skills.length > 0) {
    const { error } = await supabase
      .from('skills')
      .insert(skills.map((skill, i) => ({ ...skill, category_id: newCategory.id, sort_order: i })))

    if (error) throw new Error(error.message)
  }

  return newCategory
}

export async function updateSkillCategory(id: string, data: SkillCategory) {
  const supabase = await createClient()
  const { skills, ...categoryData } = data

  const { error: categoryError } = await supabase
    .from('skill_categories')
    .update({
      ...categoryData,
      published_at: categoryData.status === 'published' ? new Date().toISOString() : null,
    })
    .eq('id', id)

  if (categoryError) throw new Error(categoryError.message)

  // Delete and recreate skills
  await supabase.from('skills').delete().eq('category_id', id)

  if (skills.length > 0) {
    const { error } = await supabase
      .from('skills')
      .insert(skills.map((skill, i) => ({ ...skill, category_id: id, sort_order: i })))

    if (error) throw new Error(error.message)
  }
}

export async function deleteSkillCategory(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('skill_categories')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}
