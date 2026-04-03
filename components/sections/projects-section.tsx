import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { SectionHeading } from '@/components/sections/section-heading'
import { SectionShell } from '@/components/sections/section-shell'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { sanitizeHTML } from '@/lib/utils/html-sanitizer'
import { cn } from '@/lib/utils'
import type { Project } from '@/utils/data'

function truncateText(text: string, maxLength: number): string {
  const stripped = text.replace(/<[^>]*>/g, '')
  if (stripped.length <= maxLength) return stripped
  return stripped.slice(0, maxLength).trimEnd() + '...'
}

type ProjectGridProps = {
  items: Project[] | any[]
}

const ProjectCard = ({ project }: { project: Project | any }) => {
  const tags = project.project_tags || project.tags || []
  const links = project.project_links || project.links || []
  const slug = project.slug || project.id

  return (
    <article className="group rounded-2xl border border-white/[0.06] bg-zinc-950 p-5 transition-colors duration-300 hover:border-white/[0.1]">
      <div
        className={cn(
          'relative h-40 overflow-hidden rounded-xl bg-gradient-to-br p-4',
          project.accent
        )}
      >
        <div className="flex items-center justify-between text-xs text-white/80">
          <span>{project.category}</span>
          <span>{project.year}</span>
        </div>
        <div
          className={cn(
            'absolute inset-0 -z-10 bg-gradient-to-br opacity-30 blur-2xl transition-opacity duration-500 group-hover:opacity-50',
            project.accent
          )}
        />
      </div>
      <div className="mt-5 space-y-2">
        <Link href={`/projects/${slug}`}>
          <h3 className="text-xl font-medium text-white hover:text-zinc-300 transition-colors">
            {project.title}
          </h3>
        </Link>
        <p className="text-sm text-zinc-400">{truncateText(project.description || '', 300)}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.slice(0, 6).map((tag: any) => {
          const tagName = tag.tag || tag
          return (
            <Badge key={tagName} variant="outline">
              {tagName}
            </Badge>
          )
        })}
        {tags.length > 6 && <Badge variant="outline">+{tags.length - 6}</Badge>}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {links.map((link: any) => (
          <Link
            key={`${slug}-${link.label}`}
            href={link.href}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/60 px-3 py-1 text-xs text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
            target={link.href.startsWith('http') ? '_blank' : undefined}
            rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
          >
            {link.label}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        ))}
      </div>
    </article>
  )
}

type ProjectGridComponentProps = {
  items?: Project[] | any[]
}

export const ProjectGrid = ({ items }: ProjectGridComponentProps) => {
  if (!items || items.length === 0) return null
  return (
    <div className="mt-12 grid gap-4 md:grid-cols-2 lg:gap-6">
      {items.map((project: any) => (
        <ProjectCard key={project.slug || project.id} project={project} />
      ))}
    </div>
  )
}

type ProjectsSectionProps = {
  data?: Project[] | any[]
  sectionHeading?: { heading: string; title: string; description?: string } | null
}

export const ProjectsSection = ({ data, sectionHeading }: ProjectsSectionProps) => {
  return (
    <SectionShell id="projects">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          heading={sectionHeading?.heading ?? 'Selected Work'}
          title={sectionHeading?.title ?? 'AI-powered platforms and enterprise-scale products.'}
          description={
            sectionHeading?.description ??
            'Production builds spanning AI hiring platforms, CRM systems, e-commerce engines, and intelligent dashboards serving 50+ enterprise clients.'
          }
        />
        <Link
          href="/projects"
          className={cn(
            buttonVariants({ variant: 'secondary', size: 'sm' }),
            'self-start md:self-auto shrink-0'
          )}
        >
          View archive
        </Link>
      </div>
      <ProjectGrid items={data} />
    </SectionShell>
  )
}
