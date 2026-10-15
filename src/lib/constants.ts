import type { Channel, Format, Status, FormatId, ContentBody } from '../db/types'

export const CHANNELS: Channel[] = [
  { id: 'instagram', name: 'Instagram' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'linkedin', name: 'LinkedIn' },
]

export const FORMATS: Format[] = [
  { id: 'ig_carrossel', channel: 'instagram', name: 'Carrossel', kind: 'slides', aspect: '4:5', width: 1080, height: 1350, maxSlides: 10, captionMax: 2200, notes: 'Capa (A) → conteúdo → CTA (E). Uma ideia por lâmina, até ~45 palavras.' },
  { id: 'ig_estatico', channel: 'instagram', name: 'Post estático', kind: 'slides', aspect: '4:5', width: 1080, height: 1350, maxSlides: 1, captionMax: 2200 },
  { id: 'ig_reel', channel: 'instagram', name: 'Reel', kind: 'video', aspect: '9:16', width: 1080, height: 1920, durationSec: [30, 60], captionMax: 2200, notes: 'Hook 0–5s; um take por ideia; zona segura 250px topo/base.' },
  { id: 'ig_mc_cut', channel: 'instagram', name: 'MC Cut', kind: 'frames', aspect: '4:5', width: 1080, height: 1350, captionMax: 2200, notes: 'Frame 1 = tensão, Frame 2 = conclusão. Frames reais do podcast.' },
  { id: 'yt_video', channel: 'youtube', name: 'Vídeo YouTube', kind: 'video', aspect: '16:9', width: 1920, height: 1080, notes: 'Título ≤ 70 caracteres; thumbnail 1280×720.' },
  { id: 'yt_short', channel: 'youtube', name: 'Short', kind: 'video', aspect: '9:16', width: 1080, height: 1920, durationSec: [15, 60] },
  { id: 'li_post', channel: 'linkedin', name: 'Post LinkedIn', kind: 'text', aspect: '1:1', width: 1200, height: 1200, captionMax: 3000, notes: 'Primeiras 2 linhas decidem o "ver mais".' },
  { id: 'li_documento', channel: 'linkedin', name: 'Documento (PDF)', kind: 'slides', aspect: '4:5', width: 1080, height: 1350, maxSlides: 20, captionMax: 3000 },
]

export const formatById = (id: FormatId) => FORMATS.find((f) => f.id === id)!

export const STATUSES: { id: Status; label: string; color: string }[] = [
  { id: 'briefing', label: 'Briefing', color: '#6B7280' },
  { id: 'producao', label: 'Em produção', color: '#155DFC' },
  { id: 'revisao', label: 'Em revisão', color: '#A855F7' },
  { id: 'ajustes', label: 'Ajustes', color: '#F97316' },
  { id: 'aprovado', label: 'Aprovado', color: '#16A34A' },
  { id: 'agendado', label: 'Agendado', color: '#0D9488' },
  { id: 'publicado', label: 'Publicado', color: '#162456' },
  { id: 'arquivado', label: 'Arquivado', color: '#9CA3AF' },
]
export const statusMeta = (s: Status) => STATUSES.find((x) => x.id === s)!

export const FORMAT_COLORS: Record<FormatId, string> = {
  ig_carrossel: '#FDC700',
  ig_estatico: '#FCD34D',
  ig_reel: '#155DFC',
  ig_mc_cut: '#F97316',
  yt_video: '#DC2626',
  yt_short: '#F87171',
  li_post: '#0A66C2',
  li_documento: '#38BDF8',
}

export const LAYOUTS: { id: string; name: string }[] = [
  { id: 'A', name: 'A · Hero/Capa' },
  { id: 'B', name: 'B · Texto + imagem' },
  { id: 'C', name: 'C · Lista' },
  { id: 'D', name: 'D · KPIs' },
  { id: 'E', name: 'E · CTA' },
  { id: 'F', name: 'F · Dado/frase' },
  { id: 'G', name: 'G · Citação' },
  { id: 'H', name: 'H · Mosaico' },
  { id: 'I', name: 'I · Agradecimento' },
]

export const uid = () => crypto.randomUUID()
export const nowIso = () => new Date().toISOString()

export const emptyBody = (): ContentBody => ({
  caption: '',
  hashtags: '',
  cta: '',
  slides: [],
  cover: { title: '', highlight: '' },
  script: [],
  frames: [
    { id: uid(), text: '', highlight: '' },
    { id: uid(), text: '', highlight: '' },
  ],
  videoTitle: '',
  description: '',
})

export const BRAND = {
  blue: '#162456',
  darkBlue: '#091134',
  yellow: '#FDC700',
  lightBlue: '#155DFC',
  site: 'MCINTELIGENCIA.COM',
  tagline: 'CONSULTORIA | TREINAMENTO DE BI',
  handle: '@mcinteligencia',
}
