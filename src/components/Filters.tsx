import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { ChannelId, ContentItem, FormatId, Status } from '../db/types'
import { CHANNELS, FORMATS, STATUSES } from '../lib/constants'

export interface Filters { channel: ChannelId | ''; format: FormatId | ''; status: Status | ''; pillar: string; q: string; showArchived: boolean }
export const emptyFilters: Filters = { channel: '', format: '', status: '', pillar: '', q: '', showArchived: false }

export function applyFilters(items: ContentItem[], f: Filters) {
  const q = f.q.trim().toLowerCase()
  return items.filter((c) =>
    (!f.channel || c.channel === f.channel) &&
    (!f.format || c.format === f.format) &&
    (!f.status || c.status === f.status) &&
    (!f.pillar || c.pillarId === f.pillar) &&
    (f.showArchived || f.status === 'arquivado' || c.status !== 'arquivado') &&
    (!q || `${c.title} ${c.hook} ${c.tag}`.toLowerCase().includes(q)),
  )
}

export function FilterBar({ f, set }: { f: Filters; set: (f: Filters) => void }) {
  const pillars = useLiveQuery(() => db.pillars.toArray(), []) ?? []
  const sel = 'field w-auto py-1 text-xs'
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input className="field w-48 py-1 text-xs" placeholder="Buscar…" value={f.q} onChange={(e) => set({ ...f, q: e.target.value })} />
      <select className={sel} value={f.channel} onChange={(e) => set({ ...f, channel: e.target.value as ChannelId })}>
        <option value="">Todos os canais</option>
        {CHANNELS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select className={sel} value={f.format} onChange={(e) => set({ ...f, format: e.target.value as FormatId })}>
        <option value="">Todos os formatos</option>
        {FORMATS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
      </select>
      <select className={sel} value={f.status} onChange={(e) => set({ ...f, status: e.target.value as Status })}>
        <option value="">Todos os status</option>
        {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
      </select>
      <select className={sel} value={f.pillar} onChange={(e) => set({ ...f, pillar: e.target.value })}>
        <option value="">Todos os pilares</option>
        {pillars.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    </div>
  )
}
