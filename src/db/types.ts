// Modelo de dados da v0. Espelha o schema planejado para Supabase/Postgres na v1:
// cada interface = uma tabela; ids são UUID string; datas em ISO.

export type ChannelId = 'instagram' | 'youtube' | 'linkedin'

export type FormatId =
  | 'ig_carrossel'
  | 'ig_estatico'
  | 'ig_reel'
  | 'ig_mc_cut'
  | 'yt_video'
  | 'yt_short'
  | 'li_post'
  | 'li_documento'

export type BodyKind = 'slides' | 'video' | 'frames' | 'text'

export type Status =
  | 'briefing'
  | 'producao'
  | 'revisao'
  | 'ajustes'
  | 'aprovado'
  | 'agendado'
  | 'publicado'
  | 'arquivado'

export type Role = 'editor' | 'aprovador'

export type VersionSource = 'human' | 'claude_external' | 'ai'

export interface User {
  id: string
  name: string
  role: Role
}

export interface Channel {
  id: ChannelId
  name: string
}

/** Specs como DADO (não hardcode): a IA da v1 lê daqui. */
export interface Format {
  id: FormatId
  channel: ChannelId
  name: string
  kind: BodyKind
  aspect: string // ex.: "4:5"
  width: number
  height: number
  maxSlides?: number
  captionMax?: number
  durationSec?: [number, number]
  notes?: string
}

export interface Pillar {
  id: string
  name: string
  weight: number // peso editorial de referência (%)
  role: string
  themes: string
  color: string
}

export interface Source {
  id: string
  name: string
  edition: string
  evidence: string
  usage: string
  url: string
  note: string
}

export interface Idea {
  id: string
  title: string
  hook: string
  channel?: ChannelId
  format?: FormatId
  pillarId?: string
  notes: string
  createdBy: string
  createdAt: string
  promotedContentId?: string
}

export type SlideLayout = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I'

export interface Slide {
  id: string
  layout: SlideLayout
  tag?: string
  title: string
  body: string
  sourceNote?: string
  variant?: 'dark' | 'yellow' | 'light'
  /** arte final (PNG exportado) — se existir, a prévia mostra a imagem */
  assetId?: string
  /** imagem de apoio dentro do layout */
  imageAssetId?: string
}

export interface ScriptTake {
  id: string
  time: string
  speech: string
  screenText: string
}

export interface Frame {
  id: string
  text: string
  highlight: string
  assetId?: string
}

/** Corpo estruturado do conteúdo — texto, não imagem, para a IA da v1 conseguir editar. */
export interface ContentBody {
  caption: string
  hashtags: string
  cta: string
  slides: Slide[]
  cover: { title: string; highlight: string; assetId?: string }
  script: ScriptTake[]
  frames: Frame[]
  videoTitle: string
  description: string
  externalLink?: string // ex.: link do CarrosseIA
}

export interface ContentItem {
  id: string
  title: string
  channel: ChannelId
  format: FormatId
  pillarId?: string
  tag: string // recorte fino (ex.: "IA + Carreira")
  status: Status
  scheduledAt: string // YYYY-MM-DD
  hook: string
  objective: string
  notes: string
  sourceIds: string[]
  sourceText: string
  body: ContentBody // rascunho de trabalho
  currentVersionId?: string
  publishedUrl?: string
  weekNumber?: number
  createdAt: string
  updatedAt: string
}

export interface Version {
  id: string
  contentId: string
  number: number
  source: VersionSource
  body: ContentBody
  note: string
  authorId: string
  createdAt: string
  generationMeta?: Record<string, unknown> // v1: modelo, prompt, custo...
}

export interface Asset {
  id: string
  contentId?: string
  name: string
  mime: string
  blob: Blob
  createdAt: string
}

export interface Comment {
  id: string
  contentId: string
  versionId?: string
  slideRef?: string
  authorId: string
  text: string
  resolved: boolean
  createdAt: string
}

export interface Approval {
  id: string
  contentId: string
  versionId: string
  decision: 'aprovado' | 'ajustes'
  authorId: string
  note: string
  createdAt: string
}

export interface ActivityLog {
  id: string
  contentId?: string
  authorId: string
  action: string
  createdAt: string
}

export interface Setting {
  key: string
  value: unknown
}
