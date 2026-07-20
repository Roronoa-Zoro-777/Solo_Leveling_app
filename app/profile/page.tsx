'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Sidebar from '@/components/Sidebar'
import { SystemLoading } from '@/components/SystemLoading'

const RANK_PROGRESSION = [
  { rank: 'E', label: 'E-Rank', min: 0, xp: 500, color: 'var(--rank-e)' },
  { rank: 'D', label: 'D-Rank', min: 500, xp: 2000, color: 'var(--rank-d)' },
  { rank: 'C', label: 'C-Rank', min: 2000, xp: 6000, color: 'var(--rank-c)' },
  { rank: 'B', label: 'B-Rank', min: 6000, xp: 15000, color: 'var(--rank-b)' },
  { rank: 'A', label: 'A-Rank', min: 15000, xp: 40000, color: 'var(--rank-a)' },
  { rank: 'S', label: 'S-Rank', min: 40000, xp: 100000, color: 'var(--rank-s)' },
  { rank: 'NATIONAL', label: 'National Level', min: 100000, xp: 999999, color: 'var(--rank-national)' },
]

const QUOTE = `"I'm not the strongest because I won. I won because I am the strongest."`

const STORAGE_KEY = 'sl_profile_pic'

export default function ProfilePage() {
  const { hunter, user, isLoading } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null)
  const [uploadHover, setUploadHover] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    if (!isLoading && !hunter) router.replace('/')
  }, [hunter, isLoading, router])

  // Sync avatarSrc from hunter profile
  useEffect(() => {
    if (hunter?.photoURL) {
      setAvatarSrc(hunter.photoURL)
    }
  }, [hunter])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const { doc, updateDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      
      const dataUrl = ev.target?.result as string
      setAvatarSrc(dataUrl)
      
      try {
        await updateDoc(doc(db, 'hunters', user.uid), {
          photoURL: dataUrl
        })
        setUploadSuccess(true)
        setTimeout(() => setUploadSuccess(false), 2500)
      } catch (err) {
        console.error('Failed to update profile pic:', err)
      }
    }
    reader.readAsDataURL(file)
  }

  if (isLoading || !hunter) return <SystemLoading />

  const currentRankData = RANK_PROGRESSION.find(r => r.rank === hunter.rank) || RANK_PROGRESSION[0]
  const xpPct = Math.min(100, ((hunter.xp - currentRankData.min) / (currentRankData.xp - currentRankData.min)) * 100)

  const stats = [
    { label: 'Strength', abbr: 'STR', value: hunter.strength, icon: '💪', color: '#ef4444' },
    { label: 'Agility', abbr: 'AGI', value: hunter.agility, icon: '⚡', color: '#22c55e' },
    { label: 'Intelligence', abbr: 'INT', value: hunter.intelligence, icon: '🧠', color: '#3b82f6' },
    { label: 'Vitality', abbr: 'VIT', value: hunter.vitality, icon: '❤️', color: '#ec4899' },
    { label: 'Perception', abbr: 'PER', value: hunter.perception, icon: '👁️', color: '#a855f7' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main className="main-content" style={{ transition: 'margin-left 0.35s cubic-bezier(0.4,0,0.2,1)' }}>
        <div className="page-header">
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--gate-cyan)', letterSpacing: '0.2em', marginBottom: 6 }}>
            ◈ HUNTER PROFILE ◈
          </div>
          <h1 className="page-title">Hunter Registry</h1>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Left: Profile card */}
          <div className="w-full">
            <div className="glass-panel" style={{ padding: '24px', marginBottom: 24 }}>
              {/* Avatar with upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }} className="flex-col sm:flex-row text-center sm:text-left">
                {/* Clickable avatar */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onMouseEnter={() => setUploadHover(true)}
                  onMouseLeave={() => setUploadHover(false)}
                  style={{
                    width: 100, height: 100, borderRadius: 14,
                    background: avatarSrc
                      ? 'none'
                      : 'linear-gradient(135deg, var(--mana-dark), var(--mana-purple))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 36,
                    border: uploadHover
                      ? '2px solid #06b6d4'
                      : '2px solid var(--ui-border-glow)',
                    boxShadow: uploadHover
                      ? '0 0 25px rgba(6,182,212,0.5)'
                      : '0 0 20px rgba(124, 58, 237, 0.4)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                  }}
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                  ) : (
                    <span>🌑</span>
                  )}
                  {/* Hover overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    opacity: uploadHover ? 1 : 0,
                    transition: 'opacity 0.25s ease',
                    borderRadius: 12,
                  }}>
                    <span style={{ fontSize: 20 }}>📷</span>
                    <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 7, color: '#06b6d4', letterSpacing: '0.05em', marginTop: 2 }}>UPLOAD</span>
                  </div>
                </div>

                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <div className="flex-1 min-w-0">
                  <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.5rem', color: 'white', marginBottom: 4 }} className="truncate">
                    {hunter.username}
                  </h2>
                  <div className={`rank-badge rank-badge-${hunter.rank}`} style={{ fontSize: 11, padding: '4px 10px', width: 'auto', height: 'auto', display: 'inline-flex' }}>
                    {hunter.rank}-Rank Hunter
                  </div>
                  {/* Upload hint */}
                  <div style={{
                    fontFamily: 'Orbitron, monospace', fontSize: 8,
                    color: uploadSuccess ? '#22c55e' : 'var(--text-dim)',
                    letterSpacing: '0.07em', marginTop: 8,
                    transition: 'color 0.3s ease',
                  }}>
                    {uploadSuccess ? '✓ PROFILE UPDATED' : '▲ CLICK TO CHANGE PHOTO'}
                  </div>
                </div>
              </div>

              {/* XP */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, color: 'var(--gate-cyan)', letterSpacing: '0.1em' }}>
                    RANK PROGRESS
                  </span>
                  <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, color: 'var(--text-secondary)' }}>
                    {hunter.xp.toLocaleString()} XP
                  </span>
                </div>
                <div className="xp-bar-track" style={{ height: 8 }}>
                  <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
                </div>
              </div>

              {/* Key stats */}
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                {[
                  { label: 'Level', value: hunter.level, icon: '⬆️' },
                  { label: 'Quests', value: hunter.totalQuests, icon: '⚔️' },
                  { label: 'Shadows', value: hunter.shadowCount, icon: '👹' },
                ].map(c => (
                  <div key={c.label} style={{ textAlign: 'center', padding: '12px 6px', background: 'rgba(10,10,20,0.5)', borderRadius: 10, border: '1px solid var(--shadow-border)' }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{c.icon}</div>
                    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{c.value}</div>
                    <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 9, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote */}
            <div style={{
              padding: 20,
              background: 'rgba(124, 58, 237, 0.06)',
              border: '1px solid rgba(124, 58, 237, 0.2)',
              borderRadius: 12,
              borderLeft: '3px solid var(--mana-purple)',
            }} className="mb-6 lg:mb-0">
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>
                {QUOTE}
              </div>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 8, color: 'var(--text-dim)', marginTop: 8, letterSpacing: '0.1em' }}>
                — SUNG JINWOO
              </div>
            </div>
          </div>

          {/* Right: Stats panel */}
          <div className="w-full">
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--gate-cyan)', letterSpacing: '0.15em', marginBottom: 20 }}>
                ◈ BATTLE STATISTICS
              </div>
              <div className="space-y-4">
                {stats.map(s => (
                  <div key={s.abbr}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14 }}>{s.icon}</span>
                        <span style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {s.label}
                        </span>
                        <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 8, color: s.color, letterSpacing: '0.05em' }}>
                          [{s.abbr}]
                        </span>
                      </div>
                      <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 14, fontWeight: 700, color: s.color }}>
                        {s.value}
                      </span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, s.value)}%`,
                        background: s.color,
                        borderRadius: 2,
                        boxShadow: `0 0 8px ${s.color}`,
                        transition: 'width 1s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--shadow-border)', paddingTop: 20, marginTop: 12 }}>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--gate-cyan)', letterSpacing: '0.15em', marginBottom: 16 }}>
                  ◈ RANK HISTORY
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {RANK_PROGRESSION.map(r => (
                    <div key={r.rank} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 32, height: 32, borderRadius: 6,
                      border: `1px solid ${r.color}`,
                      background: hunter.rank === r.rank ? `${r.color}33` : 'transparent',
                      fontFamily: 'Orbitron, monospace', fontSize: 10, fontWeight: 700,
                      color: r.color,
                      opacity: hunter.rank === r.rank ? 1 : 0.25,
                      boxShadow: hunter.rank === r.rank ? `0 0 10px ${r.color}` : 'none',
                    }} title={r.label}>
                      {r.rank === 'NATIONAL' ? 'N' : r.rank}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
