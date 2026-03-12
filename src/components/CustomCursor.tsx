'use client'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

type CursorType = 'default' | 'pointer' | 'text'

export default function CustomCursor() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [type, setType] = useState<CursorType>('default')
  const [visible, setVisible] = useState(false)
  const pathname = usePathname()

  const glowColor = pathname?.includes('/parrot')
    ? 'rgba(52,211,153,0.9)'
    : pathname?.includes('/bear')
    ? 'rgba(251,191,36,0.9)'
    : 'rgba(220,190,100,0.7)'

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const wrap = wrapRef.current
    if (!wrap) return

    let rafId: number

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        wrap.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      })

      setVisible(true)

      const target = document.elementFromPoint(e.clientX, e.clientY) as Element | null
      if (!target) return

      if (target.closest('input, textarea, [contenteditable="true"]')) {
        setType('text')
      } else if (
        target.closest('button, a, [role="button"], select, label, [tabindex]:not([tabindex="-1"])')
      ) {
        setType('pointer')
      } else {
        setType('default')
      }
    }

    const onLeave = () => setVisible(false)
    const onEnter = () => setVisible(true)

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
      cancelAnimationFrame(rafId)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // All three cursors share the same glow style — white shape + page-aware colour glow
  const glow = `drop-shadow(0 0 4px ${glowColor}) drop-shadow(0 0 8px ${glowColor})`

  const sharedPath = {
    fill: 'white',
    stroke: 'rgba(0,0,0,0.28)',
    strokeWidth: '0.7',
    strokeLinejoin: 'round' as const,
  }

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 99999,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease',
        willChange: 'transform',
        transform: 'translate(-200px, -200px)',
      }}
    >
      {/* ── Default arrow — hotspot top-left ── */}
      {type === 'default' && (
        <svg
          width="16" height="22" viewBox="0 0 16 22"
          style={{ display: 'block', filter: glow, transition: 'filter 0.6s ease' }}
        >
          <path
            d="M 1 1 L 1 19 L 5.5 14.5 L 8 21 L 10 20.2 L 7.5 13.8 L 13 13.8 Z"
            {...sharedPath}
          />
        </svg>
      )}

      {/* ── Text / I-beam — hotspot centred, same glow as arrow ── */}
      {type === 'text' && (
        <svg
          width="16" height="22" viewBox="0 0 16 22"
          style={{
            display: 'block',
            transform: 'translate(-8px, -11px)',
            filter: glow,
            transition: 'filter 0.6s ease',
          }}
        >
          {/* Top serif */}
          <line x1="2" y1="2" x2="14" y2="2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          {/* Stem */}
          <line x1="8" y1="2" x2="8" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          {/* Bottom serif */}
          <line x1="2" y1="20" x2="14" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}

      {/* ── Pointer / hand — hotspot at finger tip, same glow as arrow ── */}
      {type === 'pointer' && (
        <svg
          width="16" height="22" viewBox="0 0 16 22"
          style={{
            display: 'block',
            transform: 'translate(-7px, 0px)',
            filter: glow,
            transition: 'filter 0.6s ease',
          }}
        >
          {/*
            Index finger: y 1.5 → 7.5  (6 px, ~30% of 21 total)
            Palm:         y 7.5 → 21   (13.5 px)
            Other fingers shown as three gentle bumps on the right side
            Thumb web: concave curve on the bottom-left reconnecting to finger
          */}
          <path
            d="M5.5 1.5
               C5.5 0.7 6.1 0.2 7 0.2
               C7.9 0.2 8.5 0.7 8.5 1.5
               L8.5 7.5
               C9 7 9.7 6.8 10.3 7.1
               C10.9 7.4 11.1 8.1 11.1 8.8
               C11.6 8.3 12.2 8.2 12.8 8.5
               C13.3 8.9 13.5 9.5 13.5 10.2
               L13.5 13
               C13.5 17.2 10.9 21 7.5 21
               L5.5 21
               C3.4 21 1.9 19.5 1.1 17.9
               L0.5 14.8
               C0.2 13.6 0.7 12.4 1.8 11.9
               C2.9 11.4 4.1 11.9 4.6 13
               L5.5 15
               L5.5 1.5Z"
            {...sharedPath}
          />
        </svg>
      )}
    </div>
  )
}
