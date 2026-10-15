// MC Cut PADRÃO FIXO (ver docs-projeto/PADRAO-ARTES-MC.md): 2 frames reais, Inter 600 33px, frase normal, branco, sem tag/destaque. 1080×1350.
// Uso: node --experimental-strip-types scripts/render/mccut.mjs <saida> <framesDir>
//   framesDir/<data>/1.jpg e 2.jpg  (se faltar, usa placeholder)
import { readFileSync, existsSync, mkdirSync } from 'node:fs'
import { chromium } from 'playwright-core'
import { MC_CUTS } from '../../src/db/seed-data.ts'

const Y = '#FDC700'
const font = (p) => readFileSync(new URL(`../../node_modules/${p}`, import.meta.url)).toString('base64')
const CSS = `
@font-face{font-family:Inter;font-weight:100 900;src:url(data:font/woff2;base64,${font('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')}) format('woff2')}
*{margin:0;padding:0;box-sizing:border-box}
.s{width:1080px;height:1350px;background:${Y};display:flex;flex-direction:column;gap:10px;position:relative;font-family:Inter}
.f{flex:1;position:relative;overflow:hidden;background:#111}
.f img{width:100%;height:100%;object-fit:cover;object-position:50% 30%;display:block}
.sh{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.5) 100%)}
.cap{position:absolute;left:50px;right:50px;bottom:40px;text-align:center;text-wrap:balance;font:600 33px/1.25 Inter;color:#fff;letter-spacing:-.005em;text-shadow:0 0 3px rgba(0,0,0,.95),0 2px 6px rgba(0,0,0,.85),0 0 14px rgba(0,0,0,.6)}
.hd{position:absolute;bottom:18px;right:32px;font:600 18px Inter;color:#fff;opacity:.7}
.ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#888;font:600 28px Inter;background:repeating-linear-gradient(45deg,#1a1a1a 0 20px,#222 20px 40px)}
`
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const hl = (t, w) => {
  const i = t.toUpperCase().indexOf(w.toUpperCase())
  return i < 0 ? esc(t) : `${esc(t.slice(0, i))}<b>${esc(t.slice(i, i + w.length))}</b>${esc(t.slice(i + w.length))}`
}

export const PRESENTER = {
  '2026-10-02': 'Leonardo', '2026-10-09': 'Leonardo', '2026-10-16': 'Marcelo', '2026-10-23': 'Marcelo',
  '2026-10-30': 'Leonardo', '2026-11-06': 'Leonardo', '2026-11-13': 'Leonardo', '2026-11-20': 'Leonardo',
  '2026-11-27': 'Marcelo', '2026-12-04': 'Marcelo', '2026-12-11': 'Leonardo', '2026-12-18': 'Marcelo',
}

const out = process.argv[2] ?? 'out'
const framesDir = process.argv[3] ?? 'frames'
const only = process.argv.slice(4)
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await b.newPage({ viewport: { width: 1080, height: 1350 } })
for (const [date, c] of Object.entries(MC_CUTS)) {
  if (only.length && !only.includes(date)) continue
  const img = (n) => {
    for (const ext of ['jpg', 'jpeg', 'png']) {
      const p = `${framesDir}/${date}/${n}.${ext}`
      if (existsSync(p)) return `<img src="data:image/${ext === 'png' ? 'png' : 'jpeg'};base64,${readFileSync(p).toString('base64')}">`
    }
    return `<div class="ph">frame ${n} · ${PRESENTER[date]}</div>`
  }
  const frame = (n, [t, w]) => `<div class="f">${img(n)}<div class="sh"></div><div class="cap">${esc(t)}</div>${n === 2 ? '<div class="hd">@mcinteligencia</div>' : ''}</div>`
  await page.setContent(`<html><head><style>${CSS}</style></head><body><div class="s">${frame(1, c.f1)}${frame(2, c.f2)}</div></body></html>`)
  await page.evaluate(() => document.fonts.ready)
  mkdirSync(`${out}/${date}`, { recursive: true })
  await page.locator('.s').screenshot({ path: `${out}/${date}/mc-cut-padrao.png` })
  console.log('ok', date)
}
await b.close()
