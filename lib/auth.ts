import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'solo-leveling-system-secret'

export function signToken(payload: { hunterId: string; email: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { hunterId: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { hunterId: string; email: string }
  } catch {
    return null
  }
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}

// XP thresholds per level
export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// Determine rank from level
export function getRankFromLevel(level: number): string {
  if (level >= 100) return 'NATIONAL'
  if (level >= 60) return 'S'
  if (level >= 40) return 'A'
  if (level >= 25) return 'B'
  if (level >= 15) return 'C'
  if (level >= 8) return 'D'
  return 'E'
}

// XP reward to add to stats
export function getStatBoost(rank: string): number {
  const boosts: Record<string, number> = {
    E: 1, D: 2, C: 3, B: 5, A: 8, S: 15,
  }
  return boosts[rank] || 1
}
