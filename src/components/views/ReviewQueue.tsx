import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/db'
import type { ContentItem } from '../../db/types'
import { FORMAT_COLORS, formatById, statusMeta } from '../../lib/constants'
import { fmtLong, todayKey, addDays, toKey } from '../../lib/date'

function Row({ c, onOpen, extra }: { c: ContentItem; onOpen: (id: string) => void; extra?: string }) {
  return (
    <button onClick={() => onOpen(c.id)} className="card flex w-full items-center gap-3 p-3 text-left hover:border-mci-light">
      <span className="h-8 w-1.5 rounded" style={{ background: FORMAT_COLORS[c.format] }} />
      <div className="flex-1">
        <div className="text-sm font-medium">{c.title}</div>
        <div className="text-xs text-gray-500">{formatById(c.format).name} · {fmtLong(c.scheduledAt)} {extra && `· ${extra}`}</div>
      </div>
      <span className="chip" style={{ background: statusMeta(c.status).color + '22', color: statusMeta(c.status).color }}>{statusMeta(c.status).label}</span>
    </button>
  )
}

export function ReviewQueue({ onOpen }: { onOpen: (id: string) => void }) {
  const all = useLiveQuery(() => db.contents.orderBy('scheduledAt').toArray(), []) ?? []
  const openByContent = useLiveQuery(async () => {
    const m = new Map<string, number>()
    for (const cm of await db.comments.filter((x) => !x.resolved).toArray()) m.set(cm.contentId, (m.get(cm.contentId) ?? 0) + 1)
    return m
  }, []) ?? new Map()
  const soon = toKey(addDays(new Date(), 10))
  const today = todayKey()
  const groups: [string, string, ContentItem[]][] = [
    ['Aguardando aprovação', 'O aprovador precisa decidir', all.filter((c) => c.status === 'revisao')],
    ['Ajustes pedidos', 'Voltaram para o editor', all.filter((c) => c.status === 'ajustes')],
    ['Próximos 10 dias sem aprovação', 'Risco de atraso', all.filter((c) => c.scheduledAt >= today && c.scheduledAt <= soon && ['briefing', 'producao', 'ajustes', 'revisao'].includes(c.status))],
    ['Com comentários abertos', '', all.filter((c) => openByContent.has(c.id))],
  ]
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {groups.map(([t, sub, list]) => (
        <section key={t}>
          <div className="mb-2 flex items-baseline gap-2"><h3 className="font-heading text-base font-bold text-mci-blue">{t}</h3><span className="text-xs text-gray-500">{sub} · {list.length}</span></div>
          <div className="space-y-2">
            {list.map((c) => <Row key={c.id} c={c} onOpen={onOpen} extra={openByContent.get(c.id) ? `${openByContent.get(c.id)} comentário(s) aberto(s)` : undefined} />)}
            {!list.length && <div className="text-sm text-gray-400">Nada aqui.</div>}
          </div>
        </section>
      ))}
    </div>
  )
}
