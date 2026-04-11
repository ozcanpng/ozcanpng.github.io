# Astro Migration Design

**Date:** 2026-04-11  
**Approach:** Minimal Astro (Approach A) — preserve existing design, migrate structure

## Overview

Migrate `ozcanpng.github.io` from a single-file vanilla HTML SPA to Astro, while keeping the existing purple design system intact. Goal: real URLs, better SEO, and simpler content management.

## Architecture

### File Structure

```
ozcanpng.github.io/
├── src/
│   ├── pages/
│   │   ├── index.astro           # Home + About sections
│   │   ├── blog/
│   │   │   ├── index.astro       # Post list with CTF/CVE/Tips filter
│   │   │   └── [slug].astro      # Post detail (TOC + copy buttons)
│   ├── components/
│   │   ├── PostCard.astro        # Single row in blog listing
│   │   ├── TOC.astro             # Table of contents
│   │   └── Nav.astro             # Navigation bar
│   ├── content/
│   │   └── posts/                # Markdown files with frontmatter
│   └── styles/
│       └── global.css            # Existing CSS, unchanged
├── public/
│   ├── images/                   # Existing images/ directory
│   ├── _headers
│   ├── _redirects
│   ├── robots.txt
│   ├── sitemap.xml
│   └── manifest.json
├── astro.config.mjs
└── package.json
```

### What changes
- `index.html` splits into multiple `.astro` files
- `posts/*.md` → `src/content/posts/` with frontmatter added
- `images/` → `public/images/` (URLs stay the same)

### What stays the same
- All CSS (colors, fonts, layout) — copied verbatim into `global.css`
- Cloudflare Pages deploy pipeline
- `_headers`, `_redirects`, `robots.txt`, `sitemap.xml`, `manifest.json`

## Content Schema

Each markdown post gets frontmatter at the top:

```markdown
---
title: "Sudo Root Escape — CVE-2025-32463"
date: 2025-07-17
tag: cve          # cve | ctf | tips
difficulty: 4     # 1-5 (used for star rating display)
slug: sudo-cve-2025-32463
description: "One-line summary for SEO and post cards."
---
```

Values are sourced from the existing `POST_CONFIG` object in `index.html`. No manual lookup needed — all 6 posts will have frontmatter auto-generated.

**Adding new posts:** Drop a `.md` file in `src/content/posts/`, add frontmatter, push. The blog post list page updates automatically. `sitemap.xml` and `feed.xml` are static files in `public/` and need manual updates when adding new posts (same as today).

## URL Structure

| Page | Current | After migration |
|------|---------|-----------------|
| Home | `ozcanpng.dev/` | `ozcanpng.dev/` |
| Blog list | `ozcanpng.dev/#blog` | `ozcanpng.dev/blog` |
| Post detail | `ozcanpng.dev/#post=sudo-cve-2025-32463` | `ozcanpng.dev/blog/sudo-cve-2025-32463` |
| About | `ozcanpng.dev/#about` | `ozcanpng.dev/#about` (stays in index) |

Old hash URLs redirected via `_redirects`:
```
/#post=sudo-cve-2025-32463  /blog/sudo-cve-2025-32463  301
```
(One redirect entry per existing post)

## Build & Deploy

```
git push origin main
  → Cloudflare Pages detects push
  → npm run build (Astro compiles to dist/)
  → dist/ served as static site
  → ozcanpng.dev updates (~1 min)
```

Cloudflare Pages settings (already configured by user):
- **Build command:** `npm run build`
- **Output directory:** `dist`

## Components

### `Nav.astro`
Top navigation bar. Links: Home, Blog, About. Active state based on current URL path.

### `PostCard.astro`
Renders a single blog post row in the listing. Props: `title`, `date`, `tag`, `difficulty`, `slug`, `description`. Shows tag badge (color-coded by category), difficulty stars, and read time.

### `TOC.astro`
Table of contents generated from markdown headings. Smooth scroll on click with 72px offset to account for fixed navbar. Uses buttons (not anchor links) to avoid routing interference.

### `[slug].astro`
- Fetches post content via Astro content collections
- Renders markdown with syntax highlighting (Shiki, built into Astro)
- Mounts TOC and copy-to-clipboard buttons after render
- Sets `<title>` and meta tags per post for SEO

## Features Preserved
- Purple color scheme and all CSS variables
- Category filter tabs (All / CTF / CVE / Tips)
- Difficulty star rating
- Copy buttons on code blocks
- TOC with smooth scroll (72px offset)
- Image lightbox (zoom on click)
- Visitor counter (counterapi.dev)
- PWA manifest + service worker files
- Security headers via `_headers`

## Out of Scope
- Redesigning the visual theme
- Adding new features beyond what exists today
- Changing the Cloudflare Pages hosting setup
