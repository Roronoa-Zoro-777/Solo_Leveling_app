'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { useAudio } from '@/components/AudioProvider'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore'

interface Quest {
  id: string
  title: string
  rank: string
  status: string
  startTime?: string | null
  dueDate?: string | null
}

export default function GlobalAlarm() {
  const { user, hunter } = useAuth()
  const { isMuted, pauseBGM, resumeBGM, playSFX, stopSFX } = useAudio()
  const [alarmQuest, setAlarmQuest] = useState<Quest | null>(null)
  const [quests, setQuests] = useState<Quest[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Sync states with localStorage for multi-tab coordination
  const getSnoozedUntil = () => Number(localStorage.getItem('sl_snoozed_until') || 0)
  const setSnoozedUntil = (val: number) => localStorage.setItem('sl_snoozed_until', String(val))
  
  const getLastTriggered = () => {
    const raw = localStorage.getItem('sl_last_triggered')
    return raw ? JSON.parse(raw) : null
  }
  const setLastTriggered = (val: { id: string; time: string } | null) => {
    if (val) localStorage.setItem('sl_last_triggered', JSON.stringify(val))
    else localStorage.removeItem('sl_last_triggered')
    // Dispatch event manually for same-tab listener
    window.dispatchEvent(new Event('storage'))
  }

  // Load quests
  useEffect(() => {
    if (!user) {
      // Guest mode periodically polls local quests
      const interval = setInterval(() => {
        const localQuestsStr = localStorage.getItem('sl_local_quests')
        if (localQuestsStr) {
          setQuests(JSON.parse(localQuestsStr))
        }
      }, 2000)
      return () => clearInterval(interval)
    }

    const q = query(collection(db, 'quests'), where('createdById', '==', user.uid), where('status', '==', 'PENDING'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setQuests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quest)))
    })
    return () => unsubscribe()
  }, [user])

  // Sync with other tabs
  useEffect(() => {
    const handleStorageChange = () => {
      const snoozedUntil = getSnoozedUntil()
      if (Date.now() < snoozedUntil && alarmQuest) {
        setAlarmQuest(null)
      }
      
      // If a quest was started/completed, the status in 'quests' will change 
      // via Firestore/Interval, which handles closing.
    }
    window.addEventListener('storage', handleStorageChange)
    const int = setInterval(handleStorageChange, 500) // Polling fallback
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(int)
    }
  }, [alarmQuest])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const currentH = now.getHours().toString().padStart(2, '0')
      const currentM = now.getMinutes().toString().padStart(2, '0')
      const currentTime = `${currentH}:${currentM}`
      
      const snoozedUntil = getSnoozedUntil()
      const lastTriggered = getLastTriggered()

      // Audio fallback check
      if (alarmQuest && audioRef.current && audioRef.current.paused && !isMuted) {
        audioRef.current.play().catch(() => {})
      }

      if (!quests.length || alarmQuest || Date.now() < snoozedUntil) return
      
      const triggered = quests.find(q => {
        if (q.status !== 'PENDING' || !q.startTime) return false
        if (lastTriggered?.id === q.id && lastTriggered?.time === currentTime) return false
        
        const qDate = q.dueDate || now.toISOString().split('T')[0]
        if (qDate !== now.toISOString().split('T')[0]) return false
        
        return q.startTime === currentTime
      })

      if (triggered) {
        setAlarmQuest(triggered)
        setLastTriggered({ id: triggered.id, time: currentTime })
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [quests, alarmQuest, isMuted])

  // Lock BGM during alarm
  useEffect(() => {
    if (alarmQuest) {
      pauseBGM(true)
    } else {
      resumeBGM(true)
    }
  }, [alarmQuest, pauseBGM, resumeBGM])

  const [countdown, setCountdown] = useState<number | null>(null)

  const handleEnterGate = async () => {
    if (!alarmQuest || countdown !== null) return
    
    setCountdown(5)
    
    // Silence the warning audio immediately when processing starts
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    
    // Play the start sound for the 5-second countdown
    playSFX('/assets/tone/start.mpeg')

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          finalizeEnterGate()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const finalizeEnterGate = async () => {
    if (!alarmQuest) return
    const qId = alarmQuest.id
    
    // Stop the start SFX after 5 seconds
    stopSFX()

    setAlarmQuest(null)
    
    if (!user) {
      // Guest mode action
      const localQuestsStr = localStorage.getItem('sl_local_quests')
      if (localQuestsStr) {
        const lq: any[] = JSON.parse(localQuestsStr)
        const updated = lq.map(q => q.id === qId ? { ...q, status: 'ACTIVE' } : q)
        localStorage.setItem('sl_local_quests', JSON.stringify(updated))
      }
    } else {
      // Firebase action
      try {
        await updateDoc(doc(db, 'quests', qId), { status: 'ACTIVE' })
      } catch (e) {
        console.error("GlobalAlarm action failed:", e)
      }
    }
    // Finalize Firebase/Local stats
  }

  const handleSnooze = () => {
    localStorage.setItem('sl_snoozed_until', String(Date.now() + 5000))
    setLastTriggered(null) 
    setAlarmQuest(null)
    window.dispatchEvent(new Event('storage'))
  }

  if (!alarmQuest) return null

  return (
    <div 
      id="global-system-alarm"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(220, 38, 38, 0.95)',
        zIndex: 99999, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        border: '10px solid gold',
        animation: 'sys-pulse 2s infinite'
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes sys-pulse {
          0% { background-color: rgba(220, 38, 38, 0.95); }
          50% { background-color: rgba(153, 27, 27, 0.95); }
          100% { background-color: rgba(220, 38, 38, 0.95); }
        }
      ` }} />
      {!isMuted && <audio ref={audioRef} src="/assets/tone/warning.mpeg" autoPlay loop />}
      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 24, color: 'black', letterSpacing: '0.2em', marginBottom: 16 }}>
        SYSTEM DIRECTIVE
      </div>
      <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 48, color: 'white', textShadow: '0 0 20px black', textAlign: 'center', padding: '0 20px' }}>
        {alarmQuest.title}
      </h1>
      <p style={{ fontFamily: 'Orbitron, monospace', color: 'black', fontSize: 24, margin: '20px 0', textTransform: 'uppercase' }}>
        {alarmQuest.rank}-RANK THREAT DETECTED
      </p>
      <div style={{ display: 'flex', gap: 20, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button 
          className="btn btn-primary" 
          style={{ 
            fontSize: 24, padding: '20px 40px', boxShadow: '0 0 30px rgba(0,0,0,0.5)',
            opacity: countdown !== null ? 0.7 : 1,
            cursor: countdown !== null ? 'wait' : 'pointer',
            minWidth: 320
          }}
          onClick={handleEnterGate}
          disabled={countdown !== null}
        >
          {countdown !== null ? `PROCESSING: ${countdown}S` : 'ENTER GATE NOW'}
        </button>
        <button 
          className="btn btn-ghost" 
          style={{ fontSize: 18, padding: '20px 30px', background: 'rgba(0,0,0,0.4)', borderColor: 'white', color: 'white' }}
          onClick={handleSnooze}
        >
          SNOOZE (5S)
        </button>
      </div>
    </div>
  )
}
