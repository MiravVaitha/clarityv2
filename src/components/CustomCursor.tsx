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
        </svg>
      )}

      {/* ── Pointer / hand cursor ── */}
      {type === 'pointer' && (
        <svg
          width="14"
          height="20"
          viewBox="0 0 14 20"
          style={{
            display: 'block',
            transform: 'translate(-7px, 0px)',
            filter: pointerGlow,
            transition: 'filter 0.6s ease',
          }}
        >
          <path
            d="M6 1.5
               C6 0.7 6.5 0.2 7.2 0.2
               C7.9 0.2 8.3 0.7 8.3 1.5
               L8.3 8
               C8.8 7.5 9.4 7.3 10 7.5
               C10.6 7.8 10.9 8.4 10.9 9.1
               C11.3 8.6 11.9 8.5 12.5 8.8
               C13 9.1 13.3 9.7 13.3 10.4
               L13.3 12.5
               C13.3 16 10.8 18.5 7.8 18.5
               L5.5 18.5
               C3.3 18.5 1.8 17.3 1 15.7
               L0.3 12.8
               C0 11.7 0.5 10.7 1.6 10.3
               C2.6 9.9 3.7 10.3 4.2 11.3
               C4.6 12.1 4.8 12.8 5.3 13.2
               C5.5 12.2 5.8 11.2 6 10.5
               L6 1.5Z"
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
