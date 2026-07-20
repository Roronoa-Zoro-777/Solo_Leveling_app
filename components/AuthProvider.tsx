'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'

interface Hunter {
  id: string
  username: string
  email: string
  rank: string
  xp: number
  level: number
  totalQuests: number
  shadowCount: number
  strength: number
  agility: number
  intelligence: number
  vitality: number
  perception: number
  photoURL?: string
  unlockedShadowIds?: string[]
}

interface AuthContextType {
  hunter: Hunter | null
  user: User | null
  loginWithGoogle: () => Promise<void>
  loginAsGuest: () => void
  updateHunter: (updates: Partial<Hunter>) => Promise<void>
  logout: () => void
  resetSession: () => void
  refreshHunter: () => Promise<void>
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [hunter, setHunter] = useState<Hunter | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hunterRefUnsubscribe = React.useRef<(() => void) | null>(null)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      console.log('Auth State Changed:', firebaseUser ? `User: ${firebaseUser.email || firebaseUser.uid}` : 'No Firebase User');
      setError(null);
      
      // Check for Guest Mode persistence if no firebase user
      if (!firebaseUser) {
        const isGuest = localStorage.getItem('sl_guest_mode') === 'true'
        if (isGuest) {
          const savedData = localStorage.getItem('sl_guest_data')
          if (savedData) {
            try {
              const guestData = JSON.parse(savedData)
              console.log('Restoring Guest Session:', guestData.username);
              setHunter(guestData)
              setIsLoading(false)
              return // Stay as guest
            } catch (e) {
              console.error("Failed to parse guest data:", e)
            }
          }
        }
      }

      // Cleanup previous hunter listener if it exists
      if (hunterRefUnsubscribe.current) {
        hunterRefUnsubscribe.current();
        hunterRefUnsubscribe.current = null;
      }

      if (firebaseUser) {
        // Attempt to load from cache for instant UI
        const cachedProfile = localStorage.getItem('sl_profile_cache');
        if (cachedProfile) {
          try {
            const profileData = JSON.parse(cachedProfile);
            if (profileData.id === firebaseUser.uid) {
              console.log('Instant Profile Load from Cache:', profileData.username);
              setHunter(profileData);
              setIsLoading(false);
            }
          } catch (e) {
            console.warn('Failed to parse profile cache:', e);
          }
        } else {
          setIsLoading(true);
        }

        let unsub: (() => void) | null = null;
        
        // Timeout to prevent infinite "Loading" if Firestore is dead/disabled
        const timeoutId = setTimeout(() => {
          console.warn('Firestore profile fetch timed out. Triggering fallback states.');
          if (unsub) unsub();
          setIsLoading(false);
          setError('System connection timeout. Check if Firestore is enabled.');
          if (!hunter) setHunter(null); 
        }, 8000);

        try {
          const hunterRef = doc(db, 'hunters', firebaseUser.uid);
          
          unsub = onSnapshot(hunterRef, async (snapshot) => {
            clearTimeout(timeoutId);
            if (snapshot.exists()) {
              const hunterData = { id: snapshot.id, ...snapshot.data() } as Hunter;
              setHunter(hunterData);
              localStorage.setItem('sl_profile_cache', JSON.stringify(hunterData));
              setIsLoading(false);
              setError(null);
            } else {
              // Creating the profile if it doesn't exist.
              try {
                await setDoc(hunterRef, {
                  username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Unknown Hunter',
                  email: firebaseUser.email || '',
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
                });
                // Once saved, the listener will re-fire and populate `hunter`.
              } catch (createErr: any) {
                console.error('Failed to create default profile:', createErr);
                setHunter(null);
                setIsLoading(false);
                setError('Failed to initialize Hunter Profile.');
              }
            }
          }, (err) => {
            clearTimeout(timeoutId);
            console.error('Firestore subscription error:', err);
            setIsLoading(false);
            setHunter(null);
            
            if (err.code === 'permission-denied') {
              setError('Access Denied. Ensure your account is registered correctly.');
            } else if (err.message.includes('API has not been used')) {
              setError('SYSTEM ERROR: Cloud Firestore API is disabled. Please enable it in Firebase Console.');
            } else {
              setError(`Connection Error: ${err.message}`);
            }
          });
          
          hunterRefUnsubscribe.current = unsub;
        } catch (err: any) {
          clearTimeout(timeoutId);
          console.error('Failed to setup hunter snapshot:', err);
          setIsLoading(false);
          setHunter(null);
          setError(err.message || 'Fatal Authentication Error');
        }
      } else {
        console.log('No authentication source found. Clearing profile.');
        setHunter(null);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (hunterRefUnsubscribe.current) {
        hunterRefUnsubscribe.current();
      }
    };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth')
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (err) {
      console.error('Google Auth Error:', err)
      throw err
    }
  }, [])

  const loginAsGuest = useCallback(() => {
    const defaultGuest: Hunter = {
      id: 'guest_' + Math.random().toString(36).slice(2, 7),
      username: 'Guest Hunter',
      email: 'guest@system.local',
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
      photoURL: '/icon-192x192.png'
    }

    // Load existing guest stats if any
    const savedGuest = localStorage.getItem('sl_guest_data')
    const hunterData = savedGuest ? JSON.parse(savedGuest) : defaultGuest

    setHunter(hunterData)
    setUser(null)
    setIsLoading(false)
    localStorage.setItem('sl_guest_mode', 'true')
    localStorage.setItem('sl_guest_data', JSON.stringify(hunterData))
  }, [])

  const updateHunter = useCallback(async (updates: Partial<Hunter>) => {
    if (user) {
      // Firebase update logic would go here if not using onSnapshot
      // But since we use onSnapshot, we just update Firestore
      console.log('Firebase user update skipped in AuthProvider (using Firestore directly)')
      return
    }

    // Guest update logic
    if (hunter) {
      const updatedHunter = { ...hunter, ...updates }
      setHunter(updatedHunter)
      localStorage.setItem('sl_guest_data', JSON.stringify(updatedHunter))
    }
  }, [user, hunter])

  const logout = useCallback(async () => {
    localStorage.removeItem('sl_guest_mode')
    localStorage.removeItem('sl_guest_data')
    await signOut(auth)
    setHunter(null)
    setUser(null)
    window.location.href = '/'
  }, [])

  const resetSession = useCallback(() => {
    localStorage.clear()
    sessionStorage.clear()
    signOut(auth).finally(() => {
      window.location.reload()
    })
  }, [])

  const refreshHunter = useCallback(async () => {
    if (!user) return
    const hunterRef = doc(db, 'hunters', user.uid)
    const snapshot = await getDoc(hunterRef)
    if (snapshot.exists()) {
      setHunter({ id: snapshot.id, ...snapshot.data() } as Hunter)
    }
  }, [user])

  return (
    <AuthContext.Provider value={{ hunter, user, loginWithGoogle, loginAsGuest, updateHunter, logout, resetSession, refreshHunter, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
