import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { CalendarDays, Columns3, Lightbulb, CheckCircle2, Settings, Plus, FolderSync, AlertTriangle } from 'lucide-react'
import { db } from './db/db'
import { setCurrentUser } from './db/repo'
import { useCurrentUser, useSync, useUsers } from './lib/hooks'
import { todayKey } from './lib/date'
import { reconnect } from './sync/folder'
import { CalendarView } from './components/views/Calendar'
import { KanbanView } from './components/views/Kanban'
import { IdeasView } from './components/views/Ideas'
import { ReviewQueue } from './components/views/ReviewQueue'
import { SettingsView } from './components/views/Settings'
import { ContentDrawer } from './components/ContentDrawer'
import { NewContentDialog } from './components/NewContentDialog'
import { FilterBar, emptyFilters, type Filters } from './components/Filters'

type View = 'calendario' | 'kanban' | 'ideias' | 'revisao' | 'config'

export default function App() {
  const [view, setView] = useState<View>('calendario')
  const [openId, setOpenId] = useState<string | null>(null)
  const [newDate, setNewDate] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const me = useCurrentUser()
  const users = useUsers()
  const sync = useSync()
  const pending = useLiveQuery(() => db.contents.where('status').equals('revisao').count(), []) ?? 0
  const ideas = useLiveQuery(() => db.ideas.filter((i) => !i.promotedContentId).count(), []) ?? 0

  const nav: [View, string, typeof CalendarDays, number?][] = [
    ['calendario', 'Calendário', CalendarDays],
    ['kanban', 'Kanban', Columns3],
    ['ideias', 'Ideias', Lightbulb, ideas],
    ['revisao', 'Aprovação', CheckCircle2, pending],
    ['config', 'Configurações', Settings],
  ]

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-4 bg-mci-blue px-5 py-2.5 text-white">
        <div className="font-heading text-lg font-bold tracking-tight">mc<span className="text-mci-yellow">inteligência</span> <span className="font-normal text-white/60">· Content Studio</span></div>
        <nav className="ml-4 flex gap-1">
          {nav.map(([k, label, Icon, badge]) => (
            <button key={k} onClick={() => setView(k)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${view === k ? 'bg-white/15 font-semibold' : 'text-white/75 hover:bg-white/10'}`}>
              <Icon size={16} /> {label}
              {!!badge && <span className="rounded-full bg-mci-yellow px-1.5 text-[11px] font-bold text-mci-blue">{badge}</span>}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 text-sm">
          {sync.needsPermission ? (
            <button className="flex items-center gap-1 rounded-lg bg-orange-500 px-2 py-1 text-xs" onClick={() => reconnect()}><AlertTriangle size={14} /> Reconectar pasta</button>
          ) : sync.connected ? (
            <span className="flex items-center gap-1 text-xs text-white/70" title={sync.lastSavedAt}><FolderSync size={14} /> {sync.folderName}</span>
          ) : (
            <button className="flex items-center gap-1 text-xs text-white/60 hover:text-white" onClick={() => setView('config')}><FolderSync size={14} /> sem pasta</button>
          )}
          <select className="rounded-lg bg-white/10 px-2 py-1 text-sm" value={me?.id ?? ''} onChange={(e) => setCurrentUser(e.target.value)} title="Quem está usando">
            {users.map((u) => <option key={u.id} value={u.id} className="text-ink">{u.name} ({u.role})</option>)}
          </select>
        </div>
      </header>

      {(view === 'calendario' || view === 'kanban') && (
        <div className="flex items-center gap-3 border-b bg-white px-5 py-2">
          <FilterBar f={filters} set={setFilters} />
          <button className="btn-primary ml-auto" onClick={() => setNewDate(todayKey())}><Plus size={16} /> Novo conteúdo</button>
        </div>
      )}

      <main className="min-h-0 flex-1 overflow-auto p-5">
        {view === 'calendario' && <CalendarView filters={filters} onOpen={setOpenId} onNew={setNewDate} />}
        {view === 'kanban' && <KanbanView filters={filters} onOpen={setOpenId} />}
        {view === 'ideias' && <IdeasView onOpen={setOpenId} />}
        {view === 'revisao' && <ReviewQueue onOpen={setOpenId} />}
        {view === 'config' && <SettingsView />}
      </main>

      {openId && <ContentDrawer id={openId} onClose={() => setOpenId(null)} />}
      {newDate && <NewContentDialog date={newDate} onClose={() => setNewDate(null)} onCreated={(id) => { setNewDate(null); setOpenId(id) }} />}
    </div>
  )
}
