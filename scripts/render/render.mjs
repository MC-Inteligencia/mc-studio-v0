// Renderiza carrosséis MC em PNG 1080×1350 com imagem em todas as lâminas.
// Uso: node --experimental-strip-types scripts/render/render.mjs <saida> [data ...]
import { readFileSync, mkdirSync } from 'node:fs'
import { chromium } from 'playwright-core'
import { art } from './art.mjs'
import { CAROUSELS } from '../../src/db/seed-data.ts'
import { PLAN } from './plan.mjs'

const Y = '#FDC700', NAVY = '#162456', DARK = '#091134', LB = '#155DFC'
const font = (p) => readFileSync(new URL(`../../node_modules/${p}`, import.meta.url)).toString('base64')
const CSS = `
@font-face{font-family:Geist;font-weight:100 900;src:url(data:font/woff2;base64,${font('@fontsource-variable/geist/files/geist-latin-wght-normal.woff2')}) format('woff2')}
@font-face{font-family:Inter;font-weight:100 900;src:url(data:font/woff2;base64,${font('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')}) format('woff2')}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#000}
.s{width:1080px;height:1350px;position:relative;overflow:hidden;font-family:Inter;color:#fff;background:#0a0a0a}
.abs{position:absolute;inset:0}
.art svg{width:100%;height:100%;display:block}
.hdr{position:absolute;top:44px;left:64px;right:64px;display:flex;justify-content:space-between;font:600 20px Inter;letter-spacing:.1em;opacity:.6;z-index:5}
.cnt{position:absolute;top:108px;right:64px;background:rgba(0,0,0,.4);font:500 22px Inter;padding:6px 16px;border-radius:24px;z-index:5;color:#fff}
.ftr{position:absolute;left:64px;right:64px;bottom:44px;display:flex;justify-content:space-between;align-items:center;font:600 22px Inter;z-index:5;opacity:.65}
.h{font-family:Geist;font-weight:800;text-transform:uppercase;letter-spacing:-.015em;line-height:1.0}
.y{color:${Y}}
.band{display:inline-block;background:${Y};color:${NAVY};font:700 34px/1.25 Inter;padding:10px 18px;margin-top:26px}
.tag{display:inline-block;background:${Y};color:${NAVY};font:700 24px Inter;letter-spacing:.06em;padding:8px 20px;border-radius:24px;margin-bottom:26px}
.p{font:400 36px/1.45 Inter;white-space:pre-line}
.src{font:400 22px/1.3 Inter;opacity:.65;margin-top:26px}
.card{border-radius:16px;overflow:hidden}
.arrow{width:60px;height:60px;background:${Y};color:${NAVY};font:800 40px/60px Geist;text-align:center;border-radius:4px;margin-bottom:34px}
.li{display:flex;gap:24px;align-items:center;font:500 38px/1.25 Inter;margin-bottom:22px}
.li i{width:18px;height:18px;background:${Y};border-radius:3px;flex-shrink:0}
.chip{display:inline-block;background:${Y};color:${NAVY};font:800 44px Geist;padding:6px 18px;margin-bottom:26px}
`
// Logo MC (canto superior esquerdo) + MCINTELIGENCIA.COM (canto superior direito) em todo carrossel. Padrão definido em 01/10/2026.
const LOGO_B64 = readFileSync(process.env.LOGO ?? new URL('../../../marca/logo-mc-inteligencia.png', import.meta.url)).toString('base64')
const SEL = JSON.parse(readFileSync(process.env.SEL ?? '/tmp/claude-0/selection.json', 'utf8'))
const PHOTO_DIR = process.env.PHOTOS ?? '/tmp/claude-0/fotos'
const photoCache = {}
function ph(date, i, pos = 'center') {
  const e = SEL[date]?.[i]
  if (!e) return null
  photoCache[e.id] ??= readFileSync(`${PHOTO_DIR}/${e.id}.jpg`).toString('base64')
  return `<img src="data:image/jpeg;base64,${photoCache[e.id]}" style="width:100%;height:100%;object-fit:cover;object-position:${pos};display:block">`
}
const esc = (t = '') => t.replace(/&/g, '&amp;').replace(/</g, '&lt;')

function slideHtml(s, plan, i, total, date) {
  const seed = Number(String(date).replace(/\D/g, '')) + i * 17
  const light = plan.type === 'yellowCard' || plan.type === 'lightSplit'
  const chrome = (dark = true) => `${dark ? '<div style="position:absolute;top:0;left:0;right:0;height:230px;background:linear-gradient(180deg,rgba(0,0,0,.7),rgba(0,0,0,0));z-index:4"></div>' : ''}
    <div class="hdr" style="color:${dark ? '#fff' : NAVY};opacity:1;top:36px;align-items:center"><img src="data:image/png;base64,${LOGO_B64}" style="height:56px;display:block;border-radius:6px"><span style="opacity:.75">MCINTELIGENCIA.COM</span></div>
    <div class="cnt">${i + 1}/${total}</div>
    <div class="ftr" style="color:${dark ? '#fff' : NAVY}"><span>@mcinteligencia</span><span>${i < total - 1 ? 'ARRASTA →' : ''}</span></div>`
  const src = s[4] ? `<div class="src">${esc(s[4])}</div>` : ''
  const title = esc(s[1]), body = esc(s[2] ?? '')
  const lines = (s[2] ?? '').split('\n').map((x) => x.trim()).filter(Boolean)
  const titleSize = (base) => (title.length > 55 ? base * 0.8 : title.length > 38 ? base * 0.9 : base)

  switch (plan.type) {
    case 'cover':
      return `<div class="s"><div class="abs art">${ph(date, i, plan.pos) ?? art(plan.scene, 1080, 1350, seed)}</div>
        <div class="abs" style="background:linear-gradient(180deg,rgba(8,8,10,0) 30%,rgba(8,8,10,.75) 58%,rgba(8,8,10,.97) 80%)"></div>
        ${chrome()}
        <div style="position:absolute;left:64px;right:64px;bottom:130px">
          ${s[3] ? `<div class="tag">${esc(s[3])}</div>` : ''}
          <div class="h y" style="font-size:${titleSize(104)}px">${title}</div>
          ${body ? `<div class="band">${body}</div>` : ''}
        </div></div>`
    case 'photoTop':
      return `<div class="s" style="background:#0a0a0a"><div style="position:absolute;top:0;left:0;right:0;height:720px" class="art">${ph(date, i, plan.pos) ?? art(plan.scene, 1080, 720, seed)}</div>
        <div style="position:absolute;top:420px;left:0;right:0;height:300px;background:linear-gradient(180deg,rgba(8,8,10,0),#0a0a0a)"></div>
        ${chrome()}
        <div style="position:absolute;left:64px;right:64px;top:${title.length > 50 ? 640 : 700}px">
          <div class="h y" style="font-size:${titleSize(74)}px">${title}</div>
          <div class="p" style="margin-top:30px;font-size:40px">${body}</div>${src}
        </div></div>`
    case 'arrowOver':
      return `<div class="s"><div class="abs art" style="opacity:.45">${ph(date, i, plan.pos) ?? art(plan.scene, 1080, 1350, seed)}</div>
        <div class="abs" style="background:rgba(8,8,10,.55)"></div>${chrome()}
        <div style="position:absolute;left:64px;right:64px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center">
          <div class="arrow">→</div>
          <div class="h" style="font-size:${titleSize(62)}px">${title}</div>
          <div class="p" style="margin-top:30px">${body}</div>${src}
        </div></div>`
    case 'yellowCard':
      return `<div class="s" style="background:${Y};color:${NAVY}">${chrome(false)}
        <div style="position:absolute;left:64px;right:64px;top:150px;bottom:130px;display:flex;flex-direction:column">
          <div class="h" style="font-size:${titleSize(66)}px;color:${NAVY}">${title}</div>
          <div class="card art" style="height:640px;margin-top:40px">${ph(date, i, plan.pos) ?? art(plan.scene, 952, 640, seed)}</div>
          <div class="p" style="margin-top:38px;font-weight:600;font-size:40px">${body}</div>
        </div></div>`
    case 'lightSplit':
      return `<div class="s" style="background:#F3F4F6;color:${NAVY}">${chrome(false)}
        <div style="position:absolute;left:64px;right:64px;top:170px"><div class="h" style="font-size:${titleSize(64)}px;color:${NAVY}">${title}</div></div>
        <div style="position:absolute;left:64px;width:440px;top:${title.length > 40 ? 420 : 380}px;font-size:40px" class="p">${body}${src}</div>
        <div class="card art" style="position:absolute;right:0;width:500px;top:${title.length > 40 ? 420 : 380}px;bottom:120px;border-radius:16px 0 0 16px">${ph(date, i, plan.pos) ?? art(plan.scene, 500, 800, seed)}</div>
        </div>`
    case 'number':
      return `<div class="s" style="background:#0a0a0a">${chrome()}
        <div style="position:absolute;left:64px;right:64px;top:170px">
          <div class="card art" style="height:520px;position:relative">${ph(date, i, plan.pos) ?? art(plan.scene, 952, 520, seed)}<div class="chip" style="position:absolute;left:24px;top:24px">${plan.n}</div></div>
          <div class="h y" style="font-size:${titleSize(58)}px;margin-top:44px">${title}</div><div style="width:120px;height:8px;background:${Y};margin-top:22px"></div>
          <div class="p" style="margin-top:28px">${body}</div>
        </div></div>`
    case 'list':
      return `<div class="s" style="background:#0a0a0a">${chrome()}
        <div class="card art" style="position:absolute;left:64px;right:64px;top:150px;height:380px">${ph(date, i, plan.pos) ?? art(plan.scene, 952, 380, seed)}</div>
        <div style="position:absolute;left:64px;right:64px;top:580px">
          <div class="h y" style="font-size:${titleSize(58)}px;margin-bottom:36px">${title}</div>
          ${lines.map((l) => `<div class="li"><i></i>${esc(l)}</div>`).join('')}${src}
        </div></div>`
    case 'listOver':
      return `<div class="s"><div class="abs art" style="opacity:.4">${ph(date, i, plan.pos) ?? art(plan.scene, 1080, 1350, seed)}</div>
        <div class="abs" style="background:linear-gradient(90deg,rgba(8,8,10,.85),rgba(8,8,10,.35))"></div>${chrome()}
        <div style="position:absolute;left:64px;right:64px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center">
          <div class="arrow">→</div>
          <div class="h y" style="font-size:${titleSize(62)}px;margin-bottom:40px">${title}</div>
          ${lines.map((l) => `<div class="li"><i></i>${esc(l)}</div>`).join('')}${src}
        </div></div>`
    case 'statement':
      return `<div class="s"><div class="abs art">${ph(date, i, plan.pos) ?? art(plan.scene, 1080, 1350, seed)}</div>
        <div class="abs" style="background:linear-gradient(180deg,rgba(8,8,10,.35),rgba(8,8,10,.85))"></div>${chrome()}
        <div style="position:absolute;left:64px;right:64px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center">
          <div class="h y" style="font-size:${titleSize(108)}px">${title}</div>
          ${body ? `<div class="p" style="margin-top:34px;font-size:42px">${body}</div>` : ''}${src}
        </div></div>`
    case 'cta':
      return `<div class="s" style="background:#000"><div class="abs art" style="opacity:.3">${ph(date, i, plan.pos) ?? art(plan.scene, 1080, 1350, seed)}</div>
        <div class="abs" style="background:radial-gradient(60% 50% at 50% 50%,rgba(0,0,0,.2),rgba(0,0,0,.85))"></div>${chrome()}
        <div style="position:absolute;left:90px;right:90px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center">
          <div style="font:600 54px/1.25 Inter">${title}</div>
          <div style="font:italic 800 48px/1.2 Geist;color:${Y};margin-top:44px">“${body}”</div>
          <div style="margin-top:110px;font:700 32px Inter;letter-spacing:.05em">MCINTELIGENCIA.COM</div>
          <div style="font:400 24px Inter;opacity:.7;margin-top:10px">CONSULTORIA | TREINAMENTO DE BI</div>
        </div></div>`
  }
  throw new Error('tipo desconhecido ' + plan.type)
}

// EXTRA=<arquivo.json> adiciona carrosséis fora do calendário (ex.: Radar semanal):
// { "<chave>": { "slides": [[layout, título, corpo, tag?, fonte?], ...], "plan": [{ "type": "cover", "scene": "chat" }, ...] } }
if (process.env.EXTRA) {
  const extra = JSON.parse(readFileSync(process.env.EXTRA, 'utf8'))
  for (const [k, v] of Object.entries(extra)) { CAROUSELS[k] = { slides: v.slides }; PLAN[k] = v.plan }
}
const out = process.argv[2] ?? 'out'
const dates = process.argv.slice(3).length ? process.argv.slice(3) : Object.keys(PLAN)
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } })
for (const date of dates) {
  const car = CAROUSELS[date], plan = PLAN[date]
  mkdirSync(`${out}/${date}`, { recursive: true })
  for (let i = 0; i < car.slides.length; i++) {
    await page.setContent(`<html><head><style>${CSS}</style></head><body>${slideHtml(car.slides[i], plan[i], i, car.slides.length, date)}</body></html>`)
    await page.evaluate(() => document.fonts.ready)
    await page.locator('.s').screenshot({ path: `${out}/${date}/${String(i + 1).padStart(2, '0')}.png` })
  }
  console.log('ok', date)
}
await browser.close()
