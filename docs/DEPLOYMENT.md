# Deployment Guide

This guide covers deploying your portfolio CMS to production on various platforms.

## Table of Contents
1. [Vercel (Recommended)](#vercel-recommended)
2. [Self-Hosted (Node.js / Docker)](#self-hosted)
3. [Environment Variables](#environment-variables)
4. [Database & Storage Setup](#database--storage-setup)
5. [Revalidation & ISR](#revalidation--isr)
6. [Custom Domain](#custom-domain)
7. [Monitoring & Logs](#monitoring--logs)

---

## Vercel (Recommended)

Vercel is the recommended platform — it's optimized for Next.js and offers a seamless deployment experience.

### Prerequisites
- Vercel account (free at [vercel.com](https://vercel.com))
- GitHub repository with this code
- Supabase project already set up

### Step 1: Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub account and this repository
4. Click "Import"

### Step 2: Add Environment Variables

In the Vercel dashboard, go to **Project Settings > Environment Variables** and add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret-min-32-chars
```

**Where to find these values:**
- Log into your Supabase project
- Go to **Settings > API**
- Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`
- Generate a random string (32+ chars) → `JWT_SECRET`

### Step 3: Deploy

1. Click **Deploy**
2. Vercel builds and deploys automatically
3. You'll get a `.vercel.app` domain
4. **First deploy may take 5-10 minutes**

Subsequent pushes to `main` will auto-deploy.

### Step 4: Set Up Revalidation (Optional)

To refresh content on-demand instead of waiting 1 hour, add this webhook to your admin:

In Vercel Project Settings > Git, add a **Deploy Hook**:
- **Name:** `revalidate-portfolio`
- **Branch:** `main`
- Copy the webhook URL

Then in your Supabase, you could trigger this webhook on content publish (advanced).

### Vercel ISR Strategy

By default, content revalidates every 1 hour (see `app/page.tsx`). For faster updates:
- Option 1: Reduce `revalidate = 3600` to a lower number (60 = 1 minute)
- Option 2: Use on-demand revalidation via Supabase functions
- Option 3: Accept 1-hour lag, manually trigger deployment on important changes

---

## Self-Hosted

### Option A: Node.js Server

#### Prerequisites
- Node.js 18+ installed
- A Linux server (Ubuntu recommended)
- Supabase project configured

#### Deployment Steps

1. **SSH into your server**
   ```bash
   ssh user@your-server.com
   ```

2. **Install dependencies**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs git
   corepack enable && corepack prepare pnpm@latest --activate
   ```

3. **Clone your repository**
   ```bash
   git clone https://github.com/DDharma/portfolio-cms.git
   cd portfolio-cms
   ```

4. **Install project dependencies**
   ```bash
   pnpm install --prod
   ```

5. **Build the Next.js app**
   ```bash
   pnpm build
   ```

6. **Create `.env` file** (same as `.env.example`)
   ```bash
   cp .env.example .env.local
   nano .env.local  # Edit with your values
   ```

7. **Start the server**
   ```bash
   pnpm start
   # The server runs on http://localhost:3000
   ```

8. **Set up PM2 for persistent running** (optional but recommended)
   ```bash
   sudo pnpm add -g pm2
   pm2 start "pnpm start" --name portfolio
   pm2 startup
   pm2 save
   ```

9. **Set up Nginx as reverse proxy** (optional)
   ```bash
   sudo apt-get install -y nginx
   sudo nano /etc/nginx/sites-available/default
   ```

   Add this to the `server` block:
   ```nginx
   location / {
     proxy_pass http://localhost:3000;
     proxy_http_version 1.1;
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection 'upgrade';
     proxy_set_header Host $host;
     proxy_cache_bypass $http_upgrade;
   }
   ```

   Then:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **Enable HTTPS** (Let's Encrypt)
    ```bash
    sudo apt-get install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d yourdomain.com
    ```

### Option B: Docker

1. **Create a `Dockerfile`** in your project root:
   ```dockerfile
   FROM node:18-alpine

   RUN corepack enable && corepack prepare pnpm@latest --activate

   WORKDIR /app

   COPY package.json pnpm-lock.yaml ./
   RUN pnpm install --prod --frozen-lockfile

   COPY . .
   RUN pnpm build

   ENV NODE_ENV=production
   EXPOSE 3000

   CMD ["pnpm", "start"]
   ```

2. **Build the image**
   ```bash
   docker build -t portfolio:latest .
   ```

3. **Run the container**
   ```bash
   docker run -p 3000:80 \
     -e NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key \
     -e SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
     -e JWT_SECRET=your-jwt-secret \
     portfolio:latest
   ```

   Or use Docker Compose (`docker-compose.yml`):
   ```yaml
   version: '3.8'

   services:
     portfolio:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
         - NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
         - SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
         - JWT_SECRET=your-jwt-secret
   ```

   Then run:
   ```bash
   docker-compose up -d
   ```

---

## Environment Variables

All environment variables from `.env.example` are required:

| Variable | Required | Where to Get | Example |
|----------|----------|--------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase Dashboard > Settings > API > Project URL | `https://abcd1234.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase Dashboard > Settings > API > anon key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase Dashboard > Settings > API > service_role key | `eyJhbGciOi...` |
| `JWT_SECRET` | ✅ | Generate your own | `qwertyuiopasdfghjklzxcvbnm123456` |

**⚠️ Never commit `.env.local` to git. Add it to `.gitignore`.**

---

## Database & Storage Setup

### 1. Create Supabase Project

1. Sign up at [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose a region close to your users
4. Wait for the project to initialize (2-5 minutes)

### 2. Run the Migration

1. Go to **SQL Editor** in Supabase
2. Click **New Query**
3. Copy the entire contents of [`scripts/production-migration.sql`](../scripts/production-migration.sql)
4. Paste into the SQL editor
5. Click **Run**

This creates all 28 tables, indexes, triggers, and RLS policies.

### 3. Create Storage Bucket

1. Go to **Storage** > **Buckets**
2. Click **New Bucket**
3. Name: `portfolio-images`
4. Check **Public bucket**
5. Click **Create bucket**

### 4. Create Admin Account

Visit your deployed site at `/setup` to create your admin account. This page is only available when no admin exists.

---

## Revalidation & ISR

### How It Works

By default, the homepage and archive pages revalidate **every 1 hour** (ISR). This means:
- Fresh content is cached for fast load times
- Updates appear within 1 hour automatically
- No manual redeploy needed

See `app/page.tsx`, `app/blog/page.tsx`, `app/projects/page.tsx`:
```typescript
export const revalidate = 3600; // 1 hour in seconds
```

### Speed It Up

#### Option 1: Reduce ISR Time
Change `revalidate = 3600` to `revalidate = 60` (1 minute) or `revalidate = 300` (5 minutes).

**Tradeoff:** More server load but faster updates.

#### Option 2: On-Demand Revalidation (Advanced)
Create a webhook that Supabase triggers on publish:

1. In Vercel, create a **Deploy Hook** (Settings > Git)
2. Or create an API route in your Next.js app:
   ```typescript
   // app/api/revalidate/route.ts
   import { revalidateTag } from 'next/cache';

   export async function POST(req: Request) {
     const authHeader = req.headers.get('authorization');
     if (authHeader !== `Bearer ${process.env.REVALIDATE_SECRET}`) {
       return new Response('Unauthorized', { status: 401 });
     }

     revalidateTag('home');
     revalidateTag('blog');
     revalidateTag('projects');

     return Response.json({ revalidated: true, now: Date.now() });
   }
   ```

3. When publishing from the CMS, make an API call to this endpoint

---

## Custom Domain

### On Vercel

1. Go to **Project Settings > Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `myportfolio.com`)
4. Follow DNS instructions for your registrar
5. Wait 5-30 minutes for DNS propagation

### On Self-Hosted

1. Point your domain's DNS to your server IP
2. If using Nginx, update `/etc/nginx/sites-available/default`:
   ```nginx
   server_name myportfolio.com www.myportfolio.com;
   ```
3. Set up HTTPS with Let's Encrypt:
   ```bash
   sudo certbot --nginx -d myportfolio.com -d www.myportfolio.com
   ```

---

## Monitoring & Logs

### Vercel

- Go to **Project Settings > Deployments**
- Click on any deployment to see build logs
- Go to **Project Settings > Functions** to see serverless function logs

### Self-Hosted (PM2)

View logs:
```bash
pm2 logs portfolio
```

Restart the app:
```bash
pm2 restart portfolio
```

### Self-Hosted (Docker)

View logs:
```bash
docker logs container-name -f
```

---

## Troubleshooting

### "Database connection failed"
- Check that `SUPABASE_SERVICE_ROLE_KEY` is correct
- Ensure Supabase project is running (check dashboard)
- Verify network allows connections to Supabase

### "Image won't load from Supabase"
- Check that `portfolio-images` bucket is public
- Verify images are in the bucket (go to Storage in Supabase)
- Check browser console for CORS errors

### "Admin login fails"
- Verify `JWT_SECRET` is set and at least 32 characters
- Check that admin user exists in `profiles` table with `role = 'admin'`
- Clear browser cookies and try again

### "Build fails on deploy"
- Run `pnpm build` locally to debug
- Check that all environment variables are set
- Ensure `next.config.ts` is valid

### "Content not refreshing"
- If using ISR, wait up to 1 hour or reduce `revalidate` time
- On Vercel, try **Redeploy** button manually
- Check that you're viewing a `GET` request (not cached from `POST`)

---

## Need Help?

- Check [`README.md`](../README.md) for quick start
- [Open an issue on GitHub](https://github.com/DDharma/portfolio-cms/issues)
- Check [`docs/`](../docs/) for more resources
