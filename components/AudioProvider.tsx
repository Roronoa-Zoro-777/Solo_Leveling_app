'use client'
import React, { createContext, useContext, useRef, useEffect, useCallback } from 'react'

interface AudioContextType {
  playSFX: (src: string) => void
  playBGM: (src: string) => void
  pauseBGM: (lock?: boolean) => void
  resumeBGM: (unlock?: boolean) => void
  stopAllAudio: () => void
  stopSFX: () => void
  toggleMute: () => void
  isMuted: boolean
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = React.useState(false)
  const bgmRef = useRef<HTMLAudioElement | null>(null)
  const sfxRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Initialize mute state from localStorage
    const savedMute = localStorage.getItem('sl_system_muted') === 'true'
    setIsMuted(savedMute)

    // Initialize audio elements only on the client side
    bgmRef.current = new Audio()
    bgmRef.current.loop = true

    sfxRef.current = new Audio()

    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause()
        bgmRef.current = null
      }
      if (sfxRef.current) {
        sfxRef.current.pause()
        sfxRef.current = null
      }
    }
  }, [])

  // Resume BGM on unmute
  useEffect(() => {
    if (!isMuted && bgmRef.current && bgmRef.current.src) {
      if (bgmRef.current.paused) {
        bgmRef.current.play().catch(e => console.log("BGM resume on unmute blocked/failed:", e))
      }
    }
  }, [isMuted])

  const [isBGMPauseLocked, setIsBGMPauseLocked] = React.useState(false)

  const playSFX = useCallback((src: string) => {
    if (!sfxRef.current || isMuted) return
    sfxRef.current.src = src
    sfxRef.current.currentTime = 0
    sfxRef.current.play().catch(e => console.error("SFX play error:", e))
  }, [isMuted])

  const playBGM = useCallback((src: string) => {
    if (!bgmRef.current || isMuted || isBGMPauseLocked) return
    
    // If it's the same track and already playing, do nothing
    if (bgmRef.current.src.endsWith(src) && !bgmRef.current.paused) return

    // Stop current BGM before starting new one
    bgmRef.current.pause()
    bgmRef.current.currentTime = 0
    bgmRef.current.src = src
    bgmRef.current.play().catch(e => console.error("BGM play error:", e))
  }, [isMuted, isBGMPauseLocked])

  const pauseBGM = useCallback((lock = false) => {
    if (bgmRef.current) {
      bgmRef.current.pause()
    }
    if (lock) setIsBGMPauseLocked(true)
  }, [])

  const resumeBGM = useCallback((unlock = false) => {
    if (unlock) setIsBGMPauseLocked(false)
    if (bgmRef.current && !isMuted && bgmRef.current.src) {
      // Small timeout to avoid race conditions with lock update
      setTimeout(() => {
        if (bgmRef.current && !bgmRef.current.paused) return // already playing
        bgmRef.current?.play().catch(e => console.error("BGM resume error:", e))
      }, 50)
    }
  }, [isMuted])

  const stopSFX = useCallback(() => {
    if (sfxRef.current) {
      sfxRef.current.pause()
      sfxRef.current.currentTime = 0
    }
  }, [])

  const stopAllAudio = useCallback(() => {
    if (bgmRef.current) {
      bgmRef.current.pause()
      bgmRef.current.currentTime = 0
    }
    stopSFX()
  }, [stopSFX])

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newState = !prev
      localStorage.setItem('sl_system_muted', String(newState))
      if (newState) {
        stopAllAudio()
      }
      return newState
    })
  }, [stopAllAudio])

  return (
    <AudioContext.Provider value={{ playSFX, playBGM, pauseBGM, resumeBGM, stopAllAudio, stopSFX, toggleMute, isMuted }}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider')
  }
  return context
}
