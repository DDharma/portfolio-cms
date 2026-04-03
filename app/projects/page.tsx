import type { Metadata } from 'next'

import { SectionShell } from '@/components/sections/section-shell'
import { SectionHeading } from '@/components/sections/section-heading'
import { ProjectGrid } from '@/components/sections/projects-section'
import { getPublishedProjects } from '@/lib/api/projects'
import { getSiteSettings, DEFAULT_SITE_NAME } from '@/lib/api/contact'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const name = settings?.site_name ?? DEFAULT_SITE_NAME
  return {
    title: `Projects · ${name}`,
    description: 'A collection of projects and case studies.',
  }
}

export default async function ProjectsPage() {
  const projects = await getPublishedProjects()

  return (
    <SectionShell id="projects-archive">
      <SectionHeading
        heading="Projects Archive"
        title="A collection of projects and case studies."
        description="Production applications showcasing technical depth across different domains and scales."
      />
      <ProjectGrid items={projects} />
    </SectionShell>
  )
}
