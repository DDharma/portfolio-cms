# Developer Portfolio CMS

A self-hosted, fully customizable portfolio CMS for developers. Built with **Next.js 16**, **Supabase**, and **TypeScript**. Deploy it once, then manage all your content (hero, about, skills, experience, projects, blog, research, gallery, contact) from a built-in admin dashboard — no code changes required after the initial setup.

MIT licensed. Fork it, deploy it, and own your content end-to-end.

> **New here? Read this README top-to-bottom — it walks you from "I just cloned the repo" to "my portfolio is live on the internet" in about 15 minutes.**

---

## Table of contents

1. [What you get](#what-you-get)
2. [Before you start](#before-you-start) — accounts and tools
3. [The full setup process](#the-full-setup-process) — 6 steps, ~15 minutes
   - [Step 1 — Get the code](#step-1--get-the-code)
   - [Step 2 — Create your Supabase project](#step-2--create-your-supabase-project)
   - [Step 3 — Run the database migration](#step-3--run-the-database-migration)
   - [Step 4 — Create the storage bucket](#step-4--create-the-storage-bucket)
   - [Step 5 — Configure environment variables](#step-5--configure-environment-variables)
   - [Step 6 — Create your admin account and start the site](#step-6--create-your-admin-account-and-start-the-site)
4. [Adding your content](#adding-your-content) — what to fill in first
5. [Going live (deploy to the internet)](#going-live-deploy-to-the-internet)
6. [Optional configuration](#optional-configuration) — feature flags
7. [Troubleshooting](#troubleshooting)
8. [Tech stack & project structure](#tech-stack--project-structure)
9. [Documentation index](#documentation-index)
10. [Contributing & license](#contributing--license)

---

## What you get

- **Complete CMS control** — manage every section (hero, about, skills, experience, projects, blog, research, gallery, contact) from `/admin`
- **Rich text editing** — Tiptap editor with code highlighting, custom CSS classes, and inline styling
- **Drag-and-drop media** — upload images and PDFs directly from the dashboard
- **Drafts & publishing** — save before publishing, unpublish at any time
- **Custom CSS classes** — define styles in the admin and apply them to text without writing HTML
- **Icon picker** — choose Lucide icons for skill categories, highlights, and more
- **SEO-ready** — Incremental Static Regeneration (ISR) keeps content fast and fresh
- **Self-hosted** — your data stays on your Supabase project, your code stays on your server
- **Fully open source** — MIT licensed

> This is a developer portfolio CMS, not a general-purpose blogging platform. It's optimized for showcasing engineering work.

---

## Before you start

You need three free accounts and two pieces of software. None of this costs money for typical portfolio usage.

| Need | Why | Get it |
|---|---|---|
| **Node.js 18 or newer** | Runs the dev server and builds the site | [nodejs.org](https://nodejs.org) — install the LTS version |
| **Git** | Clone the repo and push to GitHub | [git-scm.com](https://git-scm.com) (already installed on macOS / Linux usually) |
| **GitHub account** | Host your fork; required for one-click Vercel deploy | [github.com](https://github.com) |
| **Supabase account** | Database + image storage. Free tier is more than enough. | [supabase.com](https://supabase.com) |
| **Vercel account** *(optional but recommended)* | Free hosting for the live site | [vercel.com](https://vercel.com) |

Verify Node.js and Git are working:

```bash
node --version   # should print v18.x or higher
git --version    # should print git version 2.x
```

---

## The full setup process

The whole flow is six steps. Don't skip any of them — each one builds on the previous.

### Step 1 — Get the code

Choose **one** of the following:

**Option A — Fork on GitHub (recommended if you want to deploy to Vercel later):**
1. Go to [github.com/DDharma/portfolio-cms](https://github.com/DDharma/portfolio-cms) and click **Fork**.
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/portfolio-cms.git
   cd portfolio-cms
   ```

**Option B — Clone directly (fastest, but you'll need to set up your own remote later):**
```bash
git clone https://github.com/DDharma/portfolio-cms.git
cd portfolio-cms
```

Then install dependencies:

```bash
npm install
```

This downloads everything the project needs (~2–3 minutes the first time).

### Step 2 — Create your Supabase project

Supabase gives you a free PostgreSQL database and image storage in one place.

1. Sign up / log in at [supabase.com](https://supabase.com).
2. Click **New project**.
3. Fill in:
   - **Name:** anything (e.g. `my-portfolio`)
   - **Database password:** generate a strong one and **save it somewhere safe** (you won't need it day-to-day, but you'll want it for emergencies)
   - **Region:** choose the one closest to you
4. Click **Create new project** and wait 2–5 minutes for it to provision.

While you wait, leave the tab open — you'll come back to it in Steps 3, 4, and 5.

### Step 3 — Run the database migration

This creates all the tables, indexes, and security policies your CMS needs.

1. In your Supabase project, click **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open [`scripts/production-migration.sql`](scripts/production-migration.sql) from this repo, copy the **entire** file, and paste it into the SQL editor.
4. Click **Run** (or press <kbd>Cmd/Ctrl</kbd> + <kbd>Enter</kbd>).
5. Wait until you see "Success. No rows returned." — this can take 10–20 seconds.

That's it for the database. All RLS (row-level security) policies are included, so you don't need to run anything else.

### Step 4 — Create the storage bucket

This is where your uploaded images will live.

1. In Supabase, click **Storage** in the left sidebar.
2. Click **New bucket**.
3. Name it exactly: `portfolio-images`
4. Toggle **Public bucket** to **on** (so the images can be served publicly).
5. Click **Create bucket**.

> The bucket name **must** be `portfolio-images` exactly — the app expects that name.

### Step 5 — Configure environment variables

The app needs four pieces of information about your Supabase project to connect to it.

1. In your project root, copy the example env file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` in your editor. You'll see four required variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   JWT_SECRET=...
   ```

3. Fill them in with values from your Supabase project:

   | Variable | Where to find it |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → **Project Settings** → **API** → **Project URL** |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → **Project Settings** → **API** → **API keys** → `anon public` |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → **Project Settings** → **API** → **API keys** → `service_role` *(keep this secret — never commit it)* |
   | `JWT_SECRET` | A random string of 32+ characters. Generate one with `openssl rand -base64 32` or use [randomkeygen.com](https://randomkeygen.com/jwt-secret) |

4. Save the file. **Do not commit `.env.local` to git** — it's already ignored.

### Step 6 — Create your admin account and start the site

Almost done.

1. Start the development server:
   ```bash
   npm run dev
   ```
   You should see `Ready in XXXms` and a link to `http://localhost:3000`.

2. Open [http://localhost:3000/setup](http://localhost:3000/setup) in your browser.

3. Fill in your **name**, **email**, and a **password** (8+ characters), then click **Create Admin Account**.

4. You'll be auto-logged-in and redirected to the admin dashboard at [http://localhost:3000/admin](http://localhost:3000/admin).

5. Visit [http://localhost:3000](http://localhost:3000) — your portfolio is live locally. The placeholder sections will be empty until you add content.

> The `/setup` page only works when no admin exists. Once you've created your first admin, that route is locked. To add additional admins later, you'd need to insert a row into the `profiles` table directly.

---

## Adding your content

Open [http://localhost:3000/admin](http://localhost:3000/admin). For a complete-looking portfolio, fill these in (in order):

1. **Hero** (`/admin/hero`) — your homepage headline. The hero subtitle also drives the footer tagline. Click **Publish** when done.
2. **Settings** (`/admin/settings`) — your contact email, location, social links, and resume URL. This populates the contact section and footer social links.
3. **About** (`/admin/about`) — your bio, highlights, and principles.
4. **Skills** (`/admin/skills`) — skill categories and items.
5. **Experience** (`/admin/experience`) — your work history.
6. **Projects** (`/admin/projects`) — your portfolio projects. Each project gets its own page at `/projects/[slug]`.
7. **Blog** (`/admin/blog`) *(optional)* — long-form posts at `/blog/[slug]`.
8. **Research / Gallery** *(optional)* — academic papers and a photo gallery.

Refresh the public site (`http://localhost:3000`) after publishing each section. Drafts won't show up — only **Published** content is visible to visitors.

For a deeper walkthrough of the CMS workflow (drafts, image uploads, custom styles, etc.), see [**docs/QUICK_START.md**](docs/QUICK_START.md).

---

## Going live (deploy to the internet)

Once your portfolio looks the way you want locally, deploy it.

### Easiest path — Vercel (recommended, free)

1. Push your code to GitHub if you haven't already:
   ```bash
   git add .
   git commit -m "Initial portfolio content"
   git push
   ```
2. Click this button (replace with your fork URL if you forked):

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDDharma%2Fportfolio-cms&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,JWT_SECRET)

3. When Vercel asks for environment variables, paste the **same four values from your `.env.local`**.
4. Click **Deploy**. The first build takes ~3–5 minutes.
5. You'll get a URL like `your-project.vercel.app` — your portfolio is live.

### Other hosting options

For Node.js servers, Docker, custom domains, HTTPS, and on-demand revalidation, see [**docs/DEPLOYMENT.md**](docs/DEPLOYMENT.md).

### Connecting a custom domain

1. In Vercel: **Project Settings → Domains → Add**.
2. Enter your domain and follow the DNS instructions for your registrar.
3. DNS propagation usually takes 5–30 minutes.

---

## Optional configuration

These are extra knobs you may never need to touch.

### `NEXT_PUBLIC_ENABLE_ONBOARDING` *(default: `true`)*

Controls whether the public `/setup` admin-creation route is available.

- **Default behavior** (unset or `"true"`) — `/setup` works as long as no admin exists in the database. Once you've created your first admin, the route auto-locks.
- **Set to `"false"`** on hardened production deployments where you'd rather seed the first admin via SQL. The `/setup` page renders a "Setup disabled" message and `POST /api/auth/register` returns `403`. Login behavior is unaffected.

To use it, add this line to your `.env.local` (or your hosting platform's env settings):

```env
NEXT_PUBLIC_ENABLE_ONBOARDING=false
```

> **Branding note:** all portfolio content (your name, tagline, contact info, projects, blog posts, etc.) is managed via the admin dashboard — no code edits required. The footer pulls its tagline from your published hero subtitle and falls back to placeholder text (`Your Name` / `Your Title`) until that content is configured.

---

## Troubleshooting

If something doesn't work, check here first.

### `npm install` fails

- Make sure your Node.js version is 18 or newer: `node --version`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again.

### `/setup` shows a blank page or redirects to `/login` unexpectedly

- The redirect to `/login` means an admin already exists. If that wasn't you, check the `profiles` table in Supabase (delete the row if it's leftover test data, then re-visit `/setup`).
- A blank page usually means your env vars are wrong. Open the browser console and look for Supabase errors.

### "Failed to fetch" / "Internal server error" on `/admin`

- Double-check `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`. Restart `npm run dev` after editing.
- Verify the migration ran successfully (Supabase → Table Editor should show 28 tables including `profiles`, `hero_content`, `projects`, etc.).

### Image uploads fail

- Confirm the bucket exists and is named exactly `portfolio-images`.
- Confirm the bucket is set to **Public**.
- Image files must be under 10MB.

### "Can't login" after creating admin

- Verify the `profiles` row has `role = 'admin'`.
- Confirm `JWT_SECRET` matches between local and the place you created the account (if you switched envs mid-flow).
- Clear browser cookies for `localhost` (or your domain) and try again.

### Content I published isn't showing on the public site

- Confirm the `status` is `published`, not `draft`.
- The public homepage uses ISR with a 1-hour cache. Hard-refresh (<kbd>Cmd/Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd>) or wait, or reduce the `revalidate = 3600` in `app/page.tsx` for instant updates during development.

### Build fails on Vercel

- Make sure all four environment variables are set in **Project Settings → Environment Variables**.
- Run `npm run build` locally first to confirm it succeeds before pushing.

Still stuck? See [**docs/DEPLOYMENT.md → Troubleshooting**](docs/DEPLOYMENT.md#troubleshooting) or [open an issue](https://github.com/DDharma/portfolio-cms/issues).

---

## Tech stack & project structure

### Tech stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript 5 |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Custom JWT (not Supabase Auth) |
| **Storage** | Supabase Storage |
| **Styling** | Tailwind CSS v4 |
| **UI primitives** | Radix UI, Shadcn-style components |
| **Forms** | react-hook-form + Zod |
| **Rich text** | Tiptap 3 |
| **Data fetching** | TanStack Query (admin), SWR (fallback), ISR (public) |

### Project structure

```
portfolio-cms/
├── app/                      Next.js App Router pages & API routes
│   ├── (admin)/              Admin login + /setup (auth-gated routes)
│   ├── admin/                The admin dashboard pages
│   ├── api/                  REST endpoints (auth + admin CRUD)
│   ├── blog/, projects/, …   Public pages
│   └── layout.tsx            Root layout (fetches contact + hero data)
├── components/               UI components (admin forms, public sections)
├── lib/                      API clients, auth helpers, validations, config
├── hooks/                    Reusable React hooks
├── scripts/                  SQL migrations (run these in Supabase)
├── docs/                     The rest of the documentation
└── public/                   Static assets
```

### Available commands

```bash
npm run dev      # Start the dev server at http://localhost:3000
npm run build    # Build for production
npm run start    # Run the production build locally
npm run lint     # Run ESLint
```

---

## Documentation index

- [**docs/QUICK_START.md**](docs/QUICK_START.md) — day-to-day CMS usage (creating posts, projects, image uploads, drafts vs publishing)
- [**docs/DEPLOYMENT.md**](docs/DEPLOYMENT.md) — Vercel, Node.js, Docker, custom domains, ISR tuning
- [**docs/RLS-SETUP.md**](docs/RLS-SETUP.md) — how the row-level security model works (deeper read for self-hosters)
- [**docs/CMS_IMPROVEMENT_ROADMAP.md**](docs/CMS_IMPROVEMENT_ROADMAP.md) — what's planned next
- [**CONTRIBUTING.md**](CONTRIBUTING.md) — branch conventions, PR process, areas where help is wanted
- [**scripts/production-migration.sql**](scripts/production-migration.sql) — the database schema (you ran this in Step 3)

---

## Contributing & license

Contributions are welcome — see [**CONTRIBUTING.md**](CONTRIBUTING.md).

Licensed under the [MIT License](LICENSE) — fork it, deploy it, modify it, sell it. Just keep the license file.

Built with [Next.js](https://nextjs.org/), [Supabase](https://supabase.com), [Tailwind CSS](https://tailwindcss.com), [Tiptap](https://tiptap.dev), and [React Hook Form](https://react-hook-form.com).
