import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { SectionShell } from "@/components/sections/section-shell";
import { Badge } from "@/components/ui/badge";
import { getPublishedProjects, getProjectBySlug } from "@/lib/api/projects";
import { sanitizeHTML } from "@/lib/utils/html-sanitizer";
import { cn } from "@/lib/utils";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const projects = await getPublishedProjects();
    return projects.map((project: any) => ({ slug: project.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) {
    return { title: "Project not found · Dharmvir Dharmacharya" };
  }
  const plainDescription = project.description?.replace(/<[^>]*>/g, "").slice(0, 160);
  return {
    title: `${project.title} · Dharmvir Dharmacharya`,
    description: plainDescription,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const tags = project.project_tags || [];
  const links = project.project_links || [];

  return (
    <SectionShell id={`project-${project.slug}`}>
      <div className="mb-8">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="space-y-6">
        {/* Header with category and year */}
        {(project.category || project.year) && (
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            {project.category && <span>{project.category}</span>}
            {project.category && project.year && <span className="text-zinc-600">·</span>}
            {project.year && <span>{project.year}</span>}
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl font-medium tracking-[-0.02em] text-white md:text-4xl">
          {project.title}
        </h1>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: any) => (
              <Badge key={tag.id || tag.tag} variant="outline">
                {tag.tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Links */}
        {links.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {links.map((link: any) => (
              <Link
                key={link.id || link.label}
                href={link.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700/60 px-4 py-1.5 text-sm text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
              >
                {link.label}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Featured Image */}
      {project.featured_image && (
        <div
          className={cn(
            "mt-10 relative overflow-hidden rounded-2xl bg-gradient-to-br",
            project.accent
          )}
        >
          <img
            src={project.featured_image}
            alt={project.title}
            className="w-full object-cover"
          />
        </div>
      )}

      {/* Full Description */}
      <div className="mt-10">
        <div
          className="prose prose-invert max-w-none text-base leading-relaxed text-zinc-300"
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(project.description || '') }}
        />
      </div>
    </SectionShell>
  );
}
