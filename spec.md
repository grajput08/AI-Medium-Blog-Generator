# AI Medium Blog Generator & Publisher — Product Specification

**Version:** 1.0
**Date:** 2026-07-16
**Status:** Draft — approved for development

---

## 1. Overview

A production-ready SaaS web application that lets users generate high-quality, Medium-style blog articles using AI, refine them in a rich text editor, optimize them for SEO, and publish them to their Medium account. Includes full authentication, draft management, analytics, templates, and billing surfaces.

### Goals
- Generate complete, publish-ready Medium articles from a topic + configuration form.
- Provide a polished editing experience (TipTap) with Markdown import/export.
- One-click publishing to Medium with scheduling and visibility controls.
- Track AI usage, blog stats, and SEO quality per article.

### Non-Goals (v1)
- Multi-author teams / organizations.
- Publishing to platforms other than Medium (Dev.to, Hashnode — future).
- Mobile native apps.

### ⚠️ Known Risk — Medium API
Medium deprecated its public write API and stopped issuing new integration tokens for most accounts. The Medium integration layer MUST be built behind an adapter interface (`PublisherAdapter`) so we can ship with:
1. **Integration token flow** (works for accounts that still have tokens),
2. **Markdown/HTML export + "copy for Medium"** fallback,
3. Future adapters (RSS import, other platforms) without touching the rest of the app.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Forms & validation | React Hook Form + Zod (shared schemas with backend) |
| Editor | TipTap (rich text) with syntax highlighting, tables, images |
| Data fetching | TanStack Query (optimistic updates, caching) |
| Animation | Framer Motion |
| Icons | Lucide |
| Backend | Node.js, Express.js, TypeScript |
| ORM / DB | Prisma + PostgreSQL (Neon) |
| Auth | JWT (access + refresh), bcrypt, Google & GitHub OAuth |
| AI | OpenAI API (text + image generation) |
| Publishing | Medium API via `PublisherAdapter` |
| Deployment | Vercel (frontend), Railway/Render (backend), Neon (DB) |

---

## 3. Features

### 3.1 Authentication
- Email/password **Sign Up** and **Login** (bcrypt-hashed passwords).
- **Forgot Password** — email token flow with expiry.
- **OAuth**: Google and GitHub login.
- **JWT**: short-lived access token + rotating refresh token (httpOnly cookie).
- **Protected routes**: middleware on frontend (Next.js middleware) and backend (Express middleware).
- Session refresh via `POST /auth/refresh`; logout invalidates refresh token.

### 3.2 Dashboard
Post-login landing page showing:
- Welcome message (user's name, time-of-day greeting).
- Stat cards: **Total Blogs**, **Published Blogs**, **Draft Blogs**, **Total AI Tokens Used**.
- **Recent Activity** feed (created / edited / published events).
- **Quick Actions**: Generate Blog, New Draft, Connect Medium.

### 3.3 Sidebar Navigation
Dashboard · Generate Blog · Drafts · Published Blogs · Templates · SEO Tools · Analytics · Medium Integration · Settings · Billing · Profile.
Collapsible on desktop, drawer on mobile, active-state highlighting.

### 3.4 Blog Generator
Form-driven AI generation page.

**Input fields:**
- Blog Topic (required), Keywords (tag input)
- Writing Style: Tutorial, How-To, Comparison, Listicle, Story, Opinion, Technical Guide, Case Study, Interview Experience, Product Review, AI Generated News
- Tone: Professional, Friendly, Conversational, Technical, Beginner, Expert, Motivational
- Audience, Language, Word Count (slider), Creativity Level (temperature slider), Blog Category
- Toggles: Include FAQs, Table of Contents, Conclusion, CTA, Generate Featured Image, Generate Meta Description, Generate SEO Title

**Generated article must include (as applicable):**
Attractive title, subtitle, introduction, table of contents, headings/subheadings, examples, code blocks, tables, quotes, tips, key takeaways, FAQs, conclusion, call to action.

**Content quality requirements:** original, human-like, SEO-optimized, engaging, easy to read, plagiarism-free, Medium-formatting compatible.

**UX:** streaming generation into the editor, progress states, regenerate-section actions, token usage display after generation.

### 3.5 Rich Text Editor (TipTap)
Bold, italic, underline, headings (H1–H4), bullet/numbered lists, tables, images, code blocks with syntax highlighting, blockquotes, links, emoji picker, Markdown import, Markdown export. Autosave to draft every N seconds and on blur.

### 3.6 AI Image Generator
- Generate featured image from prompt (auto-derived from title, editable).
- Upload custom image, crop, resize, download.
- Attach as featured image on the blog.

### 3.7 SEO Optimization
Auto-generate: SEO title, meta description, URL slug, keywords, reading time, keyword density, internal-linking suggestions, external-linking suggestions.
Compute and display an **SEO score** (0–100) with a checklist of pass/fail rules (title length, meta length, keyword presence in H1/intro, image alt text, link count, readability).

### 3.8 Medium Integration
- Connect via Medium **integration token**; store token (encrypted) + Medium user ID.
- **Test Connection** button (fetch profile).
- Publish blog / publish draft / update existing / delete post / fetch published posts.
- Publishing options: Publish Now, Schedule Publish, Draft mode, Public, Unlisted.
- Graceful degradation per §1 risk note (export fallback when API unavailable).

### 3.9 Draft Management
Save, edit, duplicate, delete (soft), restore, archive drafts. List view with search, filters (status, category, date), pagination.

### 3.10 Blog History
Per blog: creation date, last updated, published date, status (draft/scheduled/published/archived), AI tokens used.

### 3.11 Analytics Dashboard
Charts: total blogs, published blogs, views, AI usage over time, monthly publishing cadence, SEO score distribution/average.

### 3.12 Templates
Built-in templates: Tutorial, React, Vue, Next.js, JavaScript, Interview Experience, Career Growth, AI, Productivity, Finance, Travel, Technology, Startup, Business, Marketing. Each template pre-fills the generator form + provides an outline skeleton. "Use template" → generator page pre-populated.

### 3.13 Billing (surface for v1)
Plans page, current plan, usage vs. quota (AI tokens), upgrade CTA. Payment processing is stubbed behind an interface in v1 (Stripe-ready).

---

## 4. Database Schema (Prisma)

Models (with relations and indexes):

- **User** — id, email (unique), name, avatarUrl, passwordHash?, provider (local/google/github), providerId?, createdAt, updatedAt. Relations: blogs, drafts, mediumAccount, aiUsage, settings, scheduledPosts.
- **Blog** — id, userId (idx), title, subtitle, slug (idx), contentJson (TipTap), contentMarkdown, featuredImageUrl, status (DRAFT/SCHEDULED/PUBLISHED/ARCHIVED, idx), seoTitle, metaDescription, readingTime, seoScore, tokensUsed, mediumPostId?, publishedAt, categoryId, createdAt, updatedAt. Relations: tags (m:n), category, analytics, scheduledPost.
- **Draft** — versioned snapshots of a Blog (blogId idx, version, contentJson, createdAt) enabling restore.
- **MediumAccount** — userId (unique), encryptedToken, mediumUserId, username, connectedAt, lastVerifiedAt.
- **AIUsage** — id, userId (idx), blogId?, operation (GENERATE/IMPROVE/REWRITE/SEO/IMAGE), model, promptTokens, completionTokens, totalTokens, createdAt (idx).
- **Tag** — id, name (unique); m:n with Blog.
- **Category** — id, name (unique), slug.
- **Template** — id, name, description, category, defaultConfig (JSON: style/tone/toggles), outline (JSON), builtIn boolean.
- **ScheduledPost** — id, blogId (unique), userId (idx), scheduledFor (idx), status (PENDING/PUBLISHED/FAILED), attempts, lastError.
- **Analytics** — id, blogId (idx), date (idx), views, reads, claps (best-effort).
- **Settings** — userId (unique), theme, defaultTone, defaultStyle, defaultLanguage, autosaveInterval, emailNotifications.

---

## 5. REST API

Base URL: `/api/v1`. All non-auth routes require `Authorization: Bearer <accessToken>`.

### Auth
| Method | Path | Description |
|---|---|---|
| POST | /auth/register | Create account |
| POST | /auth/login | Login, returns access + sets refresh cookie |
| POST | /auth/logout | Invalidate refresh token |
| POST | /auth/refresh | Rotate tokens |
| POST | /auth/forgot-password | Send reset email |
| POST | /auth/reset-password | Reset with token |
| GET | /auth/oauth/:provider | OAuth redirect (google/github) |
| GET | /auth/oauth/:provider/callback | OAuth callback |

### Blogs
GET `/blogs` (paginated, filterable) · GET `/blogs/:id` · POST `/blogs` · PUT `/blogs/:id` · DELETE `/blogs/:id` (soft) · POST `/blogs/:id/duplicate` · POST `/blogs/:id/restore` · POST `/blogs/:id/archive`

### AI
POST `/ai/generate` (streaming SSE) · POST `/ai/improve` · POST `/ai/rewrite` · POST `/ai/seo` · POST `/ai/image`

### Medium
POST `/medium/connect` · GET `/medium/profile` (test connection) · POST `/medium/publish` · PUT `/medium/update` · DELETE `/medium/post/:id` · GET `/medium/posts`

### Analytics
GET `/analytics` · GET `/usage` · GET `/dashboard`

**Conventions:** Zod-validated request bodies (schemas shared with frontend), consistent error envelope `{ error: { code, message, details? } }`, cursor pagination `{ data, nextCursor }`.

---

## 6. UI / Design Requirements

- Clean modern SaaS aesthetic: glassmorphism panels, rounded corners (xl), gradient accents, smooth Framer Motion transitions.
- **Dark + Light mode** (system default, toggle persisted in Settings).
- Fully responsive (mobile drawer nav, stacked cards).
- Components: dashboard stat cards, charts (Recharts), data tables, modal dialogs, toast notifications (sonner), loading skeletons, empty states, pagination, search, filters.
- Accessibility: keyboard navigable, focus rings, ARIA labels, WCAG AA contrast in both themes.

---

## 7. Security

- JWT auth (15-min access, 7-day rotating refresh in httpOnly Secure SameSite cookie).
- bcrypt (cost ≥ 12) password hashing.
- Helmet, strict CORS allowlist, rate limiting (per-IP + per-user on AI routes).
- Zod input validation on every route; Prisma parameterized queries (SQLi-safe).
- XSS: sanitize editor HTML output server-side; CSP headers.
- CSRF: refresh-token endpoint protected via SameSite + CSRF token.
- Medium tokens encrypted at rest (AES-256-GCM, key from env).
- Secrets only via environment variables; never committed.

---

## 8. Performance

Lazy loading (routes + heavy components), Next.js image optimization, TanStack Query caching + optimistic updates, cursor pagination, code splitting, React Server Components where possible, Suspense + streaming, AI generation streamed via SSE.

---

## 9. Deliverables

- `frontend/` — Next.js app
- `backend/` — Express API
- Prisma schema + SQL migrations + seed data (templates, categories, demo user)
- Docker Compose (Postgres + backend + frontend) for local dev
- `.env.example` for both apps
- README, API documentation (OpenAPI-style markdown), deployment guide
- Unit tests (Vitest/Jest) + E2E tests (Playwright)

---

## 10. Acceptance Criteria (v1 done means)

1. A new user can sign up, log in (email or OAuth), and reach the dashboard.
2. User can generate a full article from the generator form and see it stream into the editor.
3. User can edit, autosave, and manage drafts (duplicate/archive/restore/delete).
4. SEO panel shows score + generated metadata for any blog.
5. User can connect Medium (or see the export fallback) and publish/schedule a post.
6. Dashboard and Analytics show real counts from the database.
7. All routes validated, rate-limited, and covered by the test suites; CI green.
