# Astro Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate ozcanpng.github.io from a single-file vanilla SPA to Astro, preserving the purple design while gaining real URLs (`/blog/slug`), build-time markdown rendering, and better SEO.

**Architecture:** Astro 5 with legacy Content Collections for markdown posts (frontmatter metadata), file-based routing for clean `/blog/[slug]` URLs, client-side `<script>` tags for interactive features (TOC, copy buttons, lightbox, filter tabs). All existing CSS copied verbatim into `src/styles/global.css`.

**Tech Stack:** Astro 5, Node.js 22, Content Collections (legacy API via `src/content/config.ts`), Shiki for syntax highlighting (built into Astro, `tokyo-night` theme), Cloudflare Pages (`npm run build` → `dist/`)

---

### Task 1: Initialize Astro project files

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "ozcanpng",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "astro": "^5.0.0"
  }
}
```

- [ ] **Step 2: Create astro.config.mjs**

```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ozcanpng.dev',
  markdown: {
    shikiConfig: {
      theme: 'tokyo-night',
    },
  },
});
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "extends": "astro/tsconfigs/base"
}
```

- [ ] **Step 4: Install dependencies**

Run: `npm install`

Expected: `node_modules/` created, `package-lock.json` created, no errors.

- [ ] **Step 5: Create src directory structure**

Run:
```bash
mkdir -p src/layouts src/pages/blog src/content/posts src/styles public/images
```

- [ ] **Step 6: Create temporary placeholder page to verify Astro starts**

Create `src/pages/index.astro`:
```astro
---
---
<html><body><h1>hello</h1></body></html>
```

- [ ] **Step 7: Verify dev server starts**

Run: `npm run dev`

Expected: Terminal shows `Local: http://localhost:4321`. Browser shows "hello". No errors. Stop with Ctrl+C.

- [ ] **Step 8: Remove placeholder page (will be recreated in Task 6)**

Delete `src/pages/index.astro`.

- [ ] **Step 9: Commit**

```bash
git add package.json astro.config.mjs tsconfig.json package-lock.json
git commit -m "feat: init Astro project"
```

---

### Task 2: Extract CSS to global.css

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Copy the full `<style>` block from `index.html` (lines 42–582) into `src/styles/global.css`**

The content is every line between `<style>` and `</style>` in the current `index.html`. After copying, make the following two changes only:

**Change 1** — Remove background from `.md pre` (Shiki sets this via inline style; keeping it causes a visual mismatch):

Find this rule:
```css
.md pre {
  background: var(--bg2); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 1.25rem; overflow-x: auto;
}
```
Replace with:
```css
.md pre {
  border: 1px solid var(--border);
  border-radius: var(--radius); padding: 1.25rem; overflow-x: auto;
  position: relative;
}
```
(Also merged the duplicate `/* ── COPY BUTTON */ .md pre { position: relative; }` rule into this one.)

**Change 2** — Delete the now-redundant standalone copy-button `.md pre` rule that follows:
```css
/* ── COPY BUTTON ──────────────────────────────────── */
.md pre { position: relative; }
```
Remove this (already merged above).

Everything else in the CSS is copied unchanged.

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: extract CSS to global.css"
```

---

### Task 3: Create content collection schema

**Files:**
- Create: `src/content/config.ts`

- [ ] **Step 1: Create src/content/config.ts**

```typescript
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tag: z.enum(['ctf', 'cve', 'tips']),
    difficulty: z.number().min(1).max(5),
    slug: z.string(),
    description: z.string(),
  }),
});

export const collections = { posts };
```

- [ ] **Step 2: Commit**

```bash
git add src/content/config.ts
git commit -m "feat: add content collection schema"
```

---

### Task 4: Migrate posts to src/content/posts/ with frontmatter

**Files:**
- Create: `src/content/posts/overpass-thm.md`
- Create: `src/content/posts/netguard-hackviser.md`
- Create: `src/content/posts/chrome-cookie-hijack.md`
- Create: `src/content/posts/tomcat-cve-2017-12617.md`
- Create: `src/content/posts/apache-cve-2021-42013.md`
- Create: `src/content/posts/sudo-cve-2025-32463.md`

- [ ] **Step 1: Copy all post files to src/content/posts/ with slug-based filenames**

```bash
cp "posts/Overpass | TryHackMe.md"                          src/content/posts/overpass-thm.md
cp "posts/NetGuard | Hackviser.md"                           src/content/posts/netguard-hackviser.md
cp "posts/Session Hijacking via Chrome Debug Mode.md"        src/content/posts/chrome-cookie-hijack.md
cp "posts/Tomcat JSP Upload RCE — CVE-2017-12617.md"         src/content/posts/tomcat-cve-2017-12617.md
cp "posts/CVE-2021-42013 — Apache Path Traversal RCE.md"     src/content/posts/apache-cve-2021-42013.md
cp "posts/Sudo Root Escape — CVE-2025-32463.md"              src/content/posts/sudo-cve-2025-32463.md
```

- [ ] **Step 2: Prepend frontmatter to overpass-thm.md**

The file should start with (insert before the first `#` heading):
```markdown
---
title: "Overpass | TryHackMe"
date: 2025-07-11
tag: ctf
difficulty: 2
slug: overpass-thm
description: "TryHackMe Overpass machine — web login bypass, RSA key cracking, and crontab privilege escalation."
---

```

- [ ] **Step 3: Prepend frontmatter to netguard-hackviser.md**

```markdown
---
title: "NetGuard | Hackviser"
date: 2025-06-29
tag: ctf
difficulty: 3
slug: netguard-hackviser
description: "Hackviser NetGuard challenge — network enumeration and privilege escalation write-up."
---

```

- [ ] **Step 4: Prepend frontmatter to chrome-cookie-hijack.md**

```markdown
---
title: "Session Hijacking via Chrome Debug Mode"
date: 2025-07-22
tag: tips
difficulty: 2
slug: chrome-cookie-hijack
description: "How to extract session cookies from Chrome's remote debugging port to hijack authenticated sessions."
---

```

- [ ] **Step 5: Prepend frontmatter to tomcat-cve-2017-12617.md**

```markdown
---
title: "Tomcat JSP Upload RCE — CVE-2017-12617"
date: 2025-07-05
tag: cve
difficulty: 3
slug: tomcat-cve-2017-12617
description: "Apache Tomcat partial PUT request vulnerability allowing unauthenticated JSP file upload and remote code execution."
---

```

- [ ] **Step 6: Prepend frontmatter to apache-cve-2021-42013.md**

```markdown
---
title: "CVE-2021-42013 — Apache Path Traversal RCE"
date: 2025-07-23
tag: cve
difficulty: 3
slug: apache-cve-2021-42013
description: "Apache HTTP Server 2.4.49/2.4.50 path traversal and RCE via mod_cgi and URL-encoded path sequences."
---

```

- [ ] **Step 7: Prepend frontmatter to sudo-cve-2025-32463.md**

```markdown
---
title: "Sudo Root Escape — CVE-2025-32463"
date: 2025-07-17
tag: cve
difficulty: 4
slug: sudo-cve-2025-32463
description: "Local privilege escalation via sudo's --chroot (-R) flag, abusing libnss loading to obtain a root shell."
---

```

- [ ] **Step 8: Update image URLs in all 6 post files**

Replace GitHub blob URLs with local `/images/` paths in every post:

```bash
for f in src/content/posts/*.md; do
  sed -i '' 's|https://github.com/ozcanpng/ozcanpng.github.io/blob/main/images/|/images/|g' "$f"
done
```

Expected: references like `![](/images/NVD-2025-32463.png)` instead of GitHub URLs.

- [ ] **Step 9: Commit**

```bash
git add src/content/posts/
git commit -m "feat: migrate posts to content collection with frontmatter"
```

---

### Task 5: Create base Layout component

**Files:**
- Create: `src/layouts/Layout.astro`

- [ ] **Step 1: Create src/layouts/Layout.astro**

```astro
---
import '../styles/global.css';

interface Props {
  title?: string;
  description?: string;
  canonical?: string;
}

const {
  title = 'ozcanpng',
  description = 'Offensive security researcher — CTF write-ups, CVE analysis, exploit development.',
  canonical = 'https://ozcanpng.dev/',
} = Astro.props;

const pageTitle = title === 'ozcanpng' ? 'ozcanpng' : `${title} — ozcanpng`;
const currentPath = Astro.url.pathname;
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{pageTitle}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content="https://github.com/ozcanpng.png" />
  <meta property="og:url" content={canonical} />
  <meta name="twitter:card" content="summary" />
  <link rel="canonical" href={canonical} />
  <link rel="icon" type="image/png" href="https://github.com/ozcanpng.png" />
  <link rel="apple-touch-icon" href="https://github.com/ozcanpng.png" />
  <link rel="alternate" type="application/rss+xml" title="ozcanpng RSS" href="/feed.xml" />
  <meta name="theme-color" content="#a855f7" />
  <script type="application/ld+json" set:html={JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Özcan Ersan",
    "url": "https://ozcanpng.dev",
    "image": "https://github.com/ozcanpng.png",
    "jobTitle": "Offensive Security Researcher",
    "description": "4th-year Computer Engineering student. Penetration tester, CTF player, and vulnerability researcher.",
    "sameAs": ["https://github.com/ozcanpng", "https://linkedin.com/in/özcanersan"]
  })} />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Manrope:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
</head>
<body>
  <div class="scroll-progress" id="scroll-bar"></div>

  <nav class="nav">
    <div class="nav-inner">
      <a href="/" class="nav-logo">ozcan<span>png</span></a>
      <div class="nav-links" id="nav-links">
        <a href="/" class:list={['nav-link', { active: currentPath === '/' }]}>Home</a>
        <a href="/blog" class:list={['nav-link', { active: currentPath.startsWith('/blog') }]}>Blog</a>
        <a href="/#about" class="nav-link">About</a>
      </div>
      <button class="nav-mobile-btn" id="nav-mobile-btn" aria-label="Menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
    </div>
  </nav>

  <div id="page">
    <div class="page-inner">
      <slot />
    </div>
  </div>

  <footer class="footer">
    <span class="footer-left">© 2026 ozcanpng</span>
    <span class="footer-visitors" id="visitor-count">— visitors</span>
    <div class="footer-links">
      <a href="mailto:ozcanersan@proton.me">Contact</a>
      <a href="https://github.com/ozcanpng" target="_blank" rel="noopener">GitHub</a>
      <a href="https://linkedin.com/in/özcanersan" target="_blank" rel="noopener">LinkedIn</a>
    </div>
  </footer>

  <script>
    // Scroll progress bar
    window.addEventListener('scroll', () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
      const bar = document.getElementById('scroll-bar');
      if (bar) bar.style.width = Math.min(pct, 100) + '%';
    }, { passive: true });

    // Mobile nav toggle
    document.getElementById('nav-mobile-btn')?.addEventListener('click', () => {
      document.getElementById('nav-links')?.classList.toggle('open');
    });
    document.querySelectorAll('.nav-link').forEach(a =>
      a.addEventListener('click', () => document.getElementById('nav-links')?.classList.remove('open'))
    );

    // Visitor counter
    (async () => {
      try {
        const r = await fetch('https://api.counterapi.dev/v1/ozcanpng/blog/up');
        if (!r.ok) throw new Error();
        const { count } = await r.json();
        const el = document.getElementById('visitor-count');
        if (el) el.textContent = count.toLocaleString() + ' visitors';
      } catch {}
    })();

    // Handle old hash-based post URL redirects (e.g. /#post=sudo-cve-2025-32463)
    if (window.location.hash.startsWith('#post=')) {
      const slug = decodeURIComponent(window.location.hash.replace('#post=', ''));
      window.location.replace('/blog/' + slug);
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/Layout.astro
git commit -m "feat: add base Layout component"
```

---

### Task 6: Create Home page

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Create src/pages/index.astro**

```astro
---
import Layout from '../layouts/Layout.astro';
import { getCollection } from 'astro:content';

const LANG_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572a5',
  Go: '#00add8', Rust: '#dea584', C: '#555555', 'C++': '#f34b7d',
  'C#': '#178600', Shell: '#89e051', HTML: '#e34c26', CSS: '#563d7c',
  Java: '#b07219', PHP: '#4f5d95', Ruby: '#701516', Kotlin: '#a97bff',
  Swift: '#f05138', Dart: '#00b4ab', PowerShell: '#012456',
};

const REPOS = [
  { name: 'SecureShift',           description: 'Security training project with Go and SQLite showcasing common web vulnerabilities.',     html_url: 'https://github.com/ozcanpng/SecureShift',           language: 'Go',     stargazers_count: 2 },
  { name: 'Stock-Hunter',          description: 'Track Zara, Pull&Bear, Bershka products — get notified instantly when stock arrives.',    html_url: 'https://github.com/ozcanpng/Stock-Hunter',          language: 'Python', stargazers_count: 2 },
  { name: 'Cargo-Tracking-System', description: 'Cargo tracking web application using Flask and MySQL.',                                   html_url: 'https://github.com/ozcanpng/Cargo-Tracking-System', language: 'HTML',   stargazers_count: 0 },
  { name: 'pico-ducky',            description: 'Rubber Ducky-like device using Raspberry Pi Pico. Turkish translated source.',            html_url: 'https://github.com/ozcanpng/pico-ducky',            language: 'Python', stargazers_count: 1 },
  { name: 'BadPico',               description: 'Payloads for Raspberry Pi Pico — everything the USB Rubber Ducky can do.',               html_url: 'https://github.com/ozcanpng/BadPico',               language: null,     stargazers_count: 1 },
];

function calcReadTime(text: string): string {
  const codeLines = (text.match(/```[\s\S]*?```/g) ?? []).reduce((s, b) => s + b.split('\n').length - 2, 0);
  const words = text.replace(/```[\s\S]*?```/g, '').replace(/[#*_[\]()!`]/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180 + codeLines / 30)) + ' min';
}

function stars(n: number): string {
  return Array.from({ length: 5 }, (_, i) => `<span class="${i < n ? 'on' : ''}">${i < n ? '★' : '☆'}</span>`).join('');
}

function fmtDate(d: Date | string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const allPosts = await getCollection('posts');
const recentPosts = allPosts
  .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime())
  .slice(0, 4);
---
<Layout>
  <section class="hero" id="home">
    <div class="hero-eyebrow">// offensive security</div>
    <h1 class="hero-name">Özcan<br /><span>Ersan</span></h1>
    <div class="typing-wrap">
      <span class="prompt">
        <span class="prompt-user">ozcanpng</span><span class="prompt-at">@</span><span class="prompt-host">pngwashere</span><span class="prompt-path"> ~</span><span class="prompt-sym"> $</span>
      </span>
      <span class="typing-text" id="typing-text"></span><span class="cursor"></span>
    </div>
    <p class="hero-bio">4th-year Computer Engineering student. Penetration tester, CTF player, and vulnerability researcher. Writing about what I find.</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="/blog">Read the Blog</a>
      <a class="btn btn-ghost" href="https://github.com/ozcanpng" target="_blank" rel="noopener">GitHub ↗</a>
    </div>
  </section>

  <div class="section-head">
    <span class="section-title">Recent Write-ups</span>
    <a class="section-more" href="/blog">View all →</a>
  </div>
  <div class="post-list">
    {recentPosts.map((post, i) => (
      <a class="post-item" href={`/blog/${post.data.slug}`}
        data-category={post.data.tag}
        style={`animation-delay:${i * 55}ms`}>
        <span class={`post-tag ${post.data.tag}`}>{post.data.tag.toUpperCase()}</span>
        <span class="post-title">{post.data.title}</span>
        <span class="post-meta">
          <span class="stars" set:html={stars(post.data.difficulty)} />
          <span>{fmtDate(post.data.date)}</span>
          <span>{calcReadTime(post.body ?? '')}</span>
        </span>
      </a>
    ))}
  </div>

  <div class="section-head">
    <span class="section-title">Projects</span>
    <a class="section-more" href="https://github.com/ozcanpng" target="_blank" rel="noopener">GitHub ↗</a>
  </div>
  <div class="project-grid">
    {REPOS.map(r => {
      const color = r.language ? LANG_COLORS[r.language] : null;
      return (
        <a class="project-card" href={r.html_url} target="_blank" rel="noopener">
          <div class="project-name">{r.name}</div>
          <div class="project-desc">{r.description}</div>
          <div class="project-meta">
            {r.language && (
              <span class="lang-label">
                {color && <span class="lang-dot" style={`background:${color}`} />}
                {r.language}
              </span>
            )}
            {r.stargazers_count > 0 && <span>★ {r.stargazers_count}</span>}
          </div>
        </a>
      );
    })}
    <a class="project-card project-card-more" href="https://github.com/ozcanpng" target="_blank" rel="noopener">
      View all on GitHub →
    </a>
  </div>

  <section class="about-section" id="about">
    <img class="about-avatar" src="https://github.com/ozcanpng.png" alt="ozcanpng" />
    <h1 class="about-name">Özcan Ersan</h1>
    <p class="about-role">Offensive Security · ozcanpng</p>
    <div class="about-body">
      <p>Hello! I'm a <em>4th-year Computer Engineering student</em> actively training under the <em>Siber Vatan</em> program, working towards specializing in cybersecurity.</p>
      <p>My main focus areas are <em>Web Application Security</em> and <em>penetration testing</em>. I have a strong interest in <em>malware development</em> and regularly solve <em>CTF challenges</em> to sharpen my skills.</p>
      <p>In my own lab environment, I conduct technical experiments, explore real-world vulnerabilities, and share findings through <em>detailed write-ups</em>.</p>
      <div class="badge-row">
        <span class="badge">Web App Security</span>
        <span class="badge">Penetration Testing</span>
        <span class="badge">CTF</span>
        <span class="badge">Malware Dev</span>
        <span class="badge">CVE Research</span>
      </div>
    </div>
  </section>
</Layout>

<script>
  const cmds = ['go run backdoor.go', 'jadx-gui ./target.apk', 'frida -U -f com.target.app', 'adb shell id', 'burpsuite --project web.json'];
  let wi = 0, ci = 0, del = false;
  const textEl = document.getElementById('typing-text');
  if (textEl) {
    function tick() {
      const w = cmds[wi];
      if (del) { textEl.textContent = w.slice(0, --ci); }
      else     { textEl.textContent = w.slice(0, ++ci); }
      let ms = del ? 45 : 100;
      if (!del && ci === w.length) { ms = 2000; del = true; }
      else if (del && ci === 0)    { del = false; wi = (wi + 1) % cmds.length; ms = 500; }
      setTimeout(tick, ms);
    }
    setTimeout(tick, 700);
  }
</script>
```

- [ ] **Step 2: Verify home page in browser**

Run: `npm run dev`

Open `http://localhost:4321`. Expected:
- Hero section with Özcan Ersan name and typing animation visible
- 4 recent posts listed below
- 5 project cards + "View all on GitHub" card
- About section at bottom

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add home page"
```

---

### Task 7: Create Blog listing page

**Files:**
- Create: `src/pages/blog/index.astro`

- [ ] **Step 1: Create src/pages/blog/index.astro**

```astro
---
import Layout from '../../layouts/Layout.astro';
import { getCollection } from 'astro:content';

function calcReadTime(text: string): string {
  const codeLines = (text.match(/```[\s\S]*?```/g) ?? []).reduce((s, b) => s + b.split('\n').length - 2, 0);
  const words = text.replace(/```[\s\S]*?```/g, '').replace(/[#*_[\]()!`]/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180 + codeLines / 30)) + ' min';
}

function stars(n: number): string {
  return Array.from({ length: 5 }, (_, i) => `<span class="${i < n ? 'on' : ''}">${i < n ? '★' : '☆'}</span>`).join('');
}

function fmtDate(d: Date | string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const allPosts = await getCollection('posts');
const posts = allPosts.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
---
<Layout
  title="Blog"
  description="All write-ups — CTF solutions, CVE analysis, security tips."
  canonical="https://ozcanpng.dev/blog"
>
  <div class="section-head" style="margin-top:2.5rem">
    <span class="section-title">All Write-ups</span>
  </div>
  <div class="filter-tabs">
    <button class="filter-tab active" data-filter="all">All</button>
    <button class="filter-tab" data-filter="ctf">CTF</button>
    <button class="filter-tab" data-filter="cve">CVE</button>
    <button class="filter-tab" data-filter="tips">Tips</button>
  </div>
  <div class="post-list" id="all-posts">
    {posts.map((post, i) => (
      <a class="post-item" href={`/blog/${post.data.slug}`}
        data-category={post.data.tag}
        style={`animation-delay:${i * 55}ms`}>
        <span class={`post-tag ${post.data.tag}`}>{post.data.tag.toUpperCase()}</span>
        <span class="post-title">{post.data.title}</span>
        <span class="post-meta">
          <span class="stars" set:html={stars(post.data.difficulty)} />
          <span>{fmtDate(post.data.date)}</span>
          <span>{calcReadTime(post.body ?? '')}</span>
        </span>
      </a>
    ))}
  </div>
</Layout>

<script>
  document.querySelectorAll<HTMLButtonElement>('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter ?? 'all';
      document.querySelectorAll('.filter-tab').forEach(b => {
        b.classList.remove('active', 'active-ctf', 'active-cve', 'active-other', 'active-tips');
      });
      if (f === 'all') btn.classList.add('active');
      else btn.classList.add(`active-${f}`);

      let visible = 0;
      document.querySelectorAll<HTMLElement>('.post-item').forEach(item => {
        const match = f === 'all' || item.dataset.category === f;
        item.style.display = match ? 'grid' : 'none';
        if (match) {
          item.style.animationDelay = `${visible * 45}ms`;
          item.style.animation = 'none';
          item.offsetHeight; // trigger reflow
          item.style.animation = '';
          visible++;
        }
      });
    });
  });
</script>
```

- [ ] **Step 2: Verify blog listing**

Open `http://localhost:4321/blog`. Expected:
- All 6 posts listed with tag, title, stars, date, read time
- Filter buttons (All / CTF / CVE / Tips) visible and clickable
- Clicking a filter hides/shows posts correctly

- [ ] **Step 3: Commit**

```bash
git add src/pages/blog/index.astro
git commit -m "feat: add blog listing page with filter tabs"
```

---

### Task 8: Create Post detail page

**Files:**
- Create: `src/pages/blog/[slug].astro`

- [ ] **Step 1: Create src/pages/blog/[slug].astro**

```astro
---
import Layout from '../../layouts/Layout.astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return posts.map(post => ({
    params: { slug: post.data.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();

function calcReadTime(text: string): string {
  const codeLines = (text.match(/```[\s\S]*?```/g) ?? []).reduce((s, b) => s + b.split('\n').length - 2, 0);
  const words = text.replace(/```[\s\S]*?```/g, '').replace(/[#*_[\]()!`]/g, '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180 + codeLines / 30)) + ' min';
}

function stars(n: number): string {
  return Array.from({ length: 5 }, (_, i) => `<span class="${i < n ? 'on' : ''}">${i < n ? '★' : '☆'}</span>`).join('');
}

function fmtDate(d: Date | string): string {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const { title, date, tag, difficulty, description, slug } = post.data;
const readTime = calcReadTime(post.body ?? '');
---
<Layout
  title={title}
  description={description}
  canonical={`https://ozcanpng.dev/blog/${slug}`}
>
  <div class="post-reader">
    <a class="post-reader-back" href="/blog">← Back to Blog</a>
    <div class="post-reader-header">
      <span class={`post-reader-tag ${tag}`}>{tag.toUpperCase()}</span>
      <h1 class="post-reader-title">{title}</h1>
      <div class="post-reader-meta">
        <span>{fmtDate(date)}</span>
        <span>{readTime} read</span>
        <span class="stars" set:html={stars(difficulty)} />
      </div>
    </div>
    <div class="post-reader-divider"></div>
    <div class="md">
      <Content />
    </div>
  </div>
</Layout>

<script>
  // Table of Contents
  function buildTOC() {
    const mdEl = document.querySelector<HTMLElement>('.md');
    if (!mdEl) return;
    const headings = [...mdEl.querySelectorAll<HTMLElement>('h2, h3')];
    if (headings.length < 3) return;

    const nav = document.createElement('nav');
    nav.className = 'toc';
    const label = document.createElement('span');
    label.className = 'toc-label';
    label.textContent = 'Contents';
    nav.appendChild(label);

    const ul = document.createElement('ul');
    headings.forEach(h => {
      const li = document.createElement('li');
      li.className = h.tagName === 'H3' ? 'toc-sub' : '';
      const btn = document.createElement('button');
      btn.className = 'toc-link';
      btn.textContent = h.textContent ?? '';
      btn.addEventListener('click', () => {
        const top = h.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: 'smooth' });
      });
      li.appendChild(btn);
      ul.appendChild(li);
    });
    nav.appendChild(ul);
    mdEl.insertBefore(nav, mdEl.firstChild);
  }

  // Copy buttons on code blocks
  function addCopyButtons() {
    document.querySelectorAll<HTMLElement>('.md pre').forEach(pre => {
      if (pre.querySelector('.copy-btn')) return;
      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'copy';
      btn.addEventListener('click', async () => {
        const text = pre.querySelector('code')?.innerText ?? pre.innerText;
        await navigator.clipboard.writeText(text).catch(() => {});
        btn.textContent = 'copied!';
        setTimeout(() => { btn.textContent = 'copy'; }, 2000);
      });
      pre.appendChild(btn);
    });
  }

  // Image lightbox
  function initLightbox() {
    document.querySelectorAll<HTMLImageElement>('.md img').forEach(img => {
      img.addEventListener('click', () => {
        const ov = document.createElement('div');
        ov.className = 'lightbox-overlay';
        const big = new Image();
        big.src = img.src;
        big.alt = img.alt;
        ov.appendChild(big);
        ov.addEventListener('click', () => ov.remove());
        big.addEventListener('click', e => e.stopPropagation());
        document.addEventListener('keydown', function esc(e) {
          if (e.key === 'Escape') {
            ov.remove();
            document.removeEventListener('keydown', esc);
          }
        });
        document.body.appendChild(ov);
      });
    });
  }

  buildTOC();
  addCopyButtons();
  initLightbox();
  window.scrollTo({ top: 0, behavior: 'instant' });
</script>
```

- [ ] **Step 2: Verify post detail pages**

Open `http://localhost:4321/blog/sudo-cve-2025-32463`. Expected:
- CVE tag badge, post title, date, read time, stars visible
- Markdown content rendered with syntax highlighting
- TOC box appears at top of content (if post has ≥3 h2/h3 headings)
- Copy buttons appear on code block hover
- Images are clickable (lightbox opens, Escape closes it)
- "← Back to Blog" link works

Also open `http://localhost:4321/blog/overpass-thm` and `http://localhost:4321/blog/chrome-cookie-hijack` to verify all posts load.

- [ ] **Step 3: Commit**

```bash
git add src/pages/blog/[slug].astro
git commit -m "feat: add post detail page with TOC, copy buttons, lightbox"
```

---

### Task 9: Move public assets

**Files:**
- Copy: `images/` → `public/images/`
- Copy: `_headers` → `public/_headers`
- Copy: `_redirects` → `public/_redirects`
- Copy: `robots.txt` → `public/robots.txt`
- Copy: `sitemap.xml` → `public/sitemap.xml`
- Copy: `feed.xml` → `public/feed.xml`
- Copy: `manifest.json` → `public/manifest.json`
- Copy: `sw.js` → `public/sw.js`

- [ ] **Step 1: Copy images directory**

```bash
cp -r images/ public/images/
```

- [ ] **Step 2: Copy all static/config files**

```bash
cp _headers _redirects robots.txt sitemap.xml feed.xml manifest.json sw.js public/
```

- [ ] **Step 3: Verify build includes all public assets**

Run: `npm run build`

Expected: `dist/` contains `images/`, `_headers`, `_redirects`, `robots.txt`, `sitemap.xml`, `feed.xml`, `manifest.json`, `sw.js`. No build errors.

Run: `ls dist/` and confirm the files above are present.

- [ ] **Step 4: Commit**

```bash
git add public/
git commit -m "feat: add public assets (images, headers, SEO files)"
```

---

### Task 10: Full verification and clean up

- [ ] **Step 1: Run full preview and test all pages**

Run: `npm run preview`

Open `http://localhost:4321` and verify each page:

| URL | Expected |
|-----|----------|
| `/` | Hero, typing animation, 4 recent posts, 5 projects + view all card, About section |
| `/blog` | All 6 posts, filter tabs work (CTF/CVE/Tips filter correctly) |
| `/blog/sudo-cve-2025-32463` | CVE tag, title, stars, markdown content, TOC, copy buttons, lightbox |
| `/blog/overpass-thm` | CTF tag, content loads |
| `/blog/chrome-cookie-hijack` | Tips tag, content loads |
| `/blog/tomcat-cve-2017-12617` | CVE tag, content loads |
| `/blog/apache-cve-2021-42013` | CVE tag, content loads |
| `/blog/netguard-hackviser` | CTF tag, content loads |

Stop preview with Ctrl+C.

- [ ] **Step 2: Update .gitignore**

Replace contents of `.gitignore` with:
```
.DS_Store
index.backup.html
dist/
node_modules/
```

- [ ] **Step 3: Remove old files**

```bash
rm index.html
rm -rf posts/
rm -rf images/
```

- [ ] **Step 4: Final build verify after file removal**

Run: `npm run build`

Expected: Build completes with no errors. Images still load from `public/images/`.

- [ ] **Step 5: Final commit and push**

```bash
git add -A
git commit -m "feat: complete Astro migration — real URLs, pre-rendered markdown, SEO"
git push origin main
```

Expected: Cloudflare Pages detects the push, runs `npm run build`, deploys `dist/` to `ozcanpng.dev`. Deployment visible in Cloudflare Pages dashboard within ~2 minutes.

- [ ] **Step 6: Verify production**

Open `https://ozcanpng.dev/blog/sudo-cve-2025-32463`. Expected: post loads with real URL (no `#` hash in address bar), syntax highlighting, TOC, copy buttons all working.
