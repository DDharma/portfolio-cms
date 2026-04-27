import type { Metadata } from 'next'

import { SectionShell } from '@/components/sections/section-shell'
import { SectionHeading } from '@/components/sections/section-heading'
import { ProjectGrid } from '@/components/sections/projects-section'
import { Pagination } from '@/components/ui/pagination'
import { getPublishedProjects } from '@/lib/api/projects'
import { getSiteSettings, DEFAULT_SITE_NAME } from '@/lib/api/contact'

export const revalidate = 3600

const PAGE_SIZE = 12

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const name = settings?.site_name ?? DEFAULT_SITE_NAME
  return {
    title: `Projects · ${name}`,
    description: 'A collection of projects and case studies.',
  }
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params.page) || 1)
  const { data: projects, count } = await getPublishedProjects(page, PAGE_SIZE)
  const totalPages = Math.ceil(count / PAGE_SIZE)

  return (
    <SectionShell id="projects-archive">
      <SectionHeading
        heading="Projects Archive"
        title="A collection of projects and case studies."
        description="Production applications showcasing technical depth across different domains and scales."
      />
      <ProjectGrid items={projects} />
      {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} basePath="/projects" />}
    </SectionShell>
  )
}
