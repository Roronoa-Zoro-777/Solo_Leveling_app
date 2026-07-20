'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useAudio } from '@/components/AudioProvider'
import StatusWindow from './StatusWindow'

const navItems = [
  { href: '/dashboard', label: 'Quest Board', icon: '⚔️' },
  { href: '/shadows', label: 'Shadow Army', icon: '👹' },
  { href: '/daily', label: 'Daily Quests', icon: '☀️' },
  { href: '/party', label: 'Party', icon: '👥' },
  { href: '/profile', label: 'Hunter Profile', icon: '👤' },
]

const RANK_XP: Record<string, number> = {
  E: 500, D: 2000, C: 6000, B: 15000, A: 40000, S: 100000, NATIONAL: 999999,
}

export default function Sidebar() {
  const pathname = usePathname()
  const { hunter, logout } = useAuth()
  const { isMuted, toggleMute, playBGM } = useAudio()
  const [showStatus, setShowStatus] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { resetSession } = useAuth()
  const lastTap = useRef<number>(0)

  // Global BGM Initialization/Persistence
  useEffect(() => {
    if (hunter && !isMuted) {
      // AudioProvider already handles "same src" check, but we can be explicit here
      playBGM('/assets/tone/inapp1.mpeg')
    }
  }, [hunter?.id, isMuted, playBGM])

  const xpNeeded = RANK_XP[hunter?.rank || 'E'] || 500
  const xpPct = Math.min(100, ((hunter?.xp || 0) / xpNeeded) * 100)

  // Double-tap / double-click handler
  const handleSidebarDoubleClick = () => {
    setCollapsed(prev => !prev)
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      {!mobileOpen && (
        <button 
          className="sidebar-toggle-mobile"
          onClick={() => setMobileOpen(true)}
        >
          ☰
        </button>
      )}

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`sidebar ${mobileOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}
        onDoubleClick={handleSidebarDoubleClick}
        style={{
          width: collapsed ? 60 : 260,
        }}
      >
        <style jsx global>{`
          @media (min-width: 769px) {
            .main-content { 
              margin-left: ${collapsed ? '60px' : '260px'} !important;
            }
          }
          @media (max-width: 768px) {
            .sidebar-toggle-mobile { display: flex !important; }
            .mobile-overlay { display: block !important; }
          }
          @media (min-width: 769px) {
            .sidebar-toggle-mobile { display: none !important; }
            .mobile-overlay { display: none !important; }
            .sidebar { transform: translateX(0) !important; }
          }
        `}</style>
        
        {/* Mobile Close Button */}
        <button 
          className="btn btn-ghost"
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            padding: '4px 8px',
            fontSize: 14,
            display: 'none', // Shown via CSS media query
          }}
        >
          ✕
        </button>

        {/* Logo */}
        <div className="sidebar-logo" style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
          {collapsed ? (
            <div style={{ textAlign: 'center', fontSize: 22 }}>🌑</div>
          ) : (
            <div style={{ position: 'relative' }}>
              <div style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 16,
                fontWeight: 900,
                background: 'linear-gradient(135deg, #fff, #a855f7, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.05em',
              }}>
                SOLO LEVELING
              </div>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 8, color: 'var(--gate-cyan)', letterSpacing: '0.3em', marginTop: 2 }}>
                : S Y S T E M :
              </div>
            </div>
          )}
        </div>

        {/* Hunter mini card */}
        {hunter && !collapsed && (
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--shadow-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 40, height: 40,
                borderRadius: 8,
                background: 'linear-gradient(135deg, var(--mana-dark), var(--mana-purple))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
                border: '1px solid var(--ui-border)',
                flexShrink: 0,
                backgroundImage: hunter.photoURL ? `url(${hunter.photoURL})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}>
                {!hunter.photoURL && '🌑'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 700, fontSize: 15, color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {hunter.username}
                </div>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>
                  Lv.{hunter.level} · {hunter.rank}-Rank
                </div>
              </div>
            </div>
            {/* Mini XP bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 8, color: 'var(--gate-cyan)', letterSpacing: '0.1em' }}>EXP</span>
                <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 8, color: 'var(--text-dim)' }}>{Math.floor(xpPct)}%</span>
              </div>
              <div className="xp-bar-track" style={{ height: 4 }}>
                <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? 'active' : ''}`}
              style={collapsed ? { justifyContent: 'center', padding: '12px 0' } : {}}
              title={collapsed ? item.label : undefined}
              onClick={() => setMobileOpen(false)}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        {!collapsed && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--shadow-border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              className="btn btn-gate"
              onClick={() => { setShowStatus(true); setMobileOpen(false); }}
              style={{ width: '100%' }}
            >
              ◈ STATUS WINDOW
            </button>
            <button
              className="btn btn-gate"
              onClick={() => { setShowSettings(true); setMobileOpen(false); }}
              style={{ width: '100%', background: 'rgba(6, 182, 212, 0.1)', borderColor: 'var(--gate-cyan)' }}
            >
              ⚙️ SETTINGS
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={logout}
              style={{ width: '100%' }}
            >
              Logout
            </button>
          </div>
        )}

        {collapsed && (
          <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', borderTop: '1px solid var(--shadow-border)' }}>
            <button
              className="btn btn-gate"
              onClick={() => setShowStatus(true)}
              style={{ padding: '8px', width: 40, height: 40, fontSize: 16 }}
              title="Status Window"
            >
              ◈
            </button>
            <button
              className="btn"
              onClick={() => setShowSettings(true)}
              style={{ padding: '8px', width: 40, height: 40, fontSize: 16, background: 'rgba(6, 182, 212, 0.1)', borderColor: 'var(--gate-cyan)' }}
              title="Settings"
            >
              ⚙️
            </button>
            <button
              className="btn"
              onClick={toggleMute}
              style={{ 
                padding: '8px', width: 40, height: 40, fontSize: 16, 
                background: isMuted ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                border: isMuted ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                color: isMuted ? '#4ade80' : '#f87171'
              }}
              title={isMuted ? "Unmute System" : "Mute System"}
            >
              {isMuted ? '🔊' : '🔇'}
            </button>
          </div>
        )}
      </aside>

      {showStatus && <StatusWindow onClose={() => setShowStatus(false)} />}

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)'
        }}>
          <div style={{
            width: '90%', maxWidth: 400,
            background: 'var(--mana-dark)',
            border: '2px solid var(--mana-purple)',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 0 30px rgba(124, 58, 237, 0.3)'
          }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: 'white', fontSize: 20, marginBottom: 20, textAlign: 'center' }}>SYSTEM SETTINGS</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 12, color: 'var(--text-secondary)' }}>AUDIO SYSTEM</span>
                <button
                  className="btn btn-sm"
                  onClick={toggleMute}
                  style={{ 
                    minWidth: 100,
                    background: isMuted ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                    border: isMuted ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)', 
                    color: isMuted ? '#4ade80' : '#f87171' 
                  }}
                >
                  {isMuted ? '🔊 ON' : '🔇 OFF'}
                </button>
              </div>

              <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 8 }}>
                <h3 style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: '#f87171', marginBottom: 8 }}>DANGER ZONE</h3>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    if (confirm("THIS WILL WIPE ALL LOCAL DATA AND LOGS. PROCEED?")) {
                      resetSession();
                    }
                  }}
                  style={{ width: '100%', borderColor: '#f87171', color: '#f87171' }}
                >
                  RESET ACCOUNT / CLEAR DATA
                </button>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setShowSettings(false)}
              style={{ width: '100%', marginTop: 24 }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </>
  )
}
