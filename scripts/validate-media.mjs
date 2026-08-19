// Layer 4 — media sanity for the Fernanda clips (ffprobe + black/frozen guards).
// Run: node scripts/validate-media.mjs
// Resolves ffprobe/ffmpeg via env (FFPROBE/FFMPEG) then bare PATH; SKIPS (exit 0) if unavailable.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync, spawnSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '..', 'public', 'assets', 'projects-optimized')

const FFMPEG = process.env.FFMPEG ?? 'ffmpeg'
const FFPROBE = process.env.FFPROBE ?? 'ffprobe'

function toolOk(bin) {
  try { execFileSync(bin, ['-version'], { stdio: 'ignore' }); return true } catch { return false }
}

const TARGETS = [
  { file: 'fernanda-fiuza-demo-opt.mp4', kind: 'desktop', minDur: 12, maxDur: 50, sizeWarnMB: 8, aspect: 16 / 9, tol: 0.02 },
  { file: 'fernanda-fiuza-mobile-opt.mp4', kind: 'mobile', minDur: 10, maxDur: 45, sizeWarnMB: 5, aspect: 9 / 19.5, tol: 0.06 },
]

if (!toolOk(FFPROBE) || !toolOk(FFMPEG)) {
  console.warn('[validate:media] ffprobe/ffmpeg not found (set FFMPEG/FFPROBE or add to PATH). SKIPPING media checks with exit 0.')
  process.exit(0)
}

function probe(file) {
  const out = execFileSync(FFPROBE, ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', file], { encoding: 'utf8' })
  return JSON.parse(out)
}

function ffmpegStderr(args) {
  // ffmpeg logs (blackdetect / metadata=print) go to stderr; spawnSync returns it regardless of exit code.
  const r = spawnSync(FFMPEG, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  return (r.stderr || '') + (r.stdout || '')
}

for (const t of TARGETS) {
  const abs = path.join(OUT, t.file)

  test(`M1 ${t.file} — exists`, () => {
    assert.ok(fs.existsSync(abs), `missing ${abs}`)
  })

  if (!fs.existsSync(abs)) continue

  const info = probe(abs)
  const v = info.streams.find((s) => s.codec_type === 'video')
  const dur = parseFloat(info.format.duration)
  const sizeMB = fs.statSync(abs).size / (1024 * 1024)
  const w = v.width, h = v.height
  const ar = w / h

  test(`M2 ${t.file} — size advisory (warn only)`, () => {
    if (sizeMB > t.sizeWarnMB) console.warn(`[validate:media] WARN ${t.file} is ${sizeMB.toFixed(1)}MB (> ${t.sizeWarnMB}MB advisory).`)
    assert.ok(true)
  })

  test(`M3 ${t.file} — codec h264`, () => {
    assert.equal(v.codec_name, 'h264', `codec is ${v.codec_name}`)
  })

  test(`M4 ${t.file} — aspect / orientation`, () => {
    if (t.kind === 'mobile') {
      assert.ok(h > w, `mobile must be portrait (got ${w}x${h})`)
    }
    assert.ok(Math.abs(ar - t.aspect) < t.tol, `aspect ${ar.toFixed(3)} not within ${t.tol} of ${t.aspect.toFixed(3)} (${w}x${h})`)
  })

  test(`M5 ${t.file} — duration in band`, () => {
    assert.ok(dur > 0, 'duration must be > 0')
    assert.ok(dur >= t.minDur && dur <= t.maxDur, `duration ${dur.toFixed(1)}s outside [${t.minDur}, ${t.maxDur}]`)
  })

  test(`M6 ${t.file} — not black / not frozen`, () => {
    // black guard
    const blk = ffmpegStderr(['-i', abs, '-vf', 'blackdetect=d=2:pic_th=0.98', '-an', '-f', 'null', '-'])
    let blackTotal = 0
    for (const m of blk.matchAll(/black_duration:([\d.]+)/g)) blackTotal += parseFloat(m[1])
    assert.ok(blackTotal < 0.4 * dur, `mostly black: ${blackTotal.toFixed(1)}s of ${dur.toFixed(1)}s`)
    // frozen guard
    const sig = ffmpegStderr(['-i', abs, '-vf', "select='not(mod(n,15))',signalstats,metadata=print", '-an', '-f', 'null', '-'])
    const ys = [...sig.matchAll(/lavfi\.signalstats\.YAVG=([\d.]+)/g)].map((m) => parseFloat(m[1]))
    assert.ok(ys.length >= 2, `not enough luma samples (${ys.length})`)
    const spread = Math.max(...ys) - Math.min(...ys)
    assert.ok(spread >= 2.0, `frozen: YAVG spread ${spread.toFixed(2)} < 2.0`)
  })
}
