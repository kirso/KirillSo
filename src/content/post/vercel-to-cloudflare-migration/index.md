---
title: "Migrating an Astro SSR Site from Vercel to Cloudflare Pages"
description: "A practical guide to migrating an Astro site with server-side rendering from Vercel to Cloudflare Pages, including all the gotchas I encountered along the way."
publishDate: "2026-01-18"
tags: ["astro", "cloudflare", "vercel", "webdev", "devops"]
draft: false
---

## Table of Contents

1. [Why Migrate?](#why-migrate)
2. [Understanding Cloudflare's Architecture](#understanding-cloudflares-architecture)
3. [The Migration Steps](#the-migration-steps)
4. [Gotcha #1: Workers vs Pages Confusion](#gotcha-1-workers-vs-pages-confusion)
5. [Gotcha #2: Node.js Compatibility](#gotcha-2-nodejs-compatibility)
6. [Gotcha #3: File System and Caching](#gotcha-3-file-system-and-caching)
7. [Gotcha #4: OG Image Generation with Satori](#gotcha-4-og-image-generation-with-satori)
8. [Gotcha #5: Build Environment Differences](#gotcha-5-build-environment-differences)
9. [Final Configuration](#final-configuration)
10. [Lessons Learned](#lessons-learned)

## Why Migrate?

Vercel is excellent, but I wanted to consolidate my infrastructure on Cloudflare where I already manage DNS and other services. Cloudflare Pages offers generous free tier limits and the promise of edge computing with Workers runtime.

## Understanding Cloudflare's Architecture

Before diving in, it's crucial to understand how Cloudflare Pages works:

**Pages Functions ARE Workers under the hood.** This was my biggest source of confusion initially.

When you deploy an Astro SSR site to Cloudflare Pages:

1. The `@astrojs/cloudflare` adapter generates a `_worker.js` file in your `./dist` directory
2. This `_worker.js` IS the Worker that handles all SSR requests
3. Pages automatically deploys and runs it — no separate Worker project needed
4. Static assets are served directly from Pages' CDN

You only need a Pages project connected to your GitHub repo. The "Worker" is created automatically from your build output.

## The Migration Steps

### Step 1: Swap the Adapter

```bash
bun remove @astrojs/vercel
bun add @astrojs/cloudflare
```

Update `astro.config.ts`:

```typescript
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true, // Enables local Cloudflare runtime emulation
    },
    imageService: "compile", // Uses sharp at build time
  }),
});
```

### Step 2: Create wrangler.json

```json
{
  "name": "your-project-name",
  "compatibility_date": "2024-12-01",
  "compatibility_flags": ["nodejs_compat"],
  "pages_build_output_dir": "./dist"
}
```

The `pages_build_output_dir` key tells Cloudflare this is a Pages project (not a standalone Worker).

### Step 3: Connect to Cloudflare Pages

1. Go to Cloudflare Dashboard → Pages
2. Create a new project and connect your GitHub repo
3. Set build command: `bun run build` (or `npm run build`)
4. Set output directory: `dist`

## Gotcha #1: Workers vs Pages Confusion

I initially created both a Pages project AND a separate Worker with the same name. This caused deployment conflicts.

**The fix:** Delete any standalone Workers. You only need the Pages project. The `_worker.js` that Astro generates is automatically used by Pages as its serverless function.

If you see errors about "Worker already exists" or deployment conflicts, check your Cloudflare dashboard for duplicate resources.

## Gotcha #2: Node.js Compatibility

Cloudflare Workers use a V8-based runtime, not Node.js. Many Node.js APIs aren't available by default.

**The fix:** Add the `nodejs_compat` compatibility flag:

```json
{
  "compatibility_flags": ["nodejs_compat", "disable_nodejs_process_v2"]
}
```

The `disable_nodejs_process_v2` flag is specifically recommended by the Astro docs for the Cloudflare adapter.

In your `astro.config.ts`, externalize any native Node modules that are only used during build:

```typescript
vite: {
  ssr: {
    external: ["@resvg/resvg-js"],
  },
},
```

## Gotcha #3: File System and Caching

Workers don't have a persistent file system. If your Vercel code wrote to `/tmp` for caching, it won't work.

**My original Vercel code:**

```typescript
// This worked on Vercel but fails on Workers
import fs from "node:fs";
const cacheFile = "/tmp/webmentions-cache.json";
fs.writeFileSync(cacheFile, JSON.stringify(data));
```

**The fix:** Use in-memory caching or Cloudflare KV:

```typescript
// In-memory cache (resets on cold starts, but works)
const cache = new Map<string, { data: unknown; timestamp: number }>();

export async function getCachedData(key: string, fetcher: () => Promise<unknown>) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

Similarly, if you're loading JSON data dynamically, import it statically instead:

```typescript
// Before (dynamic, fails on Workers)
const data = JSON.parse(fs.readFileSync("./data.json", "utf-8"));

// After (static import, works on Workers)
import data from "./data.json";
```

Don't forget to enable `resolveJsonModule` in `tsconfig.json`.

## Gotcha #4: OG Image Generation with Satori

This was the trickiest issue. I use Satori with `@resvg/resvg-js` to generate OG images at build time. The images include my headshot photo.

### Problem 1: Native Module in Build

`@resvg/resvg-js` is a native Node module. It works during build (which runs on Cloudflare's build servers with Node.js) but must be externalized from the Worker bundle.

```typescript
// astro.config.ts
vite: {
  optimizeDeps: {
    exclude: ["@resvg/resvg-js"],
  },
  ssr: {
    external: ["@resvg/resvg-js"],
  },
},
```

Ensure your OG image routes are prerendered:

```typescript
// src/pages/og-image/home.png.ts
export const prerender = true;
```

### Problem 2: Image Loading in Satori

I had a custom Vite plugin to convert images to base64 for Satori:

```typescript
// This worked locally but failed on Cloudflare's build
function rawImages(ext: string[]) {
  return {
    name: "vite-plugin-raw-images",
    transform(_, id) {
      if (ext.some((e) => id.endsWith(e))) {
        const buffer = fs.readFileSync(id);
        const base64 = buffer.toString("base64");
        return { code: `export default "data:image/png;base64,${base64}"` };
      }
    },
  };
}
```

**The fix:** Pre-convert images to base64 TypeScript files instead of relying on Vite transforms:

```typescript
// src/assets/img/og-headshot-base64.ts
export const headshotBase64 = "data:image/png;base64,iVBORw0KGgo...";
```

Generate this file once (I used a script) rather than transforming at build time.

### Problem 3: Satori-HTML Template Literal Parsing

Even with the base64 file, I hit another wall. The `satori-html` library's template literal parser couldn't handle my 94KB base64 string:

```typescript
// This broke with large base64 strings
import { html } from "satori-html";
const markup = () => html`<img src="${headshotBase64}" />`;
// Error: "Image source is not provided"
```

**The fix:** Use Satori's native React-like element API instead of satori-html:

```typescript
// Before (satori-html, broken)
import { html } from "satori-html";
const markup = () => html`<img src="${headshotBase64}" />`;

// After (satori native, works)
const markup = () => ({
  type: "img",
  props: {
    src: headshotBase64,
    tw: "w-56 h-56 rounded-full",
  },
});
```

This bypasses the template literal parsing entirely and passes the base64 string directly to Satori.

## Gotcha #5: Build Environment Differences

Cloudflare's build environment differs from Vercel's in subtle ways:

1. **Package manager:** I switched to Bun for faster builds, which worked well
2. **Node version:** Specify via `.nvmrc` or build settings
3. **Environment variables:** Set in Cloudflare Pages dashboard, not `vercel.json`

## Final Configuration

Here's my final setup that works:

**wrangler.json:**
```json
{
  "name": "kirillso",
  "compatibility_date": "2024-12-01",
  "compatibility_flags": ["nodejs_compat", "disable_nodejs_process_v2"],
  "pages_build_output_dir": "./dist"
}
```

**astro.config.ts (relevant parts):**
```typescript
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: { enabled: true },
    imageService: "compile",
  }),
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
    ssr: {
      external: ["@resvg/resvg-js"],
    },
  },
});
```

**OG Image with Satori native API:**
```typescript
export const prerender = true;

import { headshotBase64 } from "@/assets/img/og-headshot-base64";

const markup = () => ({
  type: "div",
  props: {
    style: { display: "flex" },
    children: {
      type: "img",
      props: { src: headshotBase64 },
    },
  },
});
```

## Lessons Learned

1. **Pages Functions = Workers:** Don't create separate Worker projects for SSR sites. Pages handles it automatically.

2. **Prerender what you can:** OG images, sitemaps, and other static content should use `export const prerender = true`.

3. **Avoid file system operations:** Workers are stateless. Use in-memory caching, KV, or external services.

4. **Template literals have limits:** For large interpolated strings (like base64 images), use direct object construction instead of template literal libraries.

5. **Test the build locally:** Run `bun run build` locally before pushing. Most errors surface during the build phase, not at runtime.

6. **Read the Astro Cloudflare docs:** The [official documentation](https://docs.astro.build/en/guides/deploy/cloudflare/) covers the adapter configuration well.

The migration took more iterations than expected (about 12 commits to get everything working), but the end result is a faster, more cost-effective deployment on Cloudflare's edge network.
