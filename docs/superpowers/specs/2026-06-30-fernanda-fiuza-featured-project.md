<!--
Provenance: generated 2026-06-30 by the "fernanda-portfolio-plan-review" ultracode workflow
(5 verifiers -> synthesis -> 3 adversarial review lenses -> finalize). Review verdicts:
correctness NEEDS_CHANGES (6), test-coverage NEEDS_CHANGES (9), completeness NEEDS_CHANGES (8) -- all folded in.
This is a PLANNING ARTIFACT. No code has been changed. Execute later after user approval.
-->

# Implementation Plan — Add "Fernanda Fiuza" as Featured Project #1 in Jorge's Portfolio

> Target repo: `C:/Users/jorge/Documents/github/portfolio` (Vite 6 + React 19 + TS, deploys to jorgemolina.dev on Vercel)
> Source site: `https://fernandafiuza.com` (Next.js 15 / Sanity / Mux / Tailwind v4 / next-intl)
> Type: **SHOWCASE entry only — no code merge.** Live link + automated, re-runnable video walkthrough.
> Status: FINAL, hardened against three review passes (correctness / test-coverage / completeness). Read-only artifact — execute later.

---

## 1. Overview & Outcome

### Goal
Insert the live site `fernandafiuza.com` as the **featured (index 0) project** in Jorge's portfolio — in both One Page and 3D modes, both locales (EN/PT) — with an automated, re-runnable video capture pipeline that produces desktop + mobile `.mp4` walkthrough clips, plus a layered test suite that proves every part was done correctly.

### Outcome (definition of done)
- `myProjects[0]` in `src/constants/index.ts` is the Fernanda entry (id, `href` to the live site, `repositoryUrl: "#"`, web + mobile video media, tags).
- `en/projects.json` and `pt/projects.json` each have a matching **index-0** entry (title, ~5 bullets, tag names), index-aligned with constants.
- Two optimized clips in `public/assets/projects-optimized/`: `fernanda-fiuza-demo-opt.mp4` (1920×1080 h264) and `fernanda-fiuza-mobile-opt.mp4` (portrait h264), each carrying a silent AAC track + `+faststart`, matching the existing convention.
- A committed, re-runnable capture script `scripts/capture-fernanda.mjs` + `npm run capture:fernanda` produces those clips from the live site.
- The project renders as **`01`** first in both modes/locales; "View Project" → `https://fernandafiuza.com`; web/mobile category tabs work; "View Details" reveals the localized bullets.
- `npm run validate` (typecheck + lint + data-integrity + media sanity) passes; Playwright e2e smoke passes for One Page EN+PT **and** a blocking 3D-scroll assertion.
- Merged to `main`, deployed to Vercel, verified live on jorgemolina.dev.

### Key corrections from investigation (override the original assumptions)
1. **About route is `/about` (PT `/sobre`), NOT `/info`.** Capture choreography uses `/about`.
2. **Existing clips DO carry a near-silent AAC track.** Do **NOT** use `-an`. Inject silent AAC via `anullsrc` + `-shortest`.
3. **Encode with CRF (constant quality), not fixed bitrate.** Size is an outcome; verify with ffprobe but treat as **advisory** (the repo's own `portifolio3d-demo-opt.mp4` is 17.4 MB).
4. **Rendered category set is `web|mobile|admin|features` ONLY** (narrower than the TS union, which also allows `api|architecture`). Use only `web`/`mobile`.
5. **Mobile is a 2-tap reveal on touch contexts** — capture script must `goto` the slug directly on mobile, not single-tap.
6. **Set `recordVideo.size = viewport`** to avoid letterbox padding.
7. **`tag.path`, `logo`, `image` are never rendered** by the Projects section, and translated tags render with no `id` (pre-existing React-key warning shared by all projects). Constants `tags.id/path` are functionally dead here — only the JSON tag `name` is rendered. Keep valid existing logo paths anyway to avoid dead refs for any other consumer.
8. **Index-0 alignment across all three files is critical** — misalignment silently swaps text onto the wrong video. The render is positional (`Projects.tsx:45-50`).
9. **The "single-video autoplaying hero" slug is NOT `cheetos-anitta-e-neguebites`** (that is a multi-video, non-autoplay zigzag project). The slug is **discovered at runtime** or supplied via env — see §4.
10. **Multiple `<LocaleToggle>` instances live in the DOM at once** (CSS-hidden, not removed). Every toggle locator (capture + e2e) MUST be disambiguated to the visible one.

---

## 2. Prerequisites / One-Time Setup

All commands run in `C:/Users/jorge/Documents/github/portfolio`.

### 2.1 Add devDependencies
```bash
npm install --save-dev playwright @playwright/test
```
- `playwright` (library) for the capture script's `chromium.launch` + `recordVideo`.
- `@playwright/test` for the Layer-3 e2e suite.
- **Do NOT add vitest** — the data-integrity layer is a plain Node ESM script (`node:test`), no transform pipeline needed.
- No `tsx` dep — the plan uses `node --experimental-strip-types` (Node v24.14 confirmed).

### 2.2 Install the Chromium browser binary
```bash
npx playwright install chromium
```
Downloads ~150–180 MB into `%USERPROFILE%\AppData\Local\ms-playwright` (outside the repo — do NOT commit).

### 2.3 Confirm ffmpeg/ffprobe (NO hardcoded absolute path in committed source)
ffmpeg 8.0.1 is present via WinGet but **not on bare PATH**. The existing repo scripts (`simple-optimize.mjs`, `optimize-*.mjs`) all call bare `ffmpeg` after an `ffmpeg -version` preflight. To match that convention **and** stay reproducible:

Resolution order used by all new scripts:
1. `process.env.FFMPEG` / `process.env.FFPROBE` (explicit override)
2. bare `ffmpeg` / `ffprobe` on PATH

If neither resolves:
- capture script → **fail fast** with: `ffmpeg not found — install it or set the FFMPEG env var (Windows WinGet: add the Gyan.FFmpeg bin dir to PATH for this shell).`
- `validate-media` → **skip with warning, exit 0** (so a CI box without ffmpeg doesn't hard-fail the data gate).

> The machine-specific WinGet path (`...Gyan.FFmpeg_..._8wekyb3d8bbwe\ffmpeg-8.0.1-full_build\bin`) is documented in a **comment only**, not a literal default — the package hash and version folder change across versions. For a local run, set it once:
> ```bash
> export FFMPEG="C:/Users/jorge/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin/ffmpeg.exe"
> export FFPROBE="C:/Users/jorge/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin/ffprobe.exe"
> ```

### 2.4 .gitignore additions
Append to `.gitignore`:
```
.capture-tmp/
```
(Playwright `.webm` intermediates. The `-opt.mp4` outputs in `public/assets/projects-optimized/` ARE committed.)

### 2.5 Baseline check (before any change)
```bash
npm run typecheck   # tsc --noEmit — confirm clean
npm run lint        # eslint . — confirm clean
```

---

## 3. Phased Task Breakdown (ordered)

Work on a feature branch (§8). Land in this order; Layer 2 + 4 tests come before e2e because they catch the most probable bugs cheapest.

### Phase A — Capture pipeline (produces the media artifacts)
- **A1. Create `scripts/capture-fernanda.mjs`** (full spec in §4). ES module mirroring repo script conventions (`CONFIG` object, `path.join(process.cwd(), 'public', 'assets', 'projects-optimized')`, `-y`, ffmpeg preflight, `formatBytes`, PT console logging).
- **A2. Add `package.json` script:** `"capture:fernanda": "node scripts/capture-fernanda.mjs"`.
- **A3. Run capture** against the live site (default) or `CAPTURE_URL` override:
  ```bash
  npm run capture:fernanda
  ```
  Produces `fernanda-fiuza-demo-opt.mp4` + `fernanda-fiuza-mobile-opt.mp4` in `public/assets/projects-optimized/`.
- **A4. Verify outputs** — the script runs ffprobe + black/frozen guards in its final step (also re-checked by Layer 4).

> Capture runs against live prod (60s ISR, unreliable autodeploy). State is not pinned; optionally pin `CAPTURE_URL` to a specific Vercel deploy URL for reproducibility.

### Phase B — Data edits (constants + both locale JSONs, index 0)
- **B1. Edit `src/constants/index.ts`** — insert the new object as the **first** element of `myProjects`. Exact object in §5.1.
- **B2. Edit `src/i18n/locales/en/projects.json`** — insert the EN entry as the **first** element of `projects[]`. Exact object in §5.2.
- **B3. Edit `src/i18n/locales/pt/projects.json`** — insert the PT entry as the **first** element of `projects[]`. Exact object in §5.3.

> CRITICAL: all three inserts at index 0. The render pairs `myProjects[i]` with `projects[i]` positionally (`Projects.tsx:45-50`). Any positional drift silently swaps text onto the wrong project's video. Confirm the two `media[].src` filenames EXACTLY match the capture script `CONFIG.*.out` — a single typo reproduces an infinite spinner (the `type:'video'` path in `MediaPlayer.tsx:204` has **no `onError`** handler, so `isLoading` stays true forever).

### Phase C — Validation harness (tests)
- **C1.** `scripts/validate-projects.mjs` (Layer 2 — data integrity). §6.2.
- **C2.** `scripts/validate-media.mjs` (Layer 4 — ffprobe + black/frozen). §6.4.
- **C3.** `playwright.config.ts` + `e2e/projects-fernanda.spec.ts` (Layer 3 — rendering/e2e, incl. blocking 3D). §6.3.
- **C4.** `tsconfig.e2e.json` + ESLint glob update so e2e specs are statically analyzed. §6.6.
- **C5.** Update `package.json` scripts to wire `validate`. §6.5.

### Phase D — Run the full gate
```bash
npm run validate          # typecheck + lint + validate:data + validate:media
npm run build             # prod build (writes fresh dist/)
npm run test:e2e          # e2e smoke: One Page EN+PT + blocking 3D-scroll
```

### Phase E — Deploy (§8.3)
Branch → PR → merge `main` → Vercel auto-deploy → verify jorgemolina.dev.

---

## 4. Capture Script Spec — `scripts/capture-fernanda.mjs`

### 4.1 Config block
```js
import { chromium } from 'playwright'
import { promisify } from 'util'
import { exec as execCb } from 'child_process'
import fs from 'fs'
import path from 'path'

const exec = promisify(execCb)

// ffmpeg/ffprobe resolution: env -> bare PATH. NO hardcoded absolute path (see §2.3).
// (Windows local: set FFMPEG/FFPROBE to the Gyan.FFmpeg WinGet bin dir.)
const FFMPEG  = process.env.FFMPEG  ?? 'ffmpeg'
const FFPROBE = process.env.FFPROBE ?? 'ffprobe'

const CONFIG = {
  baseUrl: process.env.CAPTURE_URL ?? 'https://fernandafiuza.com',
  outDir:  path.join(process.cwd(), 'public', 'assets', 'projects-optimized'),
  tmpDir:  path.join(process.cwd(), '.capture-tmp'),

  // Slug is DISCOVERED at runtime (see §4.2 preflight), NOT hardcoded.
  // Optional override for a known single-video hero slug:
  projectSlug: process.env.CAPTURE_SLUG ?? null,

  desktop: {
    viewport: { width: 1920, height: 1080 }, dsf: 1, fps: 30, crf: 23,
    out: 'fernanda-fiuza-demo-opt.mp4', w: 1920, h: 1080, level: '5.0',
  },
  mobile: {
    // Record at ~2x then scale DOWN so the portrait clip stays sharp.
    // Output 390x844 matches the UI container aspect-[9/19.5] (intentional
    // divergence from the existing 388x812 clips — both pass M4).
    viewport: { width: 780, height: 1688 }, dsf: 2, fps: 30, crf: 24,
    out: 'fernanda-fiuza-mobile-opt.mp4', w: 390, h: 844, level: '3.0',
  },
  launchArgs: [
    '--autoplay-policy=no-user-gesture-required',
    '--mute-audio',
    '--use-gl=angle', '--use-angle=gl',
  ],
}
```

### 4.2 Preflight (fail fast, discover a real single-video slug)
Runs once before any recording, in a throwaway context:

1. `ffmpeg -version` preflight (§2.3); abort with the install message on failure.
2. `goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 })`; assert the home grid exists: `await page.locator('div.grid a[href]').first().waitFor({ timeout: 30000 })`. If absent → abort ("home grid not found — site down or markup changed").
3. **Resolve the hero slug** (single-video projects render the autoplay hero; multi-video render a non-autoplay zigzag):
   - If `CONFIG.projectSlug` (env) is set, navigate there, `waitForSelector('mux-player')`, and gate on autoplay within 15 s. If it autoplays → use it.
   - Else iterate the first N home-grid tiles: for each `div.grid a[href]` whose href matches `^/(?!still|about|pt|sobre|studio)`, `goto` it, wait for `mux-player`, and test the autoplay gate (below) with a short 8 s timeout. The **first** slug that autoplays a video is the hero slug. Record it to console.
   - If none autoplay within the scan → **do not throw**; set a flag `useGridPreviewFallback = true` (capture the animated home-grid Mux preview via hover/scroll instead of a hero page — see step "Fallback" in §4.3/§4.4).
4. Assert at least one Still photo exists for the lightbox step: `const stills = await page.locator('button.cursor-zoom-in').count()`. If `goto(baseUrl + '/still')` then `stills === 0`, set `skipStill = true` (skip the lightbox beat rather than aborting — MEMORY historically noted Stills may be empty).

Autoplay gate (reused):
```js
const playing = await page.waitForFunction(
  () => [...document.querySelectorAll('video')]
          .some(v => !v.paused && v.currentTime > 0.1),
  { timeout: GATE_MS }
).then(() => true).catch(() => false)
```

### 4.3 Choreography — Desktop (≈22 s)
Context: `viewport {1920,1080}`, `deviceScaleFactor 1`, `recordVideo: { dir: tmpDir, size: {1920,1080} }`.

1. `goto(baseUrl, { waitUntil:'networkidle' })`; `await page.evaluate(() => document.fonts.ready)`; dwell **1800 ms** (cream hero intro).
2. Smooth-scroll down ~1.2 viewports in 2–3 steps to reveal the Motion grid; dwell **3000 ms** (Mux previews enter viewport, IO rootMargin 600px, start looping).
3. Hover the first **grid** tile — **always DOM-scoped to the grid**: `page.locator('div.grid a[href]').first()` (the grid IS `div.grid`, per `project-grid-client.tsx:46`). Do NOT use an unscoped href regex — it would match header `NavLink` anchors (`/`, `/still`, `/about`). Dwell **1500 ms** (hover label overlay).
4. **Determinism:** `goto(\`${baseUrl}/${heroSlug}\`, { waitUntil:'networkidle' })`; `await page.waitForSelector('mux-player')`.
5. Gate on real playback (never record black): run the autoplay gate (15 s). If it returns false here (slug regressed), fall back to the grid-preview footage from step 2–3. Dwell **5000 ms** (black overlay fades, video plays). Frame to keep the right edge inside the crop (known cosmetic right-edge white-bar on `/[slug]`).
6. If `!skipStill`: `goto(baseUrl + '/still', { waitUntil:'networkidle' })`; click first photo `page.locator('button.cursor-zoom-in').first()`; `await page.waitForSelector('.yarl__slide', { state:'visible' })`; dwell **2500 ms**; `keyboard.press('ArrowRight')`; dwell **1200 ms**; `keyboard.press('Escape')`.
7. `goto(baseUrl + '/about', { waitUntil:'networkidle' })`; dwell **2000 ms** (bio + photo + contact).
8. Click the **visible** locale toggle (multiple `<LocaleToggle>` exist in the DOM, CSS-hidden — `hero-header.tsx:469,496,619`):
   ```js
   const toggle = page
     .locator('button[aria-label="PT — Mudar para Português"]:visible')
     .first()
   await toggle.click()
   ```
   dwell **1500 ms** (bilingual cross-fade → `/pt/sobre`).
9. `const vp = await page.video().path()` **before** close; then `await context.close()` (REQUIRED — finalizes the `.webm`; wrap in `try/finally`).

### 4.4 Choreography — Mobile (≈18 s)
Context: `viewport {780,1688}`, `deviceScaleFactor 2`, `isMobile: true`, `hasTouch: true`, `recordVideo: { dir: tmpDir, size: {780,1688} }`.

1. `goto(baseUrl, { waitUntil:'networkidle' })`; `document.fonts.ready`; dwell **1800 ms**.
2. Scroll down ~1.3 viewports to the single-column grid; dwell **3000 ms** (this footage also serves as the grid-preview fallback).
3. **`goto(\`${baseUrl}/${heroSlug}\`)`** — do NOT single-tap (touch context = 2-tap reveal trap). `waitForSelector('mux-player')`; run the autoplay gate. The known iOS "home-grid play-icon freeze" affects the GRID, not the autoplay hero — using `goto` to the hero sidesteps it. If the gate fails, fall back to the grid-preview footage from step 2. Dwell **4500 ms**.
4. If `!skipStill`: `goto(baseUrl + '/still')`; tap first `button.cursor-zoom-in`; wait `.yarl__slide`; dwell **2500 ms**; `Escape`.
5. `goto(baseUrl + '/about')`; dwell **2000 ms**.
6. Tap the **visible** PT locale toggle (same `:visible` disambiguation; pick whichever variant is displayed at this viewport — the mobile-curtain or mobile-hidden variant); dwell **1500 ms**.
7. `const vp = await page.video().path()`; `await context.close()` (try/finally).

### 4.5 ffmpeg commands (CRF, silent AAC, +faststart, yuv420p, crop-to-fill)
Run via `exec(FFMPEG + ...)`.

**Desktop → 1920×1080, level 5.0, crf 23:**
```bash
ffmpeg -y -i "<INPUT.webm>" \
  -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 \
  -vf "fps=30,scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,format=yuv420p" \
  -c:v libx264 -profile:v high -level 5.0 -crf 23 -preset slow \
  -pix_fmt yuv420p -movflags +faststart \
  -c:a aac -b:a 8k -ar 48000 -ac 2 \
  -shortest "<outDir>/fernanda-fiuza-demo-opt.mp4"
```

**Mobile → 390×844 (portrait), level 3.0, crf 24:**
```bash
ffmpeg -y -i "<INPUT.webm>" \
  -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=48000 \
  -vf "fps=30,scale=390:844:force_original_aspect_ratio=increase,crop=390:844,format=yuv420p" \
  -c:v libx264 -profile:v high -level 3.0 -crf 24 -preset slow \
  -pix_fmt yuv420p -movflags +faststart \
  -c:a aac -b:a 8k -ar 48000 -ac 2 \
  -shortest "<outDir>/fernanda-fiuza-mobile-opt.mp4"
```

### 4.6 Final verification step (inside the script)
For each output, after transcode:
1. **ffprobe stream**: assert `codec_name == h264`, `pix_fmt == yuv420p`, `avg_frame_rate == 30/1`, dimensions match config, `format.duration > 0` and within the expected band (desktop ~18–30 s, mobile ~14–24 s).
2. **faststart**: assert `moov` precedes `mdat`.
3. **Pre-crop portrait check (mobile only)**: ffprobe the **intermediate `.webm`** (pre-crop) and assert `height > width` — proves a true portrait capture, not a landscape source center-cropped into portrait.
4. **Black/frozen guard** (the #1 capture risk): run a luma check on the OUTPUT and fail if the clip is mostly black or static:
   ```bash
   # all-black guard: blackdetect over a low luminance threshold
   ffmpeg -i "<OUT.mp4>" -vf "blackdetect=d=2:pic_th=0.98" -an -f null - 2>&1
   # fail if total black duration > 40% of format.duration
   # frozen guard: signalstats, sample YAVG across frames; fail if stddev of YAVG ~0
   ffmpeg -i "<OUT.mp4>" -vf "select='not(mod(n,15))',signalstats,metadata=print" -an -f null - 2>&1
   # parse lavfi.signalstats.YAVG; assert the spread across samples exceeds a small epsilon
   ```
   Threshold guidance: black if cumulative `blackdetect` ≥ 40% of duration; frozen if `max(YAVG) - min(YAVG) < 2.0` across sampled frames. On failure, exit non-zero with a clear message.
5. Log `formatBytes(size)` and **WARN** (do not fail) if desktop > 8 MB or mobile > 5 MB (re-encode at higher CRF if undesired).
6. Delete `.capture-tmp/*.webm` on success (try/finally).

### 4.7 Risks + fallbacks (capture)
| # | Risk | Likelihood | Fallback |
|---|------|-----------|----------|
| R1 | Hero slug doesn't autoplay (wrong/multi-video slug) | Medium | Slug is **discovered** at runtime via the autoplay gate, not hardcoded; if none found, capture animated home-grid preview footage; final fallback = manual OBS/QuickTime recording → same ffmpeg step. |
| R2 | `-an` mismatch with convention | High (orig plan wrong) | Inject silent AAC via `anullsrc` + `-shortest`. |
| R3 | Letterbox padding (`recordVideo.size` ≠ viewport) | Medium | `recordVideo.size = viewport`; ffmpeg crop as defense-in-depth. |
| R4 | Mobile soft after upscale | Medium | Record 780×1688, scale DOWN to 390×844; M4-pre-crop probe asserts true portrait. |
| R5 | Variable/low capture FPS → judder | Medium | `-vf fps=30` re-times to CFR; record ~40 s slack. |
| R6 | Black/frozen clip ships | Medium | §4.6 black + frozen guards fail the script. |
| R7 | `context.close()` skipped → 0-byte webm | Low | try/finally; read `video().path()` before close. |
| R8 | Cold ISR TTFB (~2.4 s) | Low | `waitUntil:'networkidle'`, ≥30 s nav timeout. |
| R9 | Multiple locale toggles → strict-mode throw | High (orig plan wrong) | `:visible` + `.first()` disambiguation (§4.3 step 8). |
| R10 | Stills empty → lightbox step aborts | Low-Med | Preflight sets `skipStill`; the beat is skipped, not fatal. |
| R11 | iOS home-grid play-icon freeze in touch context | Low | Mobile uses `goto(hero)`, not a grid tap — sidesteps the freeze path. |
| R12 | Right-edge white-bar on `/[slug]` in frame | Low | Frame to keep the right edge inside the crop; cosmetic, non-blocking. |
| R13 | Browser binary download blocked | Low | `channel:'chrome'` or `PLAYWRIGHT_BROWSERS_PATH`; manual-recording fallback. |

---

## 5. Exact Data Objects

### 5.1 `src/constants/index.ts` — new `myProjects[0]`
Paste as the **first** element of the `myProjects` array (before the current `id:1` entry):
```ts
{
  id: 4,
  title: "Fernanda Fiuza", // overwritten at render by translation; fallback only
  subDescription: [
    "Bilingual (PT/EN) portfolio for movement director and choreographer Fernanda Fiuza.",
    "Built with Next.js 15 App Router, Sanity CMS, and Mux adaptive video streaming.",
  ],
  href: "https://fernandafiuza.com",
  repositoryUrl: "#", // private repo -> hides the Code button
  logo: "", // value unused by Projects section
  image: "", // value unused by Projects section
  media: [
    {
      type: "video",
      src: "/assets/projects-optimized/fernanda-fiuza-demo-opt.mp4",
      alt: "Fernanda Fiuza portfolio — desktop walkthrough",
      category: "web",
      priority: 1,
    },
    {
      type: "video",
      src: "/assets/projects-optimized/fernanda-fiuza-mobile-opt.mp4",
      alt: "Fernanda Fiuza portfolio — mobile walkthrough",
      category: "mobile",
      priority: 1,
    },
  ],
  // NOTE: tag id/path are functionally DEAD in the Projects section — the render
  // uses the locale JSON tag `name` only, and keys translated tags by an absent
  // `id` (pre-existing React-key warning shared by all current projects). Paths
  // point at real existing logo files to avoid dead refs for any other consumer.
  tags: [
    { id: 40, name: "Next.js", path: "/assets/logos/nextjs.check.svg" },
    { id: 41, name: "TypeScript", path: "/assets/logos/typescript.svg" },
    { id: 42, name: "Sanity", path: "/assets/logos/react.svg" },
    { id: 43, name: "Mux", path: "/assets/logos/nodejs.svg" },
    { id: 44, name: "Tailwind", path: "/assets/logos/tailwindcss.svg" },
    { id: 45, name: "next-intl", path: "/assets/logos/vitejs.svg" },
    { id: 46, name: "Vercel", path: "/assets/logos/docker.svg" },
  ],
},
```
> `id:4` and tag ids `40+` are unused values. Keep `category` to `web`/`mobile` only (the rendered set).

### 5.2 `src/i18n/locales/en/projects.json` — new `projects[0]`
Insert as the **first** element of the `projects` array:
```json
{
  "title": "Fernanda Fiuza",
  "subDescription": [
    "Bilingual (PT/EN) portfolio site for movement director, choreographer, and camera operator Fernanda Fiuza, live at fernandafiuza.com.",
    "Built on Next.js 15 (App Router) with field-level internationalization via next-intl, served as a dark, editorial single-experience.",
    "Sanity CMS lets Fernanda manage motion projects, photo galleries, and her bio independently — no developer needed.",
    "Video is hosted and streamed adaptively through Mux, with animated home-grid previews and autoplaying project heroes.",
    "Deployed on Vercel with ISR, styled with Tailwind CSS v4, and tuned for smooth bilingual View Transitions."
  ],
  "tags": [
    { "name": "Next.js" },
    { "name": "TypeScript" },
    { "name": "Sanity" },
    { "name": "Mux" },
    { "name": "Tailwind" },
    { "name": "next-intl" },
    { "name": "Vercel" }
  ]
}
```

### 5.3 `src/i18n/locales/pt/projects.json` — new `projects[0]`
Insert as the **first** element of the `projects` array:
```json
{
  "title": "Fernanda Fiuza",
  "subDescription": [
    "Site de portfólio bilíngue (PT/EN) da diretora de movimento, coreógrafa e operadora de câmera Fernanda Fiuza, no ar em fernandafiuza.com.",
    "Construído em Next.js 15 (App Router) com internacionalização por campo via next-intl, em uma experiência única, escura e editorial.",
    "O CMS Sanity permite que a Fernanda gerencie projetos de movimento, galerias de fotos e sua bio de forma independente — sem precisar de desenvolvedor.",
    "Os vídeos são hospedados e transmitidos de forma adaptativa pelo Mux, com prévias animadas na grade inicial e heróis de projeto em autoplay.",
    "Publicado na Vercel com ISR, estilizado com Tailwind CSS v4 e ajustado para transições bilíngues suaves (View Transitions)."
  ],
  "tags": [
    { "name": "Next.js" },
    { "name": "TypeScript" },
    { "name": "Sanity" },
    { "name": "Mux" },
    { "name": "Tailwind" },
    { "name": "next-intl" },
    { "name": "Vercel" }
  ]
}
```
> All three `tags` arrays have **7 entries** and **identical `name`s in the same order** (asserted by Layer 2 A3). Tag `name` is the only rendered field.

---

## 6. Layered Test / Validation Plan

### 6.1 LAYER 1 — Static gates
**Commands:**
```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint .
```
**What each gate ACTUALLY guarantees (attribution corrected):**
- **`tsc --noEmit`** is the type authority. Because `myProjects[0]` lives in `src/`, tsc enforces the `Project`/`ProjectMedia`/`ProjectTag` interfaces and the `media[].type` + `category` **unions** (a `"webb"` typo fails here). tsc does NOT see JSON content or the e2e/config files (see §6.6).
- **`eslint .`** lints `src/**` JS/TS for style/React rules only. It does **NOT** validate JSON shape and does **NOT** enforce the media/category unions. (The original plan over-credited lint — corrected.)
- **JSON shape/validity is NOT proven here** — it is proven by Layer 2's `import`+parse of both locale files (the authoritative JSON gate).

**Pass:** both exit `0`.
**Prevents:** wrong/missing field type in constants; category typo; React/style rule violations in `src/`.
> Scope limits: ESLint is scoped to `src/**` (so `scripts/*.mjs` are not linted — keep them clean by hand). `tsc` include is `["src"]` (so root-level `playwright.config.ts` and `e2e/*.ts` are NOT typechecked by `npm run typecheck`). §6.6 closes the e2e gap.

### 6.2 LAYER 2 — Data-integrity script (CRITICAL) — `scripts/validate-projects.mjs`
**Command:** `node --experimental-strip-types scripts/validate-projects.mjs`
**Load:** `import { myProjects } from '../src/constants/index.ts'` (Node 24 strips types); `import en from '../src/i18n/locales/en/projects.json' with { type: 'json' }` + same for `pt`; `PUBLIC = path.resolve(repoRoot, 'public')`. Use `node:test` + `node:assert/strict` so each assertion is a named, individually-reported case.
```js
const ALLOWED_CATEGORIES = new Set(['web','mobile','admin','features']) // RENDERED set, NOT the TS union
const ALLOWED_TYPES      = new Set(['image','gif','video'])
```
**Assertions:**
| # | Assertion | Prevents |
|---|-----------|----------|
| A1 | `myProjects[0].title === 'Fernanda Fiuza'` AND `en.projects[0].title === 'Fernanda Fiuza'` AND `pt.projects[0].title === 'Fernanda Fiuza'` | Inserted at wrong index → renders as 02/03; title typo |
| A2 | `en.projects.length === myProjects.length` AND `pt.projects.length === myProjects.length` | Locale file out of sync → English fallback ships untranslated |
| **A3** | **For EVERY index `i`:** `en.projects[i]` and `pt.projects[i]` exist with non-empty `title`; **`en[i].title === myProjects[i].title`** (constants title is the canonical fallback/anchor for ordering at all indices); `en[i].tags.length === pt[i].tags.length === myProjects[i].tags.length`; and the **tag `name`s match in order** across `en[i]`, `pt[i]`, and `myProjects[i]` (`en[i].tags.map(t=>t.name)` deep-equals `pt[i].tags.map(t=>t.name)` deep-equals `myProjects[i].tags.map(t=>t.name)`). | Reorder in ONE file only at ANY index → text mapped onto wrong project; tag-name drift |
| A4 | For every media item: `fs.existsSync(path.join(PUBLIC, src.replace(/^\//,'')))` — **HARD error, no skip** | **#1 likely bug** — clip not copied into `public/...` → genuine infinite spinner (video path has no `onError`) |
| A5 | `myProjects[0].href === 'https://fernandafiuza.com'`; every `href` is `'#'` or `new URL(href).protocol==='https:'` | Typo'd / non-https "View Project" link |
| A6 | Every `repositoryUrl` is `undefined` / `'#'` / valid https | Broken "Code" button |
| A7 | Every `media.category ∈ ALLOWED_CATEGORIES`; `myProjects[0].media.some(m=>m.category==='web')` AND `...some(m=>m.category==='mobile')` | Invisible media (`api`/`architecture` render no tab); missing tab |
| A8 | Every `media.type ∈ ALLOWED_TYPES` | Bad media type |
| A9 | `subDescription` is a non-empty array of non-empty trimmed strings in en, pt, AND constants for each index | Blank "View Details" panel |
| **A10** | Constants `media[].src` filenames equal the expected capture outputs (`fernanda-fiuza-demo-opt.mp4`, `fernanda-fiuza-mobile-opt.mp4`) | Filename typo vs capture `CONFIG.*.out` → infinite spinner |
**Pass:** all `node:test` cases pass, exit `0`.

### 6.3 LAYER 3 — Rendering / e2e smoke (Playwright) — `e2e/projects-fernanda.spec.ts`
**Config `playwright.config.ts`:**
- `webServer: { command: 'npm run build && npm run preview', url: 'http://localhost:4173', reuseExistingServer: false, timeout: 180000 }` — **build before preview** so e2e never tests a stale `dist/`. (`reuseExistingServer:false` in the gate path; flip to `true` only for local iteration.)
- `use: { baseURL: 'http://localhost:4173' }`, `--project=chromium`.

**Deterministic locale + viewport pinning (per spec):** i18next resolves the initial language from the browser. Pin it explicitly so EN and PT specs can't collapse onto the same locale, and use a **desktop viewport** so `LanguageToggle` stays mounted (it returns null on width<768 when tutorialCompleted):
```ts
test.use({ viewport: { width: 1440, height: 900 } })
// In a beforeEach, before first navigation:
await context.addInitScript(() => localStorage.setItem('i18nextLng', '<en|pt>'))
```
Assert i18n landed by reading `sectionTitle` (`Projects` for EN / `Projetos` for PT) rather than toggling from an unknown default.

**Mode entry:** the app boots into `PortfolioModeSelector` (sessionStorage-based intent — isolated Playwright contexts DO hit the selector). Click the target mode (One Page = `t('modeSelector:onepage.title')`; 3D = the 3D mode title).

**Toggle disambiguation (mirror the capture fix):** when a spec must operate the locale toggle, scope to the **visible** one and assert count:
```ts
const toggle = page.getByRole('button', { name: /Switch to|Mudar para/ }).filter({ has: page.locator(':visible') })
await expect(page.locator('button[aria-label*="Switch to"]:visible')).toHaveCount(1)
```
(Prefer locale pinning over toggling; use the toggle only in the dedicated toggle spec.)

**Scroll-into-view (REQUIRED):** `ProjectShowcase` and the Projects title use Framer `whileInView` starting at `opacity:0,y:50`; Playwright treats `opacity:0`/offscreen as not visible. **Before any assertion**, scroll the Fernanda showcase into view and wait for it to settle:
```ts
const showcase = page.getByText('Fernanda Fiuza').first()
await showcase.scrollIntoViewIfNeeded()
await expect(showcase).toBeVisible()
// One Page scroller = window; 3D scroller = [data-scroll-container] (drive the right one)
```

**Matrix:** `{EN, PT} × {OnePage}` (blocking) + **one blocking 3D-scroll spec** (below).

**Assertions (One Page, per pinned locale):**
| # | Assertion | Prevents |
|---|-----------|----------|
| E1 | First showcase number span = `01`, heading = `Fernanda Fiuza` (after scrollIntoView) | Not first / wrong number |
| E2 | First showcase `<video>` src matches `/fernanda-fiuza-demo-opt\.mp4$/` (web is default tab) | Wrong/broken desktop video wired |
| E3 | `getByRole('link', { name: labels.viewProject })` has `href='https://fernandafiuza.com'` + `target=_blank` | Project link wrong |
| E4 | Both `Web` and `Mobile` category tab buttons visible (CategoryTabs renders only when >1 category) | Missing/extra category |
| E5 | Click `Mobile` → visible media container has class `aspect-[9/19.5]` AND its `<video>` src matches `/fernanda-fiuza-mobile-opt\.mp4$/` | Mobile media mis-mapped / wrong aspect |
| E6 | Click `labels.viewDetails` → details panel appears; bullet count === `subDescription.length` for that pinned locale | Empty/wrong details per locale |
| E7 | EN run shows `Projects` + English bullet text; PT run shows `Projetos` + PT bullet text (assert a distinctive PT phrase, e.g. "diretora de movimento") | Untranslated content leaking |

**Blocking 3D-scroll spec (E8 — the user-named "3D scroll regression"):**
- Enter 3D mode. Programmatically scroll the 3D scroller to the Projects section:
  ```ts
  await page.evaluate(() => {
    const c = document.querySelector('[data-scroll-container]')
    // scroll to the Projects section anchor/offset
    c?.scrollTo({ top: /* projects offset */, behavior: 'instant' })
  })
  ```
- Assert (a) Fernanda's `ProjectShowcase` shows `01` + title after `scrollIntoViewIfNeeded` on `[data-scroll-container]`, AND (b) the section is **detected** as Projects — `currentSection === 'PROJECTS'` (read via the exposed Zustand state or the active nav dot for "Projects").
- **Deterministic guard (runs even if 3D can't drive headlessly):** assert `myProjects.length` is the expected count and that `sectionHeights.ts` still defines a `projects` height — so adding the 6th project can't silently break section mapping. If the interactive 3D scroll can't run in CI, this guard is the blocking fallback (documented), NOT a skipped test.

**Pass:** all One Page specs (E1–E7) green for BOTH pinned locales, AND the 3D spec (E8) green — either via the interactive scroll assertion or the deterministic guard. **No spec is allowed to "skip" and count as pass.**

### 6.4 LAYER 4 — Media sanity (ffprobe + black/frozen) — `scripts/validate-media.mjs`
**Command:** `node scripts/validate-media.mjs`
**Targets:** the two Fernanda mp4s. **ffprobe/ffmpeg resolved** via `process.env.FFPROBE/FFMPEG` → bare PATH; if unresolvable, **skip with warning + exit 0**.
**Assertions:**
| # | Assertion | Prevents |
|---|-----------|----------|
| M1 | File exists | Forgot a file (Layer 2 A4 already hard-fails this earlier) |
| M2 | Size budget is **ADVISORY (warn-only, never fails the gate)**: warn if desktop > 8 MB or mobile > 5 MB. Context: the repo's own `portifolio3d-demo-opt.mp4` is **17.4 MB**, so a rich on-convention clip can legitimately exceed any hard cap. | Hard-failing a perfectly good, on-convention clip purely on size |
| M3 | `codec_name === 'h264'` | VP9/HEVC/AV1 won't play on iOS Safari |
| M4 | Desktop: `\|w/h − 16/9\| < 0.02`. Mobile: `height > width` AND `\|w/h − 9/19.5\| < 0.06`. **NOTE:** because the ffmpeg crop forces output dims, this is mostly a tautology on the OUTPUT — the REAL portrait proof is the capture script's pre-crop `.webm` `height>width` probe (§4.6 step 3). Keep M4 as a cheap output-shape sanity check; the capture-time pre-crop probe is the authoritative anti-landscape guard. | Landscape in mobile slot / wrong output shape |
| M5 | `format.duration > 0` AND within band (desktop ~18–30 s, mobile ~14–24 s) | Corrupt/truncated export; wrong-length capture |
| **M6** | **Black/frozen guard** (re-runs §4.6 logic against committed outputs): `blackdetect` cumulative black < 40% of duration; `signalstats` YAVG spread ≥ 2.0 across sampled frames | All-black or frozen capture shipping as the showcase video |
**Pass:** all checks pass for both files, exit `0` (or clean skip with warning if no ffprobe).

### 6.5 Wiring into `package.json`
```json
"scripts": {
  "typecheck": "tsc --noEmit",
  "lint": "eslint .",
  "capture:fernanda": "node scripts/capture-fernanda.mjs",
  "validate:data": "node --experimental-strip-types scripts/validate-projects.mjs",
  "validate:media": "node scripts/validate-media.mjs",
  "test:e2e": "playwright test",
  "validate": "npm run typecheck && npm run lint && npm run validate:data && npm run validate:media",
  "validate:full": "npm run validate && npm run build && npm run test:e2e"
}
```
- `validate` = Layers 1+2+4 (fast, no browser; `&&` short-circuits on first failure; `validate:data` runs BEFORE anything that needs the media, so A4 catches a missing clip first).
- `test:e2e` (Layer 3) is separate (needs browser + a built `dist/` + preview boot). The Playwright config does `build && preview`, so it cannot test stale output. **`test:e2e` is a required, non-optional gate** — Playwright exits non-zero on spec compile errors, which (with §6.6) is the only place e2e specs are validated.
- New devDeps: `playwright`, `@playwright/test`. **No vitest.**

**Recommended landing order:** Layer 2 first (highest value), Layer 4 alongside (shared ffmpeg harness), Layer 1 wiring (near-zero cost), Layer 3 last (highest cost).

### 6.6 Closing the e2e static-analysis gap
The e2e specs/config sit outside both `tsc` (`include:["src"]`) and ESLint (`files:['src/**/*...']`). To avoid a broken selector/import surfacing only at Playwright runtime:
- **Create `tsconfig.e2e.json`** extending the base, `include: ["e2e", "playwright.config.ts"]`, and add an optional `"typecheck:e2e": "tsc -p tsconfig.e2e.json --noEmit"` script (run it in `validate:full` or manually).
- **OR** add `e2e/**/*.ts` + `playwright.config.ts` to the ESLint `files` glob.
- At minimum, **document** that Playwright is the sole validator of the specs and keep `test:e2e` a required gate (a compile error in a spec fails the run, it cannot read as "skipped").

---

## 7. Verification Checklist

### Automated (gates)
- [ ] `npm run typecheck` → exit 0 (enforces constants types/unions)
- [ ] `npm run lint` → exit 0 (src style/React only — NOT JSON/unions)
- [ ] `node --experimental-strip-types scripts/validate-projects.mjs` → A1–A10 pass (JSON validity + index alignment + tag-name parity at every index + filename match)
- [ ] `node scripts/validate-media.mjs` → M1, M3, M4, M5, M6 pass; M2 advisory only (or clean skip if no ffprobe)
- [ ] `npm run build` → succeeds (also run by the e2e webServer)
- [ ] `npm run test:e2e` → One Page E1–E7 green for BOTH pinned locales; 3D E8 green (interactive scroll OR deterministic guard). No skips counted as pass.

### Manual — One Page mode
- [ ] EN: Fernanda is the **first** card, numbered `01`, title "Fernanda Fiuza".
- [ ] EN: default (Web) tab shows the desktop clip playing/looping (poster note below).
- [ ] EN: Web **and** Mobile tabs present; clicking Mobile shows the portrait clip in `aspect-[9/19.5]`.
- [ ] EN: "View Project" opens `https://fernandafiuza.com` in a new tab; no "Code" button (repo `#`).
- [ ] EN: "View Details" expands to the 5 EN bullets.
- [ ] PT: section title `Projetos`; PT title + PT bullets render over the **same** videos.
- [ ] Existing projects (SOLTO etc.) still show their correct title/description over their own media (no index-swap regression at any index).

### Manual — 3D immersive mode
- [ ] Enter 3D mode; navigate to the Projects planet; the Projects page scrolls natively; Fernanda renders first as `01` with the same content (INV-2 confirmed: same `<Projects/>` component, `SectionPagesZustand.jsx:182`; `ProjectOrbit` is dead/unused).
- [ ] 3D scroll lands on Projects: nav dot for "Projects" active, section detected, no overshoot/short-scroll after the +1 project height (~1 extra viewport).
- [ ] Planets/nav points unchanged (still 5; "Projects" is one planet regardless of count).
- [ ] (Optional polish, one-page only) Consider bumping `src/constants/sectionHeights.ts` `projects: '120vh' → '160vh'` and mobile `'140vh' → '180vh'` to reduce a sub-second skeleton layout shift. Not required for correctness.

### Manual — first-frame UX (poster note)
- [ ] Both videos have `autoPlay={false}` in this section → with no `thumbnail`, the first frame is a black box until Play. This matches all 3 existing projects (baseline). OPTIONAL improvement: add `thumbnail: "/assets/projects/fernanda-*-poster.jpg"` to each media item (extract a poster frame in the capture script). Not blocking.

---

## 8. Risks, Rollback, Deploy

### 8.1 Risks & mitigations
| Risk | Mitigation |
|------|-----------|
| **Index-0 (and any-index) misalignment** across the 3 files silently swaps text onto wrong videos | Layer 2 A1–A3 hard-asserts index-0 position AND every-index title/tag-name parity; manual checklist verifies existing projects |
| Clip referenced but not copied into `public/...` → genuine infinite spinner (video path has no `onError`) | Layer 2 A4 `fs.existsSync` HARD error on every media src, BEFORE build/e2e; A10 asserts filename match |
| **Wrong/hardcoded hero slug** (`cheetos…` is multi-video, no autoplay) → capture aborts | Slug DISCOVERED at runtime via the autoplay gate; env override; grid-preview + manual fallbacks (R1) |
| Black/frozen capture ships as the showcase video | §4.6 + Layer 4 M6 blackdetect/signalstats guards fail the script/gate |
| **Multiple locale toggles** → Playwright strict-mode throw | `:visible` + `.first()` in capture AND e2e; assert count |
| **e2e asserts on whileInView opacity:0 content** → flake/timeout on correct code | `scrollIntoViewIfNeeded` + visibility wait before every assertion; drive correct scroller |
| **3D scroll regression untested** | Blocking E8: interactive 3D scroll + section-detection assertion, with deterministic `myProjects.length`/`sectionHeights` guard as the non-skippable fallback |
| Stale `dist/` tested by e2e | Playwright webServer does `build && preview`, `reuseExistingServer:false` in gate |
| Audio/encoding divergence | ffmpeg keeps silent AAC + faststart + yuv420p; M3 asserts h264; script asserts faststart |
| ffmpeg path not reproducible | No hardcoded absolute path in source; env → bare PATH; documented WinGet path in comment only |
| Wrong route assumption (`/info`) | Corrected to `/about` (PT `/sobre`) |
| Mobile 2-tap nav trap / iOS grid play-icon freeze | Mobile uses `goto(hero)`, never a grid tap |
| Right-edge white-bar on `/[slug]` | Frame to keep right edge inside crop; cosmetic |
| Non-https / typo'd href | Layer 2 A5; E3 asserts exact href + `target=_blank` |
| iOS-incompatible codec | Layer 4 M3 (h264) |
| e2e specs outside static analysis | §6.6 `tsconfig.e2e.json` / ESLint glob; `test:e2e` required gate (compile error ≠ skip) |
| Black first frame in showcase | Documented baseline; optional `thumbnail` poster |

### 8.2 Rollback
- **Pre-merge (clean path):** all changes are additive and isolated to the feature branch. `git checkout main && git branch -D feat/featured-fernanda-fiuza-project`. Nothing reaches `main`; committed binaries never enter `main` history.
- **Post-merge:** revert the **PR merge commit** (`git revert -m 1 <merge-commit>`) — this is the reliable path because the work is split across multiple commits (pipeline / data / tests, §8.3); a single non-merge revert may not cleanly remove media added in a different commit. If commits were NOT squashed, you may need to revert **each** relevant commit (pipeline + data + media).
  - Caveat: `git revert` removes the files going forward but does NOT reclaim history size for the committed `~2–17 MB` `.mp4` blobs. That is acceptable here (matches existing convention of committing optimized clips); state it explicitly. True history cleanup would require a filter-repo rewrite (not warranted).
- **Media-only rollback (keep code):** delete the two `fernanda-fiuza-*-opt.mp4` files, remove the `myProjects[0]` + both JSON `projects[0]` entries, re-run Layer 2 to confirm parity restored.

### 8.3 Deploy
1. Branch: `git checkout -b feat/featured-fernanda-fiuza-project`.
2. Commit in logical chunks (conventional commits; portfolio repo style applies):
   - `chore: add playwright + capture pipeline for fernanda fiuza clips`
   - `feat: add fernanda fiuza as featured project (index 0)`
   - `test: add data-integrity, media-sanity, and e2e validation for projects`
   > Prefer a squash-merge PR so a single `git revert -m 1` cleanly rolls back all of it (see §8.2).
3. Run the full gate locally: `npm run validate && npm run build && npm run test:e2e`.
4. Push with `-u`; open PR. PR body: showcase-entry summary, index-0 alignment rationale, capture pipeline (runtime slug discovery), and the test plan with a checked test-plan section.
5. Merge to `main` → Vercel auto-deploys the portfolio (jorgemolina.dev).
6. **Verify live on jorgemolina.dev:** Projects section, Fernanda first as `01` (EN + PT), Web/Mobile tabs play, "View Project" → fernandafiuza.com, "View Details" bullets, 3D mode renders + scrolls to the entry. Confirm both `-opt.mp4` assets load (Network tab, 200, reasonable size).
7. If broken in prod: revert the merge commit (§8.2) and re-deploy.

### Files created / touched (all absolute)
- Create: `C:/Users/jorge/Documents/github/portfolio/scripts/capture-fernanda.mjs`
- Create: `C:/Users/jorge/Documents/github/portfolio/scripts/validate-projects.mjs`
- Create: `C:/Users/jorge/Documents/github/portfolio/scripts/validate-media.mjs`
- Create: `C:/Users/jorge/Documents/github/portfolio/playwright.config.ts`
- Create: `C:/Users/jorge/Documents/github/portfolio/e2e/projects-fernanda.spec.ts`
- Create: `C:/Users/jorge/Documents/github/portfolio/tsconfig.e2e.json` (e2e static-analysis gate, §6.6)
- Create (capture output, committed): `C:/Users/jorge/Documents/github/portfolio/public/assets/projects-optimized/fernanda-fiuza-demo-opt.mp4`, `.../fernanda-fiuza-mobile-opt.mp4`
- Edit: `C:/Users/jorge/Documents/github/portfolio/src/constants/index.ts` (insert `myProjects[0]`)
- Edit: `C:/Users/jorge/Documents/github/portfolio/src/i18n/locales/en/projects.json` (insert `projects[0]`)
- Edit: `C:/Users/jorge/Documents/github/portfolio/src/i18n/locales/pt/projects.json` (insert `projects[0]`)
- Edit: `C:/Users/jorge/Documents/github/portfolio/package.json` (scripts + devDeps)
- Edit: `C:/Users/jorge/Documents/github/portfolio/.gitignore` (`.capture-tmp/`)
- Edit: `C:/Users/jorge/Documents/github/portfolio/eslint.config.js` (add e2e glob — optional alternative to tsconfig.e2e.json, §6.6)
- Optional: `C:/Users/jorge/Documents/github/portfolio/src/constants/sectionHeights.ts` (cosmetic one-page min-height)