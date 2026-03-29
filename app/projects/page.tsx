import type { Metadata } from "next";

import { SectionShell } from "@/components/sections/section-shell";
import { SectionHeading } from "@/components/sections/section-heading";
import { ProjectGrid } from "@/components/sections/projects-section";
import { getPublishedProjects } from "@/lib/api/projects";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Projects · Dharmvir Dharmacharya",
  description:
    "Portfolio of AI-powered platforms, enterprise dashboards, CRM systems, and scalable frontend applications built with React, Next.js, and TypeScript.",
};

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <SectionShell id="projects-archive">
      <SectionHeading
        heading="Projects Archive"
        title="AI-powered platforms and enterprise-scale products."
        description="From AI hiring platforms to CRM systems and real-time dashboards — production builds serving 50+ enterprise clients with measurable business impact."
      />
      <ProjectGrid items={projects} />
    </SectionShell>
  );
}
