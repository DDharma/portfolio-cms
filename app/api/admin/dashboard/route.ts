import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/jwt'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/dashboard
 * Get dashboard statistics for admin panel
 */
export async function GET(request: NextRequest) {
  // Verify admin authentication
  const authResult = requireAdmin(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const supabase = await createClient()

    // Fetch counts for all content types in parallel
    const [
      heroResult,
      aboutResult,
      skillsResult,
      experienceResult,
      projectsResult,
      blogResult,
      researchResult,
    ] = await Promise.all([
      supabase.from('hero_content').select('id, status', { count: 'exact', head: false }),
      supabase.from('about_content').select('id, status', { count: 'exact', head: false }),
      supabase.from('skill_categories').select('id, status', { count: 'exact', head: false }),
      supabase.from('experience_items').select('id, status', { count: 'exact', head: false }),
      supabase.from('projects').select('id, status', { count: 'exact', head: false }),
      supabase.from('blog_posts').select('id, status', { count: 'exact', head: false }),
      supabase.from('research_papers').select('id, status', { count: 'exact', head: false }),
    ])

    // Helper to count by status
    const countByStatus = (data: any[]) => {
      const published = data?.filter(item => item.status === 'published').length || 0
      const draft = data?.filter(item => item.status === 'draft').length || 0
      return { total: data?.length || 0, published, draft }
    }

    // Aggregate statistics
    const stats = {
      hero: countByStatus(heroResult.data || []),
      about: countByStatus(aboutResult.data || []),
      skills: countByStatus(skillsResult.data || []),
      experience: countByStatus(experienceResult.data || []),
      projects: countByStatus(projectsResult.data || []),
      blog: countByStatus(blogResult.data || []),
      research: countByStatus(researchResult.data || []),
    }

    // Calculate totals across all content
    const totals = {
      total: Object.values(stats).reduce((sum, stat) => sum + stat.total, 0),
      published: Object.values(stats).reduce((sum, stat) => sum + stat.published, 0),
      draft: Object.values(stats).reduce((sum, stat) => sum + stat.draft, 0),
    }

    return NextResponse.json({
      success: true,
      data: {
        stats,
        totals,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}
