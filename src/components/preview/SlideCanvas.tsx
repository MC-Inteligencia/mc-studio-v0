import { forwardRef, type CSSProperties, type ReactNode } from 'react'
import type { Slide } from '../../db/types'
import { BRAND } from '../../lib/constants'
import { useAssetUrl, useSetting } from '../../lib/hooks'

// Renderiza uma lâmina no Design System MC 2026 em 1080×1350 (coordenadas reais)
// e escala para a largura pedida. A mesma lâmina é usada para exportar PNG.

const W = 1080
const H = 1350
const Y = BRAND.yellow
const heading: CSSProperties = { fontFamily: 'Geist, Inter, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em' }

function Highlight({ text, word, color }: { text: string; word?: string; color: string }) {
  if (!word) return <>{text}</>
  const i = text.toLowerCase().indexOf(word.toLowerCase())
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <span style={{ color }}>{text.slice(i, i + word.length)}</span>
      {text.slice(i + word.length)}
    </>
  )
}

export interface SlideCanvasProps {
  slide: Slide
  index: number
  total: number
  width: number
  exportMode?: boolean
}

export const SlideCanvas = forwardRef<HTMLDivElement, SlideCanvasProps>(function SlideCanvas(
  { slide, index, total, width, exportMode },
  ref,
) {
  const finalArt = useAssetUrl(slide.assetId)
  const img = useAssetUrl(slide.imageAssetId)
  const avatarId = useSetting<string>('avatarAssetId')
  const avatar = useAssetUrl(avatarId)
  const scale = width / W

  const variant = slide.variant ?? 'dark'
  const bg = variant === 'yellow' ? Y : variant === 'light' ? '#F3F4F6' : '#050814'
  const fg = variant === 'dark' ? '#FFFFFF' : BRAND.blue
  const accent = variant === 'dark' ? Y : BRAND.blue
  const lines = slide.body.split('\n').map((l) => l.trim()).filter(Boolean)

  let content: ReactNode
  if (finalArt) {
    content = <img src={finalArt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
  } else {
    const photoBg = img && (slide.layout === 'A' || slide.layout === 'F' || slide.layout === 'G') && variant === 'dark'
    content = (
      <>
        {photoBg && (
          <>
            <img src={img} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,8,20,0.15) 0%, rgba(5,8,20,0.55) 45%, rgba(5,8,20,0.97) 78%)' }} />
          </>
        )}
        {!photoBg && variant === 'dark' && (
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(120% 80% at 80% 0%, ${BRAND.blue} 0%, ${BRAND.darkBlue} 45%, #03050d 100%)` }} />
        )}

        {/* header micro */}
        <div style={{ position: 'absolute', top: 40, left: 64, right: 64, display: 'flex', justifyContent: 'space-between', fontSize: 20, letterSpacing: '0.08em', fontWeight: 600, color: fg, opacity: 0.55 }}>
          <span>{BRAND.site}</span>
          <span>{BRAND.tagline}</span>
        </div>
        {total > 1 && (
          <div style={{ position: 'absolute', top: 86, right: 64, background: 'rgba(0,0,0,0.35)', color: '#fff', fontSize: 22, padding: '6px 16px', borderRadius: 24 }}>
            {index + 1}/{total}
          </div>
        )}

        <div style={{ position: 'absolute', left: 64, right: 64, top: 150, bottom: 150, display: 'flex', flexDirection: 'column', color: fg }}>
          {renderLayout(slide, lines, { fg, accent, img, variant })}
        </div>

        {slide.sourceNote && (
          <div style={{ position: 'absolute', left: 64, right: 64, bottom: 118, fontSize: 22, color: fg, opacity: 0.6 }}>{slide.sourceNote}</div>
        )}
      </>
    )
  }

  return (
    <div style={{ width, height: H * scale, overflow: 'hidden', flexShrink: 0, borderRadius: exportMode ? 0 : 6 }}>
      <div ref={ref} style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'relative', background: bg, fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
        {content}
        {!finalArt && (
          <div style={{ position: 'absolute', left: 64, right: 64, bottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, overflow: 'hidden', background: avatar ? undefined : 'rgba(255,255,255,0.15)', border: `3px solid ${Y}` }}>
              {avatar && <img src={avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <span style={{ fontSize: 22, fontWeight: 600, color: fg, opacity: 0.5 }}>{BRAND.handle}</span>
          </div>
        )}
      </div>
    </div>
  )
})

function renderLayout(
  s: Slide,
  lines: string[],
  { fg, accent, img, variant }: { fg: string; accent: string; img?: string; variant: string },
): ReactNode {
  const imageCard = (h: number) =>
    img ? (
      <div style={{ height: h, borderRadius: 16, overflow: 'hidden', marginTop: 40 }}>
        <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    ) : null
  const arrow = (
    <div style={{ width: 56, height: 56, background: Y, display: 'flex', alignItems: 'center', justifyContent: 'center', color: BRAND.blue, fontSize: 36, fontWeight: 800, marginBottom: 32, borderRadius: 4 }}>→</div>
  )
  switch (s.layout) {
    case 'A':
      return (
        <div style={{ marginTop: 'auto' }}>
          {s.tag && <div style={{ display: 'inline-block', background: Y, color: BRAND.blue, fontSize: 24, fontWeight: 700, padding: '8px 20px', borderRadius: 24, marginBottom: 28, letterSpacing: '0.05em' }}>{s.tag}</div>}
          <div style={{ ...heading, fontSize: 96, lineHeight: 1.0, color: accent }}>{s.title}</div>
          {s.body && (
            <div style={{ display: 'inline-block', marginTop: 28, background: Y, color: BRAND.blue, fontSize: 34, fontWeight: 700, padding: '10px 18px', lineHeight: 1.25 }}>{s.body}</div>
          )}
        </div>
      )
    case 'B':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: img ? 'flex-start' : 'center' }}>
          <div style={{ ...heading, fontSize: 66, lineHeight: 1.05, color: accent, textDecoration: variant === 'dark' ? 'none' : undefined }}>{s.title}</div>
          <div style={{ fontSize: 36, lineHeight: 1.45, marginTop: 32, color: fg }}>{s.body}</div>
          {imageCard(420)}
        </div>
      )
    case 'C':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
          {arrow}
          <div style={{ ...heading, fontSize: 64, lineHeight: 1.05, color: accent, marginBottom: 40 }}>{s.title}</div>
          {lines.map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 38, marginBottom: 22, color: fg }}>
              <span style={{ width: 18, height: 18, background: Y, flexShrink: 0, borderRadius: 3 }} />
              {l.replace(/^[-•]\s*/, '')}
            </div>
          ))}
        </div>
      )
    case 'D':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
          <div style={{ ...heading, fontSize: 60, color: accent, marginBottom: 48 }}>{s.title}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {lines.map((l, i) => {
              const [v, lab] = l.split('|').map((x) => x.trim())
              return (
                <div key={i} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 32 }}>
                  <div style={{ ...heading, fontSize: 72, color: BRAND.lightBlue }}>{v}</div>
                  <div style={{ fontSize: 28, marginTop: 8, color: fg, opacity: 0.85 }}>{lab}</div>
                </div>
              )
            })}
          </div>
        </div>
      )
    case 'E':
    case 'I':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: 50, lineHeight: 1.25, fontWeight: 600, color: fg }}>{s.title}</div>
          {s.body && <div style={{ fontSize: 46, fontStyle: 'italic', fontWeight: 800, color: accent, marginTop: 40, fontFamily: 'Geist, Inter' }}>“{s.body}”</div>}
          <div style={{ marginTop: 90, fontSize: 30, fontWeight: 700, color: fg, letterSpacing: '0.04em' }}>{BRAND.site}</div>
          <div style={{ fontSize: 24, color: fg, opacity: 0.7, marginTop: 8 }}>{BRAND.tagline}</div>
        </div>
      )
    case 'G':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'Geist', fontSize: 200, lineHeight: 0.8, color: Y, fontWeight: 800 }}>“</div>
          <div style={{ fontFamily: 'Geist', fontSize: 70, lineHeight: 1.1, fontWeight: 700, color: fg }}>{s.title}</div>
          {s.body && <div style={{ fontSize: 42, lineHeight: 1.35, marginTop: 36, color: accent, fontWeight: 600 }}>{s.body}</div>}
        </div>
      )
    case 'H':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ ...heading, fontSize: 60, color: accent }}>{s.title}</div>
          {imageCard(700)}
          <div style={{ fontSize: 32, marginTop: 28, color: fg }}>{s.body}</div>
        </div>
      )
    case 'F':
    default:
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: img && variant === 'dark' ? 'flex-end' : 'center' }}>
          <div style={{ ...heading, fontSize: s.title.length > 60 ? 76 : 100, lineHeight: 1.0, color: accent }}>{s.title}</div>
          {s.body && <div style={{ fontSize: 40, lineHeight: 1.4, marginTop: 36, color: fg }}>{s.body}</div>}
        </div>
      )
  }
}
