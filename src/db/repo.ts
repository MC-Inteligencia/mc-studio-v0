import { db } from './db'
import type { ContentBody, ContentItem, Idea, Status, VersionSource, FormatId } from './types'
import { emptyBody, nowIso, uid, formatById } from '../lib/constants'
import { scheduleSnapshot } from '../sync/folder'

async function log(action: string, contentId?: string) {
  const authorId = (await currentUserId()) ?? 'sistema'
  await db.activity.add({ id: uid(), contentId, authorId, action, createdAt: nowIso() })
}

export async function currentUserId(): Promise<string | undefined> {
  const s = await db.settings.get('currentUserId')
  return s?.value as string | undefined
}

export async function setCurrentUser(id: string) {
  await db.settings.put({ key: 'currentUserId', value: id })
}

const touched = () => scheduleSnapshot()

export async function saveContent(id: string, patch: Partial<ContentItem>) {
  await db.contents.update(id, { ...patch, updatedAt: nowIso() })
  touched()
}

export async function saveBody(id: string, body: ContentBody) {
  await db.contents.update(id, { body, updatedAt: nowIso() })
  touched()
}

export async function createContent(data: {
  title: string; format: FormatId; scheduledAt: string; pillarId?: string; hook?: string; tag?: string
}): Promise<string> {
  const f = formatById(data.format)
  const id = uid()
  await db.contents.add({
    id,
    title: data.title,
    channel: f.channel,
    format: data.format,
    pillarId: data.pillarId,
    tag: data.tag ?? '',
    status: 'briefing',
    scheduledAt: data.scheduledAt,
    hook: data.hook ?? '',
    objective: '',
    notes: '',
    sourceIds: [],
    sourceText: '',
    body: emptyBody(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  })
  await log('criou o conteúdo', id)
  touched()
  return id
}

export async function deleteContent(id: string) {
  await db.transaction('rw', [db.contents, db.versions, db.comments, db.approvals, db.assets, db.activity], async () => {
    await db.contents.delete(id)
    await db.versions.where('contentId').equals(id).delete()
    await db.comments.where('contentId').equals(id).delete()
    await db.approvals.where('contentId').equals(id).delete()
    await db.assets.where('contentId').equals(id).delete()
    await db.activity.where('contentId').equals(id).delete()
  })
  touched()
}

export async function setStatus(id: string, status: Status) {
  await db.contents.update(id, { status, updatedAt: nowIso() })
  await log(`mudou status para "${status}"`, id)
  touched()
}

/** Congela o rascunho atual como nova versão. */
export async function snapshotVersion(contentId: string, note: string, source: VersionSource = 'human', meta?: Record<string, unknown>) {
  const c = await db.contents.get(contentId)
  if (!c) throw new Error('conteúdo não encontrado')
  const last = await db.versions.where('contentId').equals(contentId).sortBy('number')
  const number = (last.at(-1)?.number ?? 0) + 1
  const id = uid()
  await db.versions.add({
    id, contentId, number, source, body: structuredClone(c.body), note,
    authorId: (await currentUserId()) ?? 'sistema', createdAt: nowIso(), generationMeta: meta,
  })
  await db.contents.update(contentId, { currentVersionId: id, updatedAt: nowIso() })
  await log(`salvou a versão v${number}`, contentId)
  touched()
  return id
}

export async function submitForReview(contentId: string, note: string) {
  await snapshotVersion(contentId, note || 'Enviado para revisão')
  await setStatus(contentId, 'revisao')
}

export async function decide(contentId: string, decision: 'aprovado' | 'ajustes', note: string) {
  const c = await db.contents.get(contentId)
  if (!c) return
  let versionId = c.currentVersionId
  if (!versionId) versionId = await snapshotVersion(contentId, 'Versão criada na decisão')
  await db.approvals.add({
    id: uid(), contentId, versionId, decision, note,
    authorId: (await currentUserId()) ?? 'sistema', createdAt: nowIso(),
  })
  if (note.trim()) await addComment(contentId, (decision === 'aprovado' ? '✅ ' : '↩️ ') + note, versionId)
  await setStatus(contentId, decision)
}

export async function restoreVersion(contentId: string, versionId: string) {
  const v = await db.versions.get(versionId)
  if (!v) return
  await db.contents.update(contentId, { body: structuredClone(v.body), updatedAt: nowIso() })
  await log(`restaurou a versão v${v.number} para o rascunho`, contentId)
  touched()
}

export async function addComment(contentId: string, text: string, versionId?: string, slideRef?: string) {
  await db.comments.add({
    id: uid(), contentId, versionId, slideRef, text, resolved: false,
    authorId: (await currentUserId()) ?? 'sistema', createdAt: nowIso(),
  })
  touched()
}

export async function toggleComment(id: string) {
  const c = await db.comments.get(id)
  if (c) await db.comments.update(id, { resolved: !c.resolved })
  touched()
}

export async function deleteComment(id: string) {
  await db.comments.delete(id)
  touched()
}

export async function addAsset(file: File | Blob, name: string, contentId?: string) {
  const id = uid()
  await db.assets.add({ id, contentId, name, mime: file.type || 'image/png', blob: file, createdAt: nowIso() })
  touched()
  return id
}

// ---------- Ideias ----------
export async function saveIdea(idea: Partial<Idea> & { title: string }) {
  if (idea.id) {
    await db.ideas.update(idea.id, idea)
  } else {
    await db.ideas.add({
      id: uid(), title: idea.title, hook: idea.hook ?? '', notes: idea.notes ?? '',
      channel: idea.channel, format: idea.format, pillarId: idea.pillarId,
      createdBy: (await currentUserId()) ?? 'sistema', createdAt: nowIso(),
    })
  }
  touched()
}

export async function deleteIdea(id: string) {
  await db.ideas.delete(id)
  touched()
}

export async function promoteIdea(ideaId: string, format: FormatId, scheduledAt: string) {
  const idea = await db.ideas.get(ideaId)
  if (!idea) return
  const id = await createContent({ title: idea.title, format, scheduledAt, pillarId: idea.pillarId, hook: idea.hook })
  await db.contents.update(id, { notes: idea.notes })
  await db.ideas.update(ideaId, { promotedContentId: id })
  touched()
  return id
}
