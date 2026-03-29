# Scripts Directory

This directory contains migration scripts and utilities for your portfolio.

## 📚 Files Overview

### 1. **QUICK_START.md** ⭐ START HERE
   - Fast 5-minute setup guide
   - Two options: SQL (easiest) or Node.js (automated)
   - Copy-paste instructions
   - **Best for**: First-time migration

### 2. **MIGRATION_README.md**
   - Complete documentation
   - Detailed prerequisites
   - All troubleshooting scenarios
   - Verification queries
   - Rollback instructions
   - **Best for**: Reference & troubleshooting

### 3. **migrate-data.sql**
   - SQL migration script
   - Runs in Supabase SQL Editor
   - No dependencies needed
   - Fast (1-2 minutes)
   - **Best for**: First-time users

### 4. **migrate-data.ts**
   - Node.js/TypeScript migration script
   - Automated with error handling
   - Progress logging
   - Can be integrated into API routes
   - **Best for**: Automation & CI/CD

### 5. **migrate.sh**
   - Interactive shell script
   - Menu-driven interface
   - Guides you through the process
   - Handles both SQL and Node.js methods
   - **Best for**: Non-technical users

## 🚀 Quick Start (2 minutes)

### Option A: SQL (Fastest)

```bash
# 1. Get your admin user ID from Supabase
# 2. Open migrate-data.sql and replace the admin_id placeholder
# 3. Copy-paste entire script into Supabase SQL Editor
# 4. Click Run
# Done!
```

See: [QUICK_START.md](./QUICK_START.md)

### Option B: Automated

```bash
npx ts-node scripts/migrate-data.ts
```

See: [MIGRATION_README.md](./MIGRATION_README.md)

## 📋 What Gets Migrated

| Section | Items | Details |
|---------|-------|---------|
| Hero | 1 | Title, description, 2 CTAs, 3 stats, 12 marquee items |
| About | 1 | Title, description, 4 highlights, 5 principles |
| Skills | 5 | 5 categories with 40+ individual skills |
| Experience | 11 | All jobs with 30+ achievements & 50+ tech stack |
| Projects | 8 | All projects with 30+ tags |
| **Total** | **~200** | **Database records created** |

## 🎯 Choose Your Path

### If you're new to this:
1. Read [QUICK_START.md](./QUICK_START.md)
2. Choose Option A (SQL)
3. Copy-paste and run
4. Verify with queries

### If you want automation:
1. Read [QUICK_START.md](./QUICK_START.md) Option B
2. Run: `npx ts-node scripts/migrate-data.ts`
3. Check output for success

### If you need detailed help:
1. Read [MIGRATION_README.md](./MIGRATION_README.md)
2. Follow step-by-step instructions
3. Check troubleshooting section if issues arise

## ⚙️ Prerequisites

Before running any migration:

- [ ] Supabase project created
- [ ] Database schema applied (`docs/SUPABASE_SCHEMA.sql`)
- [ ] Admin user exists in `public.profiles` with role='admin'
- [ ] `.env.local` configured (see below)

### Environment Variables

For **SQL migration**: Not needed

For **Node.js migration**: Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

## 🔄 Migration Process

### Phase 1: Hero Content
- Insert hero title & description
- Add 2 CTAs
- Add 3 stats
- Add 12 marquee items

### Phase 2: About Content
- Insert about title & description
- Add 4 highlights
- Add 5 principles

### Phase 3: Skills
- Create 5 skill categories
- Add 40+ skills/tools

### Phase 4: Experience
- Insert 11 experience items
- Add 30+ achievements
- Add 50+ tech stack items

### Phase 5: Projects
- Insert 8 projects
- Add 30+ tags

**Total Time**: ~1-2 minutes

## ✅ Verification

After migration, run these queries:

```sql
-- Check content exists
SELECT
  (SELECT COUNT(*) FROM public.hero_content) as hero,
  (SELECT COUNT(*) FROM public.about_content) as about,
  (SELECT COUNT(*) FROM public.skill_categories) as skills,
  (SELECT COUNT(*) FROM public.experience_items) as experience,
  (SELECT COUNT(*) FROM public.projects) as projects;

-- Expected: hero=1, about=1, skills=5, experience=11, projects=8
```

## 🆘 Troubleshooting

### Common Issues:

| Issue | Solution |
|-------|----------|
| "No admin user found" | See MIGRATION_README.md section: No admin user found |
| "Foreign key constraint failed" | Admin user ID is incorrect |
| "RLS policy violation" | Use SQL migration or disable RLS temporarily |
| "Missing SUPABASE_SERVICE_ROLE_KEY" | Use SQL migration instead (Option A) |

Full troubleshooting: [MIGRATION_README.md](./MIGRATION_README.md#troubleshooting)

## 🔄 Rollback

If you need to clear migrated data:

```sql
DELETE FROM public.hero_ctas;
DELETE FROM public.hero_stats;
DELETE FROM public.hero_marquee_items;
DELETE FROM public.hero_content;

DELETE FROM public.about_highlights;
DELETE FROM public.about_principles;
DELETE FROM public.about_content;

DELETE FROM public.skills;
DELETE FROM public.skill_categories;

DELETE FROM public.experience_achievements;
DELETE FROM public.experience_tech_stack;
DELETE FROM public.experience_items;

DELETE FROM public.project_links;
DELETE FROM public.project_tags;
DELETE FROM public.projects;
```

## 🎉 After Migration

Your data is now in Supabase! Next steps:

1. ✅ Visit admin dashboard
2. ✅ Test edit/publish workflow
3. ✅ Upload images through media manager
4. ✅ Update frontend to use API instead of static data
5. ✅ Test all sections on public site

## 📖 Documentation Structure

```
scripts/
├── README.md (this file)
├── QUICK_START.md (5-minute guide)
├── MIGRATION_README.md (detailed docs)
├── migrate-data.sql (SQL script)
├── migrate-data.ts (TypeScript script)
└── migrate.sh (interactive shell)
```

## 🤝 Need Help?

1. **Quick answer?** → Check [QUICK_START.md](./QUICK_START.md)
2. **Detailed help?** → Read [MIGRATION_README.md](./MIGRATION_README.md)
3. **Error message?** → Search troubleshooting sections
4. **Still stuck?** → Check Supabase dashboard logs

## 📝 Notes

- These scripts use your existing data from `utils/data.ts`
- Data is inserted as "published" status by default
- All migrations run with your admin user as `created_by`
- No data is sent to external services
- Migrations are idempotent (can be run multiple times safely)

---

**Ready to migrate?** Start with [QUICK_START.md](./QUICK_START.md) ⭐
