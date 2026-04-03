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

export const skillCategories: SkillCategory[] = [
  {
    title: "Frontend Development",
    description:
      "Building modern, responsive user interfaces with clean component architecture.",
    icon: "Sparkles",
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
    tools: ["Next.js", "TypeScript", "Tailwind CSS", "React Query"],
  },
  {
    title: "Backend Development",
    description:
      "Reliable server-side services and API design.",
    icon: "Server",
    skills: ["Node.js", "REST APIs", "PostgreSQL", "Authentication"],
    tools: ["Node.js", "Express", "Supabase", "PostgreSQL"],
  },
];

export type ExperienceItem = {
  company: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  achievements: string[];
  stack: string[];
};

export const experienceTimeline: ExperienceItem[] = [
  {
    company: "Example Corp",
    role: "Senior Developer",
    period: "Jan 2023 — Present",
    location: "Remote",
    summary:
      "Leading frontend architecture and building scalable web applications.",
    achievements: [
      "Led migration to Next.js, improving performance by 40%",
      "Built component library used across 3 products",
    ],
    stack: ["Next.js", "TypeScript", "React Query", "Tailwind CSS"],
  },
  {
    company: "Startup Inc",
    role: "Frontend Developer",
    period: "Jun 2021 — Dec 2022",
    location: "Remote",
    summary:
      "Built customer-facing dashboards and internal tools.",
    achievements: [
      "Developed admin dashboard from scratch",
      "Improved page load times by 60%",
    ],
    stack: ["React", "JavaScript", "Redux", "REST APIs"],
  },
];

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

export const projects: Project[] = [
  {
    slug: "portfolio-cms",
    title: "Developer Portfolio CMS",
    category: "Full-Stack App",
    description:
      "A self-hosted portfolio CMS with admin dashboard, rich text editing, media uploads, and custom styling. Built with Next.js, Supabase, and TypeScript.",
    year: "2024",
    tags: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
    accent: "from-emerald-400/70 via-cyan-400/70 to-sky-500/60",
    links: [],
  },
  {
    slug: "example-saas-app",
    title: "Example SaaS Dashboard",
    category: "SaaS",
    description:
      "A multi-tenant dashboard with role-based access control, real-time data visualization, and responsive design.",
    year: "2023",
    tags: ["React", "TypeScript", "Tailwind", "Chart.js"],
    accent: "from-violet-400/70 via-purple-500/70 to-indigo-500/60",
    links: [],
  },
];

export type ContactDetails = {
  email: string;
  location: string;
  availability: string;
  socials: { label: string; href: string }[];
  callouts: string[];
};

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
