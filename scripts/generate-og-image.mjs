// Re-runnable generator for the link-preview card (public/og-image.png).
//   npm run og:image
// Env: OG_SITE_URL (default https://www.jorgemolina.dev), FFMPEG
//
// The particle field is captured from the real site rather than reimplemented:
// Particles is an OGL/WebGL component, so a CSS lookalike would drift from it.
// The script loads the site, isolates the canvas layer, and grabs one frame.
import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const FFMPEG = process.env.FFMPEG ?? 'ffmpeg'
const SITE = process.env.OG_SITE_URL ?? 'https://www.jorgemolina.dev'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'public', 'og-image.png')
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'og-'))

// Open Graph's expected ratio (1.91:1). Rendered at 2x and downscaled so the
// type stays crisp without shipping a 2400px file.
const W = 1200
const H = 630

const log = (m) => console.log(`[og] ${m}`)
const fileUrl = (p) => pathToFileURL(path.join(ROOT, p)).href

function preflight() {
  try {
    execFileSync(FFMPEG, ['-version'], { stdio: 'ignore' })
  } catch {
    console.error(`\nffmpeg not found -- install it or set the FFMPEG env var.\n`)
    process.exit(1)
  }
}

function cardHtml(particlesPath) {
  return `<!doctype html>
<meta charset="utf-8">
<style>
  @font-face { font-family: 'Funnel Display'; font-weight: 300; src: url('${fileUrl('public/fonts/funnel-display-300.ttf')}') format('truetype'); }
  @font-face { font-family: 'Funnel Display'; font-weight: 500; src: url('${fileUrl('public/fonts/funnel-display-500.ttf')}') format('truetype'); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${W}px; height: ${H}px;
    font-family: 'Funnel Display', sans-serif;
    /* site palette: navy #161a31 -> midnight #06091f -> the black body colour */
    background: radial-gradient(120% 100% at 12% 8%, #161a31 0%, #06091f 45%, #000000 100%);
    color: #fff;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 72px 80px;
    overflow: hidden;
  }
  /* 'screen' drops the capture's black backdrop, leaving the dots over the gradient */
  body::before {
    content: '';
    position: absolute; inset: 0;
    background: url('${pathToFileURL(particlesPath).href}') center / cover no-repeat;
    mix-blend-mode: screen;
    opacity: .9;
  }
  body > * { position: relative; z-index: 1; }
  /* orbit.png is a solid black glyph made for a light browser tab; invert it here */
  .mark { width: 58px; height: 58px; filter: invert(1); opacity: .88; }
  .name { font-size: 92px; font-weight: 500; letter-spacing: -.025em; line-height: 1; }
  .role { margin-top: 26px; font-size: 25px; font-weight: 300; letter-spacing: .34em; text-transform: uppercase; color: rgba(255,255,255,.62); }
  .foot { display: flex; justify-content: flex-end; }
  .url { font-size: 23px; font-weight: 300; color: rgba(255,255,255,.45); }
</style>
<body>
  <img class="mark" src="${fileUrl('public/orbit.png')}">
  <div>
    <div class="name">Jorge Molina</div>
    <div class="role">Web Development</div>
  </div>
  <div class="foot"><span class="url">www.jorgemolina.dev</span></div>
</body>`
}

async function captureParticles(browser) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })
  const out = path.join(TMP, 'particles.png')
  try {
    await page.goto(SITE, { waitUntil: 'networkidle', timeout: 45000 })
    await page.getByText('One Page', { exact: true }).click()
    await page.locator('div.fixed.inset-0.z-0 canvas').waitFor({ timeout: 30000 })
    // Strip everything but the particle layer so the capture is pure background.
    await page.addStyleTag({
      content: `
        [data-scroll-container], header, nav { display: none !important; }
        html, body { background: #000 !important; }
        div.fixed.inset-0.z-0 { z-index: 9999 !important; }
      `,
    })
    await page.waitForTimeout(2500)
    await page.screenshot({ path: out })
  } finally {
    await page.close()
  }
  return out
}

async function renderCard(browser, particlesPath) {
  const html = path.join(TMP, 'card.html')
  fs.writeFileSync(html, cardHtml(particlesPath), 'utf8')

  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })
  const shot = path.join(TMP, 'card-2x.png')
  try {
    await page.goto(pathToFileURL(html).href)
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: shot })
  } finally {
    await page.close()
  }
  return shot
}

async function main() {
  preflight()
  const browser = await chromium.launch()
  try {
    log(`capturing particles from ${SITE}`)
    const particles = await captureParticles(browser)
    log('rendering card')
    const shot = await renderCard(browser, particles)
    log(`downscaling to ${W}x${H}`)
    execFileSync(FFMPEG, ['-v', 'error', '-i', shot, '-vf', `scale=${W}:${H}:flags=lanczos`, '-y', OUT])
  } finally {
    await browser.close()
    fs.rmSync(TMP, { recursive: true, force: true })
  }
  const kb = (fs.statSync(OUT).size / 1024).toFixed(1)
  log(`wrote public/og-image.png (${kb} KB)`)
}

await main()
