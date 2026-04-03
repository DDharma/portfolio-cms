import { createClient } from '@/lib/supabase/server'
import { BlogPost } from '@/lib/validations/blog.schema'

export async function getBlogPosts(): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, blog_post_tags(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }

  return data || []
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, blog_post_tags(*)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) {
    console.error(`Error fetching blog post ${slug}:`, error)
    return null
  }

  return data
}

export async function createBlogPost(data: BlogPost) {
  const supabase = await createClient()
  const { tags, ...blogData } = data

  const { data: newPost, error: postError } = await supabase
    .from('blog_posts')
    .insert({
      ...blogData,
      created_by: (await supabase.auth.getUser()).data.user?.id,
      published_at: blogData.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single()

  if (postError) throw new Error(postError.message)

  if (tags && tags.length > 0) {
    const { error: tagsError } = await supabase.from('blog_tags').insert(
      tags.map((tag, i) => ({
        ...tag,
        blog_id: newPost.id,
        sort_order: i,
      }))
    )

    if (tagsError) throw new Error(tagsError.message)
  }

  return newPost
}

export async function updateBlogPost(id: string, data: BlogPost) {
  const supabase = await createClient()
  const { tags, ...blogData } = data

  const { error: postError } = await supabase
    .from('blog_posts')
    .update({
      ...blogData,
      published_at: blogData.status === 'published' ? new Date().toISOString() : null,
    })
    .eq('id', id)

  if (postError) throw new Error(postError.message)

  // Delete and recreate tags
  await supabase.from('blog_tags').delete().eq('blog_id', id)

  if (tags && tags.length > 0) {
    const { error: tagsError } = await supabase.from('blog_tags').insert(
      tags.map((tag, i) => ({
        ...tag,
        blog_id: id,
        sort_order: i,
      }))
    )

    if (tagsError) throw new Error(tagsError.message)
  }
}

export async function deleteBlogPost(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('blog_posts').delete().eq('id', id)

  if (error) throw new Error(error.message)
}
