import { HeroSection } from "@/components/sections/hero-section";
import { AboutSection } from "@/components/sections/about-section";
import { SkillsSection } from "@/components/sections/skills-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { BlogSection } from "@/components/sections/blog-section";
import { ContactSection } from "@/components/sections/contact-section";

import { getHeroContent } from "@/lib/api/hero";
import { getAboutContent } from "@/lib/api/about";
import { getPublishedSkills } from "@/lib/api/skills";
import { getPublishedExperience } from "@/lib/api/experience";
import { getPublishedProjects } from "@/lib/api/projects";
import { getBlogPosts } from "@/lib/api/blog";
import { getSectionMetadata } from "@/lib/api/section-metadata";
import { getContactSettings } from "@/lib/api/contact";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [hero, about, skills, experience, projectsResult, blogResult, skillsHeading, experienceHeading, projectsHeading, contact] = await Promise.all([
    getHeroContent(),
    getAboutContent(),
    getPublishedSkills(),
    getPublishedExperience(),
    getPublishedProjects(),
    getBlogPosts(1, 4),
    getSectionMetadata('skills'),
    getSectionMetadata('experience'),
    getSectionMetadata('projects'),
    getContactSettings(),
  ]);

  return (
    <>
      <HeroSection data={hero} />
      <BlogSection posts={blogResult.data} />
      <AboutSection data={about} />
      <SkillsSection data={skills} sectionHeading={skillsHeading} />
      <ExperienceSection data={experience} sectionHeading={experienceHeading} />
      <ProjectsSection data={projectsResult.data} sectionHeading={projectsHeading} />
      <ContactSection data={contact} />
    </>
  );
}
