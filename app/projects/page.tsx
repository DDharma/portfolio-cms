import type { Metadata } from "next";

import { SectionShell } from "@/components/sections/section-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { ProjectGrid } from "@/components/sections/projects-section";
import { Pagination } from "@/components/ui/pagination";
import { getPublishedProjects } from "@/lib/api/projects";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: "Projects · Dharmvir Dharmacharya",
  description:
    "Portfolio of AI-powered platforms, enterprise dashboards, CRM systems, and scalable frontend applications built with React, Next.js, and TypeScript.",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const { data: projects, count } = await getPublishedProjects(page, PAGE_SIZE);
  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <SectionShell id="projects-archive">
      <SectionHeading
        heading="Projects Archive"
        title="AI-powered platforms and enterprise-scale products."
        description="From AI hiring platforms to CRM systems and real-time dashboards — production builds serving 50+ enterprise clients with measurable business impact."
      />
      <ProjectGrid items={projects} />
      <Pagination currentPage={page} totalPages={totalPages} basePath="/projects" />
    </SectionShell>
  );
}
