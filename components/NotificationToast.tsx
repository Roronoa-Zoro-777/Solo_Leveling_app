'use client'
import { useEffect } from 'react'

interface NotificationToastProps {
  message: string
  onDone: () => void
  type?: 'info' | 'success' | 'warning' | 'rank'
}

const colors: Record<string, string> = {
  info: 'var(--mana-light)',
  success: 'var(--rank-d)',
  warning: 'var(--rank-a)',
  rank: 'var(--gold-s)',
}

const glows: Record<string, string> = {
  info: 'rgba(168,85,247,0.4)',
  success: 'rgba(34,197,94,0.4)',
  warning: 'rgba(245,158,11,0.4)',
  rank: 'rgba(251,191,36,0.5)',
}

export default function NotificationToast({ message, onDone, type = 'info' }: NotificationToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      className="notification-toast"
      style={{
        color: colors[type],
        borderColor: colors[type],
        boxShadow: `0 0 20px ${glows[type]}, 0 20px 40px rgba(0,0,0,0.4)`,
      }}
    >
      {type === 'rank' ? '👑' : type === 'success' ? '⚡' : type === 'warning' ? '⚠' : '◈'} {message}
    </div>
  )
}
