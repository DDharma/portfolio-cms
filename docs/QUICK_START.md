# Using the CMS — day-to-day guide

This guide picks up **after** you've finished the setup in the [main README](../README.md). It covers how to actually use the admin dashboard: creating content, drafts vs. publishing, uploading images, and the rest of the workflow.

> **Haven't finished setup yet?** Go through the [README setup section](../README.md#the-full-setup-process) first — you need a running dev server and an admin account before anything here works.

---

## Table of contents

1. [Logging into the admin](#logging-into-the-admin)
2. [The admin sections at a glance](#the-admin-sections-at-a-glance)
3. [The basic editing workflow](#the-basic-editing-workflow)
4. [Drafts vs. publishing](#drafts-vs-publishing)
5. [Image and file uploads](#image-and-file-uploads)
6. [Custom CSS classes](#custom-css-classes)
7. [Tagging and slugs](#tagging-and-slugs)
8. [Worked examples](#worked-examples)
9. [Field reference (every section, every field)](#field-reference)
10. [Day-to-day tips](#day-to-day-tips)
11. [Common questions](#common-questions)

---

## Logging into the admin

- **Login URL:** `http://localhost:3000/login` (or `https://your-domain.com/login` in production)
- **Setup URL:** `http://localhost:3000/setup` — only works while no admin exists
- **Dashboard:** `http://localhost:3000/admin`

If you're already logged in and visit `/login` or `/setup`, you'll be auto-redirected to `/admin`.

---

## The admin sections at a glance

| Section | Path | What it controls |
|---|---|---|
| **Dashboard** | `/admin` | Quick stats and recent activity |
| **Hero** | `/admin/hero` | Homepage headline, subtitle, CTAs, stats, marquee items |
| **About** | `/admin/about` | The about section with highlights and principles |
| **Skills** | `/admin/skills` | Skill categories and individual skills |
| **Experience** | `/admin/experience` | Work history with achievements and tech stack |
| **Projects** | `/admin/projects` | Portfolio projects with links, tags, and case studies |
| **Blog** | `/admin/blog` | Long-form blog posts |
| **Research** | `/admin/research` | Research papers and long-form content |
| **Gallery** | `/admin/gallery` | Photo gallery |
| **Media** | `/admin/media` | All uploaded images and PDFs (browse + delete) |
| **Styles** | `/admin/styles` | Custom CSS classes for use in rich text |
| **Settings** | `/admin/settings` | Contact email, location, socials, resume URL |

> Public visitors only see content with `status = published`. Drafts are private.

---

## The basic editing workflow

Every editable section follows the same pattern:

1. **List view** — see all items (e.g. `/admin/projects` shows a table of every project).
2. **Create** — click **New [section]** (e.g. **New Project**). Fill the form. Click **Save Draft** or **Publish**.
3. **Edit** — click the row (or pencil icon). Change anything. Save or publish.
4. **Delete** — click the trash icon. Confirm. Gone.
5. **Refresh the public page** to see the change live (the homepage uses ISR — see [Day-to-day tips](#day-to-day-tips)).

---

## Drafts vs. publishing

Every content row has a `status` field with two values:

- **`draft`** — private. Visible only inside the admin. Not returned by public APIs.
- **`published`** — public. Rendered on the live site after the next ISR revalidation.

**Recommended workflow:**
1. Click **Save Draft** while you're still writing.
2. Preview your content in the admin (the editor shows a live preview).
3. Click **Publish** when you're happy.
4. Visit the public route (e.g. `/blog/your-slug`) to confirm it's live.

You can **unpublish** at any time by editing and switching status back to draft.

---

## Image and file uploads

### How it works

1. Click any image upload area in a form (or drag a file onto it).
2. The file uploads to your Supabase `portfolio-images` bucket.
3. A public CDN URL is generated and stored in the field.
4. A preview appears immediately.

### Limits

- **Max file size:** 10MB per file
- **Image formats:** PNG, JPG, GIF, WebP, SVG
- **PDF support:** yes (used for the resume URL and research papers)
- **Storage quota:** 1GB on the Supabase free tier (plenty for portfolios)

### Tips

- Resize and compress images **before** uploading. [Squoosh](https://squoosh.app/) and [TinyPNG](https://tinypng.com/) are great free tools.
- Aim for 1600px wide max for hero images, 800px for project thumbnails.
- Use consistent aspect ratios across cards (e.g. 16:9 for project thumbnails).
- Keep originals saved locally — Supabase doesn't version uploads.

### Browsing or deleting old uploads

Go to `/admin/media` to see every uploaded file. You can delete unused files there to reclaim storage.

---

## Custom CSS classes

The CMS lets you create reusable CSS classes you can apply to text in any rich-text editor — without writing HTML.

1. Go to `/admin/styles` → **New Style**.
2. Give it a name (e.g. `gradient-heading`) and the CSS rules:
   ```css
   background: linear-gradient(90deg, #f59e0b, #ec4899);
   -webkit-background-clip: text;
   color: transparent;
   font-weight: 700;
   ```
3. Save with **Active** toggled on.
4. In any blog/project rich-text editor, select some text → click the **Style** dropdown → pick your class.

Active styles are auto-injected into the public site as a `<style>` tag.

---

## Tagging and slugs

### Slugs

A slug is the URL-friendly version of a title. Used in routes like `/blog/my-article` or `/projects/ai-chat-app`.

Rules:
- Lowercase only
- Hyphens between words (no spaces, no underscores)
- No special characters except hyphens
- Must be unique within its section

The form auto-suggests a slug from the title — you can override it if needed.

### Tags

Tags are free-form labels (e.g. "React", "AI", "TypeScript"). They show up as badges on cards and detail pages. Click **Add Tag** in any form to add one.

---

## Worked examples

### Create a blog post

1. Go to `/admin/blog` → **New Post**.
2. Fill in:
   - **Title** — `Building a Tiny Vector Database in Rust`
   - **Slug** — auto-fills to `building-a-tiny-vector-database-in-rust`
   - **Description** — one-paragraph excerpt for the listing card
   - **Content** — the full post (rich-text editor with code blocks, headings, links, custom styles)
   - **Featured image** — drag in a hero image
   - **Tags** — `Rust`, `Databases`, `Vector Search`
3. Click **Publish**.
4. Visit `/blog/building-a-tiny-vector-database-in-rust` — your post is live.

### Create a project

1. Go to `/admin/projects` → **New Project**.
2. Fill in:
   - **Title** — `AI Chat App`
   - **Slug** — `ai-chat-app`
   - **Description** — short summary for the card
   - **Featured image** — a screenshot
3. Add links by clicking **Add Link** repeatedly:
   - `Live demo` → `https://chat.example.com`
   - `GitHub` → `https://github.com/you/ai-chat-app`
4. Add tags: `Next.js`, `OpenAI`, `Vercel AI SDK`
5. Click **Publish**.
6. Visit `/projects/ai-chat-app` to see it.

### Update your contact info

1. Go to `/admin/settings`.
2. Update email, location, availability, social links, callouts, and resume URL.
3. Save.
4. Refresh the homepage — the contact section and footer reflect the new values.

---

## Field reference

Quick lookup of every field in every section. Required fields are marked with **★**.

### Hero (`/admin/hero`)
- ★ **Title** — the main headline (HTML supported via the rich-text editor)
- **Subtitle** — small label above the title; also used as the footer tagline
- **Description** — paragraph below the headline
- **Featured image** — optional hero image
- **CTAs** — array of call-to-action buttons (label + URL + variant)
- **Stats** — array of metrics (label + value)
- **Marquee items** — array of scrolling text items (text + optional icon)

### About (`/admin/about`)
- ★ **Title** — section heading
- ★ **Description** — main about paragraph
- **Featured image** — optional portrait or graphic
- **Highlights** — array (title + description + icon)
- **Principles** — array (title + description)

### Skills (`/admin/skills`)
- **Skill categories** — each has:
  - ★ **Name** — category name (e.g. "Frontend Development")
  - **Description** — short summary
  - **Icon** — Lucide icon picker
  - **Skills** — array of items, each with:
    - ★ Name (e.g. "React")
    - Proficiency: `beginner` / `intermediate` / `advanced` / `expert`

### Experience (`/admin/experience`)
- ★ **Title** — job title
- ★ **Company** — employer
- **Location** — city / remote
- ★ **Start date** — `YYYY-MM` or `YYYY-MM-DD`
- **End date** — leave blank if current
- **Current** — boolean toggle
- **Description** — short summary
- **Achievements** — array of bullets
- **Tech stack** — array of technologies

### Projects (`/admin/projects`)
- ★ **Title** — project name
- ★ **Slug** — URL path
- ★ **Description** — short overview
- **Featured image** — screenshot or cover
- **Year** — release year
- **Category** — free-form label
- **Links** — array (type + label + URL)
- **Tags** — array of strings

### Blog (`/admin/blog`)
- ★ **Title**
- ★ **Slug**
- ★ **Description** — listing-card excerpt
- ★ **Content** — full body (rich text)
- **Featured image** — cover image
- **Tags** — array

### Research (`/admin/research`)
- ★ **Title**
- ★ **Slug**
- ★ **Description** — abstract
- ★ **Content** — full content
- **Featured image** — cover image
- **PDF URL** — link to the paper
- **Authors** — array of names
- **Links** — related links
- **Tags** — array

### Gallery (`/admin/gallery`)
- **Photos** — uploaded image + optional title/description

### Settings (`/admin/settings`)
- ★ **Email** — contact email
- ★ **Location** — your city/country
- ★ **Availability** — short status line
- **Resume URL** — uploaded PDF URL (the header and footer link to this)
- **Socials** — array (label + URL)
- **Callouts** — array of short text snippets shown in the contact section

---

## Day-to-day tips

### Why don't my changes show up immediately on the public site?

The public pages use **Incremental Static Regeneration (ISR)** with a 1-hour cache by default. To see changes faster:

- **Hard refresh** (<kbd>Cmd/Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd>) sometimes triggers a fresh fetch.
- **Reduce the cache** during heavy editing: open `app/page.tsx` and change `export const revalidate = 3600` to `60` (1 minute). Restart the dev server.
- **Force a redeploy** on Vercel if you really need an instant update in production.

See [DEPLOYMENT.md → Revalidation](DEPLOYMENT.md#revalidation--isr) for advanced options like on-demand revalidation.

### Save Draft early, publish late

Always click **Save Draft** before stepping away. The form doesn't auto-save.

### Keep slugs short and stable

Once a post is live and indexed (or shared), changing its slug breaks the URL. Pick a good one upfront.

### Use the Media library

If you've uploaded an image once, reuse its URL via the media library (`/admin/media`) instead of re-uploading. It saves storage and keeps your CDN cache warm.

### Order matters

Several sections (skills, hero stats, hero CTAs, about highlights, etc.) have a `sort_order` field. Lower numbers appear first.

---

## Common questions

### Can I have more than one admin?

The `/setup` route only works for the **first** admin. To add more:

1. Hash a password using bcrypt:
   ```js
   // run in Node.js: node -e "console.log(require('bcryptjs').hashSync('your-password', 12))"
   ```
2. In Supabase → SQL Editor, insert a row:
   ```sql
   insert into profiles (email, full_name, role, password_hash)
   values ('coworker@example.com', 'Coworker Name', 'admin', 'paste-the-bcrypt-hash-here');
   ```
3. They can now log in at `/login` with that email + password.

### How do I reset a forgotten admin password?

There's no built-in password-reset flow yet. Manually update the `password_hash` column in the `profiles` table with a new bcrypt hash (see above).

### Can I delete the very first admin?

Yes — but make sure another admin exists first. Otherwise `/setup` will reopen and someone could create a new admin on your live site (unless you've set `NEXT_PUBLIC_ENABLE_ONBOARDING=false`).

### How do I back up my content?

Supabase → **Database → Backups**. The free tier includes daily automatic backups for 7 days.

For manual exports, use the SQL Editor:
```sql
-- Export blog posts as JSON
select json_agg(row_to_json(blog_posts)) from blog_posts;
```

### Where do uploaded files live?

In your Supabase project → **Storage → portfolio-images** bucket. Each file gets a permanent public URL.

### My page-load is slow on the homepage

The homepage fetches several CMS sections in parallel. If it feels slow:
- Check the **Network** tab in your browser dev tools — slow Supabase queries are the usual culprit.
- Verify your Supabase region is close to your Vercel region (Vercel → Project Settings → Functions Region).
- Reduce the size of uploaded images (unoptimized hero images are the #1 cause).

---

## Next steps

- [**docs/DEPLOYMENT.md**](DEPLOYMENT.md) — going to production, custom domains, Docker, CI
- [**docs/RLS-SETUP.md**](RLS-SETUP.md) — how the security model works under the hood
- [**docs/CMS_IMPROVEMENT_ROADMAP.md**](CMS_IMPROVEMENT_ROADMAP.md) — what's planned next, and where you can help

Happy publishing!
