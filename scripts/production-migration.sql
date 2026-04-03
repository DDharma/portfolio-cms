-- ============================================================================
-- PRODUCTION MIGRATION: Complete Supabase Schema Setup
-- ============================================================================
--
-- Consolidated migration file for setting up the entire portfolio CMS schema.
-- This is the single source of truth for the database structure.
-- Safe to run on a fresh Supabase project - uses CREATE TABLE IF NOT EXISTS.
--
-- Run in Supabase SQL Editor in order.
-- After running, apply password_hash to admin user and seed data separately.
--
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Helper function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper function to check if current user is admin
-- Uses SECURITY DEFINER to avoid infinite recursion on profiles table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PROFILES TABLE (custom JWT auth - no dependency on Supabase auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  avatar_url TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================================================
-- MEDIA TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT DEFAULT 'portfolio-images',
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_media_updated_at ON public.media;
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON public.media
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON public.media(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON public.media(created_at DESC);

-- ============================================================================
-- HERO CONTENT & CHILDREN
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.hero_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  heading TEXT,
  subtitle TEXT,
  description TEXT,
  featured_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  custom_style_ids UUID[]
);

DROP TRIGGER IF EXISTS update_hero_content_updated_at ON public.hero_content;
CREATE TRIGGER update_hero_content_updated_at BEFORE UPDATE ON public.hero_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.hero_ctas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id UUID REFERENCES public.hero_content(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  variant TEXT DEFAULT 'default' CHECK (variant IN ('default', 'secondary')),
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_hero_ctas_hero ON public.hero_ctas(hero_id);

CREATE TABLE IF NOT EXISTS public.hero_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id UUID REFERENCES public.hero_content(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  helper TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_hero_stats_hero ON public.hero_stats(hero_id);

CREATE TABLE IF NOT EXISTS public.hero_marquee_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_id UUID REFERENCES public.hero_content(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_hero_marquee_hero ON public.hero_marquee_items(hero_id);

-- ============================================================================
-- ABOUT CONTENT & CHILDREN
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.about_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  featured_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  custom_style_ids UUID[]
);

DROP TRIGGER IF EXISTS update_about_content_updated_at ON public.about_content;
CREATE TRIGGER update_about_content_updated_at BEFORE UPDATE ON public.about_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.about_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  about_id UUID REFERENCES public.about_content(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  custom_style_ids UUID[]
);

CREATE INDEX IF NOT EXISTS idx_about_highlights_about ON public.about_highlights(about_id);

CREATE TABLE IF NOT EXISTS public.about_principles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  about_id UUID REFERENCES public.about_content(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  custom_style_ids UUID[]
);

CREATE INDEX IF NOT EXISTS idx_about_principles_about ON public.about_principles(about_id);

-- ============================================================================
-- SKILL CATEGORIES & SKILLS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.skill_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

DROP TRIGGER IF EXISTS update_skill_categories_updated_at ON public.skill_categories;
CREATE TRIGGER update_skill_categories_updated_at BEFORE UPDATE ON public.skill_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.skill_categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  proficiency_level TEXT DEFAULT 'intermediate' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category_id);

-- ============================================================================
-- EXPERIENCE ITEMS & CHILDREN
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.experience_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  featured_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0
);

DROP TRIGGER IF EXISTS update_experience_items_updated_at ON public.experience_items;
CREATE TRIGGER update_experience_items_updated_at BEFORE UPDATE ON public.experience_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_experience_items_status ON public.experience_items(status);
CREATE INDEX IF NOT EXISTS idx_experience_items_sort ON public.experience_items(sort_order);

CREATE TABLE IF NOT EXISTS public.experience_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES public.experience_items(id) ON DELETE CASCADE NOT NULL,
  achievement TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_experience_achievements_experience ON public.experience_achievements(experience_id);

CREATE TABLE IF NOT EXISTS public.experience_tech_stack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES public.experience_items(id) ON DELETE CASCADE NOT NULL,
  technology TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_experience_tech_stack_experience ON public.experience_tech_stack(experience_id);

-- ============================================================================
-- PROJECTS & CHILDREN
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  featured_image TEXT,
  thumbnail_image TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  year TEXT,
  category TEXT,
  accent TEXT
);

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_sort ON public.projects(sort_order);

CREATE TABLE IF NOT EXISTS public.project_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('live', 'github', 'other')),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_project_links_project ON public.project_links(project_id);

CREATE TABLE IF NOT EXISTS public.project_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  tag TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_project_tags_project ON public.project_tags(project_id);

CREATE TABLE IF NOT EXISTS public.project_case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  headline TEXT NOT NULL,
  challenge TEXT NOT NULL,
  solution TEXT NOT NULL,
  results TEXT NOT NULL,
  featured_image TEXT,
  metrics JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

DROP TRIGGER IF EXISTS update_case_studies_updated_at ON public.project_case_studies;
CREATE TRIGGER update_case_studies_updated_at BEFORE UPDATE ON public.project_case_studies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_case_studies_status ON public.project_case_studies(status);
CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON public.project_case_studies(slug);
CREATE INDEX IF NOT EXISTS idx_case_studies_project ON public.project_case_studies(project_id);

CREATE TABLE IF NOT EXISTS public.case_study_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id UUID REFERENCES public.project_case_studies(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  section TEXT CHECK (section IN ('challenge', 'solution', 'results', 'general')),
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_case_study_images_case_study ON public.case_study_images(case_study_id);

CREATE TABLE IF NOT EXISTS public.case_study_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id UUID REFERENCES public.project_case_studies(id) ON DELETE CASCADE NOT NULL,
  tag TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_case_study_tags_case_study ON public.case_study_tags(case_study_id);

-- ============================================================================
-- BLOG POSTS & CHILDREN
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT,
  reading_time TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0
);

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC);

CREATE TABLE IF NOT EXISTS public.blog_post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE NOT NULL,
  tag TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_blog_post_tags_blog_post ON public.blog_post_tags(blog_post_id);

-- ============================================================================
-- RESEARCH PAPERS & CHILDREN
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.research_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT,
  pdf_url TEXT,
  authors TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0
);

DROP TRIGGER IF EXISTS update_research_papers_updated_at ON public.research_papers;
CREATE TRIGGER update_research_papers_updated_at BEFORE UPDATE ON public.research_papers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_research_papers_status ON public.research_papers(status);
CREATE INDEX IF NOT EXISTS idx_research_papers_slug ON public.research_papers(slug);
CREATE INDEX IF NOT EXISTS idx_research_papers_published_at ON public.research_papers(published_at DESC);

CREATE TABLE IF NOT EXISTS public.research_paper_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_paper_id UUID REFERENCES public.research_papers(id) ON DELETE CASCADE NOT NULL,
  tag TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_research_paper_tags_research_paper ON public.research_paper_tags(research_paper_id);

CREATE TABLE IF NOT EXISTS public.research_paper_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_paper_id UUID REFERENCES public.research_papers(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_research_paper_links_research_paper ON public.research_paper_links(research_paper_id);

-- ============================================================================
-- GALLERY PHOTOS & CHILDREN
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT,
  location TEXT,
  photo_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

DROP TRIGGER IF EXISTS update_gallery_photos_updated_at ON public.gallery_photos;
CREATE TRIGGER update_gallery_photos_updated_at BEFORE UPDATE ON public.gallery_photos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_gallery_photos_status ON public.gallery_photos(status);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_category ON public.gallery_photos(category);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_sort ON public.gallery_photos(sort_order);

CREATE TABLE IF NOT EXISTS public.gallery_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID REFERENCES public.gallery_photos(id) ON DELETE CASCADE NOT NULL,
  tag TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_gallery_tags_photo ON public.gallery_tags(photo_id);

-- ============================================================================
-- CUSTOM STYLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.custom_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  css_rules TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'text' CHECK (category IN ('text', 'background', 'border', 'layout', 'custom')),
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_custom_styles_updated_at ON public.custom_styles;
CREATE TRIGGER update_custom_styles_updated_at BEFORE UPDATE ON public.custom_styles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_custom_styles_active ON public.custom_styles(is_active);
CREATE INDEX IF NOT EXISTS idx_custom_styles_category ON public.custom_styles(category);

-- ============================================================================
-- SECTION METADATA TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.section_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  heading TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_section_metadata_updated_at ON public.section_metadata;
CREATE TRIGGER update_section_metadata_updated_at BEFORE UPDATE ON public.section_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed initial section_metadata values
INSERT INTO public.section_metadata (section_key, heading, title, description, status) VALUES
  ('skills', 'Capabilities', 'Crafted systems with engineering-grade polish.', 'A multidisciplinary toolkit for building expressive, reliable products end-to-end.', 'published'),
  ('experience', 'Experience', 'Professional experience and career highlights.', 'Key roles, achievements, and technical expertise across my career.', 'published')
ON CONFLICT (section_key) DO UPDATE SET
  status = 'published',
  updated_at = NOW();

-- ============================================================================
-- CONTACT SETTINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.contact_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  location TEXT NOT NULL,
  availability TEXT NOT NULL,
  socials JSONB DEFAULT '[]'::JSONB,
  callouts JSONB DEFAULT '[]'::JSONB,
  resume_url TEXT DEFAULT NULL,
  site_name TEXT NOT NULL DEFAULT 'Your Name',
  site_title TEXT NOT NULL DEFAULT 'Developer',
  site_description TEXT NOT NULL DEFAULT 'A developer portfolio.',
  site_logo TEXT NOT NULL DEFAULT 'P',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_contact_settings_updated_at ON public.contact_settings;
CREATE TRIGGER update_contact_settings_updated_at BEFORE UPDATE ON public.contact_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add branding columns to existing contact_settings tables (idempotent upgrade)
ALTER TABLE public.contact_settings ADD COLUMN IF NOT EXISTS site_name TEXT NOT NULL DEFAULT 'Your Name';
ALTER TABLE public.contact_settings ADD COLUMN IF NOT EXISTS site_title TEXT NOT NULL DEFAULT 'Developer';
ALTER TABLE public.contact_settings ADD COLUMN IF NOT EXISTS site_description TEXT NOT NULL DEFAULT 'A developer portfolio.';
ALTER TABLE public.contact_settings ADD COLUMN IF NOT EXISTS site_logo TEXT NOT NULL DEFAULT 'P';
ALTER TABLE public.contact_settings ADD COLUMN IF NOT EXISTS resume_url TEXT DEFAULT NULL;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Disable RLS on profiles (auth handled at API level with JWT)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Enable RLS on all content tables
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_ctas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_marquee_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_principles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_tech_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_study_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_study_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_paper_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_paper_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: MAIN CONTENT TABLES
-- ============================================================================
-- Pattern: Public can read published, Admins can do everything

-- Hero Content
DROP POLICY IF EXISTS "Public can read published hero" ON public.hero_content;
DROP POLICY IF EXISTS "Admins can manage hero" ON public.hero_content;
CREATE POLICY "Public can read published hero"
ON public.hero_content FOR SELECT
USING (status = 'published');
CREATE POLICY "Admins can manage hero"
ON public.hero_content FOR ALL
USING (public.is_admin());

-- About Content
DROP POLICY IF EXISTS "Public can read published about" ON public.about_content;
DROP POLICY IF EXISTS "Admins can manage about" ON public.about_content;
CREATE POLICY "Public can read published about"
ON public.about_content FOR SELECT
USING (status = 'published');
CREATE POLICY "Admins can manage about"
ON public.about_content FOR ALL
USING (public.is_admin());

-- Skill Categories
DROP POLICY IF EXISTS "Public can read published skills" ON public.skill_categories;
DROP POLICY IF EXISTS "Admins can manage skills" ON public.skill_categories;
CREATE POLICY "Public can read published skills"
ON public.skill_categories FOR SELECT
USING (status = 'published');
CREATE POLICY "Admins can manage skills"
ON public.skill_categories FOR ALL
USING (public.is_admin());

-- Experience Items
DROP POLICY IF EXISTS "Public can read published experience" ON public.experience_items;
DROP POLICY IF EXISTS "Admins can manage experience" ON public.experience_items;
CREATE POLICY "Public can read published experience"
ON public.experience_items FOR SELECT
USING (status = 'published');
CREATE POLICY "Admins can manage experience"
ON public.experience_items FOR ALL
USING (public.is_admin());

-- Projects
DROP POLICY IF EXISTS "Public can read published projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;
CREATE POLICY "Public can read published projects"
ON public.projects FOR SELECT
USING (status = 'published');
CREATE POLICY "Admins can manage projects"
ON public.projects FOR ALL
USING (public.is_admin());

-- Project Case Studies
DROP POLICY IF EXISTS "Public can read published case studies" ON public.project_case_studies;
DROP POLICY IF EXISTS "Admins can manage case studies" ON public.project_case_studies;
CREATE POLICY "Public can read published case studies"
ON public.project_case_studies FOR SELECT
USING (status = 'published');
CREATE POLICY "Admins can manage case studies"
ON public.project_case_studies FOR ALL
USING (public.is_admin());

-- Blog Posts
DROP POLICY IF EXISTS "Public can read published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;
CREATE POLICY "Public can read published blog posts"
ON public.blog_posts FOR SELECT
USING (status = 'published');
CREATE POLICY "Admins can manage blog posts"
ON public.blog_posts FOR ALL
USING (public.is_admin());

-- Research Papers
DROP POLICY IF EXISTS "Public can read published research" ON public.research_papers;
DROP POLICY IF EXISTS "Admins can manage research" ON public.research_papers;
CREATE POLICY "Public can read published research"
ON public.research_papers FOR SELECT
USING (status = 'published');
CREATE POLICY "Admins can manage research"
ON public.research_papers FOR ALL
USING (public.is_admin());

-- Gallery Photos
DROP POLICY IF EXISTS "Public can read published gallery photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Admins can manage gallery photos" ON public.gallery_photos;
CREATE POLICY "Public can read published gallery photos"
ON public.gallery_photos FOR SELECT
USING (status = 'published');
CREATE POLICY "Admins can manage gallery photos"
ON public.gallery_photos FOR ALL
USING (public.is_admin());

-- Section Metadata
DROP POLICY IF EXISTS "Public can read published section metadata" ON public.section_metadata;
DROP POLICY IF EXISTS "Admins can manage section metadata" ON public.section_metadata;
CREATE POLICY "Public can read published section metadata"
ON public.section_metadata FOR SELECT
USING (status = 'published');
CREATE POLICY "Admins can manage section metadata"
ON public.section_metadata FOR ALL
USING (public.is_admin());

-- ============================================================================
-- RLS POLICIES: CHILD TABLES
-- ============================================================================
-- Pattern: Public can read when parent is published, Admins can do everything

-- Hero CTAs
DROP POLICY IF EXISTS "Public can read hero CTAs" ON public.hero_ctas;
DROP POLICY IF EXISTS "Admins can manage hero CTAs" ON public.hero_ctas;
CREATE POLICY "Public can read hero CTAs"
ON public.hero_ctas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.hero_content
    WHERE hero_content.id = hero_ctas.hero_id AND hero_content.status = 'published'
  )
);
CREATE POLICY "Admins can manage hero CTAs"
ON public.hero_ctas FOR ALL
USING (public.is_admin());

-- Hero Stats
DROP POLICY IF EXISTS "Public can read hero stats" ON public.hero_stats;
DROP POLICY IF EXISTS "Admins can manage hero stats" ON public.hero_stats;
CREATE POLICY "Public can read hero stats"
ON public.hero_stats FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.hero_content
    WHERE hero_content.id = hero_stats.hero_id AND hero_content.status = 'published'
  )
);
CREATE POLICY "Admins can manage hero stats"
ON public.hero_stats FOR ALL
USING (public.is_admin());

-- Hero Marquee Items
DROP POLICY IF EXISTS "Public can read marquee items" ON public.hero_marquee_items;
DROP POLICY IF EXISTS "Admins can manage marquee items" ON public.hero_marquee_items;
CREATE POLICY "Public can read marquee items"
ON public.hero_marquee_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.hero_content
    WHERE hero_content.id = hero_marquee_items.hero_id AND hero_content.status = 'published'
  )
);
CREATE POLICY "Admins can manage marquee items"
ON public.hero_marquee_items FOR ALL
USING (public.is_admin());

-- About Highlights
DROP POLICY IF EXISTS "Public can read about highlights" ON public.about_highlights;
DROP POLICY IF EXISTS "Admins can manage about highlights" ON public.about_highlights;
CREATE POLICY "Public can read about highlights"
ON public.about_highlights FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.about_content
    WHERE about_content.id = about_highlights.about_id AND about_content.status = 'published'
  )
);
CREATE POLICY "Admins can manage about highlights"
ON public.about_highlights FOR ALL
USING (public.is_admin());

-- About Principles
DROP POLICY IF EXISTS "Public can read about principles" ON public.about_principles;
DROP POLICY IF EXISTS "Admins can manage about principles" ON public.about_principles;
CREATE POLICY "Public can read about principles"
ON public.about_principles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.about_content
    WHERE about_content.id = about_principles.about_id AND about_content.status = 'published'
  )
);
CREATE POLICY "Admins can manage about principles"
ON public.about_principles FOR ALL
USING (public.is_admin());

-- Skills
DROP POLICY IF EXISTS "Public can read skills" ON public.skills;
DROP POLICY IF EXISTS "Admins can manage skills items" ON public.skills;
CREATE POLICY "Public can read skills"
ON public.skills FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.skill_categories
    WHERE skill_categories.id = skills.category_id AND skill_categories.status = 'published'
  )
);
CREATE POLICY "Admins can manage skills items"
ON public.skills FOR ALL
USING (public.is_admin());

-- Experience Achievements
DROP POLICY IF EXISTS "Public can read experience achievements" ON public.experience_achievements;
DROP POLICY IF EXISTS "Admins can manage experience achievements" ON public.experience_achievements;
CREATE POLICY "Public can read experience achievements"
ON public.experience_achievements FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.experience_items
    WHERE experience_items.id = experience_achievements.experience_id AND experience_items.status = 'published'
  )
);
CREATE POLICY "Admins can manage experience achievements"
ON public.experience_achievements FOR ALL
USING (public.is_admin());

-- Experience Tech Stack
DROP POLICY IF EXISTS "Public can read experience tech stack" ON public.experience_tech_stack;
DROP POLICY IF EXISTS "Admins can manage experience tech stack" ON public.experience_tech_stack;
CREATE POLICY "Public can read experience tech stack"
ON public.experience_tech_stack FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.experience_items
    WHERE experience_items.id = experience_tech_stack.experience_id AND experience_items.status = 'published'
  )
);
CREATE POLICY "Admins can manage experience tech stack"
ON public.experience_tech_stack FOR ALL
USING (public.is_admin());

-- Project Links
DROP POLICY IF EXISTS "Public can read project links" ON public.project_links;
DROP POLICY IF EXISTS "Admins can manage project links" ON public.project_links;
CREATE POLICY "Public can read project links"
ON public.project_links FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_links.project_id AND projects.status = 'published'
  )
);
CREATE POLICY "Admins can manage project links"
ON public.project_links FOR ALL
USING (public.is_admin());

-- Project Tags
DROP POLICY IF EXISTS "Public can read project tags" ON public.project_tags;
DROP POLICY IF EXISTS "Admins can manage project tags" ON public.project_tags;
CREATE POLICY "Public can read project tags"
ON public.project_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = project_tags.project_id AND projects.status = 'published'
  )
);
CREATE POLICY "Admins can manage project tags"
ON public.project_tags FOR ALL
USING (public.is_admin());

-- Case Study Images
DROP POLICY IF EXISTS "Public can read case study images" ON public.case_study_images;
DROP POLICY IF EXISTS "Admins can manage case study images" ON public.case_study_images;
CREATE POLICY "Public can read case study images"
ON public.case_study_images FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_case_studies
    WHERE project_case_studies.id = case_study_images.case_study_id AND project_case_studies.status = 'published'
  )
);
CREATE POLICY "Admins can manage case study images"
ON public.case_study_images FOR ALL
USING (public.is_admin());

-- Case Study Tags
DROP POLICY IF EXISTS "Public can read case study tags" ON public.case_study_tags;
DROP POLICY IF EXISTS "Admins can manage case study tags" ON public.case_study_tags;
CREATE POLICY "Public can read case study tags"
ON public.case_study_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_case_studies
    WHERE project_case_studies.id = case_study_tags.case_study_id AND project_case_studies.status = 'published'
  )
);
CREATE POLICY "Admins can manage case study tags"
ON public.case_study_tags FOR ALL
USING (public.is_admin());

-- Blog Post Tags
DROP POLICY IF EXISTS "Public can read blog tags" ON public.blog_post_tags;
DROP POLICY IF EXISTS "Admins can manage blog tags" ON public.blog_post_tags;
CREATE POLICY "Public can read blog tags"
ON public.blog_post_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.blog_posts
    WHERE blog_posts.id = blog_post_tags.blog_post_id AND blog_posts.status = 'published'
  )
);
CREATE POLICY "Admins can manage blog tags"
ON public.blog_post_tags FOR ALL
USING (public.is_admin());

-- Research Paper Tags
DROP POLICY IF EXISTS "Public can read research tags" ON public.research_paper_tags;
DROP POLICY IF EXISTS "Admins can manage research tags" ON public.research_paper_tags;
CREATE POLICY "Public can read research tags"
ON public.research_paper_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.research_papers
    WHERE research_papers.id = research_paper_tags.research_paper_id AND research_papers.status = 'published'
  )
);
CREATE POLICY "Admins can manage research tags"
ON public.research_paper_tags FOR ALL
USING (public.is_admin());

-- Research Paper Links
DROP POLICY IF EXISTS "Public can read research links" ON public.research_paper_links;
DROP POLICY IF EXISTS "Admins can manage research links" ON public.research_paper_links;
CREATE POLICY "Public can read research links"
ON public.research_paper_links FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.research_papers
    WHERE research_papers.id = research_paper_links.research_paper_id AND research_papers.status = 'published'
  )
);
CREATE POLICY "Admins can manage research links"
ON public.research_paper_links FOR ALL
USING (public.is_admin());

-- Gallery Tags
DROP POLICY IF EXISTS "Public can read gallery tags" ON public.gallery_tags;
DROP POLICY IF EXISTS "Admins can manage gallery tags" ON public.gallery_tags;
CREATE POLICY "Public can read gallery tags"
ON public.gallery_tags FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.gallery_photos
    WHERE gallery_photos.id = gallery_tags.photo_id AND gallery_photos.status = 'published'
  )
);
CREATE POLICY "Admins can manage gallery tags"
ON public.gallery_tags FOR ALL
USING (public.is_admin());

-- ============================================================================
-- RLS POLICIES: MEDIA, CUSTOM STYLES, CONTACT SETTINGS
-- ============================================================================

-- Media (admin only)
DROP POLICY IF EXISTS "Admins can manage media" ON public.media;
CREATE POLICY "Admins can manage media"
ON public.media FOR ALL
USING (public.is_admin());

-- Custom Styles (public read active, admin manage all)
DROP POLICY IF EXISTS "Public read active custom styles" ON public.custom_styles;
DROP POLICY IF EXISTS "Admins manage custom styles" ON public.custom_styles;
CREATE POLICY "Public read active custom styles"
ON public.custom_styles FOR SELECT
USING (is_active = TRUE);
CREATE POLICY "Admins manage custom styles"
ON public.custom_styles FOR ALL
USING (public.is_admin());

-- Contact Settings (public read, admin manage)
DROP POLICY IF EXISTS "Public can read contact settings" ON public.contact_settings;
CREATE POLICY "Public can read contact settings"
ON public.contact_settings FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage contact settings" ON public.contact_settings;
CREATE POLICY "Admins can manage contact settings"
ON public.contact_settings FOR ALL
USING (public.is_admin());

-- ============================================================================
-- GRANTS
-- ============================================================================
-- service_role needs table-level grants even though it bypasses RLS.
-- Tables created via raw SQL (not the Supabase dashboard) don't inherit
-- default grants automatically.

GRANT USAGE ON SCHEMA public TO service_role, anon, authenticated;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
--
-- Next steps:
-- 1. Start your app and visit /setup to create your admin account
-- 2. Or use POST /api/auth/register to create an admin via API
-- 3. Optionally seed portfolio data via the admin dashboard
--
-- ============================================================================
