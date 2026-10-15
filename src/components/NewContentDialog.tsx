import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { FormatId } from '../db/types'
import { FORMATS } from '../lib/constants'
import { createContent } from '../db/repo'

export function NewContentDialog({ date, onClose, onCreated }: { date: string; onClose: () => void; onCreated: (id: string) => void }) {
  const pillars = useLiveQuery(() => db.pillars.toArray(), []) ?? []
  const [f, setF] = useState({ title: '', format: 'ig_carrossel' as FormatId, scheduledAt: date, pillarId: '', hook: '' })
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card w-[480px] space-y-3 p-5 shadow-xl">
        <div className="font-heading text-lg font-bold text-mci-blue">Novo conteúdo</div>
        <input autoFocus className="field" placeholder="Título / tema" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <div className="grid grid-cols-2 gap-2">
          <select className="field" value={f.format} onChange={(e) => setF({ ...f, format: e.target.value as FormatId })}>
            {FORMATS.map((x) => <option key={x.id} value={x.id}>{x.channel === 'instagram' ? 'Instagram' : x.channel === 'youtube' ? 'YouTube' : 'LinkedIn'} · {x.name}</option>)}
          </select>
          <input type="date" className="field" value={f.scheduledAt} onChange={(e) => setF({ ...f, scheduledAt: e.target.value })} />
        </div>
        <select className="field" value={f.pillarId} onChange={(e) => setF({ ...f, pillarId: e.target.value })}>
          <option value="">Pilar (opcional)</option>
          {pillars.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <textarea className="field" placeholder="Hook / ideia central" value={f.hook} onChange={(e) => setF({ ...f, hook: e.target.value })} />
        <div className="flex justify-end gap-2">
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" disabled={!f.title.trim() || !f.scheduledAt} onClick={async () => onCreated(await createContent({ ...f, pillarId: f.pillarId || undefined }))}>Criar</button>
        </div>
      </div>
    </div>
  )
}
