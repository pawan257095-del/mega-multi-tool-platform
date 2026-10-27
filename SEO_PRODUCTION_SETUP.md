# Production SEO setup

## 1. Set the canonical production origin

Create/update `.env.production` (or set the same environment variable in your hosting provider):

```env
NEXT_PUBLIC_SITE_URL=https://YOUR-REAL-DOMAIN.com
```

Use the real HTTPS origin only: no path, query string, or trailing slash is required. Do not deploy with the placeholder `https://your-domain.com`.

## 2. What this patch adds

- `src/lib/seo.ts`: shared URL helpers and per-tool metadata generated from `src/data/tools.ts`.
- All 136 existing `/tools/[tool-id]` page files use `getToolMetadata(toolId)` for title, description, canonical, Open Graph and Twitter metadata.
- `src/app/sitemap.ts`: emits the homepage and every tool URL from the tools data.
- `src/app/robots.ts`: allows crawling and points crawlers to `/sitemap.xml`.
- `src/app/layout.tsx`: adds `metadataBase`, canonical homepage metadata, default Open Graph/Twitter metadata, and retains viewport/PWA metadata.

## 3. Category URLs

At present, categories are homepage filters, not separate routable pages. The sitemap deliberately does not invent `/categories/...` URLs. If you later implement real category pages, add their canonical URLs to `src/app/sitemap.ts` and give each page unique metadata.

## 4. Verify before launch

Run:

```bash
npm run typecheck
npm run lint
npm run build
npm run start
```

Then visit:
- `https://YOUR-REAL-DOMAIN.com/robots.txt`
- `https://YOUR-REAL-DOMAIN.com/sitemap.xml`
- a sample tool such as `https://YOUR-REAL-DOMAIN.com/tools/word-counter`

Inspect each page source or response headers and confirm it contains a unique `<title>`, description, canonical link, and Open Graph URL. Confirm every sitemap URL returns HTTP 200 and is not blocked by authentication or robots rules.

Finally, add the domain in Google Search Console, verify ownership, and submit `/sitemap.xml`. Sitemap submission aids discovery; it does not guarantee indexing.
