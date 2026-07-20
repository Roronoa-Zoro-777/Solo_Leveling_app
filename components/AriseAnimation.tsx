'use client'

import { useEffect, useRef } from 'react'

export default function AriseAnimation({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(onComplete, 3200)
    return () => clearTimeout(timer)
  }, [onComplete])

  const smokes = Array.from({ length: 18 }, (_, i) => ({
    x: 40 + Math.random() * 20,
    delay: Math.random() * 1.2,
    duration: 1.5 + Math.random() * 1.5,
    size: 60 + Math.random() * 120,
    hue: 280 + Math.random() * 60,
  }))

  return (
    <div
      ref={containerRef}
      className="arise-overlay"
      onClick={onComplete}
      style={{ cursor: 'pointer' }}
    >
      {/* smoke particles */}
      {smokes.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            bottom: '5%',
            left: `${s.x}%`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, hsla(${s.hue}, 80%, 60%, 0.4) 0%, transparent 70%)`,
            filter: 'blur(20px)',
            animation: `arise-float ${s.duration}s ease-in-out ${s.delay}s infinite`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Dark shadow silhouette */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '300px',
        height: '500px',
        background: 'linear-gradient(0deg, rgba(100, 0, 200, 0.3) 0%, transparent 60%)',
        filter: 'blur(40px)',
        animation: 'fade-in 0.5s ease',
      }} />

      {/* ARISE text */}
      <div className="arise-text">ARISE</div>

      {/* Subtitle */}
      <div style={{
        fontFamily: 'Orbitron, monospace',
        fontSize: 14,
        letterSpacing: '0.4em',
        color: 'rgba(168, 85, 247, 0.8)',
        textTransform: 'uppercase',
        marginTop: 20,
        animation: 'fade-in 1s ease 0.5s both',
      }}>
        ◈ QUEST COMPLETED ◈
      </div>

      {/* Hint */}
      <div style={{
        position: 'absolute',
        bottom: 32,
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: 13,
        color: 'rgba(144, 144, 184, 0.5)',
        letterSpacing: '0.1em',
      }}>
        Click anywhere to continue
      </div>
    </div>
  )
}
