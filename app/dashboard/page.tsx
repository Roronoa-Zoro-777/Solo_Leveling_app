'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useAudio } from '@/components/AudioProvider'
import Sidebar from '@/components/Sidebar'
import AriseAnimation from '@/components/AriseAnimation'
import RankUpCeremony from '@/components/RankUpCeremony'
import NotificationToast from '@/components/NotificationToast'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, increment, deleteDoc, setDoc } from 'firebase/firestore'
import { SystemLoading } from '@/components/SystemLoading'
import { getXPForLevel, getRankFromLevel, getStatBoost } from '@/lib/auth'

interface Quest {
  id: string
  title: string
  description: string
  rank: string
  status: string
  xpReward: number
  isShadow: boolean
  dueDate: string | null
  startTime?: string | null
  endTime?: string | null
  createdAt: string
  assignee?: { id: string; username: string; rank: string } | null
}

const RANK_ORDER = ['E', 'D', 'C', 'B', 'A', 'S']
const STATUS_FILTERS = ['ALL', 'PENDING', 'ACTIVE', 'COMPLETED', 'FAILED']

interface Toast {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'rank'
}

export default function DashboardPage() {
  const { hunter, user, isLoading, refreshHunter, updateHunter } = useAuth()
  const router = useRouter()
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [rankFilter, setRankFilter] = useState('ALL')
  const [showCreate, setShowCreate] = useState(false)
  const [ariseFor, setAriseFor] = useState<string | null>(null)
  const [rankUpTo, setRankUpTo] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [createForm, setCreateForm] = useState({ title: '', description: '', rank: 'E', dueDate: '', startTime: '', endTime: '' })
  const [creating, setCreating] = useState(false)
  const [processingAction, setProcessingAction] = useState<Record<string, { type: string; count: number }>>({})
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { playSFX, isMuted, pauseBGM, resumeBGM, stopSFX } = useAudio()

  useEffect(() => {
    if (!isLoading && !hunter) router.replace('/')
  }, [hunter, isLoading, router])

  // Quests logic remains for list display

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const saveLocalQuests = useCallback((newQuests: Quest[]) => {
    setQuests(newQuests)
    localStorage.setItem('sl_local_quests', JSON.stringify(newQuests))
  }, [])

  // Load quests
  useEffect(() => {
    // Guest Mode Fallback: Use LocalStorage if no Firebase user
    if (!user) {
      const localQuestsStr = localStorage.getItem('sl_local_quests')
      if (localQuestsStr) {
        let lq: Quest[] = JSON.parse(localQuestsStr)
        // Apply local filtering
        if (statusFilter !== 'ALL') lq = lq.filter(q => q.status === statusFilter)
        if (rankFilter !== 'ALL') lq = lq.filter(q => q.rank === rankFilter)
        
        // Sort: Active first, then by date
        lq.sort((a, b) => {
          if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1
          if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        
        setQuests(lq)
      } else {
        setQuests([])
      }
      setLoading(false)
      return
    }

    setLoading(true)
    const questsRef = collection(db, 'quests')
    // Simplify query: remove orderBy to avoid index requirement during initial setup
    let q = query(questsRef, where('createdById', '==', user.uid))
    
    if (statusFilter !== 'ALL') q = query(q, where('status', '==', statusFilter))
    if (rankFilter !== 'ALL') q = query(q, where('rank', '==', rankFilter))

    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      let questData = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
      
      // Perform sorting locally instead of on server to avoid index prerequisite
      questData.sort((a: any, b: any) => {
        if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1
        if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })

      setQuests(questData)
      setLoading(false)
    }, (err) => {
      console.error('Firestore snapshot error (Dashboard):', err)
      addToast(`Registry Error: ${err.message}`, 'warning')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, statusFilter, rankFilter])

  const handleAction = async (questId: string, action: string) => {
    if (!hunter) return

    const quest = quests.find(q => q.id === questId)
    if (!quest) return

    // Calculate XP and level ups locally first
    const xpReward = quest.xpReward || 100
    const newXP = (hunter?.xp || 0) + (action === 'complete' ? xpReward : 0)
    let newLevel = hunter?.level || 1
    let xpNeeded = getXPForLevel(newLevel + 1)
    while (newXP >= xpNeeded) {
      newLevel++
      xpNeeded = getXPForLevel(newLevel + 1)
    }
    const newRank = getRankFromLevel(newLevel)
    const rankUp = newRank !== hunter?.rank
    const statBoost = getStatBoost(quest.rank)

    // Arise, Retreat, and Enter Gate now have a 5-second processing time
    if (action === 'complete' || action === 'fail' || action === 'start') {
      if (processingAction[questId]) return // Already processing
      
      setProcessingAction(prev => ({ ...prev, [questId]: { type: action, count: 5 } }))
      
      if (action === 'complete') {
        playSFX('/assets/tone/arise.mpeg')
      } else if (action === 'fail') {
        playSFX('/assets/tone/retreat.mpeg')
      } else if (action === 'start') {
        playSFX('/assets/tone/start.mpeg')
      }

      // Start the countdown
      const timer = setInterval(() => {
        setProcessingAction(prev => {
          const current = prev[questId]
          if (!current || current.count <= 1) {
            clearInterval(timer)
            // Trigger the actual action completion
            finalizeAction(questId, action, { newXP, newLevel, newRank, rankUp, statBoost, xpReward })
            const next = { ...prev }
            delete next[questId]
            return next
          }
          return { ...prev, [questId]: { ...current, count: current.count - 1 } }
        })
      }, 1000)

      return
    }

    // Default immediate actions (not 'start'/'complete'/'fail' - though currently all use 5s)
    await finalizeAction(questId, action, { newXP, newLevel, newRank, rankUp, statBoost, xpReward })
  }

  const finalizeAction = async (questId: string, action: string, data: any) => {
    const { newXP, newLevel, newRank, rankUp, statBoost, xpReward } = data
    
    // Stop any SFX (like Arise/Retreat/Start ringtone) after 5s processing
    if (action === 'complete' || action === 'fail' || action === 'start') {
      stopSFX()
    }

    if (!user) {
      // Guest Mode Logic
      const fullQuestsRaw = localStorage.getItem('sl_local_quests')
      const fullQuests: Quest[] = fullQuestsRaw ? JSON.parse(fullQuestsRaw) : []
      
      const updatedFullQuests = fullQuests.map(q => {
        if (q.id === questId) {
          if (action === 'complete') return { ...q, status: 'COMPLETED', isShadow: true, completedAt: new Date().toISOString() }
          if (action === 'start') return { ...q, status: 'ACTIVE' }
          if (action === 'fail') return { ...q, status: 'FAILED' }
        }
        return q
      })
      saveLocalQuests(updatedFullQuests)
      
      if (action === 'complete') {
        setAriseFor(questId)
        addToast(`+${xpReward} XP Earned!`, 'success')
        updateHunter({
          xp: newXP, level: newLevel, rank: newRank,
          totalQuests: (hunter?.totalQuests || 0) + 1,
          shadowCount: (hunter?.shadowCount || 0) + 1,
          strength: (hunter?.strength || 10) + statBoost,
          agility: (hunter?.agility || 10) + statBoost,
          intelligence: (hunter?.intelligence || 10) + statBoost,
          vitality: (hunter?.vitality || 10) + Math.floor(statBoost / 2),
          perception: (hunter?.perception || 10) + Math.floor(statBoost / 2),
        })
        if (rankUp) {
          setTimeout(() => setRankUpTo(newRank), 3500)
          setTimeout(() => addToast(`RANK UP → ${newRank}-Rank!`, 'rank'), 3500)
        }
      } else if (action === 'start') {
        addToast('Quest accepted.', 'info')
      } else if (action === 'fail') {
        addToast('Quest failed.', 'warning')
      }
      return
    }

    // Firebase User Logic
    try {
      const questRef = doc(db, 'quests', questId)
      if (action === 'complete') {
        await updateDoc(questRef, { status: 'COMPLETED', completedAt: new Date().toISOString(), isShadow: true })
        const hunterRef = doc(db, 'hunters', user.uid)
        await updateDoc(hunterRef, {
          xp: newXP,
          level: newLevel,
          rank: newRank,
          totalQuests: increment(1),
          shadowCount: increment(1),
          strength: increment(statBoost),
          agility: increment(statBoost),
          intelligence: increment(statBoost),
          vitality: increment(Math.floor(statBoost / 2)),
          perception: increment(Math.floor(statBoost / 2)),
        })
        setAriseFor(questId)
        addToast(`+${xpReward} XP Earned!`, 'success')
        if (rankUp) {
          setTimeout(() => setRankUpTo(newRank), 3500)
          setTimeout(() => addToast(`RANK UP → ${newRank}-Rank!`, 'rank'), 3500)
        }
      } else if (action === 'start') {
        await updateDoc(questRef, { status: 'ACTIVE' })
        addToast('Quest accepted.', 'info')
      } else if (action === 'fail') {
        await updateDoc(questRef, { status: 'FAILED' })
        addToast('Quest failed.', 'warning')
      }
    } catch (err) {
      console.error('Action error:', err)
      addToast('System error during update.', 'warning')
    }
  }

  const handleDelete = async (e: React.MouseEvent, questId: string) => {
    e.stopPropagation()
    // Optimization: Skip confirm for completed/failed gates to reduce friction
    // But keep it for active or pending if desired. For now, let's just make it work.
    
    if (!user) {
      const fullQuestsRaw = localStorage.getItem('sl_local_quests')
      if (!fullQuestsRaw) return
      
      const fullQuests: Quest[] = JSON.parse(fullQuestsRaw)
      const updatedFullQuests = fullQuests.filter(q => q.id !== questId)
      
      saveLocalQuests(updatedFullQuests)
      addToast('Gate closed.', 'info')
      return
    }

    try {
      await deleteDoc(doc(db, 'quests', questId))
      addToast('Gate closed.', 'info')
    } catch (err) {
      addToast('Failed to close gate.', 'warning')
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const XP_MAP: Record<string, number> = { E: 100, D: 300, C: 700, B: 1500, A: 4000, S: 10000 }
    const newQuest = {
      id: Math.random().toString(36).slice(2, 9),
      ...createForm,
      status: 'PENDING',
      xpReward: XP_MAP[createForm.rank] || 100,
      isShadow: false,
      createdAt: new Date().toISOString()
    }

    if (!user) {
      saveLocalQuests([newQuest, ...quests])
      setShowCreate(false)
      setCreateForm({ title: '', description: '', rank: 'E', dueDate: '', startTime: '', endTime: '' })
      addToast('New gate has opened. (Local Mode)', 'info')
      return
    }

    setCreating(true)
    try {
      await setDoc(doc(db, 'quests', newQuest.id), {
        ...newQuest,
        createdById: user.uid,
        assignedToId: user.uid
      })
      setShowCreate(false)
      setCreateForm({ title: '', description: '', rank: 'E', dueDate: '', startTime: '', endTime: '' })
      addToast('New gate has opened.', 'info')
    } catch (err) {
      addToast('Failed to open gate.', 'warning')
    } finally {
      setCreating(false)
    }
  }

  const rankColor: Record<string, string> = {
    E: 'var(--rank-e)', D: 'var(--rank-d)', C: 'var(--rank-c)',
    B: 'var(--rank-b)', A: 'var(--rank-a)', S: 'var(--rank-s)',
  }
  const statusColor: Record<string, string> = {
    PENDING: 'var(--text-secondary)', ACTIVE: 'var(--gate-cyan)',
    COMPLETED: 'var(--rank-d)', FAILED: 'var(--rank-s)',
  }

  if (isLoading || !hunter) return <SystemLoading />

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div style={{ marginBottom: 0 }}>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--gate-cyan)', letterSpacing: '0.2em', marginBottom: 6 }}>
                ◈ HUNTER QUEST BOARD ◈
              </div>
              <h1 className="page-title">Gate Registry</h1>
              <p className="page-subtitle">Active Gates: {quests.filter(q => q.status !== 'COMPLETED' && q.status !== 'FAILED').length} · Total: {quests.length}</p>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                ＋ Open New Gate
              </button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="stats-grid">
          {[
            { label: 'Pending', count: quests.filter(q => q.status === 'PENDING').length, color: 'var(--text-secondary)' },
            { label: 'Active', count: quests.filter(q => q.status === 'ACTIVE').length, color: 'var(--gate-cyan)' },
            { label: 'Completed', count: quests.filter(q => q.status === 'COMPLETED').length, color: 'var(--rank-d)' },
            { label: 'Failed', count: quests.filter(q => q.status === 'FAILED').length, color: 'var(--rank-s)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '1.75rem', fontWeight: 700, color: s.color }}>{s.count}</div>
              <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.15em' }}>STATUS:</span>
            {STATUS_FILTERS.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`filter-chip ${statusFilter === s ? 'active' : ''}`}>
                {s}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.15em' }}>RANK:</span>
            {['ALL', ...RANK_ORDER].map(r => (
              <button key={r} onClick={() => setRankFilter(r)} className={`filter-chip ${rankFilter === r ? 'active' : ''}`}
                style={rankFilter === r && r !== 'ALL' ? { color: rankColor[r], borderColor: rankColor[r] } : {}}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Quest grid */}
        {loading ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', 
            gap: 16 
          }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 200 }} />
            ))}
          </div>
        ) : quests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-dim)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌑</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 18, color: 'var(--text-secondary)', marginBottom: 8 }}>
              No Gates Found
            </div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', color: 'var(--text-dim)', marginBottom: 24 }}>
              The system has not detected any active gates matching your filters.
            </div>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>Open First Gate</button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', 
            gap: 16 
          }}>
            {quests.map(quest => (
              <div key={quest.id} className={`quest-card quest-card-${quest.rank}`}>
                {/* Quest header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div className={`rank-badge rank-badge-${quest.rank}`}>{quest.rank}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontFamily: 'Orbitron, monospace',
                      fontSize: 9,
                      letterSpacing: '0.1em',
                      color: statusColor[quest.status] || 'var(--text-dim)',
                      border: `1px solid ${statusColor[quest.status] || 'var(--shadow-border)'}`,
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}>
                      {quest.status}
                    </span>
                  </div>
                </div>

                <h3 style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 8,
                  lineHeight: 1.3,
                }}>
                  {quest.title}
                </h3>

                <p style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  color: 'var(--text-secondary)',
                  fontSize: 14,
                  lineHeight: 1.5,
                  marginBottom: 16,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {quest.description}
                </p>

                {/* XP reward */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{
                    background: 'rgba(124, 58, 237, 0.15)',
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontFamily: 'Orbitron, monospace',
                    fontSize: 11,
                    color: 'var(--mana-light)',
                  }}>
                    ⚡ {quest.xpReward.toLocaleString()} XP
                  </div>
                  {quest.assignee && (
                    <div style={{
                      fontFamily: 'Rajdhani, sans-serif',
                      fontSize: 12,
                      color: 'var(--text-dim)',
                    }}>
                      → {quest.assignee.username}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', position: 'relative' }}>
                  {processingAction[quest.id] ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(0,0,0,0.6)',
                      border: '1px solid var(--gate-cyan)',
                      borderRadius: 6,
                      color: 'var(--gate-cyan)',
                      fontFamily: 'Orbitron, monospace',
                      fontSize: 11,
                      animation: 'sys-flash 1s infinite'
                    }}>
                      <style dangerouslySetInnerHTML={{ __html: `
                        @keyframes sys-flash {
                          0%, 100% { opacity: 1; }
                          50% { opacity: 0.5; }
                        }
                      `}} />
                      <span>◈ {processingAction[quest.id].type.toUpperCase()} DIRECTIVE: {processingAction[quest.id].count}S</span>
                    </div>
                  ) : (
                    <>
                      {quest.status === 'PENDING' && (
                        <button className="btn btn-gate btn-sm" onClick={() => handleAction(quest.id, 'start')}>
                          ⚔️ Enter Gate
                        </button>
                      )}
                      {quest.status === 'ACTIVE' && (
                        <button className="btn btn-arise btn-sm" onClick={() => handleAction(quest.id, 'complete')}>
                          💀 ARISE
                        </button>
                      )}
                      {quest.status === 'ACTIVE' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleAction(quest.id, 'fail')}>
                          ✗ Retreat
                        </button>
                      )}
                      {(quest.status === 'COMPLETED' || quest.status === 'FAILED' || quest.status === 'PENDING') && (
                        <button className="btn btn-ghost btn-sm" onClick={(e) => handleDelete(e, quest.id)} style={{ marginLeft: 'auto' }}>
                          ✕
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Due date */}
                {quest.dueDate && (
                  <div style={{
                    marginTop: 10,
                    fontFamily: 'Orbitron, monospace',
                    fontSize: 9,
                    color: 'var(--text-dim)',
                    letterSpacing: '0.08em',
                  }}>
                    DUE: {new Date(quest.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* FAB */}
        <button className="btn-fab" onClick={() => setShowCreate(true)} title="Open New Gate">
          ＋
        </button>
      </main>

      {/* Create quest modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--gate-cyan)', letterSpacing: '0.2em', marginBottom: 8 }}>
                ◈ SYSTEM: GATE CREATION ◈
              </div>
              <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: 'white' }}>Open a New Gate</h2>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--gate-cyan)', letterSpacing: '0.1em', marginBottom: 6 }}>QUEST TITLE</label>
                <input className="sys-input" type="text" value={createForm.title} onChange={e => setCreateForm(p => ({ ...p, title: e.target.value }))} placeholder="Name this gate..." required />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--gate-cyan)', letterSpacing: '0.1em', marginBottom: 6 }}>BRIEFING</label>
                <textarea className="sys-input" value={createForm.description} onChange={e => setCreateForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the mission..." required rows={3} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--gate-cyan)', letterSpacing: '0.1em', marginBottom: 6 }}>GATE RANK</label>
                  <select className="sys-select" value={createForm.rank} onChange={e => setCreateForm(p => ({ ...p, rank: e.target.value }))}>
                    {RANK_ORDER.map(r => (
                      <option key={r} value={r}>{r}-Rank ({r === 'E' ? '100' : r === 'D' ? '300' : r === 'C' ? '700' : r === 'B' ? '1,500' : r === 'A' ? '4,000' : '10,000'} XP)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--gate-cyan)', letterSpacing: '0.1em', marginBottom: 6 }}>DUE DATE</label>
                  <input className="sys-input" type="date" value={createForm.dueDate} onChange={e => setCreateForm(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--gate-cyan)', letterSpacing: '0.1em', marginBottom: 6 }}>START TIME (ALARM)</label>
                  <input className="sys-input" type="time" value={createForm.startTime} onChange={e => setCreateForm(p => ({ ...p, startTime: e.target.value }))} />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--gate-cyan)', letterSpacing: '0.1em', marginBottom: 6 }}>END TIME</label>
                  <input className="sys-input" type="time" value={createForm.endTime} onChange={e => setCreateForm(p => ({ ...p, endTime: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={creating}>
                  {creating ? 'Opening Gate...' : '🌀 Open Gate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ARISE animation */}
      {ariseFor && <AriseAnimation onComplete={() => { setAriseFor(null) }} />}

      {/* Rank up ceremony */}
      {rankUpTo && <RankUpCeremony newRank={rankUpTo} onComplete={() => setRankUpTo(null)} />}

      {/* Toasts */}
      {toasts.slice(-1).map(t => (
        <NotificationToast key={t.id} message={t.message} type={t.type} onDone={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
      ))}
    </div>
  )
}
