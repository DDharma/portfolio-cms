# 🚀 Portfolio CMS - Quick Start Guide

You now have a **complete, production-ready CMS** for managing your portfolio. Here's how to get started in 5 minutes.

## 📋 Prerequisites

- Supabase account (free tier works)
- Node.js 18+
- Development server running

## ⚡ Quick Setup (5 minutes)

### Step 1: Create Supabase Resources (2 min)

1. **Create Storage Bucket**
   - Go to Supabase dashboard → Storage → Buckets
   - Click "New Bucket"
   - Name: `portfolio-images`
   - Make it Public (toggle ON)
   - Create

2. **Set Up Database**
   - Go to SQL Editor
   - Create new query
   - Copy-paste entire `scripts/production-migration.sql`
   - Click RUN

### Step 2: Update Environment Variables (1 min)

Add to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these from Supabase: Settings → API

### Step 3: Create Admin Account (1 min)

```bash
pnpm dev
# Visit http://localhost:3000/setup
# Create your admin account with name, email, and password
# You'll be automatically logged into the admin dashboard!
```

---

## 🎯 Using the CMS

### Navigate Admin Sections

Once logged in at `/admin`:

- **Hero Section** - `/admin/hero` - Main page hero content
- **About** - `/admin/about` - About me section
- **Skills** - `/admin/skills` - Skills and categories
- **Experience** - `/admin/experience` - Work history
- **Projects** - `/admin/projects` - Portfolio projects
- **Blog** - `/admin/blog` - Blog posts
- **Research** - `/admin/research` - Research papers

### Create Content

Each section follows this pattern:

1. Click "New [Section]" button
2. Fill in form fields
3. Upload featured image (drag-drop)
4. Add array items (tags, CTAs, achievements) by clicking "Add"
5. Choose:
   - **Save Draft** - Save but don't publish
   - **Publish** - Make live immediately

### Edit Content

1. Go to section list (e.g., `/admin/projects`)
2. Click edit icon (pencil)
3. Make changes
4. Save or publish

### Delete Content

1. Click delete icon (trash)
2. Confirm deletion
3. Content is removed

---

## 📝 Example: Create a Blog Post

1. Go to `/admin/blog`
2. Click "New Post"
3. Fill in:
   - **Title**: "My Amazing Article"
   - **Slug**: "my-amazing-article" (auto-formatted)
   - **Description**: "Short summary for preview"
   - **Content**: "Full blog post content here..."
   - **Tags**: Click "Add Tag", enter tags like "React", "Web Dev"
   - **Image**: Drag-drop featured image
4. Click "Publish"
5. Content now visible on `/blog`

---

## 🖼️ Example: Create a Project

1. Go to `/admin/projects`
2. Click "New Project"
3. Fill in:
   - **Title**: "AI Chat App"
   - **Slug**: "ai-chat-app"
   - **Description**: "Real-time AI chatbot built with Next.js"
   - **Image**: Upload project screenshot
4. Add links by clicking "Add Link":
   - Type: "live" → Label: "View Live" → URL: "https://..."
   - Type: "github" → Label: "GitHub" → URL: "https://..."
5. Add tags: "React", "AI", "TypeScript"
6. Click "Publish"

---

## 🔐 Admin Access

**Login Page**: `http://localhost:3000/login`

**Protected Routes** (require login):
- `/admin/*` - All admin pages
- `/api/admin/*` - All admin APIs

**Public Routes** (no login needed):
- `/` - Home
- `/blog` - Blog listing
- `/projects` - Projects listing
- `/research` - Research listing

---

## 📤 Image Uploads

### How They Work

1. Click image upload area in forms
2. Drag-drop or click to select
3. Image uploads to Supabase Storage
4. Public URL auto-generated
5. Preview appears in form

### Size Limits

- **Max per file**: 10MB
- **Formats**: PNG, JPG, GIF
- **Storage**: Unlimited (Supabase free tier = 1GB)

### Uploading Tips

- Optimize images before uploading (resize, compress)
- Use descriptive filenames
- Keep a copy of original files

---

## 📊 Dashboard Overview

`/admin` shows:
- Total Projects created
- Total Blog Posts created
- Total Experience items
- Total Research papers

Click any stat to jump to that section.

---

## ✍️ Workflow Tips

### Draft Before Publishing
1. Always "Save Draft" first
2. Review changes
3. Then "Publish" when ready

### Organizing Content
- Use **sort_order** to arrange items (drag to reorder in future)
- Use **tags** to categorize (Blog, Research, Projects)
- Use **status** to control visibility (only Published shows publicly)

### Managing Images
- Upload small versions (optimize for web)
- Keep originals saved locally
- Use consistent aspect ratios

---

## 🐛 Troubleshooting

### "Can't login"
- Check email and password are correct
- Verify user exists in Supabase Authentication
- Verify user has admin role in profiles table

### "Can't upload images"
- File size > 10MB? Reduce and try again
- Check `portfolio-images` bucket exists in Storage
- Verify bucket is set to Public

### "Can't see content changes"
- Content in draft? Only published content visible
- Try refreshing page
- Check browser cache

### "Form validation error"
- Required fields marked with * - fill them
- Check URL format for links
- Slug must be lowercase with hyphens only

---

## 🎨 Content Types Reference

### Hero Section
- **Title** - Main headline (required)
- **Subtitle** - Secondary text (optional)
- **Description** - Detailed text (optional)
- **Featured Image** - Hero image (optional)
- **CTAs** - Call-to-action buttons (array)
- **Stats** - Key statistics display (array)
- **Marquee Items** - Scrolling text items (array)

### Projects
- **Title** - Project name (required)
- **Slug** - URL path (required, lowercase-hyphenated)
- **Description** - Project overview (required)
- **Featured Image** - Project screenshot (optional)
- **Links** - Multiple links (live, github, other)
- **Tags** - Technology and topic tags (array)

### Blog Posts
- **Title** - Post title (required)
- **Slug** - URL path (required)
- **Description** - Excerpt (required)
- **Content** - Full post content (required)
- **Featured Image** - Post cover (optional)
- **Tags** - Article topics (array)

### Experience
- **Title** - Job title (required)
- **Company** - Company name (required)
- **Location** - Location (optional)
- **Start Date** - Start date (required)
- **End Date** - End date (optional)
- **Current** - Still working there? (boolean)
- **Description** - Job summary (optional)
- **Achievements** - Key accomplishments (array)
- **Tech Stack** - Technologies used (array)

### Skills
- **Name** - Category name (required)
- **Description** - Category description (optional)
- **Icon** - Category icon (optional)
- **Skills** - Individual skills (array):
  - Name
  - Proficiency: beginner / intermediate / advanced / expert

### About Section
- **Title** - Section title (required)
- **Description** - Main text (required)
- **Featured Image** - About image (optional)
- **Highlights** - Key points (array):
  - Title, Description, Icon
- **Principles** - Core principles (array):
  - Title, Description

### Research Papers
- **Title** - Paper title (required)
- **Slug** - URL path (required)
- **Description** - Abstract (required)
- **Content** - Full content (required)
- **Featured Image** - Paper cover (optional)
- **PDF URL** - Link to PDF (optional)
- **Authors** - List of authors (array)
- **Links** - Related links (array)
- **Tags** - Research topics (array)

---

## 🚀 Next Steps

1. ✅ Complete setup above
2. ✅ Create test content (hero, blog post, project)
3. ✅ Verify it shows on public pages
4. ✅ Publish real content
5. ✅ Deploy to production (see deployment guide)

---

## 📚 Full Documentation

For detailed information, see:

- **Deployment**: `docs/DEPLOYMENT.md`
- **RLS Security**: `docs/RLS-SETUP.md`
- **Database Schema**: `scripts/production-migration.sql`
- **Roadmap**: `docs/CMS_IMPROVEMENT_ROADMAP.md`

---

## 💬 Key Concepts

### Draft vs Publish
- **Draft**: Content saved but not visible to public
- **Publish**: Content visible on public pages

### Status
- Shows whether content is draft or published
- Only published content appears on website

### Slug
- URL-friendly version of title
- Used in URLs like `/blog/my-article`
- Must be lowercase with hyphens

### Tags
- Categorize content
- Optional for most sections
- Help organize by topic

### Sort Order
- Controls display order on frontend
- Lower numbers appear first
- Can be updated in database if needed

---

## 🎉 You're All Set!

Your portfolio CMS is ready to use. Start creating content and watch it appear on your public website!

**Questions?** Check the troubleshooting section above or see full docs in `/docs` folder.

Happy creating! 🚀
