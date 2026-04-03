# Developer Portfolio CMS

A fully customizable, self-hosted portfolio CMS built for developers and tech professionals. Built with **Next.js 16**, **Supabase**, and **TypeScript**. Deploy it yourself, control your content.

## ✨ Features

- **Complete CMS Control** — Manage all portfolio content (hero, about, skills, experience, projects, blog, research, gallery) from an admin dashboard
- **Rich Text Editing** — Tiptap editor with code highlighting, custom CSS classes, and inline styling
- **Drag-and-Drop Media** — Upload images and PDFs directly from the CMS
- **Draft & Publish Workflow** — Save drafts before publishing content
- **Custom CSS Classes** — Define and apply custom CSS styles to any text without writing HTML
- **Icon Picker** — Choose from Lucide icons for skill categories, highlights, and more
- **SEO-Ready** — ISR (Incremental Static Regeneration) for fast, always-fresh content
- **Fully Open Source** — MIT licensed, fork and deploy on your own infrastructure
- **Supabase Powered** — Serverless PostgreSQL with built-in authentication and storage

## 🎯 Who Is This For?

- **Developers** building their personal brand
- **Tech professionals** with a portfolio site
- **Freelancers** wanting a professional online presence
- **Anyone** who wants CMS power without the bloat of WordPress

*This is NOT a general-purpose blogging platform. It's optimized for developer portfolios.*

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A free Supabase account (https://supabase.com)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/DDharma/portfolio-cms.git
cd portfolio-cms
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase Project
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. In the SQL Editor, run the migration from [`scripts/production-migration.sql`](scripts/production-migration.sql)
4. Create a public storage bucket named `portfolio-images`:
   - Go to Storage > Buckets
   - New bucket
   - Name: `portfolio-images`
   - Check "Public bucket"
   - Create bucket
5. Create your admin account:
   - Start the dev server (`npm run dev`)
   - Visit `http://localhost:3000/setup`
   - Fill in your name, email, and password
   - You'll be automatically logged into the admin dashboard

### 4. Configure Environment Variables
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` — Just After project created, from project overview copy the project url
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — From Project Settings > API Keys > Legacy anon > anon key
   - `SUPABASE_SERVICE_ROLE_KEY` — From Project Settings > API > Service Role Key
   - `JWT_SECRET` — Generate a random 32+ character string (Go to this https://randomkeygen.com/jwt-secret and copy any key)

### 5. Run the Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` — your portfolio is live.

## 🔐 Admin Dashboard

Access the admin CMS at `http://localhost:3000/admin`

**First-time setup:** Visit `/setup` to create your admin account. This page is only available when no admin exists.

Once logged in, you'll see:
- **Dashboard** — Quick stats on all content
- **Hero** — Homepage hero section (title, subtitle, CTAs, stats)
- **About** — About section with highlights and principles
- **Skills** — Skill categories and individual skills
- **Experience** — Work history with achievements
- **Projects** — Project portfolio with links and tags
- **Blog** — Blog posts with rich text
- **Research** — Research papers and long-form content
- **Gallery** — Photo gallery (not visible on homepage yet, but editable)
- **Media** — All uploaded images and PDFs
- **Styles** — Custom CSS classes you can apply anywhere
- **Settings** — Contact info and social links

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript 5 |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | Custom JWT (not Supabase Auth) |
| **Storage** | Supabase Storage |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | Radix UI, Shadcn-style primitives |
| **Forms** | react-hook-form + Zod |
| **Rich Text** | Tiptap 3 |
| **Data Fetching** | TanStack Query (admin), SWR (fallback), ISR (public) |

## 🚢 Deployment

### Deploy on Vercel (One-Click)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FDDharma%2Fportfolio-cms&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,JWT_SECRET)

### Manual Deployment
See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for detailed guides on deploying to:
- Vercel (with environment variables)
- Node.js servers
- Docker containers

**Key deployment notes:**
- Set environment variables in your hosting platform
- ISR revalidates content every 1 hour by default
- Supabase storage bucket must be public for image serving
- Run the migration SQL before first deploy

## 📚 Documentation

- [**Quick Start Guide**](docs/QUICK_START.md) — Initial setup walkthrough
- [**Deployment Guide**](docs/DEPLOYMENT.md) — Deploy to Vercel, Node, Docker
- [**Supabase RLS Setup**](docs/RLS-SETUP.md) — Understanding row-level security
- [**CMS Improvement Roadmap**](docs/CMS_IMPROVEMENT_ROADMAP.md) — Planned features and known gaps

## 🛠️ Development

### Available Commands
```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run TypeScript and linting
npm run type-check   # Type check only
```

### Project Structure
```
portfolio/
├── app/              # Next.js App Router pages
├── components/       # React components (admin, sections, UI)
├── lib/              # Utilities, API clients, auth
├── hooks/            # React hooks
├── types/            # TypeScript types
├── scripts/          # SQL migrations
├── docs/             # Documentation
└── public/           # Static assets
```

## 📖 Creating Content

### Blog Post Example
1. Go to Admin > Blog
2. Click "New Post"
3. Fill in title, description, and content (rich text)
4. Upload featured image
5. Add tags
6. Click "Publish"

Content is immediately visible at `/blog/[slug]`.

### Project Example
1. Go to Admin > Projects
2. Click "New Project"
3. Add title, description, images
4. Add links (live site, GitHub repo, etc.)
5. Choose category and year
6. Publish

Projects appear on `/projects` and homepage grid.

## 🎨 Styling Your Content

Use the **Styles section** in the admin to create reusable CSS classes, then apply them to text in any rich text editor:

1. Admin > Styles > New Style
2. Define CSS (e.g., `background: linear-gradient(...)`)
3. Save
4. In blog/project editors, select text and apply the style

## 🔒 Security

- Custom JWT authentication (not Supabase Auth)
- Row-level security (RLS) policies on all tables
- Admin-only endpoints (`/api/admin/*`)
- No public write access to content
- All images stored in Supabase with CDN

## 🤝 Contributing

Contributions are welcome! Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) for:
- How to run locally
- Branch naming conventions
- Pull request process
- Code style guidelines

## 📄 License

MIT License — see [`LICENSE`](LICENSE) for details.

## 🙋 Support

- **Issues & bugs?** [File an issue](https://github.com/DDharma/portfolio-cms/issues)
- **Questions?** Check the [Documentation](docs/) folder
- **Want to improve?** [Fork](https://github.com/DDharma/portfolio-cms/fork), build, and submit a PR

## 🌟 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Tiptap](https://tiptap.dev)
- [React Hook Form](https://react-hook-form.com)

---

**Made with ❤️ for developers, by developers.**

Deploy your portfolio. Own your content.
