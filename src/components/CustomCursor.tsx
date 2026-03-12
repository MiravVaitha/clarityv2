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

  const arrowGlow = `drop-shadow(0 0 4px ${glowColor}) drop-shadow(0 0 8px ${glowColor})`
  const pointerGlow = `drop-shadow(0 1px 4px rgba(0,0,0,0.9)) drop-shadow(0 0 7px ${glowColor})`

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
      {/* ── Default arrow ── */}
      {type === 'default' && (
        <svg
          width="16"
          height="22"
          viewBox="0 0 16 22"
          style={{
            display: 'block',
            filter: arrowGlow,
            transition: 'filter 0.6s ease',
          }}
        >
          <path
            d="M 1 1 L 1 19 L 5.5 14.5 L 8 21 L 10 20.2 L 7.5 13.8 L 13 13.8 Z"
            fill="white"
            stroke="rgba(0,0,0,0.28)"
            strokeWidth="0.7"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {/* ── Text / I-beam — centred on hotspot ── */}
      {type === 'text' && (
        <svg
          width="20"
          height="26"
          viewBox="0 0 20 26"
          style={{
            display: 'block',
            transform: 'translate(-10px, -13px)',
            filter: 'drop-shadow(0 1px 5px rgba(0,0,0,0.95))',
          }}
        >
          <line x1="3"  y1="4"  x2="17" y2="4"  stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="10" y1="4"  x2="10" y2="22" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="3"  y1="22" x2="17" y2="22" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          {/* Amber dot — top (Bear) */}
          <circle cx="10" cy="4"  r="2.6" fill="rgba(251,191,36,1)"  />
          {/* Emerald dot — bottom (Parrot) */}
          <circle cx="10" cy="22" r="2.6" fill="rgba(52,211,153,1)"  />
        </svg>
      )}

      {/* ── Pointer / hand cursor ── */}
      {type === 'pointer' && (
        <svg
          width="22"
          height="28"
          viewBox="0 0 22 28"
          style={{
            display: 'block',
            transform: 'translate(-5px, 0px)',
            filter: pointerGlow,
            transition: 'filter 0.6s ease',
          }}
        >
          <path
            d="M7 1C7 0.4 7.5 0 8.2 0C8.9 0 9.4 0.4 9.4 1
               L9.4 13
               C9.9 12.4 10.6 12.1 11.3 12.3C12.1 12.6 12.5 13.3 12.5 14
               C13 13.4 13.7 13.1 14.4 13.3C15.2 13.6 15.5 14.3 15.5 15
               C16 14.5 16.6 14.3 17.2 14.5C18 14.8 18.3 15.5 18.3 16.3
               L18.3 18.5
               C18.3 22.1 15.6 25.5 12 25.5
               L9 25.5
               C6.5 25.5 4.5 24 3.5 22
               L1.8 17.5
               C1.3 16.2 1.8 14.8 3 14.2C4.1 13.7 5.4 14.1 6 15.2
               L7 17
               L7 1Z"
            fill="white"
            stroke="rgba(0,0,0,0.28)"
            strokeWidth="0.7"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  )
}
