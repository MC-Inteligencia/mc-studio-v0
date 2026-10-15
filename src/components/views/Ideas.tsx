import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { db } from '../../db/db'
import type { FormatId, Idea } from '../../db/types'
import { FORMATS, formatById } from '../../lib/constants'
import { deleteIdea, promoteIdea, saveIdea } from '../../db/repo'
import { useUsers } from '../../lib/hooks'
import { fmtDateTime, todayKey } from '../../lib/date'

const blank = { title: '', hook: '', notes: '', format: '' as FormatId | '', pillarId: '' }

export function IdeasView({ onOpen }: { onOpen: (id: string) => void }) {
  const ideas = useLiveQuery(() => db.ideas.orderBy('createdAt').reverse().toArray(), []) ?? []
  const pillars = useLiveQuery(() => db.pillars.toArray(), []) ?? []
  const users = useUsers()
  const [form, setForm] = useState<typeof blank & { id?: string }>(blank)
  const [promote, setPromote] = useState<{ idea: Idea; format: FormatId; date: string } | null>(null)
  const submit = async () => {
    if (!form.title.trim()) return
    await saveIdea({ ...form, format: form.format || undefined, pillarId: form.pillarId || undefined })
    setForm(blank)
  }
  const open = ideas.filter((i) => !i.promotedContentId)
  const done = ideas.filter((i) => i.promotedContentId)
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-[380px_1fr] gap-6">
      <div className="card h-fit space-y-3 p-4">
        <div className="font-heading font-bold text-mci-blue">{form.id ? 'Editar ideia' : 'Nova ideia'}</div>
        <input className="field" placeholder="Título / tema" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="field min-h-16" placeholder="Hook / ideia central" value={form.hook} onChange={(e) => setForm({ ...form, hook: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <select className="field" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value as FormatId })}>
            <option value="">Formato (opcional)</option>
            {FORMATS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <select className="field" value={form.pillarId} onChange={(e) => setForm({ ...form, pillarId: e.target.value })}>
            <option value="">Pilar (opcional)</option>
            {pillars.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <textarea className="field min-h-20" placeholder="Notas, referências, links…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <div className="flex gap-2">
          <button className="btn-primary" onClick={submit}><Plus size={16} /> {form.id ? 'Salvar' : 'Adicionar'}</button>
          {form.id && <button className="btn-ghost" onClick={() => setForm(blank)}>Cancelar</button>}
        </div>
      </div>
      <div className="space-y-3">
        <div className="text-sm font-semibold text-gray-600">Banco de ideias ({open.length})</div>
        {open.map((i) => (
          <div key={i.id} className="card p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="font-semibold text-ink">{i.title}</div>
                {i.hook && <div className="mt-1 text-sm text-gray-600">{i.hook}</div>}
                {i.notes && <div className="mt-1 whitespace-pre-line text-xs text-gray-500">{i.notes}</div>}
                <div className="mt-2 flex gap-2 text-[11px] text-gray-500">
                  {i.format && <span className="chip bg-gray-100">{formatById(i.format).name}</span>}
                  {i.pillarId && <span className="chip bg-gray-100">{pillars.find((p) => p.id === i.pillarId)?.name}</span>}
                  <span>{users.find((u) => u.id === i.createdBy)?.name} · {fmtDateTime(i.createdAt)}</span>
                </div>
              </div>
              <button className="btn-ghost px-2" onClick={() => setForm({ id: i.id, title: i.title, hook: i.hook, notes: i.notes, format: i.format ?? '', pillarId: i.pillarId ?? '' })}><Pencil size={14} /></button>
              <button className="btn-danger px-2" onClick={() => confirm('Excluir ideia?') && deleteIdea(i.id)}><Trash2 size={14} /></button>
              <button className="btn-yellow" onClick={() => setPromote({ idea: i, format: i.format ?? 'ig_carrossel', date: todayKey() })}>Virar conteúdo <ArrowRight size={14} /></button>
            </div>
            {promote?.idea.id === i.id && (
              <div className="mt-3 flex items-end gap-2 rounded-lg bg-yellow-50 p-3">
                <div><label className="label">Formato</label>
                  <select className="field" value={promote.format} onChange={(e) => setPromote({ ...promote, format: e.target.value as FormatId })}>
                    {FORMATS.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select></div>
                <div><label className="label">Data</label><input type="date" className="field" value={promote.date} onChange={(e) => setPromote({ ...promote, date: e.target.value })} /></div>
                <button className="btn-primary" onClick={async () => { const id = await promoteIdea(i.id, promote.format, promote.date); setPromote(null); if (id) onOpen(id) }}>Criar no cronograma</button>
                <button className="btn-ghost" onClick={() => setPromote(null)}>Cancelar</button>
              </div>
            )}
          </div>
        ))}
        {!open.length && <div className="rounded-xl border border-dashed p-8 text-center text-sm text-gray-500">Nenhuma ideia no banco. Adicione ao lado.</div>}
        {!!done.length && (
          <details className="text-sm text-gray-500">
            <summary className="cursor-pointer">Ideias já transformadas em conteúdo ({done.length})</summary>
            {done.map((i) => <button key={i.id} className="block py-1 text-left hover:underline" onClick={() => onOpen(i.promotedContentId!)}>→ {i.title}</button>)}
          </details>
        )}
      </div>
    </div>
  )
}
