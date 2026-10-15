import { db } from './db'
import type { ContentItem, FormatId, Version } from './types'
import { emptyBody, nowIso, uid } from '../lib/constants'
import { CALENDAR, CAROUSELS, MC_CUTS, PILLARS, REELS, SOURCES, pillarForTag, reelTakes } from './seed-data'

const FMT: Record<string, FormatId> = { Carrossel: 'ig_carrossel', Reel: 'ig_reel', 'MC Cut': 'ig_mc_cut' }

export async function seedIfEmpty() {
  if ((await db.contents.count()) > 0 || (await db.settings.get('seeded'))) return
  const now = nowIso()
  await db.transaction('rw', [db.users, db.pillars, db.sources, db.contents, db.versions, db.settings, db.activity], async () => {
    await db.users.bulkAdd([
      { id: 'u_leo', name: 'Leo', role: 'editor' },
      { id: 'u_aprovador', name: 'Aprovador', role: 'aprovador' },
    ])
    await db.settings.put({ key: 'currentUserId', value: 'u_leo' })
    await db.pillars.bulkAdd(PILLARS)
    await db.sources.bulkAdd(SOURCES)

    const versions: Version[] = []
    const items: ContentItem[] = CALENDAR.map(([week, date, fmt, tag, title, hook, base]) => {
      const id = uid()
      const body = emptyBody()
      let status: ContentItem['status'] = 'briefing'
      let sourceIds: string[] = []
      let currentVersionId: string | undefined

      const car = CAROUSELS[date]
      if (fmt === 'Carrossel' && car) {
        body.slides = car.slides.map(([layout, t, b, tg, src]) => ({ id: uid(), layout, title: t, body: b, tag: tg, sourceNote: src }))
        body.caption = car.caption
        body.hashtags = car.hashtags
        body.cta = car.cta
        sourceIds = car.sources
        status = 'revisao'
        currentVersionId = uid()
        versions.push({
          id: currentVersionId, contentId: id, number: 1, source: 'claude_external', body: structuredClone(body),
          note: 'Roteiro final para CarrosseIA (a partir dos roteiros V1)', authorId: 'u_leo', createdAt: now,
        })
      }
      const reel = REELS[date]
      if (fmt === 'Reel' && reel) {
        body.cover = { title: reel.cover[0], highlight: reel.cover[1] }
        body.script = reelTakes(date)
        body.caption = reel.caption
        body.cta = reel.cta
        status = 'producao'
      }
      const cut = MC_CUTS[date]
      if (fmt === 'MC Cut' && cut) {
        body.frames = [
          { id: uid(), text: cut.f1[0], highlight: cut.f1[1] },
          { id: uid(), text: cut.f2[0], highlight: cut.f2[1] },
        ]
        body.caption = cut.caption
        status = 'producao'
      }
      return {
        id, title, channel: 'instagram', format: FMT[fmt], pillarId: pillarForTag(tag), tag, status,
        scheduledAt: date, hook, objective: '', notes: '', sourceIds, sourceText: base, body,
        currentVersionId, weekNumber: week, createdAt: now, updatedAt: now,
      }
    })
    await db.contents.bulkAdd(items)
    await db.versions.bulkAdd(versions)
    await db.activity.add({ id: uid(), authorId: 'sistema', action: 'Carga inicial: calendário editorial (36 posts), 4 pilares, 14 fontes', createdAt: now })
    await db.settings.put({ key: 'seeded', value: now })
  })
}
