/**
 * Static type definitions and minimal fallback shapes for the public site.
 *
 * All real portfolio content (hero, about, skills, experience, projects, blog,
 * contact) is sourced from Supabase via the admin CMS — see /admin and the
 * fetchers in lib/api/*. The exports below are kept for two reasons:
 *
 *   1. Type definitions (e.g. `Project`, `ExperienceItem`, `IconName`) are
 *      imported across components and must not be removed.
 *   2. `navLinks` is real navigation config (not dummy data).
 *   3. `contactDetails` / `socialLinks` are the *fallback template* rendered
 *      when the `contact_settings` table is empty — the placeholder URLs are
 *      intentional so first-run admins can see which fields to fill in.
 *
 * The sample data arrays (`experienceTimeline`, `projects`, `skillCategories`,
 * `blogPosts`) are intentionally empty — manage this content via the admin
 * dashboard at /admin instead of editing this file.
 */

export type IconName = "Sparkles" | "Layers" | "Server" | "Bot" | "Cloud";

export type NavLink = {
  label: string;
  href: string;
  isExternal?: boolean;
  submenu?: NavLink[];
};

export const navLinks: NavLink[] = [
  { label: "Hero", href: "/#hero" },
  {
    label: "About",
    href: "/#about",
    submenu: [
      { label: "Projects", href: "/projects" },
      { label: "Blog", href: "/blog" },
    ],
  },
  { label: "Skills", href: "/#skills" },
  { label: "Experience", href: "/#experience" },
  { label: "Work", href: "/#projects" },
  { label: "Contact", href: "/#contact" },
  { label: "Hire me", href: "/#contact" },
];

export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  readingTime: string;
  tags: string[];
};

export const blogPosts: BlogPost[] = [];

export type SkillCategory = {
  title: string;
  description: string;
  icon: IconName;
  skills: string[];
  tools: string[];
};

// Manage skill categories via the admin dashboard at /admin/skills.
export const skillCategories: SkillCategory[] = [];

export type ExperienceItem = {
  company: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  achievements: string[];
  stack: string[];
};

// Manage experience timeline via the admin dashboard at /admin/experience.
export const experienceTimeline: ExperienceItem[] = [];

export type Project = {
  slug: string;
  title: string;
  category: string;
  description: string;
  year: string;
  tags: string[];
  accent: string;
  links: { label: string; href: string }[];
};

// Manage projects via the admin dashboard at /admin/projects.
export const projects: Project[] = [];

export type ContactDetails = {
  email: string;
  location: string;
  availability: string;
  socials: { label: string; href: string }[];
  callouts: string[];
};

// Fallback template rendered only when `contact_settings` is empty in the DB.
// Manage real contact info via the admin dashboard at /admin/settings.
export const contactDetails: ContactDetails = {
  email: "your-email@example.com",
  location: "Your City, Country",
  availability:
    "Open for opportunities and collaborations.",
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/your-profile" },
    { label: "GitHub", href: "https://github.com/your-username" },
    { label: "X (Twitter)", href: "https://x.com/your-handle" },
  ],
  callouts: [
    "Replace these with your own highlights",
    "Managed via the admin Settings panel",
    "These are fallback defaults only",
  ],
};

export const socialLinks = contactDetails.socials;
