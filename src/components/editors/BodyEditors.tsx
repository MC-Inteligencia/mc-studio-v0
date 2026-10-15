import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2, X } from 'lucide-react'
import type { ContentBody, ContentItem, Slide } from '../../db/types'
import { LAYOUTS, formatById, uid } from '../../lib/constants'
import { addAsset } from '../../db/repo'
import { useAssetUrl } from '../../lib/hooks'

type Props = { c: ContentItem; body: ContentBody; onChange: (b: ContentBody) => void }

function move<T>(arr: T[], i: number, d: number) {
  const a = [...arr]
  const j = i + d
  if (j < 0 || j >= a.length) return a
  ;[a[i], a[j]] = [a[j], a[i]]
  return a
}

export function ImagePick({ assetId, contentId, onPick, label }: { assetId?: string; contentId: string; onPick: (id?: string) => void; label: string }) {
  const url = useAssetUrl(assetId)
  return (
    <div className="flex items-center gap-2">
      {url ? (
        <div className="relative">
          <img src={url} className="h-12 w-12 rounded object-cover" />
          <button onClick={() => onPick(undefined)} className="absolute -right-1.5 -top-1.5 rounded-full bg-white p-0.5 shadow" title="Remover"><X size={10} /></button>
        </div>
      ) : null}
      <label className="btn-ghost cursor-pointer border border-dashed border-gray-300 text-xs">
        <ImagePlus size={14} /> {label}
        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
          const f = e.target.files?.[0]
          if (f) onPick(await addAsset(f, f.name, contentId))
          e.target.value = ''
        }} />
      </label>
    </div>
  )
}

function Common({ body, onChange, captionLabel = 'Legenda' }: { body: ContentBody; onChange: (b: ContentBody) => void; captionLabel?: string }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="label">{captionLabel} <span className="text-gray-400">({body.caption.length} caracteres)</span></label>
        <textarea className="field min-h-28" value={body.caption} onChange={(e) => onChange({ ...body, caption: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">CTA</label><input className="field" value={body.cta} onChange={(e) => onChange({ ...body, cta: e.target.value })} /></div>
        <div><label className="label">Hashtags</label><input className="field" value={body.hashtags} onChange={(e) => onChange({ ...body, hashtags: e.target.value })} /></div>
      </div>
      <div>
        <label className="label">Link externo (ex.: CarrosseIA, Drive, Canva)</label>
        <div className="flex gap-2">
          <input className="field" value={body.externalLink ?? ''} onChange={(e) => onChange({ ...body, externalLink: e.target.value })} placeholder="https://" />
          {body.externalLink && <a className="btn-ghost shrink-0" href={body.externalLink} target="_blank" rel="noreferrer">Abrir</a>}
        </div>
      </div>
    </div>
  )
}

function SlidesEditor({ c, body, onChange, captionLabel }: Props & { captionLabel?: string }) {
  const f = formatById(c.format)
  const set = (i: number, patch: Partial<Slide>) => onChange({ ...body, slides: body.slides.map((s, k) => (k === i ? { ...s, ...patch } : s)) })
  const words = (s: Slide) => `${s.title} ${s.body}`.split(/\s+/).filter(Boolean).length
  return (
    <div className="space-y-4">
      {body.slides.map((s, i) => (
        <div key={s.id} className="card p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-mci-blue text-xs font-bold text-mci-yellow">{i + 1}</span>
            <select className="field w-40 py-1" value={s.layout} onChange={(e) => set(i, { layout: e.target.value as Slide['layout'] })}>
              {LAYOUTS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <select className="field w-28 py-1" value={s.variant ?? 'dark'} onChange={(e) => set(i, { variant: e.target.value as Slide['variant'] })}>
              <option value="dark">Escuro</option><option value="yellow">Amarelo</option><option value="light">Claro</option>
            </select>
            <span className={`ml-2 text-[11px] ${words(s) > 45 ? 'font-semibold text-orange-600' : 'text-gray-400'}`}>{words(s)} palavras</span>
            <div className="ml-auto flex">
              <button className="btn-ghost px-1.5" onClick={() => onChange({ ...body, slides: move(body.slides, i, -1) })}><ArrowUp size={14} /></button>
              <button className="btn-ghost px-1.5" onClick={() => onChange({ ...body, slides: move(body.slides, i, 1) })}><ArrowDown size={14} /></button>
              <button className="btn-danger px-1.5" onClick={() => onChange({ ...body, slides: body.slides.filter((_, k) => k !== i) })}><Trash2 size={14} /></button>
            </div>
          </div>
          <div className="grid gap-2">
            {s.layout === 'A' && <input className="field" placeholder="Tag (ex.: CARREIRA + IA)" value={s.tag ?? ''} onChange={(e) => set(i, { tag: e.target.value })} />}
            <input className="field font-semibold" placeholder="Título" value={s.title} onChange={(e) => set(i, { title: e.target.value })} />
            <textarea className="field min-h-16" placeholder={s.layout === 'C' ? 'Um item por linha' : s.layout === 'D' ? 'valor | rótulo (um por linha)' : 'Texto de apoio'} value={s.body} onChange={(e) => set(i, { body: e.target.value })} />
            <input className="field text-xs" placeholder="Fonte (rodapé)" value={s.sourceNote ?? ''} onChange={(e) => set(i, { sourceNote: e.target.value })} />
            <div className="flex flex-wrap gap-3">
              <ImagePick contentId={c.id} assetId={s.imageAssetId} label="Imagem de apoio" onPick={(id) => set(i, { imageAssetId: id })} />
              <ImagePick contentId={c.id} assetId={s.assetId} label="Arte final (PNG)" onPick={(id) => set(i, { assetId: id })} />
            </div>
          </div>
        </div>
      ))}
      <button
        className="btn-ghost w-full justify-center border border-dashed border-gray-300"
        disabled={!!f.maxSlides && body.slides.length >= f.maxSlides}
        onClick={() => onChange({ ...body, slides: [...body.slides, { id: uid(), layout: body.slides.length ? 'B' : 'A', title: '', body: '' }] })}
      >
        <Plus size={14} /> Adicionar lâmina {f.maxSlides ? `(${body.slides.length}/${f.maxSlides})` : ''}
      </button>
      <Common body={body} onChange={onChange} captionLabel={captionLabel} />
    </div>
  )
}

function VideoEditor({ c, body, onChange }: Props) {
  const setTake = (i: number, patch: object) => onChange({ ...body, script: body.script.map((t, k) => (k === i ? { ...t, ...patch } : t)) })
  return (
    <div className="space-y-4">
      <div className="card space-y-2 p-3">
        <div className="text-xs font-semibold text-gray-500">{c.format === 'yt_video' ? 'THUMBNAIL' : 'CAPA'}</div>
        <div className="grid grid-cols-[1fr_160px] gap-2">
          <input className="field" placeholder="Título da capa" value={body.cover.title} onChange={(e) => onChange({ ...body, cover: { ...body.cover, title: e.target.value } })} />
          <input className="field" placeholder="Palavra em amarelo" value={body.cover.highlight} onChange={(e) => onChange({ ...body, cover: { ...body.cover, highlight: e.target.value } })} />
        </div>
        <ImagePick contentId={c.id} assetId={body.cover.assetId} label="Imagem da capa" onPick={(id) => onChange({ ...body, cover: { ...body.cover, assetId: id } })} />
      </div>
      {c.format === 'yt_video' && (
        <div className="card space-y-2 p-3">
          <input className="field font-semibold" placeholder="Título do vídeo (≤ 70)" value={body.videoTitle} onChange={(e) => onChange({ ...body, videoTitle: e.target.value })} />
          <textarea className="field min-h-24" placeholder="Descrição" value={body.description} onChange={(e) => onChange({ ...body, description: e.target.value })} />
        </div>
      )}
      <div className="card p-3">
        <div className="mb-2 text-xs font-semibold text-gray-500">ROTEIRO</div>
        {body.script.map((t, i) => (
          <div key={t.id} className="mb-2 grid grid-cols-[70px_1fr_150px_28px] gap-2">
            <input className="field px-2 font-mono text-xs" value={t.time} onChange={(e) => setTake(i, { time: e.target.value })} placeholder="0–5s" />
            <textarea className="field min-h-14 text-sm" value={t.speech} onChange={(e) => setTake(i, { speech: e.target.value })} placeholder="Fala" />
            <textarea className="field min-h-14 text-xs" value={t.screenText} onChange={(e) => setTake(i, { screenText: e.target.value })} placeholder="Texto na tela" />
            <button className="btn-danger px-1" onClick={() => onChange({ ...body, script: body.script.filter((_, k) => k !== i) })}><Trash2 size={14} /></button>
          </div>
        ))}
        <button className="btn-ghost text-xs" onClick={() => onChange({ ...body, script: [...body.script, { id: uid(), time: '', speech: '', screenText: '' }] })}><Plus size={14} /> Take</button>
      </div>
      <Common body={body} onChange={onChange} />
    </div>
  )
}

function FramesEditor({ c, body, onChange }: Props) {
  const set = (i: number, patch: object) => onChange({ ...body, frames: body.frames.map((f, k) => (k === i ? { ...f, ...patch } : f)) })
  return (
    <div className="space-y-4">
      {body.frames.map((f, i) => (
        <div key={f.id} className="card space-y-2 p-3">
          <div className="text-xs font-semibold text-gray-500">FRAME {i + 1} {i === 0 ? '· tensão' : '· conclusão'}</div>
          <input className="field font-semibold uppercase" value={f.text} onChange={(e) => set(i, { text: e.target.value })} placeholder="Texto" />
          <input className="field" value={f.highlight} onChange={(e) => set(i, { highlight: e.target.value })} placeholder="Palavra em amarelo" />
          <ImagePick contentId={c.id} assetId={f.assetId} label="Frame do podcast" onPick={(id) => set(i, { assetId: id })} />
        </div>
      ))}
      <Common body={body} onChange={onChange} />
    </div>
  )
}

export function BodyEditor(p: Props) {
  const f = formatById(p.c.format)
  if (p.c.format === 'ig_mc_cut') return <FramesEditor {...p} />
  if (f.kind === 'video') return <VideoEditor {...p} />
  if (p.c.format === 'li_post') {
    return <SlidesEditor {...p} captionLabel="Texto do post" />
  }
  return <SlidesEditor {...p} />
}
