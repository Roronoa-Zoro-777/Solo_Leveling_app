'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useAudio } from '@/components/AudioProvider'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [particles, setParticles] = useState<{x:number,y:number,size:number,speed:number,opacity:number}[]>([])
  const [hasInteracted, setHasInteracted] = useState(false)
  const { hunter, isLoading, loginWithGoogle, loginAsGuest, resetSession } = useAuth()
  const { playSFX, playBGM } = useAudio()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && hunter) {
      playBGM('/assets/tone/inapp1.mpeg')
      router.replace('/dashboard')
    }
  }, [hunter, isLoading, router, playBGM])

  useEffect(() => {
    const pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 20 + 10,
      opacity: Math.random() * 0.6 + 0.2,
    }))
    setParticles(pts)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { signInWithEmailAndPassword } = await import('firebase/auth')
        const { auth } = await import('@/lib/firebase')
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        const { createUserWithEmailAndPassword } = await import('firebase/auth')
        const { doc, setDoc } = await import('firebase/firestore')
        const { auth, db } = await import('@/lib/firebase')
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Create initial hunter profile in Firestore
        await setDoc(doc(db, 'hunters', user.uid), {
          username: username || email.split('@')[0],
          email: email,
          rank: 'E',
          xp: 0,
          level: 1,
          totalQuests: 0,
          shadowCount: 0,
          strength: 10,
          agility: 10,
          intelligence: 10,
          vitality: 10,
          perception: 10,
          createdAt: new Date().toISOString()
        })
      }
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Auth Error:', err)
      let msg = 'System error occurred'
      if (err.code === 'auth/user-not-found') msg = 'Hunter not found in system.'
      if (err.code === 'auth/wrong-password') msg = 'Invalid security key.'
      if (err.code === 'auth/email-already-in-use') msg = 'This ID is already registered.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Mandatory initial interaction to unlock Web Audio autoplay requirements
  if (!hasInteracted) {
    return (
      <div 
        onClick={() => {
          setHasInteracted(true)
          playSFX('/assets/tone/inapp.mpeg')
        }}
        style={{ 
          display: 'flex', flexDirection: 'column', minHeight: '100vh', 
          alignItems: 'center', justifyContent: 'center', 
          background: '#0a0a14', cursor: 'pointer' 
        }}
      >
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 14, color: 'var(--gate-cyan)', letterSpacing: '0.3em', marginBottom: 16 }}>
          SYSTEM INITIALIZING
        </div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 24, color: 'white', letterSpacing: '0.1em', animation: 'pulse 2s infinite' }}>
          [ CLICK TO ENTER ]
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0a0a14' }}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: 16, color: 'var(--gate-cyan)', letterSpacing: '0.2em', animation: 'pulse 1.5s infinite' }}>
          CONNECTING TO SYSTEM...
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      {/* Animated particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: i % 3 === 0 ? 'var(--mana-purple)' : i % 3 === 1 ? 'var(--gate-cyan)' : 'var(--mana-light)',
              opacity: p.opacity,
              animation: `particle-drift ${p.speed}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Giant portal ring in background */}
      <div style={{
        position: 'absolute',
        width: 'min(90vw, 600px)',
        height: 'min(90vw, 600px)',
        borderRadius: '50%',
        border: '2px solid rgba(124, 58, 237, 0.15)',
        boxShadow: '0 0 80px rgba(124, 58, 237, 0.1), inset 0 0 80px rgba(124, 58, 237, 0.05)',
        animation: 'gate-spin 20s linear infinite',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }} />
      <div style={{
        position: 'absolute',
        width: 'min(70vw, 400px)',
        height: 'min(70vw, 400px)',
        borderRadius: '50%',
        border: '1px solid rgba(6, 182, 212, 0.1)',
        animation: 'gate-spin 15s linear infinite reverse',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }} />

      <div className="login-card">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 11,
            letterSpacing: '0.3em',
            color: 'var(--gate-cyan)',
            textTransform: 'uppercase',
            marginBottom: 8,
            opacity: 0.8,
          }}>
            ◈ SYSTEM NOTIFICATION ◈
          </div>
          <h1 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 28,
            fontWeight: 900,
            background: 'linear-gradient(135deg, #ffffff, #a855f7, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.1em',
            lineHeight: 1.2,
          }}>
            SOLO LEVELING
          </h1>
          <div style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: 10,
            letterSpacing: '0.2em',
            color: 'var(--text-secondary)',
            marginTop: 4,
          }}>
            : S Y S T E M :
          </div>
          <div style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: 13,
            color: 'var(--text-secondary)',
            marginTop: 12,
            letterSpacing: '0.05em',
          }}>
            {mode === 'login'
              ? 'The system has detected your presence. Login to continue.'
              : 'A new Hunter has awakened. Register to begin your journey.'}
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', background: 'rgba(10,10,20,0.6)', borderRadius: 8, padding: 4, marginBottom: 24, border: '1px solid var(--shadow-border)' }}>
          {(['login', 'register'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError('') }}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Orbitron, monospace',
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease',
                background: mode === m ? 'var(--mana-purple)' : 'transparent',
                color: mode === m ? 'white' : 'var(--text-secondary)',
                boxShadow: mode === m ? '0 0 15px rgba(124, 58, 237, 0.4)' : 'none',
              }}
            >
              {m === 'login' ? '[ Login ]' : '[ Awaken ]'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: '0.1em', color: 'var(--gate-cyan)', marginBottom: 6 }}>
                HUNTER NAME
              </label>
              <input
                className="sys-input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your hunter name"
                required
              />
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: '0.1em', color: 'var(--gate-cyan)', marginBottom: 6 }}>
              HUNTER ID (EMAIL)
            </label>
            <input
              className="sys-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="hunter@system.net"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'Orbitron, monospace', fontSize: 10, letterSpacing: '0.1em', color: 'var(--gate-cyan)', marginBottom: 6 }}>
              SECURITY KEY
            </label>
            <input
              className="sys-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 8,
              padding: '12px 16px',
              color: '#fca5a5',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: 14,
            }}>
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            style={{ marginTop: 8, width: '100%' }}
          >
            {loading ? (
              <span style={{ animation: 'text-glow 1s ease infinite' }}>SYSTEM PROCESSING...</span>
            ) : mode === 'login' ? (
              '⚡ ENTER THE SYSTEM'
            ) : (
              '🌑 AWAKEN AS HUNTER'
            )}
          </button>

          <div style={{ position: 'relative', margin: '8px 0', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ position: 'relative', background: 'var(--mana-dark)', padding: '0 12px', fontSize: 10, color: 'var(--text-dim)', fontFamily: 'Orbitron, monospace' }}>OR</span>
          </div>

          <button
            type="button"
            onClick={async () => {
              setError('')
              setLoading(true)
              try {
                await loginWithGoogle()
                router.push('/dashboard')
              } catch (err: any) {
                setError('Google authentication failed.')
                setLoading(false)
              }
            }}
            className="btn btn-ghost"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.03)',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: 14,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => {
              loginAsGuest()
              router.push('/dashboard')
            }}
            className="btn btn-ghost"
            style={{
              width: '100%',
              marginTop: 4,
              border: '1px solid rgba(6, 182, 212, 0.2)',
              background: 'rgba(6, 182, 212, 0.05)',
              color: 'var(--gate-cyan)',
              fontFamily: 'Orbitron, monospace',
              fontSize: 11,
              letterSpacing: '0.1em',
            }}
          >
            [ Override: Enter as Guest ]
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button 
            onClick={resetSession}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-dim)',
              fontSize: 10,
              fontFamily: 'Orbitron, monospace',
              cursor: 'pointer',
              textDecoration: 'underline',
              opacity: 0.6
            }}
          >
            RESET SYSTEM (Clear Data)
          </button>
        </div>

        {mode === 'login' && (
          <div style={{ marginTop: 20, textAlign: 'center', color: 'var(--text-dim)', fontSize: 12, fontFamily: 'Rajdhani, sans-serif' }}>
            Demo: sung@system.net / arise1234
          </div>
        )}

        <div style={{
          marginTop: 24,
          paddingTop: 20,
          borderTop: '1px solid var(--shadow-border)',
          textAlign: 'center',
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 12,
          color: 'var(--text-dim)',
          letterSpacing: '0.05em',
        }}>
          ◈ THE SYSTEM WATCHES ALL ◈
        </div>
      </div>
    </div>
  )
}
