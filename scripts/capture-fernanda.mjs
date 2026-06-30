// Re-runnable capture pipeline: records a desktop + mobile walkthrough of the live
// Fernanda Fiuza site, then ffmpeg-transcodes to the repo's -opt.mp4 convention.
//   npm run capture:fernanda
// Env: CAPTURE_URL, CAPTURE_SLUG, HEADED=1, FFMPEG, FFPROBE
import { chromium } from 'playwright'
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const FFMPEG = process.env.FFMPEG ?? 'ffmpeg'
const FFPROBE = process.env.FFPROBE ?? 'ffprobe'
// Windows WinGet ffmpeg lives at a hashed path (NOT on bare PATH). For a local run set e.g.:
//   export FFMPEG="C:/Users/.../Gyan.FFmpeg_.../ffmpeg-8.0.1-full_build/bin/ffmpeg.exe"

const CONFIG = {
  baseUrl: process.env.CAPTURE_URL ?? 'https://fernandafiuza.com',
  outDir: path.join(process.cwd(), 'public', 'assets', 'projects-optimized'),
  tmpDir: path.join(process.cwd(), '.capture-tmp'),
  projectSlug: process.env.CAPTURE_SLUG ?? null,
  headed: process.env.HEADED === '1',
  desktop: {
    viewport: { width: 1920, height: 1080 }, dsf: 1,
    out: 'fernanda-fiuza-demo-opt.mp4', w: 1920, h: 1080, level: '5.0', crf: 23,
  },
  mobile: {
    viewport: { width: 780, height: 1688 }, dsf: 2, isMobile: true, hasTouch: true,
    out: 'fernanda-fiuza-mobile-opt.mp4', w: 390, h: 844, level: '3.0', crf: 24,
  },
  launchArgs: [
    '--autoplay-policy=no-user-gesture-required',
    '--mute-audio',
    '--use-gl=angle', '--use-angle=swiftshader',
  ],
  navTimeout: 35000,
}

const log = (m) => console.log(`[capture] ${m}`)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Recursively collect <video> elements across (nested) shadow roots — mux-player nests them.
const VIDEO_GATE = `() => {
  const out = []
  const walk = (root) => {
    if (!root) return
    if (root.querySelectorAll) root.querySelectorAll('video').forEach((v) => out.push(v))
    const all = root.querySelectorAll ? root.querySelectorAll('*') : []
    all.forEach((el) => { if (el.shadowRoot) walk(el.shadowRoot) })
  }
  walk(document)
  return out.some((v) => !v.paused && v.currentTime > 0.1 && v.readyState >= 2)
}`

function toolPreflight() {
  for (const [name, bin] of [['ffmpeg', FFMPEG], ['ffprobe', FFPROBE]]) {
    try { execFileSync(bin, ['-version'], { stdio: 'ignore' }) }
    catch {
      console.error(`\n${name} not found — install it or set the ${name.toUpperCase()} env var ` +
        `(Windows WinGet: add the Gyan.FFmpeg bin dir to PATH for this shell).\n`)
      process.exit(1)
    }
  }
}

async function settle(page) {
  try { await page.waitForLoadState('networkidle', { timeout: CONFIG.navTimeout }) } catch {}
  try { await page.evaluate(() => document.fonts && document.fonts.ready) } catch {}
}

async function smoothScroll(page, totalPx, steps = 14, dwell = 90) {
  const per = Math.round(totalPx / steps)
  for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, per); await sleep(dwell) }
}

async function clickVisibleLocaleToggle(page) {
  const selectors = [
    'button[aria-label*="Portugu"]:visible',
    'button[aria-label*="Switch to"]:visible',
    'button[aria-label*="Mudar"]:visible',
  ]
  for (const sel of selectors) {
    try {
      const loc = page.locator(sel).first()
      if (await loc.count()) { await loc.click({ timeout: 3000 }); return true }
    } catch {}
  }
  return false
}

async function discover(browser) {
  const ctx = await browser.newContext({ viewport: CONFIG.desktop.viewport })
  const page = await ctx.newPage()
  let heroSlug = CONFIG.projectSlug
  let useGridFallback = false
  let skipStill = false
  try {
    await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle', timeout: CONFIG.navTimeout })
    await page.locator('div.grid a[href]').first().waitFor({ timeout: CONFIG.navTimeout })

    const gate = async (ms) => page.waitForFunction(VIDEO_GATE, { timeout: ms }).then(() => true).catch(() => false)

    const tryslug = async (slug, ms) => {
      await page.goto(`${CONFIG.baseUrl}/${slug}`, { waitUntil: 'networkidle', timeout: CONFIG.navTimeout })
      await page.waitForSelector('mux-player, video', { timeout: 15000 }).catch(() => {})
      return gate(ms)
    }

    if (heroSlug) {
      log(`testing provided slug: ${heroSlug}`)
      if (!(await tryslug(heroSlug, 15000))) { log('provided slug did not autoplay; will scan'); heroSlug = null }
    }
    if (!heroSlug) {
      const hrefs = await page.locator('div.grid a[href]').evaluateAll((els) =>
        [...new Set(els.map((e) => e.getAttribute('href')).filter(Boolean))])
      const slugs = hrefs
        .filter((h) => /^\/[^/]+$/.test(h))
        .filter((h) => !/^\/(still|about|sobre|studio|pt|en)$/.test(h))
        .map((h) => h.replace(/^\//, ''))
      log(`candidate slugs: ${slugs.slice(0, 8).join(', ')}`)
      for (const s of slugs.slice(0, 8)) {
        if (await tryslug(s, 8000)) { heroSlug = s; log(`hero slug (autoplays): ${s}`); break }
      }
    }
    if (!heroSlug) { useGridFallback = true; log('no autoplay hero found -> grid-preview fallback') }

    await page.goto(`${CONFIG.baseUrl}/still`, { waitUntil: 'networkidle', timeout: CONFIG.navTimeout }).catch(() => {})
    const stills = await page.locator('button.cursor-zoom-in').count().catch(() => 0)
    if (!stills) { skipStill = true; log('no stills -> lightbox beat skipped') }
  } finally {
    await ctx.close()
  }
  return { heroSlug, useGridFallback, skipStill }
}

async function recordDesktop(browser, plan) {
  const ctx = await browser.newContext({
    viewport: CONFIG.desktop.viewport, deviceScaleFactor: CONFIG.desktop.dsf,
    recordVideo: { dir: CONFIG.tmpDir, size: CONFIG.desktop.viewport },
  })
  const page = await ctx.newPage()
  try {
    await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle', timeout: CONFIG.navTimeout })
    await settle(page); await sleep(1800)
    await smoothScroll(page, 1300); await sleep(3000)
    try { await page.locator('div.grid a[href]').first().hover({ timeout: 3000 }); await sleep(1500) } catch {}
    if (!plan.useGridFallback && plan.heroSlug) {
      await page.goto(`${CONFIG.baseUrl}/${plan.heroSlug}`, { waitUntil: 'networkidle', timeout: CONFIG.navTimeout })
      await page.waitForSelector('mux-player, video', { timeout: 15000 }).catch(() => {})
      await page.waitForFunction(VIDEO_GATE, { timeout: 15000 }).catch(() => {})
      await sleep(5000)
    } else { await smoothScroll(page, 900); await sleep(3000) }
    if (!plan.skipStill) {
      try {
        await page.goto(`${CONFIG.baseUrl}/still`, { waitUntil: 'networkidle', timeout: CONFIG.navTimeout })
        await page.locator('button.cursor-zoom-in').first().click({ timeout: 5000 })
        await page.waitForSelector('.yarl__slide', { state: 'visible', timeout: 5000 })
        await sleep(2500); await page.keyboard.press('ArrowRight'); await sleep(1200); await page.keyboard.press('Escape')
      } catch {}
    }
    try { await page.goto(`${CONFIG.baseUrl}/about`, { waitUntil: 'networkidle', timeout: CONFIG.navTimeout }); await sleep(2000) } catch {}
    if (await clickVisibleLocaleToggle(page)) await sleep(1800)
  } finally {
    const vp = await page.video().path()
    await ctx.close()
    return vp
  }
}

async function recordMobile(browser, plan) {
  const ctx = await browser.newContext({
    viewport: CONFIG.mobile.viewport, deviceScaleFactor: CONFIG.mobile.dsf,
    isMobile: CONFIG.mobile.isMobile, hasTouch: CONFIG.mobile.hasTouch,
    recordVideo: { dir: CONFIG.tmpDir, size: CONFIG.mobile.viewport },
  })
  const page = await ctx.newPage()
  try {
    await page.goto(CONFIG.baseUrl, { waitUntil: 'networkidle', timeout: CONFIG.navTimeout })
    await settle(page); await sleep(1800)
    await smoothScroll(page, 1400); await sleep(3000)
    if (!plan.useGridFallback && plan.heroSlug) {
      await page.goto(`${CONFIG.baseUrl}/${plan.heroSlug}`, { waitUntil: 'networkidle', timeout: CONFIG.navTimeout })
      await page.waitForSelector('mux-player, video', { timeout: 15000 }).catch(() => {})
      await page.waitForFunction(VIDEO_GATE, { timeout: 15000 }).catch(() => {})
      await sleep(4500)
    } else { await smoothScroll(page, 1000); await sleep(3000) }
    if (!plan.skipStill) {
      try {
        await page.goto(`${CONFIG.baseUrl}/still`, { waitUntil: 'networkidle', timeout: CONFIG.navTimeout })
        await page.locator('button.cursor-zoom-in').first().click({ timeout: 5000 })
        await page.waitForSelector('.yarl__slide', { state: 'visible', timeout: 5000 })
        await sleep(2500); await page.keyboard.press('Escape')
      } catch {}
    }
    try { await page.goto(`${CONFIG.baseUrl}/about`, { waitUntil: 'networkidle', timeout: CONFIG.navTimeout }); await sleep(2000) } catch {}
    if (await clickVisibleLocaleToggle(page)) await sleep(1500)
  } finally {
    const vp = await page.video().path()
    await ctx.close()
    return vp
  }
}

function transcode(webm, prof) {
  const out = path.join(CONFIG.outDir, prof.out)
  const vf = `fps=30,scale=${prof.w}:${prof.h}:force_original_aspect_ratio=increase,crop=${prof.w}:${prof.h},format=yuv420p`
  const args = [
    '-y', '-i', webm,
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',
    '-vf', vf,
    '-c:v', 'libx264', '-profile:v', 'high', '-level', prof.level, '-crf', String(prof.crf), '-preset', 'slow',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '8k', '-ar', '48000', '-ac', '2',
    '-shortest', out,
  ]
  log(`ffmpeg -> ${prof.out}`)
  execFileSync(FFMPEG, args, { stdio: 'inherit' })
  return out
}

function verify(out, prof) {
  const info = JSON.parse(execFileSync(FFPROBE, ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', out], { encoding: 'utf8' }))
  const v = info.streams.find((s) => s.codec_type === 'video')
  const dur = parseFloat(info.format.duration)
  const sizeMB = fs.statSync(out).size / (1024 * 1024)
  if (v.codec_name !== 'h264') throw new Error(`${prof.out}: codec ${v.codec_name} != h264`)
  if (v.width !== prof.w || v.height !== prof.h) throw new Error(`${prof.out}: dims ${v.width}x${v.height} != ${prof.w}x${prof.h}`)
  if (!(dur > 0)) throw new Error(`${prof.out}: zero duration`)
  const blkRes = spawnSync(FFMPEG, ['-i', out, '-vf', 'blackdetect=d=2:pic_th=0.98', '-an', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  const blk = (blkRes.stderr || '')
  let black = 0
  for (const m of blk.matchAll(/black_duration:([\d.]+)/g)) black += parseFloat(m[1])
  if (black > 0.4 * dur) throw new Error(`${prof.out}: mostly black (${black.toFixed(1)}s/${dur.toFixed(1)}s) — capture failed`)
  const warn = sizeMB > (prof.w > 1000 ? 8 : 5) ? ' (WARN size)' : ''
  log(`OK ${prof.out}: ${v.width}x${v.height} ${dur.toFixed(1)}s ${sizeMB.toFixed(1)}MB${warn}`)
}

async function main() {
  toolPreflight()
  fs.mkdirSync(CONFIG.outDir, { recursive: true })
  fs.mkdirSync(CONFIG.tmpDir, { recursive: true })
  log(`launching chromium (${CONFIG.headed ? 'headed' : 'headless'}) -> ${CONFIG.baseUrl}`)
  const browser = await chromium.launch({ headless: !CONFIG.headed, args: CONFIG.launchArgs })
  const webms = []
  try {
    const plan = await discover(browser)
    log(`plan: ${JSON.stringify(plan)}`)
    const dWebm = await recordDesktop(browser, plan); webms.push(dWebm)
    const mWebm = await recordMobile(browser, plan); webms.push(mWebm)
    transcode(dWebm, CONFIG.desktop); verify(path.join(CONFIG.outDir, CONFIG.desktop.out), CONFIG.desktop)
    transcode(mWebm, CONFIG.mobile); verify(path.join(CONFIG.outDir, CONFIG.mobile.out), CONFIG.mobile)
  } finally {
    await browser.close()
    for (const w of webms) { try { fs.rmSync(w, { force: true }) } catch {} }
  }
  log('done.')
}

main().catch((e) => { console.error('[capture] FAILED:', e.message); process.exit(1) })
