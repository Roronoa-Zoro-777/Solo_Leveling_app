'use client'
import { useEffect } from 'react'
import { useAuth } from './AuthProvider'

const RANK_XP: Record<string, number> = {
  E: 500, D: 2000, C: 6000, B: 15000, A: 40000, S: 100000, NATIONAL: 999999,
}

const RANK_LABELS: Record<string, string> = {
  E: 'E-Rank Hunter', D: 'D-Rank Hunter', C: 'C-Rank Hunter',
  B: 'B-Rank Hunter', A: 'A-Rank Hunter', S: 'S-Rank Hunter', NATIONAL: 'National Level Hunter',
}

export default function StatusWindow({ onClose }: { onClose: () => void }) {
  const { hunter } = useAuth()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!hunter) return null

  const xpNeeded = RANK_XP[hunter.rank] || 500
  const xpPct = Math.min(100, (hunter.xp / xpNeeded) * 100)

  const stats = [
    { label: 'STR', value: hunter.strength },
    { label: 'AGI', value: hunter.agility },
    { label: 'INT', value: hunter.intelligence },
    { label: 'VIT', value: hunter.vitality },
    { label: 'PER', value: hunter.perception },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="status-window"
        style={{ width: '100%', maxWidth: 420, borderRadius: 4, overflow: 'hidden', animation: 'scale-in 0.2s ease' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="status-window-header">
          <div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: '0.3em', color: 'var(--gate-cyan)', marginBottom: 4 }}>
              ◈ STATUS WINDOW ◈
            </div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 18, fontWeight: 700, color: 'white' }}>
              {hunter.username}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className={`rank-badge rank-badge-${hunter.rank}`}>
              {hunter.rank}
            </div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--text-secondary)', marginTop: 4 }}>
              Lv. {hunter.level}
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Rank label */}
          <div style={{
            textAlign: 'center',
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: 13,
            color: 'var(--gate-cyan)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: 16,
          }}>
            {RANK_LABELS[hunter.rank] || `${hunter.rank}-Rank Hunter`}
          </div>

          {/* XP Bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--gate-cyan)', letterSpacing: '0.1em' }}>EXP</span>
              <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--text-secondary)' }}>
                {hunter.xp.toLocaleString()} / {xpNeeded.toLocaleString()}
              </span>
            </div>
            <div className="xp-bar-track">
              <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(6, 182, 212, 0.15)', marginBottom: 16 }} />

          {/* Stats */}
          <div>
            {stats.map(s => (
              <div key={s.label} className="stat-row">
                <span className="stat-label">{s.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 80,
                    height: 4,
                    background: 'rgba(6, 182, 212, 0.1)',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, s.value)}%`,
                      background: 'var(--gate-cyan)',
                      borderRadius: 2,
                      boxShadow: '0 0 6px var(--gate-cyan)',
                    }} />
                  </div>
                  <span className="stat-value">{s.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(6, 182, 212, 0.15)', margin: '16px 0' }} />

          {/* Counters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Shadow Army', value: hunter.shadowCount, icon: '👻' },
              { label: 'Total Quests', value: hunter.totalQuests, icon: '⚔️' },
              { label: 'Hunter Level', value: hunter.level, icon: '⬆️' },
            ].map(c => (
              <div key={c.label} style={{ textAlign: 'center', background: 'rgba(6,182,212,0.04)', borderRadius: 8, padding: 12, border: '1px solid rgba(6,182,212,0.1)' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{c.icon}</div>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 14, color: 'white', fontWeight: 700 }}>{c.value}</div>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{c.label}</div>
              </div>
            ))}
          </div>

          <button className="btn btn-ghost" style={{ width: '100%' }} onClick={onClose}>
            [ESC] CLOSE WINDOW
          </button>
        </div>
      </div>
    </div>
  )
}
