import { HeroSection } from '@/components/sections/hero-section'
import { AboutSection } from '@/components/sections/about-section'
import { SkillsSection } from '@/components/sections/skills-section'
import { ExperienceSection } from '@/components/sections/experience-section'
import { ProjectsSection } from '@/components/sections/projects-section'
import { BlogSection } from '@/components/sections/blog-section'
import { GallerySection } from '@/components/sections/gallery-section'
import { ContactSection } from '@/components/sections/contact-section'

import { getHeroContent } from '@/lib/api/hero'
import { getAboutContent } from '@/lib/api/about'
import { getPublishedSkills } from '@/lib/api/skills'
import { getPublishedExperience } from '@/lib/api/experience'
import { getPublishedProjects } from '@/lib/api/projects'
import { getPublishedGalleryPhotos } from '@/lib/api/gallery'
import { getBlogPosts } from '@/lib/api/blog'
import { getSectionMetadata } from '@/lib/api/section-metadata'
import { getContactSettings } from '@/lib/api/contact'

// ISR - revalidate every hour, on-demand via API
export const revalidate = 3600

export default async function Home() {
  // Fetch all data in parallel
  const [
    hero,
    about,
    skills,
    experience,
    projectsResult,
    galleryResult,
    blogResult,
    skillsHeading,
    experienceHeading,
    projectsHeading,
    contact,
  ] = await Promise.all([
    getHeroContent(),
    getAboutContent(),
    getPublishedSkills(),
    getPublishedExperience(),
    getPublishedProjects(),
    getPublishedGalleryPhotos(),
    getBlogPosts(1, 4),
    getSectionMetadata('skills'),
    getSectionMetadata('experience'),
    getSectionMetadata('projects'),
    getContactSettings(),
  ])

  return (
    <>
      <HeroSection data={hero} />
      <BlogSection posts={blogResult.data} />
      <AboutSection data={about} />
      <SkillsSection data={skills} sectionHeading={skillsHeading} />
      <ExperienceSection data={experience} sectionHeading={experienceHeading} />
      <ProjectsSection data={galleryResult.data} sectionHeading={projectsHeading} />
      <GallerySection data={galleryResult} />
      <ContactSection data={contact} />
    </>
  )
}
