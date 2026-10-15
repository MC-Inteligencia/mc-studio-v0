import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { FolderOpen, Download, Upload, Inbox, RefreshCw, Plus, Trash2 } from 'lucide-react'
import { db } from '../../db/db'
import { connectFolder, disconnectFolder, exportFile, importFile, loadSnapshotFromFolder, reconnect, writeSnapshot } from '../../sync/folder'
import { processInbox } from '../../sync/inbox'
import { useSync, useSetting } from '../../lib/hooks'
import { fmtDateTime } from '../../lib/date'
import { uid } from '../../lib/constants'
import { ImagePick } from '../editors/BodyEditors'

export function SettingsView() {
  const sync = useSync()
  const users = useLiveQuery(() => db.users.toArray(), []) ?? []
  const pillars = useLiveQuery(() => db.pillars.toArray(), []) ?? []
  const sources = useLiveQuery(() => db.sources.toArray(), []) ?? []
  const avatarId = useSetting<string>('avatarAssetId')
  const [msg, setMsg] = useState('')
  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try { await fn(); setMsg(ok) } catch (e: any) { setMsg('Erro: ' + (e?.message ?? e)) }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {msg && <div className="rounded-lg bg-mci-blue px-4 py-2 text-sm text-white">{msg}</div>}

      <section className="card space-y-3 p-5">
        <h3 className="font-heading font-bold text-mci-blue">Pasta de dados</h3>
        <p className="text-sm text-gray-600">
          Os dados ficam no navegador (IndexedDB). Conectando uma pasta, o sistema grava automaticamente <code>data/db.json</code> + <code>data/media/</code> (backup e migração para a v1)
          e lê pacotes de conteúdo em <code>inbox/</code>, que é por onde o Claude entrega os conteúdos produzidos fora do sistema.
        </p>
        {!sync.supported && <div className="text-sm text-orange-700">Este navegador não suporta pasta conectada. Use Chrome ou Edge, ou o backup manual abaixo.</div>}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {sync.connected ? (
            <span className="chip bg-green-100 text-green-800">Conectada: {sync.folderName}{sync.lastSavedAt && ` · salvo ${fmtDateTime(sync.lastSavedAt)}`}</span>
          ) : sync.needsPermission ? (
            <button className="btn-yellow" onClick={() => run(reconnect, 'Pasta reconectada.')}><RefreshCw size={14} /> Reconectar “{sync.folderName}”</button>
          ) : null}
          {sync.supported && <button className="btn-primary" onClick={() => run(connectFolder, 'Pasta conectada e snapshot gravado.')}><FolderOpen size={14} /> {sync.connected ? 'Trocar pasta' : 'Conectar pasta'}</button>}
          {sync.connected && <>
            <button className="btn-ghost border" onClick={() => run(async () => { const r = await processInbox(); setMsg(`Inbox: ${r.files} arquivo(s), ${r.created} criado(s), ${r.updated} atualizado(s), ${r.ideas} ideia(s).${r.errors.length ? ' Erros: ' + r.errors.join(' | ') : ''}`) }, '')}><Inbox size={14} /> Importar inbox</button>
            <button className="btn-ghost border" onClick={() => run(writeSnapshot, 'Snapshot gravado.')}>Salvar agora</button>
            <button className="btn-ghost border" onClick={() => confirm('Substituir TODOS os dados deste navegador pelo db.json da pasta?') && run(loadSnapshotFromFolder, 'Dados carregados da pasta.')}>Carregar da pasta</button>
            <button className="btn-danger" onClick={() => run(disconnectFolder, 'Pasta desconectada.')}>Desconectar</button>
          </>}
        </div>
        {sync.error && <div className="text-sm text-red-600">{sync.error}</div>}
        <div className="flex flex-wrap gap-2 border-t pt-3">
          <button className="btn-ghost border" onClick={() => run(exportFile, 'Backup baixado.')}><Download size={14} /> Baixar backup (.json)</button>
          <label className="btn-ghost cursor-pointer border"><Upload size={14} /> Restaurar backup
            <input type="file" accept=".json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f && confirm('Substituir todos os dados pelo backup?')) run(() => importFile(f), 'Backup restaurado.') }} />
          </label>
        </div>
      </section>

      <section className="card space-y-3 p-5">
        <h3 className="font-heading font-bold text-mci-blue">Usuários</h3>
        {users.map((u) => (
          <div key={u.id} className="flex gap-2">
            <input className="field" value={u.name} onChange={(e) => db.users.update(u.id, { name: e.target.value })} />
            <select className="field w-40" value={u.role} onChange={(e) => db.users.update(u.id, { role: e.target.value as any })}>
              <option value="editor">Editor</option><option value="aprovador">Aprovador</option>
            </select>
          </div>
        ))}
        <div>
          <div className="label">Avatar das lâminas (foto do especialista)</div>
          <ImagePick contentId="brand" assetId={avatarId} label="Enviar foto" onPick={(id) => db.settings.put({ key: 'avatarAssetId', value: id })} />
        </div>
      </section>

      <section className="card p-5">
        <h3 className="mb-3 font-heading font-bold text-mci-blue">Pilares editoriais</h3>
        <div className="grid grid-cols-2 gap-3">
          {pillars.map((p) => (
            <div key={p.id} className="rounded-lg border p-3 text-sm" style={{ borderLeft: `4px solid ${p.color}` }}>
              <div className="font-semibold">{p.name} <span className="text-xs text-gray-500">· peso {p.weight}%</span></div>
              <div className="text-xs text-gray-600">{p.role}</div>
              <div className="mt-1 text-xs text-gray-400">{p.themes}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <div className="mb-3 flex items-center">
          <h3 className="font-heading font-bold text-mci-blue">Fontes (fact-check)</h3>
          <button className="btn-ghost ml-auto text-xs" onClick={() => db.sources.add({ id: uid(), name: 'Nova fonte', edition: '', evidence: '', usage: '', url: '', note: '' })}><Plus size={14} /> Fonte</button>
        </div>
        <div className="space-y-2">
          {sources.map((s) => (
            <details key={s.id} className="rounded-lg border p-2 text-sm">
              <summary className="cursor-pointer font-medium">{s.name} <span className="text-xs text-gray-400">({s.edition})</span></summary>
              <div className="mt-2 grid gap-2">
                {(['name', 'edition', 'evidence', 'usage', 'url', 'note'] as const).map((k) => (
                  <input key={k} className="field text-xs" placeholder={k} value={s[k]} onChange={(e) => db.sources.update(s.id, { [k]: e.target.value })} />
                ))}
                <button className="btn-danger w-fit text-xs" onClick={() => confirm('Excluir fonte?') && db.sources.delete(s.id)}><Trash2 size={12} /> Excluir</button>
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
