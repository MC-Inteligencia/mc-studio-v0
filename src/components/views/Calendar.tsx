import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { db } from '../../db/db'
import type { ContentItem } from '../../db/types'
import { FORMAT_COLORS, formatById, statusMeta } from '../../lib/constants'
import { MONTHS, WEEKDAYS, addDays, fromKey, monthGrid, startOfWeek, toKey, todayKey, fmtLong } from '../../lib/date'
import { saveContent } from '../../db/repo'
import type { Filters } from '../Filters'
import { applyFilters } from '../Filters'

export function ContentChip({ c, onOpen, compact }: { c: ContentItem; onOpen: (id: string) => void; compact?: boolean }) {
  const st = statusMeta(c.status)
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('text/content-id', c.id)}
      onClick={() => onOpen(c.id)}
      className="group cursor-pointer rounded-md border border-gray-200 bg-white px-1.5 py-1 text-[11px] leading-tight shadow-sm hover:border-mci-light"
      style={{ borderLeft: `4px solid ${FORMAT_COLORS[c.format]}` }}
      title={`${formatById(c.format).name} · ${st.label}\n${c.title}`}
    >
      <div className="flex items-center gap-1">
        <span className="font-semibold text-gray-700">{formatById(c.format).name}</span>
        <span className="ml-auto h-2 w-2 shrink-0 rounded-full" style={{ background: st.color }} />
      </div>
      {!compact && <div className="line-clamp-2 text-gray-600">{c.title}</div>}
    </div>
  )
}

export function CalendarView({ filters, onOpen, onNew }: { filters: Filters; onOpen: (id: string) => void; onNew: (date: string) => void }) {
  const [mode, setMode] = useState<'mes' | 'semana'>('mes')
  const [cursor, setCursor] = useState(() => {
    const t = new Date()
    return t < new Date(2026, 8, 28) ? new Date(2026, 8, 28) : t
  })
  const all = useLiveQuery(() => db.contents.toArray(), []) ?? []
  const items = useMemo(() => applyFilters(all, filters), [all, filters])
  const byDay = useMemo(() => {
    const m = new Map<string, ContentItem[]>()
    for (const c of items) m.set(c.scheduledAt, [...(m.get(c.scheduledAt) ?? []), c])
    return m
  }, [items])

  const days = mode === 'mes' ? monthGrid(cursor.getFullYear(), cursor.getMonth()) : Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor), i))
  const shift = (d: number) => setCursor(mode === 'mes' ? new Date(cursor.getFullYear(), cursor.getMonth() + d, 1) : addDays(cursor, 7 * d))
  const today = todayKey()
  const drop = (e: React.DragEvent, key: string) => {
    const id = e.dataTransfer.getData('text/content-id')
    if (id) saveContent(id, { scheduledAt: key })
  }
  const title = mode === 'mes' ? `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}` : `Semana de ${fmtLong(toKey(startOfWeek(cursor)))}`

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center gap-2">
        <button className="btn-ghost px-2" onClick={() => shift(-1)}><ChevronLeft size={18} /></button>
        <button className="btn-ghost px-2" onClick={() => shift(1)}><ChevronRight size={18} /></button>
        <h2 className="font-heading text-lg font-bold text-mci-blue">{title}</h2>
        <button className="btn-ghost text-xs" onClick={() => setCursor(new Date())}>Hoje</button>
        <div className="ml-auto flex rounded-lg border bg-white p-0.5 text-sm">
          {(['mes', 'semana'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`rounded-md px-3 py-1 ${mode === m ? 'bg-mci-blue text-white' : 'text-gray-600'}`}>{m === 'mes' ? 'Mês' : 'Semana'}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-t-xl border border-b-0 bg-gray-200 text-center text-xs font-semibold text-gray-500">
        {WEEKDAYS.map((d) => <div key={d} className="bg-white py-2">{d}</div>)}
      </div>
      <div className={`grid flex-1 grid-cols-7 gap-px overflow-hidden rounded-b-xl border bg-gray-200 ${mode === 'semana' ? 'min-h-[60vh]' : ''}`}>
        {days.map((d) => {
          const key = toKey(d)
          const out = mode === 'mes' && d.getMonth() !== cursor.getMonth()
          const list = byDay.get(key) ?? []
          return (
            <div
              key={key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => drop(e, key)}
              className={`group relative min-h-[110px] p-1.5 ${out ? 'bg-gray-50' : 'bg-white'}`}
            >
              <div className="mb-1 flex items-center">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${key === today ? 'bg-mci-yellow font-bold text-mci-blue' : out ? 'text-gray-300' : 'text-gray-600'}`}>{fromKey(key).getDate()}</span>
                <button onClick={() => onNew(key)} className="ml-auto hidden rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-mci-blue group-hover:block" title="Novo conteúdo"><Plus size={14} /></button>
              </div>
              <div className="space-y-1">
                {list.map((c) => <ContentChip key={c.id} c={c} onOpen={onOpen} />)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
