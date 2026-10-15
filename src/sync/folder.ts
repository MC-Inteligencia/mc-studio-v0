// Sincronização com uma pasta local (File System Access API — Chrome/Edge).
// Estrutura da pasta conectada:
//   data/db.json        snapshot completo (fonte para backup, migração v1 e para abrir em outra máquina)
//   data/media/<id>.*   arquivos de imagem
//   inbox/*.json        pacotes de conteúdo gerados fora do sistema (Claude) — ver docs/CONTRATO-INBOX.md
//   inbox/processados/  pacotes já importados
import { db, DATA_TABLES } from '../db/db'

type DirHandle = FileSystemDirectoryHandle & {
  queryPermission?: (d: { mode: 'readwrite' }) => Promise<PermissionState>
  requestPermission?: (d: { mode: 'readwrite' }) => Promise<PermissionState>
  values?: () => AsyncIterable<FileSystemHandle>
}

let handle: DirHandle | null = null
let timer: number | undefined
const listeners = new Set<(s: SyncState) => void>()

export interface SyncState {
  supported: boolean
  connected: boolean
  needsPermission: boolean
  folderName?: string
  lastSavedAt?: string
  error?: string
}

let state: SyncState = {
  supported: typeof (window as any).showDirectoryPicker === 'function',
  connected: false,
  needsPermission: false,
}

function emit(patch: Partial<SyncState>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l(state))
}
export const getSyncState = () => state
export function onSyncState(fn: (s: SyncState) => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export async function restoreHandle() {
  const s = await db.settings.get('folderHandle')
  if (!s?.value) return
  handle = s.value as DirHandle
  const perm = await handle.queryPermission?.({ mode: 'readwrite' })
  emit({ folderName: handle.name, connected: perm === 'granted', needsPermission: perm !== 'granted' })
}

export async function connectFolder() {
  const picker = (window as any).showDirectoryPicker
  if (!picker) throw new Error('Este navegador não permite conectar pasta. Use Chrome ou Edge.')
  handle = await picker({ mode: 'readwrite', id: 'mc-content-studio' })
  await db.settings.put({ key: 'folderHandle', value: handle })
  emit({ folderName: handle!.name, connected: true, needsPermission: false, error: undefined })
  await writeSnapshot()
}

export async function reconnect() {
  if (!handle) return
  const perm = await handle.requestPermission?.({ mode: 'readwrite' })
  emit({ connected: perm === 'granted', needsPermission: perm !== 'granted' })
  if (perm === 'granted') await writeSnapshot()
}

export async function disconnectFolder() {
  handle = null
  await db.settings.delete('folderHandle')
  emit({ connected: false, needsPermission: false, folderName: undefined })
}

export const getHandle = () => (state.connected ? handle : null)

export function scheduleSnapshot() {
  if (!state.connected) return
  window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    writeSnapshot().catch((e) => emit({ error: String(e?.message ?? e) }))
  }, 1200)
}

export async function dumpData() {
  const out: Record<string, unknown[]> = {}
  for (const t of DATA_TABLES) out[t] = await (db as any)[t].toArray()
  return {
    schema: 'mc-studio/snapshot@1',
    exportedAt: new Date().toISOString(),
    tables: out,
    assets: (await db.assets.toArray()).map(({ blob, ...rest }) => ({ ...rest, file: mediaName(rest.id, rest.mime) })),
  }
}

export const mediaName = (id: string, mime: string) => `${id}.${(mime.split('/')[1] || 'bin').replace('jpeg', 'jpg').replace('svg+xml', 'svg')}`

async function writeFile(dir: FileSystemDirectoryHandle, name: string, data: Blob | string) {
  const fh = await dir.getFileHandle(name, { create: true })
  const w = await (fh as any).createWritable()
  await w.write(data)
  await w.close()
}

const writtenMedia = new Set<string>()

export async function writeSnapshot() {
  if (!handle || !state.connected) return
  const data = await handle.getDirectoryHandle('data', { create: true })
  await writeFile(data, 'db.json', JSON.stringify(await dumpData(), null, 2))
  const media = await data.getDirectoryHandle('media', { create: true })
  for (const a of await db.assets.toArray()) {
    const name = mediaName(a.id, a.mime)
    if (writtenMedia.has(name)) continue
    try {
      await media.getFileHandle(name)
    } catch {
      await writeFile(media, name, a.blob)
    }
    writtenMedia.add(name)
  }
  await handle.getDirectoryHandle('inbox', { create: true })
  emit({ lastSavedAt: new Date().toISOString(), error: undefined })
}

/** Substitui TODO o banco local pelo snapshot da pasta (usar em outra máquina / restauração). */
export async function loadSnapshotFromFolder() {
  if (!handle) throw new Error('Nenhuma pasta conectada')
  const data = await handle.getDirectoryHandle('data')
  const json = JSON.parse(await (await (await data.getFileHandle('db.json')).getFile()).text())
  const media = await data.getDirectoryHandle('media', { create: true })
  const blobs: Record<string, Blob> = {}
  for (const a of json.assets ?? []) {
    try {
      blobs[a.id] = await (await media.getFileHandle(a.file)).getFile()
    } catch { /* arquivo ausente */ }
  }
  await replaceAll(json, blobs)
}

export async function replaceAll(json: any, blobs: Record<string, Blob>) {
  if (json.schema !== 'mc-studio/snapshot@1') throw new Error('Arquivo não é um snapshot do MC Content Studio')
  await db.transaction('rw', [...DATA_TABLES.map((t) => (db as any)[t]), db.assets], async () => {
    for (const t of DATA_TABLES) {
      await (db as any)[t].clear()
      await (db as any)[t].bulkAdd(json.tables[t] ?? [])
    }
    await db.assets.clear()
    for (const a of json.assets ?? []) {
      const { file, dataUrl, ...rest } = a
      const blob = blobs[a.id] ?? (dataUrl ? await (await fetch(dataUrl)).blob() : undefined)
      if (blob) await db.assets.add({ ...rest, blob })
    }
  })
}

// ---------- Fallback manual (sem pasta) ----------
export async function exportFile() {
  const dump: any = await dumpData()
  const assets = await db.assets.toArray()
  dump.assets = await Promise.all(
    assets.map(async ({ blob, ...rest }) => ({ ...rest, dataUrl: await blobToDataUrl(blob) })),
  )
  const blob = new Blob([JSON.stringify(dump)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `mc-content-studio-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
}

export async function importFile(file: File) {
  await replaceAll(JSON.parse(await file.text()), {})
}

export function blobToDataUrl(b: Blob): Promise<string> {
  return new Promise((res) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.readAsDataURL(b)
  })
}
