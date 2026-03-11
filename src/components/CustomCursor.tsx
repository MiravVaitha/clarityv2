'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function CustomCursor() {
  const cursorRef = useRef<SVGSVGElement>(null)
  const pathname = usePathname()

  const glowColor = pathname?.includes('/parrot')
    ? 'rgba(52,211,153,0.95)'
    : pathname?.includes('/bear')
    ? 'rgba(251,191,36,0.95)'
    : 'rgba(220,190,100,0.75)'

  useEffect(() => {
    const el = cursorRef.current
    if (!el) return

    const move = (e: MouseEvent) => {
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      if (el.style.opacity === '0') el.style.opacity = '1'
    }
    const hide = () => { el.style.opacity = '0' }
    const show = () => { el.style.opacity = '1' }

    document.addEventListener('mousemove', move)
    document.addEventListener('mouseleave', hide)
    document.addEventListener('mouseenter', show)

    return () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseleave', hide)
      document.removeEventListener('mouseenter', show)
    }
  }, [])

  return (
    <svg
      ref={cursorRef}
      width="16"
      height="22"
      viewBox="0 0 16 22"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        zIndex: 99999,
        opacity: 0,
        willChange: 'transform',
        filter: `drop-shadow(0 0 4px ${glowColor}) drop-shadow(0 0 8px ${glowColor})`,
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
  )
}
