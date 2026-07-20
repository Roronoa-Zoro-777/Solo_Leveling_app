'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Sidebar from '@/components/Sidebar'
import NotificationToast from '@/components/NotificationToast'

interface Member { id: string; username: string; rank: string }
interface Party {
  id: string; name: string
  leader: Member
  members: { hunter: Member; role: string }[]
}

export default function PartyPage() {
  const { hunter, user, isLoading, updateHunter } = useAuth()
  const router = useRouter()
  const [parties, setParties] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', memberEmails: '' })
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'warning' | 'rank' } | null>(null)
  const [error, setError] = useState('')

  const addToast = (msg: string, type: 'success' | 'info' | 'warning' | 'rank' = 'info') => {
    setToast({ msg, type })
  }

  useEffect(() => { if (!isLoading && !hunter) router.replace('/') }, [hunter, isLoading, router])

  const saveLocalParties = (newParties: Party[]) => {
    setParties(newParties)
    localStorage.setItem('sl_local_parties', JSON.stringify(newParties))
  }

  // Real-time Firestore listener or LocalStorage loader
  useEffect(() => {
    if (isLoading || !hunter) return

    if (!user) {
      // Guest Mode Loader
      const stored = localStorage.getItem('sl_local_parties')
      if (stored) {
        setParties(JSON.parse(stored))
      }
      setLoading(false)
      return
    }

    const loadParties = async () => {
      const { collection, query, where, onSnapshot } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')

      setLoading(true)
      const q = query(collection(db, 'parties'), where('memberIds', 'array-contains', user.uid))

      const unsubscribe = onSnapshot(q, (snapshot: any) => {
        const partyData = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }))
        setParties(partyData)
        setLoading(false)
      })

      return unsubscribe
    }

    let unsub: any
    loadParties().then(u => unsub = u)
    return () => unsub && unsub()
  }, [user, isLoading, hunter])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hunter) return

    setCreating(true); setError('')
    try {
      const emails = form.memberEmails.split(',').map(e => e.trim()).filter(Boolean)
      const invitedMembers: { hunter: Member; role: string }[] = [{ 
        hunter: { id: user?.uid || 'guest-host', username: hunter.username, rank: hunter.rank }, 
        role: 'Guild Master' 
      }]
      const memberIds = [user?.uid || 'guest-host']

      if (!user) {
        // Guest Mode Invitations (Randomly assign ranks for realism)
        emails.forEach((name, i) => {
          const ranks = ['E','D','C','B','A','S']
          const randomRank = ranks[Math.floor(Math.random() * ranks.length)]
          const id = `guest-mem-${Date.now()}-${i}`
          invitedMembers.push({
            hunter: { id, username: name.split('@')[0], rank: randomRank },
            role: 'Elite Soldier'
          })
          memberIds.push(id)
        })

        const newParty: Party = {
          id: `party-${Date.now()}`,
          name: form.name,
          leader: invitedMembers[0].hunter,
          members: invitedMembers,
        }
        
        const currentLocal = JSON.parse(localStorage.getItem('sl_local_parties') || '[]')
        saveLocalParties([...currentLocal, newParty])
        addToast('Strike team formed locally.', 'success')
      } else {
        // Firebase logic
        const { collection, addDoc, getDocs, query, where } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')

        for (const email of emails) {
          const hQuery = query(collection(db, 'hunters'), where('email', '==', email))
          const hSnapshot = await getDocs(hQuery)
          if (!hSnapshot.empty) {
            const hDoc = hSnapshot.docs[0]
            const hData = hDoc.data()
            invitedMembers.push({ 
              hunter: { id: hDoc.id, username: hData.username, rank: hData.rank }, 
              role: 'Elite Soldier' 
            })
            memberIds.push(hDoc.id)
          }
        }

        await addDoc(collection(db, 'parties'), {
          name: form.name,
          leader: invitedMembers[0].hunter,
          members: invitedMembers,
          memberIds: memberIds,
          createdAt: new Date().toISOString(),
        })
        addToast('Party recruitment successful.', 'success')
      }

      setShowCreate(false)
      setForm({ name: '', memberEmails: '' })
    } catch (err: any) {
      setError(err.message || 'Error forming party')
    } finally { setCreating(false) }
  }

  const handleDisband = async (partyId: string) => {
    if (!confirm('Disband this party? All members will be scattered.')) return

    if (!user) {
      const updated = parties.filter(p => p.id !== partyId)
      saveLocalParties(updated)
      addToast('Party disbanded.', 'info')
      return
    }

    const { doc, deleteDoc } = await import('firebase/firestore')
    const { db } = await import('@/lib/firebase')
    try {
      await deleteDoc(doc(db, 'parties', partyId))
      addToast('Party dissolved from registry.', 'info')
    } catch (err) {
      addToast('Failed to disband party.', 'warning')
    }
  }

  if (!hunter || isLoading) return <div className="system-loading-minimal" />

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main className="main-content">
        <div className="page-header flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--gate-cyan)', letterSpacing: '0.2em', marginBottom: 6 }}>
              ◈ HUNTER ASSOCIATION ◈
            </div>
            <h1 className="page-title text-2xl lg:text-3xl">Party Management</h1>
            <p className="page-subtitle text-xs lg:text-sm">Form strike teams to conquer high-rank gates</p>
          </div>
          <button className="btn btn-primary w-full sm:w-auto" onClick={() => setShowCreate(true)}>
            ＋ Form Party
          </button>
        </div>

        {loading ? (
          Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 180, marginBottom: 16, borderRadius: 12 }} />)
        ) : parties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 24, filter: 'grayscale(0.5) opacity(0.5)' }}>👥</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 20, color: 'white', marginBottom: 12 }}>
              No Active Parties
            </div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 13, color: 'var(--text-dim)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
              High-rank Red Gates require a coordinated team. Form your first strike team to begin.
            </div>
            <button className="btn btn-primary px-10" onClick={() => setShowCreate(true)}>Form Strike Team</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {parties.map(party => (
              <div key={party.id} className="glass-panel" style={{ 
                padding: '24px 20px md:24px 28px',
                border: '1px solid rgba(124, 58, 237, 0.2)',
                background: 'linear-gradient(180deg, rgba(20,20,35,0.8) 0%, rgba(10,10,20,0.9) 100%)',
              }}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 mb-6">
                  <div style={{ 
                    fontSize: 28, 
                    width: 56, height: 56, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(124, 58, 237, 0.1)',
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                    borderRadius: 12,
                    flexShrink: 0
                  }}>⚔️</div>
                  <div style={{ flex: 1 }} className="min-w-0">
                    <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: 20, color: 'white', marginBottom: 4, letterSpacing: '0.05em' }} className="truncate">
                      {party.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 9, color: 'var(--gate-cyan)', letterSpacing: '0.1em' }}>
                        ID: {party.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-dim) opacity(0.5)' }} className="hidden sm:block" />
                      <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 12, color: 'var(--mana-light)' }}>
                         {party.members.length} Hunters Engaged
                      </div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col justify-between items-center sm:items-end gap-2 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                    <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--gold-s)', letterSpacing: '0.1em' }} className="truncate max-w-[120px]">
                      👑 {party.leader.username}
                    </div>
                    <button 
                      className="btn btn-ghost btn-xs px-3" 
                      style={{ color: '#ef4444', fontSize: 9, border: '1px solid rgba(239, 68, 68, 0.2)', height: 24 }}
                      onClick={() => handleDisband(party.id)}
                    >
                      DISBAND
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {party.members.map(m => (
                    <div key={m.hunter.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      background: 'rgba(var(--mana-rgb), 0.05)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 10, padding: '10px 14px',
                    }}>
                      <div className={`rank-badge rank-badge-${m.hunter.rank}`} style={{ width: 28, height: 28, fontSize: 10, flexShrink: 0 }}>
                        {m.hunter.rank}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ 
                          fontFamily: 'Rajdhani, sans-serif', 
                          fontSize: 14, 
                          fontWeight: 700, 
                          color: 'white',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {m.hunter.username}
                        </div>
                        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 8, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
                          {m.role.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreate && (
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <div className="modal-panel" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
              <div style={{ marginBottom: 28, textAlign: 'center' }}>
                <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 11, color: 'var(--gate-cyan)', letterSpacing: '0.3em', marginBottom: 10 }}>◈ FORM A PARTY ◈</div>
                <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 24, color: 'white', letterSpacing: '0.05em' }}>Recruit Hunters</h2>
              </div>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--gate-cyan)', letterSpacing: '0.12em', marginBottom: 8 }}>PARTY NAME</label>
                  <input className="sys-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Ahjin Guild Strike Team" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Orbitron, monospace', fontSize: 10, color: 'var(--gate-cyan)', letterSpacing: '0.12em', marginBottom: 8 }}>INVITE HUNTERS</label>
                  <textarea 
                    className="sys-input" 
                    value={form.memberEmails} 
                    onChange={e => setForm(p => ({ ...p, memberEmails: e.target.value }))} 
                    placeholder={user ? "Enter emails separated by commas..." : "Enter names separated by commas..."} 
                    rows={3} 
                    style={{ resize: 'none', fontSize: 14 }} 
                  />
                  <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: 12, color: 'var(--text-dim)', marginTop: 8, lineHeight: 1.4 }}>
                    {user ? "Registered hunters will be added instantly." : "Guest mode: Invited hunters will be assigned temporary ranks."}
                  </div>
                </div>
                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', color: '#fca5a5', fontSize: 14 }}>
                    ⚠ {error}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowCreate(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={creating}>
                    {creating ? 'COMMUNICATING...' : '⚔️ FORM PARTY'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      {toast && (
        <NotificationToast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}
    </div>
  )
}
