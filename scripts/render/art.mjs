// Gerador de imagens de apoio (SVG) na paleta MC 2026.
// Cenas abstratas "cinematográficas": fundo azul-noite, luz lateral, glow amarelo/azul, grão.
const B = { navy: '#162456', dark: '#091134', black: '#03050d', yellow: '#FDC700', blue: '#155DFC', sky: '#5B8CFF' }

function rng(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const defs = (id) => `
<defs>
  <radialGradient id="bg${id}" cx="75%" cy="15%" r="95%">
    <stop offset="0" stop-color="${B.navy}"/><stop offset=".5" stop-color="${B.dark}"/><stop offset="1" stop-color="${B.black}"/>
  </radialGradient>
  <linearGradient id="barB${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${B.sky}"/><stop offset="1" stop-color="${B.blue}" stop-opacity=".15"/></linearGradient>
  <linearGradient id="barY${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${B.yellow}"/><stop offset="1" stop-color="${B.yellow}" stop-opacity=".1"/></linearGradient>
  <filter id="glow${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="soft${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>
  <filter id="blur${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="grain${id}"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .09"/></feComponentTransfer></filter>
</defs>`

const base = (id, w, h) => `<rect width="${w}" height="${h}" fill="url(#bg${id})"/>`
const grain = (id, w, h) => `<rect width="${w}" height="${h}" filter="url(#grain${id})"/>`
const vignette = (w, h) => `<rect width="${w}" height="${h}" fill="url(#vig)"/>`

function bokeh(r, w, h, id, n = 10) {
  let s = ''
  for (let i = 0; i < n; i++) {
    const c = r() < 0.3 ? B.yellow : B.sky
    s += `<circle cx="${r() * w}" cy="${r() * h}" r="${10 + r() * 50}" fill="${c}" opacity="${0.06 + r() * 0.14}" filter="url(#blur${id})"/>`
  }
  return s
}

function lightLeak(w, h, id, color = B.yellow, x = 0.85, y = 0.1, rad = 0.35, op = 0.35) {
  return `<ellipse cx="${w * x}" cy="${h * y}" rx="${w * rad}" ry="${h * rad * 0.8}" fill="${color}" opacity="${op}" filter="url(#soft${id})"/>`
}

// ---------- cenas ----------
const scenes = {
  dashboard(r, w, h, id) {
    // monitor em perspectiva com barras + linha
    const sx = w * 0.12, sy = h * 0.18, sw = w * 0.8, sh = h * 0.62
    let bars = ''
    const n = 9
    for (let i = 0; i < n; i++) {
      const bh = sh * (0.18 + r() * 0.55)
      const bx = sx + 40 + i * ((sw - 80) / n)
      bars += `<rect x="${bx}" y="${sy + sh - 30 - bh}" width="${(sw - 80) / n - 18}" height="${bh}" rx="6" fill="url(#bar${i === 6 ? 'Y' : 'B'}${id})" opacity="${i === 6 ? 0.95 : 0.7}"/>`
    }
    let pts = []
    for (let i = 0; i <= 10; i++) pts.push([sx + 40 + i * ((sw - 80) / 10), sy + sh * (0.55 - i * 0.035 - r() * 0.12)])
    const line = pts.map((p) => p.join(',')).join(' ')
    const last = pts.at(-1)
    let grid = ''
    for (let i = 1; i < 6; i++) grid += `<line x1="${sx}" x2="${sx + sw}" y1="${sy + (sh / 6) * i}" y2="${sy + (sh / 6) * i}" stroke="#fff" stroke-opacity=".06"/>`
    return `${lightLeak(w, h, id, B.blue, 0.2, 0.3, 0.5, 0.35)}
      <g transform="translate(${w * 0.04},0) skewY(-4)">
        <rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="22" fill="#0b1640" stroke="${B.sky}" stroke-opacity=".35" stroke-width="2"/>
        ${grid}${bars}
        <polyline points="${line}" fill="none" stroke="${B.yellow}" stroke-width="6" filter="url(#glow${id})" stroke-linejoin="round"/>
        <circle cx="${last[0]}" cy="${last[1]}" r="12" fill="${B.yellow}" filter="url(#glow${id})"/>
      </g>${bokeh(r, w, h, id, 8)}`
  },
  chat(r, w, h, id) {
    let s = lightLeak(w, h, id, B.blue, 0.8, 0.2, 0.45, 0.4)
    // tela de fundo com dashboard fantasma
    s += `<rect x="${w * 0.08}" y="${h * 0.1}" width="${w * 0.84}" height="${h * 0.8}" rx="26" fill="#0a1236" stroke="${B.sky}" stroke-opacity=".25" stroke-width="2"/>`
    for (let i = 0; i < 7; i++) s += `<rect x="${w * 0.14 + i * w * 0.05}" y="${h * 0.62 - (i % 3) * 40 - r() * 80}" width="${w * 0.03}" height="${h * 0.22}" rx="4" fill="${B.blue}" opacity=".18"/>`
    // bolhas
    const bubbles = [
      [0.52, 0.18, 0.34, 0.09, B.blue, 0.95],
      [0.14, 0.32, 0.46, 0.13, '#1b2a66', 1],
      [0.46, 0.5, 0.4, 0.09, B.blue, 0.95],
      [0.14, 0.64, 0.52, 0.16, '#1b2a66', 1],
    ]
    for (const [x, y, bw, bh, c, o] of bubbles) {
      s += `<rect x="${w * x}" y="${h * y}" width="${w * bw}" height="${h * bh}" rx="${h * 0.035}" fill="${c}" opacity="${o}"/>`
      const lines = Math.max(1, Math.floor((h * bh) / 38) - 1)
      for (let l = 0; l < lines; l++) s += `<rect x="${w * x + 28}" y="${h * y + 26 + l * 34}" width="${w * bw * (0.55 + r() * 0.35)}" height="12" rx="6" fill="#fff" opacity=".35"/>`
    }
    s += `<g filter="url(#glow${id})">${[0, 1, 2].map((i) => `<circle cx="${w * 0.2 + i * 34}" cy="${h * 0.86}" r="9" fill="${B.yellow}" opacity="${1 - i * 0.25}"/>`).join('')}</g>`
    return s + bokeh(r, w, h, id, 6)
  },
  network(r, w, h, id) {
    const nodes = Array.from({ length: 26 }, () => [w * (0.08 + r() * 0.84), h * (0.1 + r() * 0.8)])
    const hub = [w * 0.5, h * 0.48]
    let s = lightLeak(w, h, id, B.blue, 0.5, 0.45, 0.4, 0.35)
    for (let i = 0; i < nodes.length; i++) {
      const [x, y] = nodes[i]
      s += `<line x1="${hub[0]}" y1="${hub[1]}" x2="${x}" y2="${y}" stroke="${B.sky}" stroke-opacity="${0.12 + r() * 0.2}" stroke-width="2"/>`
      const j = Math.floor(r() * nodes.length)
      s += `<line x1="${x}" y1="${y}" x2="${nodes[j][0]}" y2="${nodes[j][1]}" stroke="${B.sky}" stroke-opacity=".1" stroke-width="1.5"/>`
    }
    for (let i = 0; i < nodes.length; i++) {
      const hi = i % 7 === 0
      s += `<circle cx="${nodes[i][0]}" cy="${nodes[i][1]}" r="${hi ? 10 : 5 + r() * 5}" fill="${hi ? B.yellow : B.sky}" ${hi ? `filter="url(#glow${id})"` : 'opacity=".8"'}/>`
    }
    s += `<circle cx="${hub[0]}" cy="${hub[1]}" r="70" fill="none" stroke="${B.yellow}" stroke-width="3" opacity=".6"/>
      <circle cx="${hub[0]}" cy="${hub[1]}" r="34" fill="${B.yellow}" filter="url(#glow${id})"/>`
    return s + bokeh(r, w, h, id, 6)
  },
  clock(r, w, h, id) {
    const cx = w * 0.62, cy = h * 0.46, R = Math.min(w, h) * 0.36
    let s = lightLeak(w, h, id, B.yellow, 0.2, 0.9, 0.3, 0.18) + lightLeak(w, h, id, B.blue, 0.7, 0.3, 0.45, 0.35)
    for (let k = 0; k < 4; k++) s += `<circle cx="${cx}" cy="${cy}" r="${R - k * 46}" fill="none" stroke="${B.sky}" stroke-opacity="${0.12 + k * 0.05}" stroke-width="${2 + k}"/>`
    for (let t = 0; t < 60; t++) {
      const a = (t / 60) * Math.PI * 2, l = t % 5 === 0 ? 28 : 12
      s += `<line x1="${cx + Math.cos(a) * R}" y1="${cy + Math.sin(a) * R}" x2="${cx + Math.cos(a) * (R - l)}" y2="${cy + Math.sin(a) * (R - l)}" stroke="#fff" stroke-opacity="${t % 5 === 0 ? 0.5 : 0.2}" stroke-width="3"/>`
    }
    const arc = (rad, a0, a1) => {
      const p = (a) => [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]
      const [x0, y0] = p(a0), [x1, y1] = p(a1)
      return `M${x0},${y0} A${rad},${rad} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1},${y1}`
    }
    s += `<path d="${arc(R - 46, -Math.PI / 2, Math.PI * 0.15)}" fill="none" stroke="${B.yellow}" stroke-width="14" stroke-linecap="round" filter="url(#glow${id})"/>`
    s += `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - R * 0.6}" stroke="#fff" stroke-width="10" stroke-linecap="round"/>
      <line x1="${cx}" y1="${cy}" x2="${cx + R * 0.45}" y2="${cy + R * 0.15}" stroke="${B.yellow}" stroke-width="8" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="14" fill="${B.yellow}"/>`
    return s + bokeh(r, w, h, id, 8)
  },
  layers(r, w, h, id) {
    let s = lightLeak(w, h, id, B.blue, 0.5, 0.2, 0.5, 0.35)
    const cx = w * 0.5, top = h * 0.2, pw = w * 0.34, ph = h * 0.11
    const cols = [B.sky, B.blue, B.yellow]
    for (let i = 2; i >= 0; i--) {
      const y = top + i * h * 0.19
      const pts = `${cx},${y} ${cx + pw},${y + ph} ${cx},${y + ph * 2} ${cx - pw},${y + ph}`
      s += `<polygon points="${pts}" fill="${cols[i]}" fill-opacity="${i === 2 ? 0.22 : 0.14}" stroke="${cols[i]}" stroke-width="3" ${i === 2 ? `filter="url(#glow${id})"` : ''}/>`
      for (let g = 1; g < 4; g++) s += `<line x1="${cx - pw + (pw / 4) * g}" y1="${y + ph + (ph / 4) * g}" x2="${cx + (pw / 4) * g}" y2="${y + (ph / 4) * g}" stroke="${cols[i]}" stroke-opacity=".25"/>`
    }
    return s + bokeh(r, w, h, id, 8)
  },
  paths(r, w, h, id) {
    const hx = w * 0.5, hy = h * 0.32
    let s = `<rect y="${hy}" width="${w}" height="${h - hy}" fill="#050a22"/>` + lightLeak(w, h, id, B.blue, 0.5, 0.3, 0.5, 0.45)
    for (let i = -8; i <= 8; i++) s += `<line x1="${hx}" y1="${hy}" x2="${hx + i * w * 0.18}" y2="${h}" stroke="#fff" stroke-opacity=".05"/>`
    for (let k = 1; k < 10; k++) { const y = hy + (h - hy) * Math.pow(k / 10, 2); s += `<line x1="0" x2="${w}" y1="${y}" y2="${y}" stroke="#fff" stroke-opacity=".04"/>` }
    const lane = (dx, c, wd, op) => `<polygon points="${hx - 6},${hy} ${hx + 6},${hy} ${hx + dx + wd},${h} ${hx + dx - wd},${h}" fill="${c}" opacity="${op}" filter="url(#glow${id})"/>`
    s += lane(-w * 0.62, B.sky, 60, 0.45) + lane(w * 0.62, B.sky, 60, 0.45) + lane(0, B.yellow, 90, 0.9)
    s += `<circle cx="${hx}" cy="${hy}" r="60" fill="#fff" opacity=".5" filter="url(#soft${id})"/>`
    return s
  },
  beam(r, w, h, id) {
    let s = `<rect width="${w}" height="${h}" fill="#04060f"/>`
    s += `<g transform="rotate(${-58 + r() * 10} ${w / 2} ${h / 2})">
      <rect x="${w * 0.46}" y="${-h}" width="${w * 0.1}" height="${h * 3}" fill="${B.yellow}" opacity=".35" filter="url(#soft${id})"/>
      <rect x="${w * 0.495}" y="${-h}" width="10" height="${h * 3}" fill="#fff4c2" filter="url(#glow${id})"/>
    </g>`
    s += `<g transform="rotate(12 ${w / 2} ${h / 2})"><rect x="${w * 0.52}" y="${-h}" width="6" height="${h * 3}" fill="${B.yellow}" opacity=".8" filter="url(#glow${id})"/></g>`
    return s + bokeh(r, w, h, id, 5)
  },
  checklist(r, w, h, id) {
    let s = lightLeak(w, h, id, B.blue, 0.3, 0.3, 0.5, 0.35)
    const x = w * 0.18
    for (let i = 0; i < 5; i++) {
      const y = h * 0.14 + i * h * 0.16, done = i < 3
      s += `<rect x="${x}" y="${y}" width="${h * 0.09}" height="${h * 0.09}" rx="12" fill="${done ? B.yellow : 'none'}" stroke="${done ? B.yellow : B.sky}" stroke-width="4" ${done ? `filter="url(#glow${id})"` : 'stroke-opacity=".6"'}/>`
      if (done) s += `<path d="M${x + h * 0.02},${y + h * 0.047} l${h * 0.02},${h * 0.02} l${h * 0.035},-${h * 0.04}" fill="none" stroke="${B.dark}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`
      s += `<rect x="${x + h * 0.14}" y="${y + h * 0.025}" width="${w * (0.35 + r() * 0.25)}" height="${h * 0.04}" rx="${h * 0.02}" fill="#fff" opacity="${done ? 0.5 : 0.18}"/>`
    }
    return s + bokeh(r, w, h, id, 6)
  },
  semantic(r, w, h, id) {
    let s = lightLeak(w, h, id, B.blue, 0.5, 0.5, 0.45, 0.35)
    const box = (x, y, bw, bh, hl) => {
      let t = `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="14" fill="#0c1848" stroke="${hl ? B.yellow : B.sky}" stroke-width="${hl ? 4 : 2}" ${hl ? `filter="url(#glow${id})"` : 'stroke-opacity=".6"'}/>`
      t += `<rect x="${x}" y="${y}" width="${bw}" height="${bh * 0.22}" rx="14" fill="${hl ? B.yellow : B.blue}" opacity="${hl ? 0.9 : 0.6}"/>`
      for (let k = 0; k < 3; k++) t += `<rect x="${x + 20}" y="${y + bh * 0.34 + k * bh * 0.19}" width="${bw * (0.4 + r() * 0.4)}" height="10" rx="5" fill="#fff" opacity=".3"/>`
      return t
    }
    const cx = w * 0.5, cy = h * 0.5, bw = w * 0.26, bh = h * 0.2
    const sats = [[0.12, 0.1], [0.62, 0.1], [0.12, 0.7], [0.62, 0.7]]
    for (const [x, y] of sats) s += `<line x1="${cx}" y1="${cy}" x2="${w * x + bw / 2}" y2="${h * y + bh / 2}" stroke="${B.sky}" stroke-opacity=".5" stroke-width="3" stroke-dasharray="10 8"/>`
    for (const [x, y] of sats) s += box(w * x, h * y, bw, bh, false)
    s += box(cx - bw / 2, cy - bh / 2, bw, bh, true)
    return s
  },
  flow(r, w, h, id) {
    let s = lightLeak(w, h, id, B.blue, 0.5, 0.5, 0.5, 0.35)
    const n = 4, y = h * 0.5, bw = w * 0.16, gap = (w * 0.84 - n * bw) / (n - 1)
    for (let i = 0; i < n; i++) {
      const x = w * 0.08 + i * (bw + gap)
      if (i < n - 1) {
        s += `<line x1="${x + bw}" y1="${y}" x2="${x + bw + gap - 14}" y2="${y}" stroke="${B.sky}" stroke-width="4" stroke-opacity=".6"/>
          <polygon points="${x + bw + gap - 14},${y - 10} ${x + bw + gap},${y} ${x + bw + gap - 14},${y + 10}" fill="${B.sky}"/>
          <circle cx="${x + bw + gap * 0.5}" cy="${y}" r="9" fill="${B.yellow}" filter="url(#glow${id})"/>`
      }
      s += `<rect x="${x}" y="${y - bw / 2}" width="${bw}" height="${bw}" rx="22" fill="#0c1848" stroke="${i === n - 1 ? B.yellow : B.sky}" stroke-width="3"/>
        <circle cx="${x + bw / 2}" cy="${y}" r="${bw * 0.18}" fill="${i === n - 1 ? B.yellow : B.blue}" opacity=".9"/>`
    }
    return s + bokeh(r, w, h, id, 6)
  },
}

let counter = 0
/** Retorna um SVG completo (string) da cena pedida. */
export function art(scene, w, h, seed = 1) {
  const id = `a${counter++}`
  const r = rng(seed * 9973 + scene.length * 131)
  const body = scenes[scene](r, w, h, id)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">${defs(id)}${base(id, w, h)}${body}${grain(id, w, h)}</svg>`
}
export const SCENES = Object.keys(scenes)
