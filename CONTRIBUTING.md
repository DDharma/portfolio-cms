# Contributing to Developer Portfolio CMS

Thank you for your interest in contributing! This guide will help you get started.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow

## Getting Started

### 1. Fork and Clone

```bash
git clone https://github.com/YOUR_USERNAME/portfolio-cms.git
cd portfolio-cms
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Local Supabase (for testing database changes)

- Create a local Supabase project or use the free tier
- Run `scripts/production-migration.sql` in your Supabase SQL Editor
- Copy `.env.example` to `.env.local` and fill in credentials
- Visit `/setup` to create your local admin account

### 4. Run the Development Server

```bash
pnpm dev
```

Open `http://localhost:3000` in your browser.

## Development Workflow

### Branch Naming Conventions

```
feat/description        # New feature
fix/description         # Bug fix
docs/description        # Documentation only
refactor/description    # Code refactoring
test/description        # Tests only
chore/description       # Tooling, deps, etc.
```

Example: `feat/project-card-variants` or `fix/gallery-section-layout`

### Making Changes

1. **Create a feature branch** from `main`:

   ```bash
   git checkout -b feat/your-feature
   ```

2. **Make your changes** and test locally:

   ```bash
   pnpm dev
   pnpm type-check  # Ensure TypeScript is clean
   pnpm lint        # Check for linting issues
   ```

3. **Commit with clear messages** (imperative mood):

   ```bash
   git commit -m "Add project card variant selector to CMS"
   git commit -m "Fix: correct ISR revalidation timing"
   ```

4. **Push to your fork**:

   ```bash
   git push origin feat/your-feature
   ```

5. **Open a Pull Request** on the main repository
   - Reference any related issues
   - Describe what changed and why
   - Link to related PRs or docs

## Code Style

### TypeScript

- Use strict mode (it's enabled in `tsconfig.json`)
- Avoid `any` types — use proper typing
- Use descriptive variable and function names

### React

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript for prop types

### CSS / Tailwind

- Prefer Tailwind CSS classes over custom CSS
- Use v4 syntax and tokens
- Keep custom CSS minimal and well-scoped

### Formatting

We use Prettier for code formatting. Run before committing:

```bash
pnpm format  # If available
# or
pnpm exec prettier --write .
```

## Testing

### Running Tests

```bash
pnpm test        # Run all tests (if test suite exists)
pnpm test:ui # Open test UI
```

### Testing Database Changes

1. Create your migration SQL
2. Run it in a test Supabase project
3. Test the app thoroughly
4. Document any breaking changes

## Documentation

- Update [`README.md`](README.md) for user-facing changes
- Update [`docs/`](docs/) for technical changes
- Add inline comments for complex logic
- Update type definitions when changing data structures

## Areas We're Looking For

### High Priority (Help Wanted 🙋)

- [ ] Section layout variants (grid vs. masonry for projects)
- [ ] Card design variant selector for projects, blog, etc.
- [ ] Color theme controls in admin
- [ ] Navigation management CMS
- [ ] Fix missing form fields (project category/year/accent)
- [ ] Add `is_featured` flag to projects and blog

### Medium Priority

- [ ] Gallery and research public pages
- [ ] Per-page SEO settings
- [ ] Drag-and-drop section reordering
- [ ] Multi-language support

### Lower Priority

- [ ] Analytics dashboard
- [ ] Contact form with inbox
- [ ] Newsletter integration
- [ ] Import/export functionality

See [`docs/CMS_IMPROVEMENT_ROADMAP.md`](docs/CMS_IMPROVEMENT_ROADMAP.md) for the full roadmap.

## Issues and Discussions

### Filing a Bug Report

1. Check if it's already reported
2. Use descriptive title
3. Include steps to reproduce
4. Describe expected vs. actual behavior
5. Include your environment (OS, Node version, etc.)

### Feature Requests

- Describe the use case
- Explain why it's needed
- Link to related issues/PRs
- Check if it aligns with the portfolio CMS vision (developer-focused, not WordPress-like)

## Pull Request Process

1. **Self-review** — Make sure your code is clean and works
2. **Check the build** — Ensure `pnpm build` succeeds
3. **Type-check** — Run `pnpm type-check`
4. **Test your changes** locally and in a test Supabase project if needed
5. **Write a clear PR description**:

   ```markdown
   ## Description

   What does this PR do?

   ## Type of Change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation
   - [ ] Breaking change

   ## Testing

   How did you test this?

   ## Related Issues

   Closes #123
   ```

## Deployment & Releases

- `main` branch is production-ready
- Releases follow semantic versioning (v1.0.0, v1.1.0, etc.)
- Changelog is updated with major/minor/patch changes

## Questions?

- Open a discussion on GitHub
- Check [`docs/`](docs/) for existing answers
- Ask in issues for clarification

Thank you for contributing! 🎉
