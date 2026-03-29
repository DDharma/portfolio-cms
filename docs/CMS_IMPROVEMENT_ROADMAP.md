# CMS Improvement Roadmap

This document outlines the current state of the Developer Portfolio CMS, identifies known gaps, and proposes improvements for making it a fully customizable design and layout system.

**Purpose:** Guide future development to transform the CMS from a content-only tool into a complete design & layout customization platform.

---

## 1. Current State Summary

### What the CMS Controls Today

The portfolio CMS is a **content management system**, not a **design management system**. It currently controls:

- **Text content** — All headings, descriptions, titles (rich text with Tiptap editor)
- **Media** — Upload and manage images and PDFs
- **Structured data** — Skills, projects, blog posts, research papers, experience entries, gallery photos
- **Metadata** — Tags, categories, dates, links, icons for content
- **Limited styling** — Custom CSS classes that can be applied to rich text selections
- **Publishing workflow** — Draft/publish toggle on all content

### What It Does NOT Control

Visual design and layout decisions:
- Section layouts (grid, masonry, timeline, etc.)
- Card design variants (style options for how content appears)
- Color themes and branding
- Typography choices
- Navigation structure
- SEO metadata
- Homepage section visibility or ordering

---

## 2. Known Gaps (High Priority Fixes)

These are confirmed issues found in the codebase that need fixing before advancing to design features.

| Gap | Location | Impact | Fix Effort |
|-----|----------|--------|-----------|
| **Projects `category`, `year`, `accent` fields missing from form** | `components/admin/forms/projects-form.tsx`, `lib/validations/projects.schema.ts` | Cannot set accent color, category, or year via CMS (fields exist in DB and type but not form) | 🟢 Low (UI only) |
| **Gallery section commented out** | `app/page.tsx:137` | Gallery feature invisible to visitors despite having full CMS | 🟢 Low (uncomment) |
| **Hero `heading` field in type but no form input** | `components/admin/forms/hero-form.tsx` | Unused DB column, possible feature not implemented | 🟢 Low (UI only) |
| **CTA `variant` field in type but not in form** | `components/admin/forms/hero-form.tsx`, `components/ui/button.tsx` | Cannot style CTAs differently (button, link, gradient, etc.) | 🟢 Low (UI only) |
| **Navigation links are hardcoded** | `utils/data.ts` | Cannot change nav menu from CMS | 🟡 Medium (needs DB table) |
| **No public `/research` page** | `app/` | Research content has no listing page | 🟡 Medium (new route) |
| **No public `/gallery` page** | `app/` | Gallery content has no listing page | 🟡 Medium (new route) |
| **Blog/Projects archive headings hardcoded** | `app/blog/page.tsx`, `app/projects/page.tsx` | Section headings on archive pages not editable | 🟢 Low (add form inputs) |
| **Contact section heading hardcoded** | `components/sections/contact-section.tsx` | CMS contact settings don't control the section heading text | 🟢 Low (use section_metadata) |
| **No on-demand ISR revalidation route** | `app/api/` | Publish action doesn't refresh public pages immediately | 🟡 Medium (new API route) |
| **Experience description is plain textarea** | `components/admin/forms/experience-form.tsx` | No rich text for job descriptions (inconsistent with other sections) | 🟡 Medium (UI change) |
| **No drag-and-drop sorting** | All list forms | Sort order is a number input only | 🟡 Medium (UI library) |

---

## 3. Design & Layout Customization — The Big Gap

This is the core missing feature: **zero visual/layout control from the CMS**. The following grouped proposals represent what should be added to transform this into a design CMS.

### 3A. Section-Level Layout Choices

Allow admins to choose how each major portfolio section renders on the homepage:

#### Projects Section
- **Grid Layout** (current) — 2-column or 3-column responsive grid
- **Masonry** — Pinterest-style masonry layout
- **Featured + Grid** — 1 large featured project + smaller grid below
- **Carousel** — Horizontal swipe carousel (mobile-friendly)
- **List** — Simple text list view (minimal style)

**Implementation:** Add `layout_type` enum field to `section_metadata` table for Projects section.

#### Blog Section
- **Card Grid** (current) — 3-column responsive grid of cards
- **Magazine** — Large featured post + 2 columns below
- **List** — Compact list with thumbnails on left
- **Timeline** — Chronological timeline of posts
- **Table** — Archive table with title, date, category, reading time

**Implementation:** Add `layout_type` to section_metadata for Blog section.

#### Skills Section
- **Category Cards** (current) — Expandable category cards
- **Tag Cloud** — Word cloud where size = proficiency
- **Progress Bars** — Skill name with horizontal progress bar
- **Matrix Grid** — 4x4 grid of skills with colors
- **Filter Tabs** — Tabs per category with skills listed

**Implementation:** Add `layout_type` to section_metadata for Skills section.

#### Experience Section
- **Vertical Timeline** (current) — Timeline dot + text
- **Horizontal Timeline** — Timeline flowing left-to-right
- **Company Cards** — Each company as a large card with nested jobs
- **List** — Simple list of jobs with dates
- **Interactive** — Clickable timeline with expanded details on click

**Implementation:** Add `layout_type` to section_metadata for Experience section.

#### Gallery Section
- **Masonry Grid** (Pinterest-style)
- **Equal Grid** — All same size (3, 4, or 5 columns)
- **Carousel** — Horizontal swipe with lightbox
- **Hero + Grid** — Featured image + smaller grid
- **Full Width** — Full-bleed images one per row

**Implementation:** Add `layout_type` to section_metadata for Gallery section.

#### Research Section
- **Card Grid** — Similar to blog
- **Table/List** — Academic paper list with DOI, authors
- **Timeline** — Chronological research journey
- **Paper Style** — Abstract-first layout like arXiv

**Implementation:** Add `layout_type` to section_metadata for Research section.

#### About Section
- **Split Layout** — Image on left, text on right (current)
- **Stacked** — Image on top, text below
- **Text + Highlights** — Text left, highlight cards right
- **Immersive** — Full-bleed image with text overlay

**Implementation:** Add `layout_type` to section_metadata for About section.

---

### 3B. Card Design Variants

For each content type, provide multiple visual styles:

#### Project Cards
- **Minimal** — Just title and tags (text-only, no image)
- **Thumbnail Card** — Image top, text bottom (current)
- **Featured** — Large, full-bleed image with text overlay
- **Glassmorphism** — Frosted glass effect, semi-transparent
- **Bordered** — Thin border, minimal shadow, clean
- **Hover Zoom** — Image zooms on hover

**Implementation:** Add `card_variant` enum field to `projects` table. Use field in [ProjectCard](../components/sections/project-grid.tsx) component to render different styles.

#### Blog Cards
- **Image Top** (current) — Image above text
- **Side-by-Side** — Image left, text right (2-column layout)
- **Text Only** — No image, accent bar on left
- **Featured Large** — Hero-sized featured card
- **Mini** — Compact card, minimal padding
- **Overlay** — Text overlaid on image with gradient

**Implementation:** Add `card_variant` to `blog_posts` table.

#### Skill Badges
- **Plain Tag** (current) — Simple text badge
- **Icon + Label** — Icon on left, skill name on right
- **Progress Bar** — Filled bar showing proficiency
- **Percentage Circle** — Circular progress indicator
- **Colored Pill** — Color-coded by proficiency

**Implementation:** Add `badge_variant` to `skill_categories` table, use in [SkillCard](../components/sections/skills-section.tsx).

#### Experience Cards
- **Timeline Dot + Text** (current) — Timeline line with dot
- **Full Company Card** — Company name prominent, collapsible jobs
- **Compact List Item** — Inline job title, company, dates
- **Side Timeline** — Timeline on side, content in main area

**Implementation:** Add `card_variant` to `experience_items` table.

---

### 3C. Color & Theme Control

#### Global Accent Color
**What:** Single color that cascades through the entire site
- Button hover states
- Links
- Accent lines
- Border colors
- Text highlights

**Implementation:** Add `accent_color` hex field to a new `site_branding` table. Read in `app/layout.tsx` and inject as CSS variable:
```css
:root {
  --accent-color: #YOUR_COLOR;
}
```

#### Per-Section Background Styles
**Options:**
- **Solid** — Flat background color
- **Gradient** — Linear or radial gradient
- **Subtle Pattern** — Repeating texture
- **Image** — Background image with overlay
- **None** — Transparent/inherit from page

**Implementation:** Add `bg_style` and `bg_color`/`bg_gradient` to `section_metadata`. Use in section wrapper components.

#### Per-Project Accent Gradient
**What:** Fix the existing `accent` field on projects table

Currently, the `accent` field exists in DB and TypeScript type but:
- Not in Zod schema validation
- Not in form UI
- Not used in component display

**Fix:**
1. Add form input for `accent` in [projects-form.tsx](../components/admin/forms/projects-form.tsx)
2. Add to Zod schema in [projects.schema.ts](../lib/validations/projects.schema.ts)
3. Use in [ProjectCard](../components/sections/project-grid.tsx) to apply gradient class

**Example accents:** `from-blue-500 to-purple-600`, `from-green-400 to-emerald-600`, etc.

#### Dark/Light Mode Override
**What:** Admin toggle to force light or dark mode, or allow visitor preference
- Allow OS/user preference (current)
- Force light mode
- Force dark mode
- Schedule (dark after sunset, etc.)

**Implementation:** Add `force_theme` field to `site_branding` table. Check in [ThemeProvider](../components/theme/theme-provider.tsx).

#### Hero Background Style
**Options:**
- **Solid Color**
- **Linear Gradient**
- **Radial Gradient**
- **Mesh Gradient** (three.js/canvas)
- **Image with Overlay**
- **Animated** (slow moving gradient)

**Implementation:** Add `bg_style`, `bg_color`, `bg_image` to `hero_content` table. Update [HeroSection](../components/sections/hero-section.tsx) to render based on fields.

---

### 3D. Section Visibility & Ordering

#### Hide/Show Sections
**What:** Toggle whether a section appears on homepage without deleting content

**Implementation:**
1. Add `is_visible` boolean to `section_metadata` table
2. In `app/page.tsx`, conditionally render sections:
   ```typescript
   const isVisible = await getSectionMetadata('projects');
   {isVisible?.is_visible && <ProjectsSection ... />}
   ```

**Benefits:**
- Temporarily hide sections during redesign
- Show different sections to different visitors (A/B testing)
- Keep content but remove from site

#### Drag-to-Reorder Sections
**What:** Admin can change section order on homepage (Hero → About → Skills → ... → Contact)

**Implementation:**
1. Add `section_order` number field to `section_metadata`
2. Update homepage to sort sections by this field
3. Add drag-and-drop UI in admin (e.g., React Beautiful Dnd)

**Current order is hardcoded:**
```typescript
<HeroSection />
<AboutSection />
<SkillsSection />
<ExperienceSection />
<ProjectsSection />
<ContactSection />
```

---

### 3E. Typography & Spacing

#### Font Family Selector
**Options:**
- **Sans-Serif** — Inter (current)
- **Serif** — Playfair Display, Georgia, etc.
- **Monospace** — JetBrains Mono, Courier New
- **Display** — Luxe, Poppins, etc.

**Implementation:**
1. Add `font_family` field to `site_branding`
2. Load fonts from Google Fonts API or static imports
3. Apply globally in `app/layout.tsx`

#### Heading Style
**What:** Choose different typography treatment for headings
- Modern/Sans (current)
- Elegant/Serif
- Mono/Technical
- Custom

**Implementation:** Add `heading_style` to `site_branding`, apply className to all `<h1>`, `<h2>`, etc.

#### Section Padding Presets
**Options:**
- Compact — Less vertical spacing
- Normal (current)
- Spacious — Extra breathing room
- Custom — Pixel values

**Implementation:** Add `padding_level` to `section_metadata`, apply Tailwind spacing class.

#### Line Height & Base Font Size Scale
**What:** Adjust readability at a global level
- Base font size (14px, 16px, 18px, etc.)
- Line height multiplier (1, 1.5, 2)

**Implementation:** Add to `site_branding`, inject CSS variables.

---

### 3F. Global Branding

#### Site Name / Logo
**What:** Text or image logo that appears in header

Currently, the site title is hardcoded in [header.tsx](../components/layout/header.tsx).

**Implementation:**
1. Add `site_name`, `logo_image_id` fields to `site_branding` table
2. Update header to render from DB
3. Upload logo via media library

#### Favicon Upload
**What:** Upload a custom favicon instead of hardcoded one

**Implementation:**
1. Add `favicon_image_id` to `site_branding`
2. Dynamically set `<link rel="icon" href={...} />`

#### OG Image / Social Sharing
**What:** Image that appears when link is shared on social media

**Implementation:**
1. Add `og_image_id` to `site_branding`
2. Set in `<head>` meta tags:
   ```html
   <meta property="og:image" content={ogImage} />
   ```

#### Site Tagline / Description
**What:** Short description used in page titles and meta tags

**Implementation:**
1. Add `tagline`, `description` to `site_branding`
2. Use in `<title>` and `<meta name="description">`

**Example:** "John Doe — Full-stack developer, open source contributor" instead of hardcoded text.

---

### 3G. Navigation Management

Currently, navigation links are **hardcoded** in [utils/data.ts](../utils/data.ts):
```typescript
export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  // ...
];
```

#### Allow Dynamic Nav Links

**What:** Admin can add, remove, reorder navigation links

**Implementation:**
1. Create `navigation_items` table:
   ```sql
   CREATE TABLE navigation_items (
     id UUID PRIMARY KEY,
     label TEXT NOT NULL,
     href TEXT NOT NULL,
     sort_order INT NOT NULL,
     is_visible BOOLEAN DEFAULT true,
     created_at TIMESTAMP
   );
   ```
2. Update [header.tsx](../components/layout/header.tsx) to fetch nav links from DB
3. Add admin form to manage nav items in `/admin/navigation` (new page)

#### Hire Me CTA
**What:** Toggle visibility and styling of "Hire me" button in nav

**Implementation:**
1. Add `show_hire_cta`, `hire_cta_text`, `hire_cta_href` to `site_branding`
2. Conditionally render in header

#### Resume PDF Management
**What:** Upload and link resume from CMS instead of hardcoding path

Currently hardcoded in [header.tsx](../components/layout/header.tsx):
```typescript
href="/DDharma-CV.pdf"
```

**Implementation:**
1. Add `resume_file_id` to `site_branding`
2. Store resume PDF in media library
3. Generate download link dynamically

---

## 4. Future Feature Ideas

Beyond design customization, these features would enhance the platform for developer portfolios:

### Analytics & Insights
- **Page view tracking** — Which sections are visited most
- **Content engagement** — Blog post clicks, project link clicks
- **Traffic sources** — Referrers, direct, search
- **Privacy-first** — No cookies, GDPR-compliant (use Plausible or Fathom API)

### Contact & Communication
- **Contact form with inbox** — Collect inquiries, manage responses
- **View submissions** — Admin dashboard to see all contact messages
- **Email notifications** — Get notified when someone contacts you
- **Reply to submissions** — Send follow-up emails directly

### Social Proof
- **Testimonials section** — Client/colleague recommendations with images
- **Recommendations** — LinkedIn-style endorsements
- **Client logos** — Companies you've worked with

### Open Source & Contributions
- **GitHub contributions** — Auto-fetch and display public repos
- **Starred repos** — Show projects you love
- **Issue tracker** — Link to open source work
- **Contribution graph** — Activity visualization

### Speaking & Events
- **Conference talks section** — Speaking engagements with slides
- **Upcoming events** — When/where you're speaking
- **Event calendar** — Calendar view of availability

### Email & Newsletter
- **Newsletter signup** — Mailchimp or Resend integration
- **Email list** — View subscribers (optional)
- **Welcome sequence** — Auto-email new subscribers

### Now Page
- **What I'm working on now** — Status updates (inspired by Derek Sivers)
- **Current focus** — Currently learning, building, reading
- **Last updated** — Timestamp of last update

### Availability Status
- **Open to work toggle** — Show if available for freelance/full-time
- **Hire date display** — "Available starting March 2025"
- **Calendar** — Booked vs. available time slots

### Uses / Setup Page
- **Software stack** — IDEs, languages, tools
- **Hardware** — Laptop, monitor, keyboard, mouse details
- **Services** — Hosted on Vercel, databases on Supabase, etc.
- **Recommendations** — Affiliate links or endorsements

### Transparency & Changelog
- **Site changelog** — "What's new" log of portfolio updates
- **Version history** — Track public changes
- **Deployment status** — Show CI/CD status

### Advanced Features
- **Import/export** — Backup content as JSON, migrate between instances
- **Multi-language** — Duplicate content for multiple languages
- **Preview mode** — See draft content before publishing
- **Media organization** — Folders, tags for uploaded files
- **Scheduled publishing** — Queue content for future dates
- **Bulk actions** — Bulk publish/archive/delete
- **Advanced search** — Full-text search in content

---

## 5. Implementation Priority

### Phase 1: Quick Wins (1-2 sprints)
Low-effort, high-impact fixes:
- [ ] Add missing project form fields (`category`, `year`, `accent`)
- [ ] Fix Zod schema to match DB and form
- [ ] Uncomment gallery section on homepage
- [ ] Add form inputs for hero `heading` field
- [ ] Add navigation management CMS (`navigation_items` table)
- [ ] Fix contact section to use editable heading

**Impact:** Unblock users, fix inconsistencies, enable basic features.

### Phase 2: Section Customization (2-3 sprints)
Foundation for design control:
- [ ] Add `is_featured` flag to projects and blog posts
- [ ] Add `is_visible` toggle to `section_metadata`
- [ ] Create `site_branding` table with global settings
- [ ] Add global accent color picker
- [ ] Create `/admin/branding` settings page
- [ ] Add `layout_type` to Projects section, implement 2-3 layout options

**Impact:** Users can control which sections appear, customize colors, choose section layouts.

### Phase 3: Card Variants & Typography (2-3 sprints)
Visual variety:
- [ ] Add `card_variant` field to projects table, implement variants in UI
- [ ] Add `card_variant` to blog posts
- [ ] Add font family selector to branding
- [ ] Add section padding/spacing controls
- [ ] Implement 2-3 blog layout options

**Impact:** Users can customize appearance of cards, typography, and layouts.

### Phase 4: Full Layout Control (3-4 sprints)
Complete section customization:
- [ ] Implement layout choices for Skills, Experience, Gallery, Research
- [ ] Add drag-to-reorder sections on homepage
- [ ] Add hero background style options
- [ ] Add per-project gradient/accent colors
- [ ] Create on-demand ISR revalidation route

**Impact:** Full design control over all sections and layouts.

### Phase 5: Analytics & Future (ongoing)
Nice-to-have features:
- [ ] Analytics dashboard
- [ ] Contact form with inbox
- [ ] Newsletter integration
- [ ] Open source contributions section
- [ ] GitHub integration

---

## 6. Technical Approach

### Database Changes
- Add `is_visible`, `layout_type`, `bg_style`, `bg_color` to `section_metadata`
- Add `card_variant` to projects, blog_posts, experience_items, skill_categories
- Create new `site_branding` table for global settings
- Create `navigation_items` table for nav management

### Admin Forms
- Expand all section management forms with new fields
- Add form controls for layout selection (radio buttons, dropdowns)
- Create `/admin/branding` page for global settings
- Create `/admin/navigation` page for nav management

### Component Updates
- Update all section components (`HeroSection`, `ProjectsSection`, etc.) to read layout/variant from DB
- Add conditional rendering based on `layout_type`
- Use CSS classes or dynamic components for variants

### API Changes
- Extend all section APIs to return new fields
- Add new `/api/admin/branding` and `/api/admin/navigation` endpoints

### No Breaking Changes
- All changes are additive (new fields with defaults)
- Existing content continues to work with default layout/variant
- Can migrate existing instances without data loss

---

## 7. Success Criteria

Once all phases are complete, the CMS will enable users to:

✅ **Control all content** — Text, images, metadata (done today)
✅ **Choose section layouts** — Grid, masonry, timeline, etc. for each section
✅ **Choose card styles** — Multiple design variants for each content type
✅ **Customize colors** — Global accent color, per-item colors, theme
✅ **Manage navigation** — Add, remove, reorder nav items from CMS
✅ **Control branding** — Site name, logo, favicon, tagline, etc.
✅ **Show/hide sections** — Toggle section visibility without deleting
✅ **Reorder sections** — Change homepage section order via drag-and-drop
✅ **Optimize for different industries** — Developer, designer, writer portfolios with appropriate defaults

---

## Questions & Next Steps

- **Which features are highest priority for your use case?**
- **Should Phase 1 be done before releasing as open source?**
- **Do you want analytics/contact features in Phase 2 or later?**

For feedback or discussion, open an issue on GitHub or start a discussion!
