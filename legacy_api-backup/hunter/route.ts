import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'

export async function GET(req: Request) {
  const token = getTokenFromHeader(req.headers.get('Authorization'))
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const hunter = await prisma.hunter.findUnique({
    where: { id: payload.hunterId },
    select: {
      id: true, username: true, email: true, rank: true, xp: true, level: true,
      totalQuests: true, shadowCount: true, strength: true, agility: true,
      intelligence: true, vitality: true, perception: true, createdAt: true,
    },
  })
  if (!hunter) return NextResponse.json({ error: 'Hunter not found' }, { status: 404 })
  return NextResponse.json({ hunter })
}
