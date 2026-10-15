// Capas de Reel (1080×1920) e Reel de prints (MP4) a partir de frames verticais.
// Uso: node --experimental-strip-types scripts/render/reel.mjs <saida> <selDir>
import { readFileSync, mkdirSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { chromium } from 'playwright-core'
import { REELS } from '../../src/db/seed-data.ts'

const Y = '#FDC700'
const font = (p) => readFileSync(new URL(`../../node_modules/${p}`, import.meta.url)).toString('base64')
const CSS = `
@font-face{font-family:Geist;font-weight:100 900;src:url(data:font/woff2;base64,${font('@fontsource-variable/geist/files/geist-latin-wght-normal.woff2')}) format('woff2')}
@font-face{font-family:Inter;font-weight:100 900;src:url(data:font/woff2;base64,${font('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')}) format('woff2')}
*{margin:0;padding:0;box-sizing:border-box}
.s{width:1080px;height:1920px;position:relative;overflow:hidden;background:#0a0a0a;font-family:Inter;color:#fff}
.s img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.g{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.82) 0%,rgba(0,0,0,.35) 32%,rgba(0,0,0,0) 50%,rgba(0,0,0,.2) 70%,rgba(0,0,0,.85) 100%)}
.t{position:absolute;left:70px;right:70px;top:260px;font:800 104px/1.0 Geist;text-transform:uppercase;letter-spacing:-.02em;text-shadow:0 4px 20px rgba(0,0,0,.6)}
.t b{color:${Y}}
.brand{position:absolute;left:70px;top:150px;font:700 26px Inter;letter-spacing:.14em;color:${Y}}
.line{position:absolute;left:70px;top:210px;width:120px;height:8px;background:${Y}}
.sub{position:absolute;left:70px;right:70px;bottom:330px;text-align:center;font:600 46px/1.3 Inter;text-shadow:0 3px 14px rgba(0,0,0,.9)}
.big{position:absolute;left:70px;right:70px;top:300px;font:800 92px/1.02 Geist;text-transform:uppercase;letter-spacing:-.02em;text-shadow:0 4px 20px rgba(0,0,0,.6)}
.big b{color:${Y}}
.hd{position:absolute;left:0;right:0;bottom:230px;text-align:center;font:600 26px Inter;opacity:.75}
`
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const hl = (t, w) => {
  if (!w) return esc(t)
  const i = t.toLowerCase().indexOf(w.toLowerCase())
  return i < 0 ? esc(t) : `${esc(t.slice(0, i))}<b>${esc(t.slice(i, i + w.length))}</b>${esc(t.slice(i + w.length))}`
}

// capas dos Reels do Leonardo (frame vertical escolhido)
export const COVERS = {
  '2026-09-30': ['3 habilidades para combinar com IA', 'IA', 'v_9618_2'],
  '2026-10-07': ['3 níveis de uso de IA', 'níveis', 'v_9621_15'],
  '2026-10-28': ['Você provavelmente não precisa de um agente', 'agente', 'v_9620b_18'],
  '2026-11-04': ['O que um júnior não deveria delegar à IA', 'não deveria', 'v_9615_10'],
  '2026-11-18': ['Caso de uso de IA com ROI em 60 segundos', 'ROI', 'v_9615b_16'],
  '2026-12-09': ['Construí uma solução com IA sem escrever tudo', 'sem escrever tudo', 'v_9620_13'],
  '2026-12-16': ['Fazer, delegar, automatizar ou eliminar', 'eliminar', 'v_9614_2'],
  '2026-10-01': ['Gerou um HTML no Claude? Faça isso', 'HTML', 'v_9621_11'],
}
// Reel de prints: frames por take
export const REEL_PRINTS = {
  '2026-09-30': { frames: ['v_9618_2', 'v_9618_3', 'v_9618_6', 'v_9618_9', 'v_9618_12'], secs: [4, 6, 6, 6, 6] },
  '2026-10-07': { frames: ['v_9621_15', 'v_9621_3', 'v_9621_6', 'v_9621_11', 'v_9621_15'], secs: [4, 6, 6, 6, 5] },
}

const out = process.argv[2] ?? 'out'
const sel = process.argv[3] ?? 'sel'
const img = (n) => `<img src="data:image/jpeg;base64,${readFileSync(`${sel}/${n}.jpg`).toString('base64')}">`
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await b.newPage({ viewport: { width: 1080, height: 1920 } })
const shot = async (html, path) => {
  await page.setContent(`<html><head><style>${CSS}</style></head><body><div class="s">${html}</div></body></html>`)
  await page.evaluate(() => document.fonts.ready)
  await page.locator('.s').screenshot({ path })
}
for (const [date, [title, h, frame]] of Object.entries(COVERS)) {
  mkdirSync(`${out}/${date}`, { recursive: true })
  await shot(`${img(frame)}<div class="g"></div><div class="brand">MC INTELIGÊNCIA</div><div class="line"></div><div class="t">${hl(title, h)}</div><div class="hd">@mcinteligencia</div>`, `${out}/${date}/reel-capa.png`)
  console.log('capa', date)
}
for (const [date, cfg] of Object.entries(process.env.ONLY_COVERS ? {} : REEL_PRINTS)) {
  const r = REELS[date]
  const tmp = `${out}/${date}/_seg`
  mkdirSync(tmp, { recursive: true })
  const parts = []
  for (let k = 0; k < r.takes.length; k++) {
    const [, speech, screen] = r.takes[k]
    const p = `${tmp}/${k}.png`
    const head = k === 0 ? `<div class="big">${hl(r.cover[0], r.cover[1])}</div>` : `<div class="big">${esc(screen)}</div>`
    await shot(`${img(cfg.frames[k])}<div class="g"></div><div class="brand">MC INTELIGÊNCIA</div><div class="line"></div>${head}<div class="sub">${esc(speech)}</div><div class="hd">@mcinteligencia</div>`, p)
    parts.push([p, cfg.secs[k]])
  }
  // cada take: zoom lento; depois concatena
  const segs = []
  for (let k = 0; k < parts.length; k++) {
    const [p, s] = parts[k]
    const seg = `${tmp}/${k}.mp4`
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-loop', '1', '-i', p, '-t', String(s), '-vf',
      `scale=1188:2112,zoompan=z='min(zoom+0.0006,1.06)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${s * 30}:s=1080x1920:fps=30,format=yuv420p`,
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', seg])
    segs.push(seg)
  }
  const list = `${tmp}/list.txt`
  execFileSync('bash', ['-c', `printf "file '%s'\\n" ${segs.map((s) => `"${s}"`).join(' ')} > "${list}"`])
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', `${out}/${date}/reel-prints.mp4`])
  execFileSync('rm', ['-rf', tmp])
  console.log('reel', date)
}
await b.close()
