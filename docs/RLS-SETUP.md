# Row-Level Security (RLS) — How it works

> **Most users don't need to do anything here.** RLS is fully configured by [`scripts/production-migration.sql`](../scripts/production-migration.sql) — the single migration you run in [Step 3 of the README](../README.md#step-3--run-the-database-migration). This document is a **reference** explaining the security model so self-hosters and contributors can audit it. If you've already followed the README, your CMS is already secure.

## Overview

The CMS uses a two-tier security model:

1. **Admin users** — full access to create, update, and delete all content (via the server-side service-role client)
2. **Public users** — read-only access to **published** content only (via the public anon client)

## Problem Solved

Previously, the CMS was getting RLS violations like:
```
new row violates row-level security policy for table "about_highlights"
```

This happened because:
- Child tables (about_highlights, skills, project_tags, etc.) had no explicit RLS policies
- The Supabase client was using the ANON_KEY (public key) without admin permissions
- Even with custom JWT authentication, Supabase couldn't recognize the user as an admin

## Solution Implemented

### 1. Admin Supabase Client (New)

Created: `lib/supabase/admin.ts`

This client uses the SERVICE_ROLE_KEY to bypass RLS policies for admin operations:

```typescript
// Use this ONLY for server-side admin operations
export function createAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
```

### 2. Updated All API Routes

Modified ALL admin API routes to use the admin client:

**Updated Files:**
- ✅ `app/api/admin/about/route.ts` (GET, POST)
- ✅ `app/api/admin/about/[id]/route.ts` (GET, PATCH, DELETE)
- ✅ `app/api/admin/blog/route.ts` (GET, POST)
- ✅ `app/api/admin/blog/[id]/route.ts` (GET, PATCH, DELETE)
- ✅ `app/api/admin/research/route.ts` (GET, POST)
- ✅ `app/api/admin/research/[id]/route.ts` (GET, PATCH, DELETE)
- ✅ `app/api/admin/experience/route.ts` (GET, POST)
- ✅ `app/api/admin/experience/[id]/route.ts` (GET, PATCH, DELETE)
- ✅ `app/api/admin/projects/route.ts` (GET, POST)
- ✅ `app/api/admin/projects/[id]/route.ts` (GET, PATCH, DELETE)
- ✅ `app/api/admin/skills/route.ts` (GET, POST)
- ✅ `app/api/admin/skills/[id]/route.ts` (GET, PATCH, DELETE)
- ✅ `app/api/admin/hero/route.ts` (GET, POST)
- ✅ `app/api/admin/hero/[id]/route.ts` (GET, PATCH, DELETE)

**Change Pattern:**
```typescript
// Before
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// After
import { createAdminClient } from '@/lib/supabase/admin'
const supabase = createAdminClient()
```

### 3. Comprehensive RLS Policies

Defined in: [`scripts/production-migration.sql`](../scripts/production-migration.sql)

The migration sets up RLS policies for every content table:

**Main Content Tables** (with published status):
- hero_content
- about_content
- skill_categories
- experience_items
- projects
- project_case_studies
- blog_posts
- research_papers

**Child Tables** (tied to parent's published status):
- hero_ctas, hero_stats, hero_marquee_items
- about_highlights, about_principles
- skills (under skill_categories)
- experience_achievements, experience_tech_stack
- project_links, project_tags
- case_study_images, case_study_tags
- blog_post_tags
- research_paper_tags, research_paper_links

**Utility Tables**:
- media (admin only)
- profiles (custom rules)

### 4. RLS Policy Rules

**For Main Content Tables:**
```sql
-- Public can read published content
CREATE POLICY "Public can read published [table]"
USING (status = 'published');

-- Admins can do everything
CREATE POLICY "Admins can manage [table]"
USING (public.is_admin());
```

**For Child Tables:**
```sql
-- Public can read if parent is published
CREATE POLICY "Public can read [child]"
USING (
  EXISTS (
    SELECT 1 FROM parent_table
    WHERE parent_table.id = child_table.parent_id
    AND parent_table.status = 'published'
  )
);

-- Admins can do everything
CREATE POLICY "Admins can manage [child]"
USING (public.is_admin());
```

## Applying / verifying RLS

> **The production migration already does this for you.** This section is for re-running, debugging, or auditing.

### Step 1: Verify Environment Variables

Ensure your `.env.local` has the SERVICE_ROLE_KEY:

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # ← Required for admin operations
```

### Step 2: Apply RLS Policies in Supabase

If you ran [`scripts/production-migration.sql`](../scripts/production-migration.sql) during initial setup, **all RLS policies are already in place**. The migration enables RLS on every content table and creates the policies that allow admins (via service role) full access and the public (via anon key) read-only access to published rows.

To verify, run this in Supabase SQL Editor:

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

Every content table should show `rowsecurity = true`. The `profiles` table intentionally has RLS disabled (auth is handled at the API level via custom JWT — see the security model below).

### Step 3: Test Admin Operations

Once RLS policies are applied:

**Test 1: Create Content**
```bash
curl -X POST http://localhost:3000/api/admin/about \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"About Me","description":"..."}'
```

**Test 2: Update Content**
```bash
curl -X PATCH http://localhost:3000/api/admin/about/[id] \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title",...}'
```

**Test 3: Browser Admin Panel**
1. Login to admin panel
2. Navigate to any section (About, Skills, Blog, etc.)
3. Try creating/editing content
4. Check browser console for success messages
5. Verify content appears in the list

## How It Works Now

### User Flow: Authenticated Admin Request

```
1. Admin login → generates custom JWT token
2. Token stored in cookie/localStorage
3. Request to API with token in Authorization header
4. API verifies token with requireAdmin(request)
5. API creates admin client with SERVICE_ROLE_KEY
6. Admin client bypasses RLS policies
7. INSERT/UPDATE/DELETE succeeds on all tables
8. Response sent back to client
```

### Public Flow: Unauthenticated Read Request

```
1. Frontend queries public API (e.g., GET /api/public/about)
2. Uses regular Supabase client (ANON_KEY)
3. RLS policies check: status = 'published'?
4. Only published content is returned
5. Child tables returned only if parent is published
```

## Important Notes

### ⚠️ Security Considerations

1. **SERVICE_ROLE_KEY is sensitive** - Never expose to client
   - Only used on server (Next.js API routes)
   - Never in environment sent to browser

2. **Admin token is still required** - RLS bypasses don't authenticate users
   - API routes still verify JWT token with requireAdmin()
   - Both layers must be satisfied

3. **Service role bypasses RLS** - This is intentional
   - Admin operations need to bypass published status checks
   - That's why we use SERVICE_ROLE_KEY for admin routes

### ✅ Best Practices

1. Keep SERVICE_ROLE_KEY secure in .env (never commit to git)
2. All admin operations go through API routes (never direct client queries)
3. Public queries use regular ANON_KEY client
4. Test both authenticated and public flows

## Troubleshooting

### Error: "new row violates row-level security policy"
- Check if SERVICE_ROLE_KEY is set in `.env.local`
- Verify RLS policies were applied (run SQL script again)
- Check that admin client is being used in API route

### Error: "Unauthorized - Admin access required"
- Verify JWT token is being sent in Authorization header
- Check that user account has admin role in profiles table
- Verify token hasn't expired

### Published content not showing in public API
- Verify status field is set to 'published'
- Check RLS policies were created correctly
- Test with: `SELECT * FROM about_content WHERE status = 'published'`

## Where this is implemented in the codebase

| Concern | File |
|---|---|
| Admin Supabase client (service role) | [`lib/supabase/admin.ts`](../lib/supabase/admin.ts) |
| Public Supabase client (anon key) | [`lib/supabase/server.ts`](../lib/supabase/server.ts) |
| JWT auth helpers | [`lib/auth/`](../lib/auth/) |
| RLS-enabled tables and policies | [`scripts/production-migration.sql`](../scripts/production-migration.sql) |
| Admin API routes (always use the admin client) | [`app/api/admin/*`](../app/api/admin) |

## Verification Checklist

If you suspect something is misconfigured, walk through:

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local` (or your hosting platform)
- [ ] `pg_tables.rowsecurity = true` for every public content table (see SQL above)
- [ ] Admin panel at `/admin/about` can create new content without errors
- [ ] Admin panel can edit and delete content
- [ ] Public homepage (`/`) shows **only** published content
- [ ] Draft content does **not** appear on the public site
- [ ] All sections (hero, about, skills, experience, projects, blog, research, gallery) behave consistently

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Row-Level Security Examples](https://supabase.com/docs/guides/auth/row-level-security-examples)
- [Service Role vs Anon Key](https://supabase.com/docs/guides/auth/service-role-key)
