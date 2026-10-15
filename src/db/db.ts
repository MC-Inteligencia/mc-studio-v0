import Dexie, { type EntityTable } from 'dexie'
import type {
  ActivityLog, Approval, Asset, Comment, ContentItem, Idea, Pillar, Setting, Source, User, Version,
} from './types'

export class StudioDB extends Dexie {
  users!: EntityTable<User, 'id'>
  pillars!: EntityTable<Pillar, 'id'>
  sources!: EntityTable<Source, 'id'>
  ideas!: EntityTable<Idea, 'id'>
  contents!: EntityTable<ContentItem, 'id'>
  versions!: EntityTable<Version, 'id'>
  assets!: EntityTable<Asset, 'id'>
  comments!: EntityTable<Comment, 'id'>
  approvals!: EntityTable<Approval, 'id'>
  activity!: EntityTable<ActivityLog, 'id'>
  settings!: EntityTable<Setting, 'key'>

  constructor() {
    super('mc-content-studio')
    this.version(1).stores({
      users: 'id',
      pillars: 'id',
      sources: 'id',
      ideas: 'id, createdAt',
      contents: 'id, scheduledAt, status, format, channel',
      versions: 'id, contentId, [contentId+number]',
      assets: 'id, contentId',
      comments: 'id, contentId, createdAt',
      approvals: 'id, contentId, createdAt',
      activity: 'id, contentId, createdAt',
      settings: 'key',
    })
  }
}

export const db = new StudioDB()

/** Tabelas que entram no snapshot JSON (assets vão como arquivos separados). */
export const DATA_TABLES = [
  'users', 'pillars', 'sources', 'ideas', 'contents', 'versions', 'comments', 'approvals', 'activity',
] as const
