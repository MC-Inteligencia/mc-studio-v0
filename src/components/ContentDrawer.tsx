import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check, CornerUpLeft, History, Send, Trash2, X, RotateCcw, ExternalLink } from 'lucide-react'
import { db } from '../db/db'
import type { ContentBody, ContentItem, Status } from '../db/types'
import { FORMATS, STATUSES, FORMAT_COLORS, formatById, statusMeta } from '../lib/constants'
import { addComment, decide, deleteComment, deleteContent, restoreVersion, saveBody, saveContent, setStatus, snapshotVersion, submitForReview, toggleComment } from '../db/repo'
import { useCurrentUser, useUsers } from '../lib/hooks'
import { fmtDateTime, fmtLong } from '../lib/date'
import { BodyEditor } from './editors/BodyEditors'
import { ContentPreview } from './preview/Previews'

type Tab = 'conteudo' | 'briefing' | 'revisao' | 'versoes' | 'historico'

export function ContentDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const c = useLiveQuery(() => db.contents.get(id), [id])
  if (!c) return null
  return <Drawer key={id} c={c} onClose={onClose} />
}

function Drawer({ c, onClose }: { c: ContentItem; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('conteudo')
  const [body, setBody] = useState<ContentBody>(c.body)
  const dirty = useRef(false)
  const me = useCurrentUser()
  const pillars = useLiveQuery(() => db.pillars.toArray(), []) ?? []
  const openComments = useLiveQuery(() => db.comments.where('contentId').equals(c.id).filter((x) => !x.resolved).count(), [c.id]) ?? 0
  const f = formatById(c.format)

  // autosave do rascunho
  useEffect(() => {
    if (!dirty.current) return
    const t = setTimeout(() => { saveBody(c.id, body); dirty.current = false }, 500)
    return () => clearTimeout(t)
  }, [body, c.id])
  // atualização externa (inbox / restauração) quando não há edição pendente
  useEffect(() => { if (!dirty.current) setBody(c.body) }, [c.updatedAt])

  const change = (b: ContentBody) => { dirty.current = true; setBody(b) }
  const preview: ContentItem = { ...c, body }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 flex bg-black/40" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ml-auto flex h-full w-full max-w-[1280px] flex-col bg-gray-50 shadow-2xl">
        {/* topo */}
        <div className="border-b bg-white px-5 py-3">
          <div className="flex items-start gap-3">
            <span className="chip mt-1.5 text-mci-blue" style={{ background: FORMAT_COLORS[c.format] + '33' }}>{f.name}</span>
            <input className="flex-1 bg-transparent font-heading text-xl font-bold text-ink" value={c.title} onChange={(e) => saveContent(c.id, { title: e.target.value })} />
            <button className="btn-ghost" onClick={onClose}><X size={18} /></button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <input type="date" className="field w-40 py-1" value={c.scheduledAt} onChange={(e) => e.target.value && saveContent(c.id, { scheduledAt: e.target.value })} />
            <span className="text-xs text-gray-500">{fmtLong(c.scheduledAt)}</span>
            <select className="field w-36 py-1" value={c.status} onChange={(e) => setStatus(c.id, e.target.value as Status)} style={{ color: statusMeta(c.status).color, fontWeight: 600 }}>
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <select className="field w-48 py-1" value={c.pillarId ?? ''} onChange={(e) => saveContent(c.id, { pillarId: e.target.value || undefined })}>
              <option value="">Sem pilar</option>
              {pillars.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select className="field w-44 py-1" value={c.format} onChange={(e) => {
              const nf = formatById(e.target.value as ContentItem['format'])
              saveContent(c.id, { format: nf.id, channel: nf.channel })
            }}>
              {FORMATS.map((x) => <option key={x.id} value={x.id}>{x.channel === 'instagram' ? 'IG' : x.channel === 'youtube' ? 'YT' : 'LI'} · {x.name}</option>)}
            </select>
            <div className="ml-auto flex gap-2">
              <Actions c={c} role={me?.role} onReview={() => setTab('revisao')} />
              <button className="btn-danger" title="Excluir" onClick={async () => { if (confirm('Excluir este conteúdo e todo o histórico?')) { await deleteContent(c.id); onClose() } }}><Trash2 size={16} /></button>
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[1fr_420px]">
          <div className="flex min-h-0 flex-col">
            <div className="flex gap-1 border-b bg-white px-4">
              {([['conteudo', 'Conteúdo'], ['briefing', 'Briefing'], ['revisao', `Revisão${openComments ? ` (${openComments})` : ''}`], ['versoes', 'Versões'], ['historico', 'Histórico']] as [Tab, string][]).map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)} className={`border-b-2 px-3 py-2.5 text-sm ${tab === k ? 'border-mci-blue font-semibold text-mci-blue' : 'border-transparent text-gray-500'}`}>{l}</button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {tab === 'conteudo' && <BodyEditor c={c} body={body} onChange={change} />}
              {tab === 'briefing' && <Briefing c={c} />}
              {tab === 'revisao' && <Review c={c} role={me?.role} />}
              {tab === 'versoes' && <Versions c={c} onRestore={async (vid) => { await restoreVersion(c.id, vid); const v = await db.versions.get(vid); if (v) setBody(structuredClone(v.body)); setTab('conteudo') }} />}
              {tab === 'historico' && <Activity c={c} />}
            </div>
          </div>
          <div className="overflow-y-auto border-l bg-gray-100 p-5">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Prévia · {f.aspect} · {f.width}×{f.height}</div>
            <ContentPreview c={preview} />
            {f.notes && <div className="mt-4 rounded-lg bg-white p-3 text-xs text-gray-600"><b>Spec:</b> {f.notes}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

function Actions({ c, role, onReview }: { c: ContentItem; role?: string; onReview: () => void }) {
  const [url, setUrl] = useState('')
  if (c.status === 'revisao' && role === 'aprovador') {
    return <button className="btn-yellow" onClick={onReview}><Check size={16} /> Revisar e decidir</button>
  }
  if (['briefing', 'producao', 'ajustes'].includes(c.status)) {
    return (
      <button className="btn-primary" onClick={async () => { const n = prompt('Nota para o aprovador (opcional):') ?? ''; await submitForReview(c.id, n) }}>
        <Send size={16} /> Enviar para revisão
      </button>
    )
  }
  if (c.status === 'aprovado') return <button className="btn-primary" onClick={() => setStatus(c.id, 'agendado')}>Marcar agendado</button>
  if (c.status === 'agendado') {
    return (
      <div className="flex gap-1">
        <input className="field w-52 py-1" placeholder="Link do post publicado" value={url} onChange={(e) => setUrl(e.target.value)} />
        <button className="btn-primary" onClick={async () => { await saveContent(c.id, { publishedUrl: url || undefined }); await setStatus(c.id, 'publicado') }}>Publicado</button>
      </div>
    )
  }
  if (c.status === 'publicado' && c.publishedUrl) return <a className="btn-ghost" href={c.publishedUrl} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Ver post</a>
  return null
}

function Briefing({ c }: { c: ContentItem }) {
  const sources = useLiveQuery(() => db.sources.toArray(), []) ?? []
  return (
    <div className="max-w-3xl space-y-4">
      <div><label className="label">Hook / ideia central</label><textarea className="field min-h-16" value={c.hook} onChange={(e) => saveContent(c.id, { hook: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Objetivo</label><textarea className="field min-h-16" value={c.objective} onChange={(e) => saveContent(c.id, { objective: e.target.value })} /></div>
        <div><label className="label">Recorte / tag editorial</label><input className="field" value={c.tag} onChange={(e) => saveContent(c.id, { tag: e.target.value })} /></div>
      </div>
      <div><label className="label">Base / fonte (texto livre)</label><input className="field" value={c.sourceText} onChange={(e) => saveContent(c.id, { sourceText: e.target.value })} /></div>
      <div>
        <label className="label">Fontes vinculadas (fact-check)</label>
        <div className="card divide-y">
          {sources.map((s) => {
            const on = c.sourceIds.includes(s.id)
            return (
              <label key={s.id} className="flex cursor-pointer gap-3 p-2.5 text-sm hover:bg-gray-50">
                <input type="checkbox" checked={on} onChange={() => saveContent(c.id, { sourceIds: on ? c.sourceIds.filter((x) => x !== s.id) : [...c.sourceIds, s.id] })} />
                <div>
                  <div className="font-medium">{s.name} <span className="text-xs text-gray-400">({s.edition})</span></div>
                  {on && <div className="text-xs text-gray-600">{s.evidence} <i className="text-orange-700">{s.note}</i> <a className="text-mci-light underline" href={s.url} target="_blank" rel="noreferrer">link</a></div>}
                </div>
              </label>
            )
          })}
        </div>
      </div>
      <div><label className="label">Notas internas</label><textarea className="field min-h-24" value={c.notes} onChange={(e) => saveContent(c.id, { notes: e.target.value })} /></div>
    </div>
  )
}

function Review({ c, role }: { c: ContentItem; role?: string }) {
  const comments = useLiveQuery(() => db.comments.where('contentId').equals(c.id).sortBy('createdAt'), [c.id]) ?? []
  const approvals = useLiveQuery(() => db.approvals.where('contentId').equals(c.id).reverse().sortBy('createdAt'), [c.id]) ?? []
  const versions = useLiveQuery(() => db.versions.where('contentId').equals(c.id).toArray(), [c.id]) ?? []
  const users = useUsers()
  const [text, setText] = useState('')
  const [note, setNote] = useState('')
  const uname = (id: string) => users.find((u) => u.id === id)?.name ?? id
  const vnum = (id?: string) => versions.find((v) => v.id === id)?.number
  const cur = vnum(c.currentVersionId)
  return (
    <div className="max-w-3xl space-y-5">
      {c.status === 'revisao' && (
        <div className="card border-purple-300 bg-purple-50 p-4">
          <div className="mb-2 text-sm font-semibold text-purple-900">Decisão sobre a versão {cur ? `v${cur}` : 'atual'} {role !== 'aprovador' && <span className="font-normal text-purple-700">(você está como editor; troque o usuário no topo para aprovar)</span>}</div>
          <textarea className="field min-h-16" placeholder="Comentário da decisão (obrigatório ao pedir ajustes)" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="mt-2 flex gap-2">
            <button className="btn btn-primary bg-green-600 hover:bg-green-700" onClick={async () => { await decide(c.id, 'aprovado', note); setNote('') }}><Check size={16} /> Aprovar</button>
            <button className="btn-yellow" disabled={!note.trim()} onClick={async () => { await decide(c.id, 'ajustes', note); setNote('') }}><CornerUpLeft size={16} /> Pedir ajustes</button>
          </div>
        </div>
      )}
      <div>
        <div className="mb-2 text-xs font-semibold uppercase text-gray-500">Comentários</div>
        <div className="space-y-2">
          {comments.map((m) => (
            <div key={m.id} className={`card p-3 text-sm ${m.resolved ? 'opacity-50' : ''}`}>
              <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                <b className="text-gray-800">{uname(m.authorId)}</b> · {fmtDateTime(m.createdAt)} {vnum(m.versionId) && <span className="chip bg-gray-100">v{vnum(m.versionId)}</span>}
                <button className="ml-auto hover:text-green-700" onClick={() => toggleComment(m.id)}>{m.resolved ? 'Reabrir' : 'Resolver'}</button>
                <button className="hover:text-red-600" onClick={() => deleteComment(m.id)}><Trash2 size={12} /></button>
              </div>
              <div className="whitespace-pre-line">{m.text}</div>
            </div>
          ))}
          {!comments.length && <div className="text-sm text-gray-400">Sem comentários.</div>}
        </div>
        <div className="mt-3 flex gap-2">
          <textarea className="field min-h-12" placeholder="Escreva um comentário (ex.: lâmina 3, trocar o título…)" value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn-primary self-end" disabled={!text.trim()} onClick={async () => { await addComment(c.id, text, c.currentVersionId); setText('') }}>Comentar</button>
        </div>
      </div>
      {!!approvals.length && (
        <div>
          <div className="mb-2 text-xs font-semibold uppercase text-gray-500">Decisões</div>
          {approvals.map((a) => (
            <div key={a.id} className="text-sm">{a.decision === 'aprovado' ? '✅ Aprovado' : '↩️ Ajustes pedidos'} por <b>{uname(a.authorId)}</b> em {fmtDateTime(a.createdAt)} (v{vnum(a.versionId)})</div>
          ))}
        </div>
      )}
    </div>
  )
}

function Versions({ c, onRestore }: { c: ContentItem; onRestore: (id: string) => void }) {
  const versions = useLiveQuery(() => db.versions.where('contentId').equals(c.id).reverse().sortBy('number'), [c.id]) ?? []
  const users = useUsers()
  const label = { human: 'manual', claude_external: 'Claude (fora do sistema)', ai: 'IA interna' }
  return (
    <div className="max-w-3xl space-y-3">
      <button className="btn-ghost border" onClick={() => { const n = prompt('Nota da versão:') ?? ''; snapshotVersion(c.id, n || 'Versão salva manualmente') }}><History size={14} /> Salvar rascunho atual como versão</button>
      {versions.map((v) => (
        <div key={v.id} className="card flex items-center gap-3 p-3 text-sm">
          <span className="rounded bg-mci-blue px-2 py-0.5 text-xs font-bold text-mci-yellow">v{v.number}</span>
          <div className="flex-1">
            <div>{v.note}</div>
            <div className="text-xs text-gray-500">{users.find((u) => u.id === v.authorId)?.name ?? v.authorId} · {fmtDateTime(v.createdAt)} · origem: {label[v.source]} {c.currentVersionId === v.id && <b className="text-green-700">· atual</b>}</div>
          </div>
          <button className="btn-ghost text-xs" onClick={() => { if (confirm(`Substituir o rascunho pelo conteúdo da v${v.number}?`)) onRestore(v.id) }}><RotateCcw size={14} /> Restaurar</button>
        </div>
      ))}
      {!versions.length && <div className="text-sm text-gray-400">Nenhuma versão ainda. Enviar para revisão cria uma automaticamente.</div>}
    </div>
  )
}

function Activity({ c }: { c: ContentItem }) {
  const items = useLiveQuery(() => db.activity.where('contentId').equals(c.id).reverse().sortBy('createdAt'), [c.id]) ?? []
  const users = useUsers()
  return (
    <div className="max-w-3xl space-y-1 text-sm">
      {items.map((a) => (
        <div key={a.id} className="flex gap-3"><span className="w-24 shrink-0 text-xs text-gray-400">{fmtDateTime(a.createdAt)}</span><b>{users.find((u) => u.id === a.authorId)?.name ?? a.authorId}</b> {a.action}</div>
      ))}
      {!items.length && <div className="text-gray-400">Sem histórico.</div>}
    </div>
  )
}
