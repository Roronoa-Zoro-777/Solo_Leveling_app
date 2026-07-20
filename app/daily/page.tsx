'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useAudio } from '@/components/AudioProvider'
import Sidebar from '@/components/Sidebar'
import NotificationToast from '@/components/NotificationToast'

import { SystemLoading } from '@/components/SystemLoading'

interface DailyQuest { id: string; title: string; xpReward: number; completed: boolean }

const DISMISSED_KEY = 'sl_dismissed_daily'

export default function DailyPage() {
  const { hunter, user, isLoading, refreshHunter, updateHunter } = useAuth()
  const { playSFX } = useAudio()
  const router = useRouter()
  const [quests, setQuests] = useState<DailyQuest[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'warning' | 'rank' } | null>(null)

  useEffect(() => {
    if (!isLoading && !hunter) router.replace('/')
  }, [hunter, isLoading, router])

  // Load dismissed quests from localStorage
  useEffect(() => {
    const today = new Date().toDateString()
    const stored = localStorage.getItem(DISMISSED_KEY)
    if (stored) {
      try {
        const { date, ids } = JSON.parse(stored)
        if (date === today) {
          setDismissedIds(ids)
        } else {
          localStorage.removeItem(DISMISSED_KEY)
        }
      } catch (e) {
        localStorage.removeItem(DISMISSED_KEY)
      }
    }
  }, [])

  const fetch_ = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0]
    setLoading(true)

    // Guest Mode Fallback
    if (!user) {
      const LOCAL_QUESTS_KEY = `sl_local_daily_${today}`
      const stored = localStorage.getItem(LOCAL_QUESTS_KEY)
      
      if (stored) {
        setQuests(JSON.parse(stored))
        setLoading(false)
      } else {
        // Initialize default quests for guest
        const defaultQuests: DailyQuest[] = [
          { id: 'dp-1', title: '100 Push-ups', xpReward: 50, completed: false },
          { id: 'dp-2', title: '100 Sit-ups', xpReward: 50, completed: false },
          { id: 'dp-3', title: '10km Run', xpReward: 75, completed: false },
          { id: 'dp-4', title: 'Meditate for 30 minutes', xpReward: 40, completed: false },
          { id: 'dp-5', title: 'Study for 2 hours', xpReward: 60, completed: false },
        ]
        localStorage.setItem(LOCAL_QUESTS_KEY, JSON.stringify(defaultQuests))
        setQuests(defaultQuests)
        setLoading(false)

        // Cleanup old local quests
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith('sl_local_daily_') && key !== LOCAL_QUESTS_KEY) {
            localStorage.removeItem(key)
          }
        }
      }
      return
    }

    // Firebase logic
    const { collection, query, where, getDocs, addDoc } = await import('firebase/firestore')
    const { db } = await import('@/lib/firebase')

    try {
      const q = query(collection(db, 'dailyQuests'), where('hunterId', '==', user.uid), where('date', '==', today))
      const snapshot = await getDocs(q)
      
      let currentQuests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyQuest))

      if (currentQuests.length === 0) {
        const defaultQuests = [
          { title: '100 Push-ups', xpReward: 50, completed: false, hunterId: user.uid, date: today },
          { title: '100 Sit-ups', xpReward: 50, completed: false, hunterId: user.uid, date: today },
          { title: '10km Run', xpReward: 75, completed: false, hunterId: user.uid, date: today },
          { title: 'Meditate for 30 minutes', xpReward: 40, completed: false, hunterId: user.uid, date: today },
          { title: 'Study for 2 hours', xpReward: 60, completed: false, hunterId: user.uid, date: today },
        ]
        const newQuests: DailyQuest[] = []
        for (const dq of defaultQuests) {
          const docRef = await addDoc(collection(db, 'dailyQuests'), dq)
          newQuests.push({ id: docRef.id, ...dq })
        }
        currentQuests = newQuests
      }
      setQuests(currentQuests)
    } catch (err: any) {
      console.error('Daily fetch error:', err)
      setToast({ msg: `Connection failed: ${err.message}`, type: 'warning' })
    } finally { setLoading(false) }
  }, [user])

  useEffect(() => { fetch_() }, [fetch_])

  const complete = async (questId: string) => {
    if (!hunter) return

    const quest = quests.find(q => q.id === questId)
    if (!quest) return

    const xpReward = quest.xpReward
    const newXP = hunter.xp + xpReward
    
    // Guest Mode Completion
    if (!user) {
      const today = new Date().toISOString().split('T')[0]
      const updatedQuests = quests.map(q => q.id === questId ? { ...q, completed: true } : q)
      setQuests(updatedQuests)
      localStorage.setItem(`sl_local_daily_${today}`, JSON.stringify(updatedQuests))
      
      playSFX('/assets/tone/complete.mpeg')
      await updateHunter({ xp: newXP })
      setToast({ msg: `+${xpReward} XP — Daily training verified!`, type: 'success' })
      return
    }

    // Firebase Completion
    const { doc, updateDoc } = await import('firebase/firestore')
    const { db } = await import('@/lib/firebase')

    try {
      await updateDoc(doc(db, 'dailyQuests', questId), { completed: true })
      playSFX('/assets/tone/complete.mpeg')
      await updateHunter({ xp: newXP })
      setToast({ msg: `+${xpReward} XP — Daily quest cleared!`, type: 'success' })
      fetch_()
    } catch (err) {
      setToast({ msg: 'System error during completion.', type: 'warning' })
    }
  }

  const dismiss = (questId: string) => {
    const newIds = [...dismissedIds, questId]
    setDismissedIds(newIds)
    const today = new Date().toDateString()
    localStorage.setItem(DISMISSED_KEY, JSON.stringify({ date: today, ids: newIds }))
    setToast({ msg: 'Quest dismissed from view.', type: 'info' })
  }

  const visibleQuests = quests.filter(q => !dismissedIds.includes(q.id))
  const completedCount = quests.filter(q => q.completed).length
  const totalXP = quests.reduce((acc, q) => acc + q.xpReward, 0)
  const earnedXP = quests.filter(q => q.completed).reduce((acc, q) => acc + q.xpReward, 0)

  if (isLoading || !hunter) return <SystemLoading />

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main className="main-content" style={{ maxWidth: 720 }}>
        <div className="page-header">
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--gate-cyan)', letterSpacing: '0.2em', marginBottom: 6 }}>
            ◈ SYSTEM: DAILY UPDATE ◈
          </div>
          <h1 className="page-title">Daily Quests</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{
          background: 'var(--shadow-card)',
          border: '1px solid var(--shadow-border)',
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 16, color: 'white' }}>
                Daily Progress
              </span>
              <span style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, color: 'var(--gate-cyan)', marginLeft: 12 }}>
                {completedCount}/{quests.length}
              </span>
            </div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, color: 'var(--mana-light)' }}>
              {earnedXP} / {totalXP} XP
            </div>
          </div>
          <div className="xp-bar-track" style={{ height: 10 }}>
            <div className="xp-bar-fill" style={{ width: quests.length ? `${(completedCount / quests.length) * 100}%` : '0%' }} />
          </div>
          {completedCount === quests.length && quests.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 12, fontFamily: 'Cinzel, serif', fontSize: 14, color: 'var(--rank-d)' }}>
              ✓ All daily quests complete! The system is pleased.
            </div>
          )}
        </div>

        {/* Quest list */}
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 70, marginBottom: 12 }} />)
        ) : visibleQuests.length === 0 && quests.length > 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.6 }}>
             <p style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 16, color: 'var(--text-dim)' }}>
               You have hidden all of today's quests. 
             </p>
             <button className="btn btn-ghost btn-sm" onClick={() => { setDismissedIds([]); localStorage.removeItem(DISMISSED_KEY); }}>
               Restore All
             </button>
          </div>
        ) : visibleQuests.map(quest => (
          <div key={quest.id} className="daily-quest-item" style={{
            opacity: quest.completed ? 0.6 : 1,
            position: 'relative',
          }}>
            <div
              className={`daily-checkbox ${quest.completed ? 'checked' : ''}`}
              onClick={() => !quest.completed && complete(quest.id)}
            >
              {quest.completed && (
                <span style={{ color: 'var(--shadow-dark)', fontWeight: 700, fontSize: 16 }}>✓</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: 16,
                fontWeight: 600,
                color: quest.completed ? 'var(--text-dim)' : 'var(--text-primary)',
                textDecoration: quest.completed ? 'line-through' : 'none',
              }}>
                {quest.title}
              </div>
            </div>
            <div style={{
              fontFamily: 'Orbitron, monospace',
              fontSize: 11,
              color: quest.completed ? 'var(--text-dim)' : 'var(--mana-light)',
              marginRight: 12,
            }}>
              +{quest.xpReward} XP
            </div>
            {!quest.completed ? (
              <button className="btn btn-gate btn-sm" onClick={() => complete(quest.id)}>
                Complete
              </button>
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={() => dismiss(quest.id)} title="Dismiss">
                ✕
              </button>
            )}
          </div>
        ))}

        <div style={{
          marginTop: 32, padding: 20,
          background: 'rgba(124, 58, 237, 0.05)',
          border: '1px solid rgba(124, 58, 237, 0.15)',
          borderRadius: 12,
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 14,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}>
          💡 Daily quests reset every midnight. Complete all of them to maximize your XP gain. The system is always watching.
        </div>
      </main>

      {toast && (
        <NotificationToast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}
    </div>
  )
}
