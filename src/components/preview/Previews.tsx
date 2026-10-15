import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Download, Heart, MessageCircle, Send, Bookmark, Play } from 'lucide-react'
import { toPng } from 'html-to-image'
import type { ContentItem, Frame } from '../../db/types'
import { BRAND, formatById } from '../../lib/constants'
import { useAssetUrl } from '../../lib/hooks'
import { SlideCanvas } from './SlideCanvas'

const PW = 340 // largura da mídia na prévia

function IgFrame({ children, caption, hashtags }: { children: ReactNode; caption: string; hashtags?: string }) {
  const [more, setMore] = useState(false)
  return (
    <div className="mx-auto w-[360px] overflow-hidden rounded-[28px] border-[10px] border-black bg-white shadow-xl">
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mci-blue text-[10px] font-bold text-mci-yellow">MC</div>
        <div className="text-[13px] font-semibold">mcinteligencia</div>
      </div>
      <div className="flex justify-center bg-black">{children}</div>
      <div className="flex items-center gap-3 px-3 pt-2 text-gray-800">
        <Heart size={20} /><MessageCircle size={20} /><Send size={20} /><Bookmark size={20} className="ml-auto" />
      </div>
      <div className="px-3 pb-4 pt-1 text-[12.5px] leading-snug">
        <span className="font-semibold">mcinteligencia </span>
        <span className="whitespace-pre-line">{more ? caption : caption.slice(0, 120)}</span>
        {caption.length > 120 && !more && <button className="text-gray-500" onClick={() => setMore(true)}>… mais</button>}
        {more && hashtags && <div className="mt-1 text-[#00376b]">{hashtags}</div>}
      </div>
    </div>
  )
}

export async function exportNode(node: HTMLElement, name: string) {
  const url = await toPng(node, { width: 1080, height: node.offsetHeight, pixelRatio: 1, style: { transform: 'none' } })
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
}

function CarouselPreview({ c }: { c: ContentItem }) {
  const [i, setI] = useState(0)
  const slides = c.body.slides
  const exportRefs = useRef<(HTMLDivElement | null)[]>([])
  const [busy, setBusy] = useState(false)
  if (!slides.length) return <Empty text="Nenhuma lâmina ainda. Adicione na aba Conteúdo." />
  const idx = Math.min(i, slides.length - 1)
  const exportAll = async () => {
    setBusy(true)
    try {
      for (let k = 0; k < slides.length; k++) {
        const n = exportRefs.current[k]
        if (n) await exportNode(n, `${c.scheduledAt}_${String(k + 1).padStart(2, '0')}.png`)
      }
    } finally { setBusy(false) }
  }
  return (
    <div>
      <IgFrame caption={c.body.caption} hashtags={c.body.hashtags}>
        <div className="relative">
          <SlideCanvas slide={slides[idx]} index={idx} total={slides.length} width={PW} />
          {idx > 0 && <button onClick={() => setI(idx - 1)} className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1"><ChevronLeft size={16} /></button>}
          {idx < slides.length - 1 && <button onClick={() => setI(idx + 1)} className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1"><ChevronRight size={16} /></button>}
        </div>
      </IgFrame>
      <div className="mt-2 flex justify-center gap-1">
        {slides.map((_, k) => <button key={k} onClick={() => setI(k)} className={`h-1.5 w-1.5 rounded-full ${k === idx ? 'bg-mci-light' : 'bg-gray-300'}`} />)}
      </div>
      <div className="mt-3 flex justify-center">
        <button className="btn-ghost text-xs" onClick={exportAll} disabled={busy}><Download size={14} /> {busy ? 'Gerando…' : 'Baixar lâminas (PNG 1080×1350)'}</button>
      </div>
      {/* nós em tamanho real, fora da tela, para exportação */}
      <div style={{ position: 'fixed', left: -99999, top: 0 }} aria-hidden>
        {slides.map((s, k) => (
          <SlideCanvas key={s.id} ref={(el) => { exportRefs.current[k] = el }} slide={s} index={k} total={slides.length} width={1080} exportMode />
        ))}
      </div>
    </div>
  )
}

// MC Cut no padrão fixo (docs-projeto/PADRAO-ARTES-MC.md): Inter 600, 33 px na arte 1080, branca, texto como digitado
// (sem caixa alta, sem destaque amarelo, sem tag), gradiente inferior e @mcinteligencia no frame 2.
const CUT_S = PW / 1080
function FrameImg({ f, h, handle }: { f: Frame; h: number; handle?: boolean }) {
  const url = useAssetUrl(f.assetId)
  const s = CUT_S
  return (
    <div style={{ height: h, position: 'relative', background: url ? '#111' : 'linear-gradient(135deg,#0b1a4a,#155DFC 60%,#0b1a4a)', overflow: 'hidden' }}>
      {url ? <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%' }} /> : (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white/60">frame do podcast pendente</div>
      )}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,rgba(0,0,0,0) 45%,rgba(0,0,0,.5) 100%)' }} />
      <div className="absolute text-center text-white" style={{
        left: 50 * s, right: 50 * s, bottom: 40 * s, fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 33 * s, lineHeight: 1.25,
        letterSpacing: '-0.005em', textWrap: 'balance',
        textShadow: `0 0 ${3 * s}px rgba(0,0,0,.95),0 ${2 * s}px ${6 * s}px rgba(0,0,0,.85),0 0 ${14 * s}px rgba(0,0,0,.6)`,
      } as CSSProperties}>
        {f.text}
      </div>
      {handle && <div className="absolute text-white" style={{ right: 32 * s, bottom: 18 * s, fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: Math.max(7, 18 * s), opacity: 0.7 }}>@mcinteligencia</div>}
    </div>
  )
}

function McCutPreview({ c }: { c: ContentItem }) {
  const h = (PW * 1350) / 1080
  return (
    <IgFrame caption={c.body.caption} hashtags={c.body.hashtags}>
      <div style={{ width: PW, height: h, background: BRAND.yellow }} className="flex flex-col" >
        {c.body.frames.slice(0, 2).map((f, k) => <div key={f.id} style={{ marginTop: k ? 10 * CUT_S : 0 }}><FrameImg f={f} h={(h - 10 * CUT_S) / 2} handle={k === 1} /></div>)}
      </div>
    </IgFrame>
  )
}

function ReelPreview({ c }: { c: ContentItem }) {
  const cover = useAssetUrl(c.body.cover.assetId)
  const w = 250
  const t = c.body.cover.title
  const hl = c.body.cover.highlight
  const i = hl ? t.toLowerCase().indexOf(hl.toLowerCase()) : -1
  return (
    <div className="space-y-4">
      <div className="mx-auto overflow-hidden rounded-[24px] border-[8px] border-black" style={{ width: w + 16 }}>
        <div style={{ width: w, height: (w * 16) / 9, position: 'relative', background: `linear-gradient(160deg, ${BRAND.blue}, ${BRAND.darkBlue})` }}>
          {cover && <img src={cover} className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute left-4 right-4 top-[38%] font-heading text-[26px] font-extrabold leading-[1.05] text-white">
            {i >= 0 ? <>{t.slice(0, i)}<span className="text-mci-yellow">{t.slice(i, i + hl.length)}</span>{t.slice(i + hl.length)}</> : t || 'Capa do Reel'}
          </div>
          <svg className="absolute bottom-10 left-4 right-4" viewBox="0 0 200 60" style={{ width: w - 32 }}>
            <polyline points="0,58 30,45 45,48 70,35 95,30 115,20 140,22 170,8" fill="none" stroke={BRAND.lightBlue} strokeWidth="3" />
            <circle cx="170" cy="8" r="4" fill={BRAND.yellow} />
          </svg>
          <Play className="absolute right-3 top-3 text-white/70" size={18} />
        </div>
      </div>
      <Script c={c} />
    </div>
  )
}

function Script({ c }: { c: ContentItem }) {
  if (!c.body.script.length) return <Empty text="Roteiro vazio." />
  return (
    <div className="card divide-y text-xs">
      {c.body.script.map((t) => (
        <div key={t.id} className="grid grid-cols-[52px_1fr] gap-2 p-2">
          <div className="font-mono text-gray-500">{t.time}</div>
          <div>
            <div>{t.speech}</div>
            {t.screenText && <div className="mt-1 inline-block rounded bg-mci-blue px-1.5 py-0.5 font-heading text-[10px] font-bold uppercase text-mci-yellow">{t.screenText}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

function YoutubePreview({ c }: { c: ContentItem }) {
  const cover = useAssetUrl(c.body.cover.assetId)
  return (
    <div className="mx-auto w-[360px] space-y-2">
      <div className="relative aspect-video overflow-hidden rounded-xl" style={{ background: `linear-gradient(135deg, ${BRAND.blue}, ${BRAND.darkBlue})` }}>
        {cover ? <img src={cover} className="h-full w-full object-cover" /> : <div className="absolute inset-0 flex items-center p-5 font-heading text-2xl font-extrabold uppercase text-mci-yellow">{c.body.cover.title || 'Thumbnail'}</div>}
      </div>
      <div className="flex gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mci-blue text-[10px] font-bold text-mci-yellow">MC</div>
        <div>
          <div className="text-sm font-semibold leading-tight">{c.body.videoTitle || c.title}</div>
          <div className="text-xs text-gray-500">MC Inteligência</div>
        </div>
      </div>
      <div className="whitespace-pre-line rounded-lg bg-gray-100 p-2 text-xs">{c.body.description || 'Descrição do vídeo'}</div>
      <Script c={c} />
    </div>
  )
}

function LinkedinPreview({ c }: { c: ContentItem }) {
  const s = c.body.slides[0]
  return (
    <div className="mx-auto w-[380px] rounded-lg border bg-white shadow">
      <div className="flex gap-2 p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded bg-mci-blue text-[10px] font-bold text-mci-yellow">MC</div>
        <div><div className="text-sm font-semibold">MC Inteligência</div><div className="text-[11px] text-gray-500">Consultoria e Treinamento de BI</div></div>
      </div>
      <div className="whitespace-pre-line px-3 pb-3 text-[13px]">{c.body.caption || 'Texto do post'}</div>
      {s && <SlideCanvas slide={s} index={0} total={c.body.slides.length} width={378} />}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">{text}</div>
}

export function ContentPreview({ c }: { c: ContentItem }) {
  const f = formatById(c.format)
  if (c.format === 'ig_mc_cut') return <McCutPreview c={c} />
  if (c.format === 'yt_video') return <YoutubePreview c={c} />
  if (f.kind === 'video') return <ReelPreview c={c} />
  if (c.format === 'li_post' || c.format === 'li_documento') return <LinkedinPreview c={c} />
  return <CarouselPreview c={c} />
}
