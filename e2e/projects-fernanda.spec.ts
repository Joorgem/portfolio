import { test, expect, type Page } from '@playwright/test'

// Layer 3 — proves the Fernanda Fiuza entry renders FIRST and correctly in One Page mode,
// in both locales, with the right videos/link/tabs/details. Plus a 3D-mode smoke.
// The non-skippable "section mapping can't silently break" guard lives in validate-projects (A11).

const L = {
  en: { section: 'Projects', viewDetails: 'View Details', phrase: 'movement director' },
  pt: { section: 'Projetos', viewDetails: 'Ver Detalhes', phrase: 'diretora de movimento' },
} as const

type Locale = keyof typeof L

// The mode selector + initial UI render in EN: src/i18n/index.ts sets `lng: 'en'`, which takes
// precedence over the localStorage language detector on init. So we always enter via the EN
// "One Page" card, then switch to PT in-app via the language toggle (aria-label "Change language").
async function openOnePage(page: Page, locale: Locale) {
  await page.goto('/')
  await page.getByText('One Page', { exact: true }).click()
  await expect(page.locator('[data-scroll-container]')).toBeVisible()
  if (locale === 'pt') {
    await page.getByRole('button', { name: 'Change language' }).first().click()
    await expect(page.getByRole('heading', { name: 'Projetos', exact: true }).first()).toBeVisible({ timeout: 10_000 })
  }
}

function fernandaShowcase(page: Page) {
  // ProjectShowcase sections carry class "min-h-screen"; the OnePage wrapper section does not.
  return page.locator('section.min-h-screen').filter({ hasText: 'Fernanda Fiuza' }).first()
}

for (const locale of ['en', 'pt'] as Locale[]) {
  test(`One Page — Fernanda Fiuza renders first and correctly (${locale})`, async ({ page }) => {
    await openOnePage(page, locale)

    // E7 — translated section title
    const title = page.getByRole('heading', { name: L[locale].section, exact: true }).first()
    await title.scrollIntoViewIfNeeded()
    await expect(title).toBeVisible()

    const sc = fernandaShowcase(page)
    await sc.scrollIntoViewIfNeeded()

    // E1 — first, numbered 01
    await expect(sc.getByRole('heading', { name: 'Fernanda Fiuza' })).toBeVisible()
    await expect(sc.getByText('01', { exact: true })).toBeVisible()

    // E2 — desktop video wired (web is the default tab)
    await expect(sc.locator('video[src*="fernanda-fiuza-demo-opt.mp4"]')).toHaveCount(1)

    // E3 — "View Project" -> live site, new tab
    const link = sc.locator('a[href="https://fernandafiuza.com"]')
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('target', '_blank')

    // E4 — Web + Mobile category tabs present (labels are not localized)
    await expect(sc.getByRole('button', { name: /Web/ })).toBeVisible()
    await expect(sc.getByRole('button', { name: /Mobile/ })).toBeVisible()

    // E5 — switch to Mobile -> portrait video + aspect container
    await sc.getByRole('button', { name: /Mobile/ }).click()
    await expect(sc.locator('video[src*="fernanda-fiuza-mobile-opt.mp4"]')).toHaveCount(1)
    await expect(sc.locator('[class*="9/19.5"]')).toBeVisible()

    // E6 — View Details reveals the localized bullets (5)
    await sc.getByRole('button', { name: L[locale].viewDetails }).click()
    const panel = sc.locator('[class*="bg-black/95"]')
    await expect(panel).toBeVisible()
    await expect(panel.locator('p')).toHaveCount(5)
    // E7b — locale-specific copy actually rendered
    await expect(panel.getByText(L[locale].phrase, { exact: false })).toBeVisible()
  })
}

test('3D mode mounts and dismisses the selector without crashing', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/')
  await page.getByText('Immersive Mode', { exact: true }).click()
  // The store promotes to ready-3d when the scene is ready or via a 5s fallback; the selector cards then unmount.
  await expect(page.getByText('Immersive Mode', { exact: true })).toHaveCount(0, { timeout: 30_000 })
  expect(errors, `uncaught page errors:\n${errors.join('\n')}`).toEqual([])
})

// ---------------------------------------------------------------------------
// Viewport-driven playback. The videos carry no poster file: the first frame is
// painted by the `#t=0.1` media fragment, and playback starts only once the card
// actually holds the viewport. Threshold is 0.5, and every ProjectShowcase is
// min-h-screen, so at most one video can ever be decoding.
// ---------------------------------------------------------------------------

const DEMO = 'video[src*="fernanda-fiuza-demo-opt.mp4"]'

// Scrolls to a showcase far enough down that Fernanda's card leaves the viewport.
async function scrollAwayFromFernanda(page: Page) {
  await page.locator('section.min-h-screen').nth(2).scrollIntoViewIfNeeded()
}

test('E9 — Fernanda video plays once its card holds the viewport', async ({ page }) => {
  await openOnePage(page, 'en')
  const sc = fernandaShowcase(page)
  await sc.scrollIntoViewIfNeeded()

  await expect(sc.locator(DEMO)).toHaveJSProperty('paused', false)
})

test('E10 — it pauses again once the card leaves the viewport', async ({ page }) => {
  await openOnePage(page, 'en')
  const sc = fernandaShowcase(page)
  await sc.scrollIntoViewIfNeeded()
  await expect(sc.locator(DEMO)).toHaveJSProperty('paused', false)

  await scrollAwayFromFernanda(page)
  await expect(sc.locator(DEMO)).toHaveJSProperty('paused', true)
})

test('E11 — the video is playsInline (iOS Safari refuses inline playback without it)', async ({ page }) => {
  await openOnePage(page, 'en')
  const sc = fernandaShowcase(page)
  await sc.scrollIntoViewIfNeeded()

  await expect(sc.locator(DEMO)).toHaveAttribute('playsinline', '')
})

test('E12 — prefers-reduced-motion: no autoplay, but a real first frame (not a black box)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openOnePage(page, 'en')
  const sc = fernandaShowcase(page)
  await sc.scrollIntoViewIfNeeded()

  const video = sc.locator(DEMO)
  await expect(video).toHaveJSProperty('paused', true)
  // readyState >= 2 (HAVE_CURRENT_DATA) proves a frame is decoded and painted,
  // which is what makes the paused state look like a poster instead of black.
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState), { timeout: 15_000 })
    .toBeGreaterThanOrEqual(2)
})
