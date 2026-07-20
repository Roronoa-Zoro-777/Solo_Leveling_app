'use client'
import { useEffect } from 'react'

export default function RankUpCeremony({ newRank, onComplete }: { newRank: string; onComplete: () => void }) {
  useEffect(() => {
    const t = setTimeout(onComplete, 4000)
    return () => clearTimeout(t)
  }, [onComplete])

  const rankColors: Record<string, string> = {
    E: '#6b7280', D: '#22c55e', C: '#3b82f6',
    B: '#a855f7', A: '#f59e0b', S: '#ef4444', NATIONAL: '#fbbf24',
  }
  const color = rankColors[newRank] || '#7c3aed'

  const label: Record<string, string> = {
    E: 'E-RANK', D: 'D-RANK', C: 'C-RANK',
    B: 'B-RANK', A: 'A-RANK', S: 'S-RANK', NATIONAL: 'NATIONAL LEVEL',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#000',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        animation: 'fade-in 0.1s ease',
        cursor: 'pointer',
      }}
      onClick={onComplete}
    >
      {/* Expanding ring blast */}
      <div style={{
        position: 'absolute',
        width: 100, height: 100,
        borderRadius: '50%',
        background: color,
        opacity: 0.3,
        animation: 'rank-blast 1s cubic-bezier(0.16,1,0.3,1) 0.3s both',
      }} />

      {/* System message */}
      <div style={{
        fontFamily: 'Orbitron, monospace',
        fontSize: 11,
        letterSpacing: '0.4em',
        color: 'rgba(255,255,255,0.4)',
        textTransform: 'uppercase',
        marginBottom: 24,
        animation: 'slide-in-top 0.6s ease 0.8s both',
      }}>
        ◈ SYSTEM NOTIFICATION ◈
      </div>

      <div style={{
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: 18,
        letterSpacing: '0.2em',
        color: 'rgba(255,255,255,0.6)',
        textTransform: 'uppercase',
        marginBottom: 16,
        animation: 'fade-in 0.6s ease 1s both',
      }}>
        You have been promoted to
      </div>

      {/* Big rank badge */}
      <div style={{
        width: 120, height: 120,
        borderRadius: 12,
        border: `3px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${color}22`,
        boxShadow: `0 0 40px ${color}, 0 0 80px ${color}66`,
        animation: 'scale-in 0.6s cubic-bezier(0.34,1.56,0.64,1) 1.2s both',
        marginBottom: 24,
      }}>
        <span style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: 48,
          fontWeight: 900,
          color: color,
          textShadow: `0 0 20px ${color}`,
        }}>
          {newRank}
        </span>
      </div>

      <div style={{
        fontFamily: 'Cinzel, serif',
        fontSize: 28,
        fontWeight: 700,
        color,
        textShadow: `0 0 20px ${color}`,
        letterSpacing: '0.15em',
        animation: 'slide-in-bottom 0.6s ease 1.5s both',
      }}>
        {label[newRank] || newRank} HUNTER
      </div>

      <div style={{
        position: 'absolute',
        bottom: 32,
        fontFamily: 'Rajdhani, sans-serif',
        fontSize: 13,
        color: 'rgba(144,144,184,0.5)',
        letterSpacing: '0.1em',
        animation: 'fade-in 0.6s ease 2.5s both',
      }}>
        Click anywhere to continue
      </div>
    </div>
  )
}
