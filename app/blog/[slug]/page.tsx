import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'

import { SectionShell } from '@/components/sections/section-shell'
import { getBlogPosts, getBlogPostBySlug } from '@/lib/api/blog'
import { getSiteSettings, DEFAULT_SITE_NAME } from '@/lib/api/contact'

export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  try {
    const { data: posts } = await getBlogPosts()
    return posts.map((post: any) => ({ slug: post.slug }))
  } catch (error) {
    // During build time, cookies may not be available
    // Return empty array and let Next.js generate pages on-demand
    console.warn('Could not fetch blog posts for static generation:', error)
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const [post, settings] = await Promise.all([getBlogPostBySlug(slug), getSiteSettings()])
  const name = settings?.site_name ?? DEFAULT_SITE_NAME
  if (!post) {
    return { title: `Post not found · ${name}` }
  }
  return {
    title: `${post.title} · ${name}`,
    description: post.description,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <SectionShell id={`blog-${post.slug}`}>
      <div className="mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All posts
        </Link>
      </div>

      <div className="space-y-6">
        {/* Meta: Date and Reading Time */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
          {post.created_at && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Calendar className="h-4 w-4 text-zinc-500" />
              <span>
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
          {post.reading_time && (
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Clock className="h-4 w-4 text-zinc-500" />
              <span>{post.reading_time}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-medium tracking-[-0.02em] text-white md:text-4xl">
          {post.title}
        </h1>

        {/* Description / Excerpt */}
        <div
          className="text-lg text-zinc-400 prose prose-invert max-w-none [&_p]:m-0 [&_strong]:font-semibold [&_em]:italic"
          dangerouslySetInnerHTML={{ __html: post.description }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {post.tags.map((tag) => (
              <span
                key={tag.id || tag.tag}
                className="rounded-full border border-zinc-700/60 px-3 py-0.5 text-xs text-zinc-400"
              >
                {tag.tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Featured Image */}
      {post.featured_image && (
        <img
          src={post.featured_image}
          alt={post.title}
          className="mt-10 rounded-2xl w-full object-cover"
        />
      )}

      {/* Full Content */}
      <div className="mt-10 space-y-6">
        <div
          className="prose prose-invert max-w-none text-base leading-relaxed text-zinc-300"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </SectionShell>
  )
}
