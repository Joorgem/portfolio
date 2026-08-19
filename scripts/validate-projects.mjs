// Layer 2 — data-integrity validator for the Projects section.
// Run: node --experimental-strip-types scripts/validate-projects.mjs
// Proves constants <-> en/pt locale JSON stay index-aligned and every media file exists.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { myProjects } from '../src/constants/index.ts'
import en from '../src/i18n/locales/en/projects.json' with { type: 'json' }
import pt from '../src/i18n/locales/pt/projects.json' with { type: 'json' }
import { SECTION_HEIGHTS } from '../src/constants/sectionHeights.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC = path.resolve(__dirname, '..', 'public')

const ALLOWED_CATEGORIES = new Set(['web', 'mobile', 'admin', 'features']) // RENDERED set, not the TS union
const ALLOWED_TYPES = new Set(['image', 'gif', 'video'])
const EXPECTED_MEDIA = ['fernanda-fiuza-demo-opt.mp4', 'fernanda-fiuza-mobile-opt.mp4']

const isHttps = (u) => {
  try { return new URL(u).protocol === 'https:' } catch { return false }
}

test('A1 — Fernanda Fiuza is index 0 in all three sources', () => {
  assert.equal(myProjects[0].title, 'Fernanda Fiuza', 'constants[0]')
  assert.equal(en.projects[0].title, 'Fernanda Fiuza', 'en[0]')
  assert.equal(pt.projects[0].title, 'Fernanda Fiuza', 'pt[0]')
})

test('A2 — locale arrays match myProjects length', () => {
  assert.equal(en.projects.length, myProjects.length, 'en length')
  assert.equal(pt.projects.length, myProjects.length, 'pt length')
})

test('A3 — locale parity + alignment at EVERY index', () => {
  // NOTE: constants[i].title/tag-names are a never-rendered FALLBACK and legitimately diverge
  // from the locale JSON for pre-existing projects (the render overrides with the locale value).
  // The true ordering-drift signal is that en[i] and pt[i] describe the SAME project.
  for (let i = 0; i < myProjects.length; i++) {
    const c = myProjects[i], e = en.projects[i], p = pt.projects[i]
    assert.ok(e && p, `missing locale entry at index ${i}`)
    assert.ok(e.title && e.title.trim(), `en[${i}].title empty`)
    assert.ok(p.title && p.title.trim(), `pt[${i}].title empty`)
    const en2 = e.tags.map((t) => t.name)
    const pn = p.tags.map((t) => t.name)
    assert.deepEqual(pn, en2, `tag names en vs pt drift at index ${i} (one locale reordered/edited)`)
    assert.equal(c.tags.length, en2.length, `constants vs locale tag COUNT mismatch at index ${i}`)
  }
})

test('A4 — every media src exists on disk (HARD)', () => {
  for (const proj of myProjects) {
    for (const m of proj.media) {
      const abs = path.join(PUBLIC, m.src.replace(/^\//, ''))
      assert.ok(fs.existsSync(abs), `missing media file: ${m.src} (looked at ${abs})`)
    }
  }
})

test('A5 — Fernanda href correct; all hrefs are # or https', () => {
  assert.equal(myProjects[0].href, 'https://fernandafiuza.com')
  for (const proj of myProjects) {
    assert.ok(proj.href === '#' || isHttps(proj.href), `bad href: ${proj.href}`)
  }
})

test('A6 — repositoryUrl is undefined / # / https', () => {
  for (const proj of myProjects) {
    const r = proj.repositoryUrl
    assert.ok(r === undefined || r === '#' || isHttps(r), `bad repositoryUrl: ${r}`)
  }
})

test('A7 — categories valid; Fernanda has web + mobile', () => {
  for (const proj of myProjects) {
    for (const m of proj.media) {
      assert.ok(ALLOWED_CATEGORIES.has(m.category), `bad category: ${m.category}`)
    }
  }
  const cats = myProjects[0].media.map((m) => m.category)
  assert.ok(cats.includes('web'), 'Fernanda missing web media')
  assert.ok(cats.includes('mobile'), 'Fernanda missing mobile media')
})

test('A8 — media types valid', () => {
  for (const proj of myProjects) {
    for (const m of proj.media) {
      assert.ok(ALLOWED_TYPES.has(m.type), `bad media type: ${m.type}`)
    }
  }
})

test('A9 — subDescription non-empty in constants + en + pt at every index', () => {
  const ok = (arr) => Array.isArray(arr) && arr.length > 0 && arr.every((s) => typeof s === 'string' && s.trim().length > 0)
  for (let i = 0; i < myProjects.length; i++) {
    assert.ok(ok(myProjects[i].subDescription), `constants[${i}].subDescription`)
    assert.ok(ok(en.projects[i].subDescription), `en[${i}].subDescription`)
    assert.ok(ok(pt.projects[i].subDescription), `pt[${i}].subDescription`)
  }
})

test('A10 — Fernanda media filenames match expected capture outputs', () => {
  const names = myProjects[0].media.map((m) => path.basename(m.src))
  for (const expected of EXPECTED_MEDIA) {
    assert.ok(names.includes(expected), `expected media filename not wired: ${expected} (got ${names.join(', ')})`)
  }
})

test('A11 — 3D/section-mapping deterministic guard', () => {
  // Non-skippable guard for the "adding a project silently breaks 3D section mapping" risk.
  assert.ok(myProjects.length >= 4, `expected >= 4 projects, got ${myProjects.length}`)
  assert.ok('projects' in SECTION_HEIGHTS, 'sectionHeights lost the projects key')
  assert.ok(typeof SECTION_HEIGHTS.projects === 'string' && SECTION_HEIGHTS.projects.length > 0, 'projects height invalid')
})
