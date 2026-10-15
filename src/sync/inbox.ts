// Importa pacotes JSON colocados em <pasta>/inbox/ (contrato: docs/CONTRATO-INBOX.md).
// É a ponte da v0 entre a produção feita fora do sistema (Claude) e o sistema.
import { db } from '../db/db'
import type { ContentBody, ContentItem, FormatId, Status, VersionSource } from '../db/types'
import { addAsset, addComment, createContent, saveIdea, snapshotVersion } from '../db/repo'
import { getHandle, writeSnapshot } from './folder'
import { uid } from '../lib/constants'

export interface InboxItem {
  match?: { id?: string; scheduledAt?: string; format?: FormatId }
  create?: { title: string; format: FormatId; scheduledAt: string; pillar?: string; tag?: string }
  set?: Partial<Pick<ContentItem, 'title' | 'hook' | 'objective' | 'notes' | 'publishedUrl' | 'tag' | 'sourceText'>> & { status?: Status }
  body?: Partial<ContentBody>
  versionNote?: string
  source?: VersionSource
  comment?: string
}
export interface InboxPackage {
  schema: 'mc-studio/inbox@1'
  items?: InboxItem[]
  ideas?: { title: string; hook?: string; notes?: string; format?: FormatId; pillar?: string }[]
}

export interface InboxResult { files: number; updated: number; created: number; ideas: number; errors: string[] }

async function pillarIdByName(name?: string) {
  if (!name) return undefined
  const all = await db.pillars.toArray()
  return all.find((p) => p.name.toLowerCase() === name.toLowerCase())?.id
}

async function resolveFile(dir: FileSystemDirectoryHandle, path: string): Promise<File> {
  const parts = path.split('/').filter(Boolean)
  let d = dir
  for (const p of parts.slice(0, -1)) d = await d.getDirectoryHandle(p)
  return (await d.getFileHandle(parts.at(-1)!)).getFile()
}

/** Troca referências "assetFile" por assetId, importando o arquivo da inbox. */
async function importBodyAssets(body: any, inbox: FileSystemDirectoryHandle | undefined, contentId: string) {
  const walk = async (o: any) => {
    if (!o || typeof o !== 'object') return
    for (const k of Object.keys(o)) {
      if (inbox && (k === 'assetFile' || k === 'imageAssetFile') && typeof o[k] === 'string') {
        const f = await resolveFile(inbox, o[k])
        const id = await addAsset(f, f.name, contentId)
        o[k === 'assetFile' ? 'assetId' : 'imageAssetId'] = id
        delete o[k]
      } else await walk(o[k])
    }
  }
  await walk(body)
  for (const key of ['slides', 'script', 'frames'] as const) {
    if (Array.isArray(body[key])) body[key] = body[key].map((x: any) => ({ id: uid(), ...x }))
  }
}

export async function applyPackage(pkg: InboxPackage, inbox?: FileSystemDirectoryHandle): Promise<Omit<InboxResult, 'files'>> {
  const r = { updated: 0, created: 0, ideas: 0, errors: [] as string[] }
  if (pkg.schema !== 'mc-studio/inbox@1') throw new Error('schema inválido (esperado mc-studio/inbox@1)')
  for (const it of pkg.items ?? []) {
    try {
      let c: ContentItem | undefined
      if (it.match?.id) c = await db.contents.get(it.match.id)
      else if (it.match?.scheduledAt) {
        const list = await db.contents.where('scheduledAt').equals(it.match.scheduledAt).toArray()
        c = list.find((x) => !it.match!.format || x.format === it.match!.format)
      }
      if (!c && it.create) {
        const id = await createContent({
          title: it.create.title, format: it.create.format, scheduledAt: it.create.scheduledAt,
          pillarId: await pillarIdByName(it.create.pillar), tag: it.create.tag,
        })
        c = await db.contents.get(id)
        r.created++
      } else if (c) r.updated++
      if (!c) { r.errors.push(`Item sem correspondência: ${JSON.stringify(it.match)}`); continue }

      if (it.body) {
        const body = structuredClone(it.body)
        await importBodyAssets(body, inbox, c.id)
        await db.contents.update(c.id, { body: { ...c.body, ...body } })
      }
      const { status, ...rest } = it.set ?? {}
      if (Object.keys(rest).length) await db.contents.update(c.id, rest)
      if (it.versionNote || it.body) await snapshotVersion(c.id, it.versionNote ?? 'Importado da inbox', it.source ?? 'claude_external')
      if (status) await db.contents.update(c.id, { status })
      if (it.comment) await addComment(c.id, it.comment)
    } catch (e: any) {
      r.errors.push(String(e?.message ?? e))
    }
  }
  for (const i of pkg.ideas ?? []) {
    await saveIdea({ title: i.title, hook: i.hook, notes: i.notes, format: i.format, pillarId: await pillarIdByName(i.pillar) })
    r.ideas++
  }
  return r
}

export async function processInbox(): Promise<InboxResult> {
  const root = getHandle()
  if (!root) throw new Error('Conecte a pasta primeiro')
  const inbox = await root.getDirectoryHandle('inbox', { create: true })
  const done = await inbox.getDirectoryHandle('processados', { create: true })
  const res: InboxResult = { files: 0, updated: 0, created: 0, ideas: 0, errors: [] }
  for await (const entry of (inbox as any).values() as AsyncIterable<FileSystemHandle>) {
    if (entry.kind !== 'file' || !entry.name.endsWith('.json')) continue
    const file = await (entry as FileSystemFileHandle).getFile()
    try {
      const r = await applyPackage(JSON.parse(await file.text()), inbox)
      res.updated += r.updated; res.created += r.created; res.ideas += r.ideas; res.errors.push(...r.errors)
      const stamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fh = await done.getFileHandle(`${stamp}__${entry.name}`, { create: true })
      const w = await (fh as any).createWritable(); await w.write(file); await w.close()
      await inbox.removeEntry(entry.name)
      res.files++
    } catch (e: any) {
      res.errors.push(`${entry.name}: ${e?.message ?? e}`)
    }
  }
  await writeSnapshot()
  return res
}
