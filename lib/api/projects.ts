import { createClient } from '@/lib/supabase/server'
import { Project } from '@/lib/validations/projects.schema'

export async function getPublishedProjects() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select(
      `
      *,
      project_tags(*, sort_order),
      project_links(*, sort_order)
    `
    )
    .eq('status', 'published')
    .order('sort_order')

  if (error) return []
  return data || []
}

export async function getProjectBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select(
      `
      *,
      project_tags(*, sort_order),
      project_links(*, sort_order)
    `
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) return null
  return data
}

export async function getProjectById(id: string) {
  const supabase = await createClient()
  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (projectError) throw new Error(projectError.message)

  const [tags, links] = await Promise.all([
    supabase.from('project_tags').select('*').eq('project_id', id).order('sort_order'),
    supabase.from('project_links').select('*').eq('project_id', id).order('sort_order'),
  ])

  return {
    ...projectData,
    tags: tags.data || [],
    links: links.data || [],
  }
}

export async function createProject(data: Project) {
  const supabase = await createClient()
  const { tags, links, ...projectData } = data

  const { data: newProject, error: projectError } = await supabase
    .from('projects')
    .insert({
      ...projectData,
      created_by: (await supabase.auth.getUser()).data.user?.id,
      published_at: projectData.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (projectError) throw new Error(projectError.message)

  if (tags.length > 0) {
    const { error } = await supabase
      .from('project_tags')
      .insert(tags.map((tag, i) => ({ ...tag, project_id: newProject.id, sort_order: i })))

    if (error) throw new Error(error.message)
  }

  if (links.length > 0) {
    const { error } = await supabase
      .from('project_links')
      .insert(links.map((link, i) => ({ ...link, project_id: newProject.id, sort_order: i })))

    if (error) throw new Error(error.message)
  }

  return newProject
}

export async function updateProject(id: string, data: Project) {
  const supabase = await createClient()
  const { tags, links, ...projectData } = data

  const { error: projectError } = await supabase
    .from('projects')
    .update({
      ...projectData,
      published_at: projectData.status === 'published' ? new Date().toISOString() : null,
    })
    .eq('id', id)

  if (projectError) throw new Error(projectError.message)

  // Delete and recreate child records
  await Promise.all([
    supabase.from('project_tags').delete().eq('project_id', id),
    supabase.from('project_links').delete().eq('project_id', id),
  ])

  if (tags.length > 0) {
    const { error } = await supabase
      .from('project_tags')
      .insert(tags.map((tag, i) => ({ ...tag, project_id: id, sort_order: i })))

    if (error) throw new Error(error.message)
  }

  if (links.length > 0) {
    const { error } = await supabase
      .from('project_links')
      .insert(links.map((link, i) => ({ ...link, project_id: id, sort_order: i })))

    if (error) throw new Error(error.message)
  }
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').delete().eq('id', id)

  if (error) throw new Error(error.message)
}
