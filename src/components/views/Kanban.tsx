import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/db'
import { STATUSES, FORMAT_COLORS, formatById } from '../../lib/constants'
import { setStatus } from '../../db/repo'
import { fmtBR } from '../../lib/date'
import { applyFilters, type Filters } from '../Filters'
import type { Status } from '../../db/types'

export function KanbanView({ filters, onOpen }: { filters: Filters; onOpen: (id: string) => void }) {
  const all = useLiveQuery(() => db.contents.orderBy('scheduledAt').toArray(), []) ?? []
  const pillars = useLiveQuery(() => db.pillars.toArray(), []) ?? []
  const [over, setOver] = useState<Status | null>(null)
  const items = useMemo(() => applyFilters(all, { ...filters, status: '' , showArchived: true }), [all, filters])
  const cols = STATUSES.filter((s) => s.id !== 'arquivado' || filters.showArchived)
  return (
    <div className="flex h-full gap-3 overflow-x-auto pb-2">
      {cols.map((s) => {
        const list = items.filter((c) => c.status === s.id)
        return (
          <div
            key={s.id}
            onDragOver={(e) => { e.preventDefault(); setOver(s.id) }}
            onDragLeave={() => setOver(null)}
            onDrop={(e) => { const id = e.dataTransfer.getData('text/content-id'); setOver(null); if (id) setStatus(id, s.id) }}
            className={`flex w-64 shrink-0 flex-col rounded-xl ${over === s.id ? 'bg-blue-50 ring-2 ring-mci-light' : 'bg-gray-200/60'}`}
          >
            <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />{s.label}
              <span className="ml-auto text-xs font-normal text-gray-500">{list.length}</span>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-2 pb-2">
              {list.map((c) => (
                <div
                  key={c.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/content-id', c.id)}
                  onClick={() => onOpen(c.id)}
                  className="cursor-pointer rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm hover:border-mci-light"
                >
                  <div className="mb-1 flex items-center gap-1.5 text-[11px]">
                    <span className="chip text-mci-blue" style={{ background: FORMAT_COLORS[c.format] + '40' }}>{formatById(c.format).name}</span>
                    <span className="ml-auto font-mono text-gray-500">{fmtBR(c.scheduledAt)}</span>
                  </div>
                  <div className="text-[13px] font-medium leading-snug text-ink">{c.title}</div>
                  {c.pillarId && <div className="mt-1 text-[10px] text-gray-500">{pillars.find((p) => p.id === c.pillarId)?.name}</div>}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
