# Production Migration Guide

## Overview

**`scripts/production-migration.sql`** is the single, authoritative SQL file for setting up your entire Supabase schema for production. It consolidates all schema changes from the previous separate scripts into one idempotent, ordered script.

### What It Includes

- ✅ All 28 tables with correct FK dependencies
- ✅ Helper functions (`update_updated_at_column`, `is_admin()`)
- ✅ All columns including those added incrementally (e.g., `projects.year`, `hero_stats.helper`, `contact_settings`)
- ✅ All indexes and triggers
- ✅ Complete RLS policies using `is_admin()` pattern
- ✅ Initial `section_metadata` seed data
- ✅ Tables with `CREATE TABLE IF NOT EXISTS` for idempotency

### What's New vs. Previous Scripts

| Item | Previous Approach | New Approach |
|------|-------------------|--------------|
| **Schema Setup** | 7 separate SQL files run sequentially | 1 consolidated file |
| **`contact_settings`** | Missing — only in app code | Included with all columns |
| **Column Completeness** | Scattered across 3 scripts | All in one place |
| **Idempotency** | Mixed (some use IF NOT EXISTS) | Fully idempotent |
| **Profiles FK** | `auth.users` (as is) | `auth.users` (preserved) |

## How to Use

### 1. Open Supabase SQL Editor
- Go to your Supabase dashboard
- Navigate to **SQL Editor**
- Create a new query

### 2. Copy & Run
- Open `scripts/production-migration.sql`
- Copy the entire content
- Paste into the SQL Editor
- Click **Run**

### 3. Create Admin Account
After migration completes, start your app and visit `/setup` in your browser to create your admin account.

Alternatively, use the API:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"YourSecurePassword","name":"Admin"}'
```

### 4. Seed Portfolio Data (Optional)
You can add content through the admin dashboard at `/admin`.

## Important Notes

### Custom JWT Authentication
Your app uses **custom JWT tokens**, NOT Supabase Auth. This means:
- `profiles.password_hash` stores bcrypt hashes
- Admin login verifies password against this hash and issues a custom JWT
- `auth.uid()` in RLS policies checks the user ID from the JWT token
- RLS on `profiles` table is **disabled** — auth is enforced at the API layer

### RLS Policies
All content tables use the standard pattern:
```sql
-- Public can read published content
CREATE POLICY "Public can read published [table]"
ON public.[table] FOR SELECT
USING (status = 'published');

-- Admins can do everything
CREATE POLICY "Admins can manage [table]"
ON public.[table] FOR ALL
USING (public.is_admin());
```

The `is_admin()` function is defined with `SECURITY DEFINER` to avoid infinite recursion when checking the `profiles` table.

## Verification

After running the migration:

### ✅ Tables Created
Open **Table Editor** and verify all 28 tables exist:
- profiles, media, hero_content, hero_ctas, hero_stats, hero_marquee_items
- about_content, about_highlights, about_principles
- skill_categories, skills
- experience_items, experience_achievements, experience_tech_stack
- projects, project_links, project_tags
- project_case_studies, case_study_images, case_study_tags
- blog_posts, blog_post_tags
- research_papers, research_paper_tags, research_paper_links
- gallery_photos, gallery_tags
- custom_styles, section_metadata, contact_settings

### ✅ Columns Present
- `projects`: year, category, accent
- `hero_stats`: helper
- `hero_content`: heading, custom_style_ids
- `contact_settings`: email, location, availability, socials, callouts

### ✅ RLS Policies
Go to **Authentication > Policies** and verify:
- Every content table has 2 policies: "Public can read..." and "Admins can manage..."
- `profiles` has no policies (RLS disabled)
- `media` has 1 admin-only policy

### ✅ Indexes
All tables should have proper indexes for common queries (status, slug, sort_order, foreign keys, etc.)

## Troubleshooting

### Error: "relation already exists"
This shouldn't happen if using `CREATE TABLE IF NOT EXISTS`. If it does:
1. Run again — it's idempotent
2. Or manually drop the conflicting table and rerun

### Error: "RLS policy already exists"
Policies use `DROP POLICY IF EXISTS` first, so this shouldn't occur. Rerun the script.

### Contact Settings Missing
If running migrate-data.sql and it fails on contact_settings queries:
1. Verify `contact_settings` table was created (check Table Editor)
2. Rerun production-migration.sql

## When to Update This File

Update `scripts/production-migration.sql` when:
- Adding new tables
- Adding columns to existing tables
- Changing RLS policies
- Adding new indexes

## Related Files

- `scripts/production-migration.sql` — The single source of truth for the database schema
