import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader, getXPForLevel, getRankFromLevel, getStatBoost } from '@/lib/auth'

const XP_REWARDS: Record<string, number> = {
  E: 100, D: 300, C: 700, B: 1500, A: 4000, S: 10000,
}

export async function GET(req: Request) {
  const token = getTokenFromHeader(req.headers.get('Authorization'))
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const rank = searchParams.get('rank')

  const where: Record<string, unknown> = { createdById: payload.hunterId }
  if (status) where.status = status
  if (rank) where.rank = rank

  const quests = await prisma.quest.findMany({
    where,
    include: {
      assignee: { select: { id: true, username: true, rank: true } },
      creator: { select: { id: true, username: true } },
    },
    orderBy: [
      { status: 'asc' },
      { createdAt: 'desc' },
    ],
  })

  return NextResponse.json({ quests })
}

export async function POST(req: Request) {
  const token = getTokenFromHeader(req.headers.get('Authorization'))
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { title, description, rank, dueDate, assignedToId } = await req.json()
  if (!title || !description || !rank)
    return NextResponse.json({ error: 'Title, description and rank required' }, { status: 400 })

  const quest = await prisma.quest.create({
    data: {
      title,
      description,
      rank,
      xpReward: XP_REWARDS[rank] || 100,
      createdById: payload.hunterId,
      assignedToId: assignedToId || payload.hunterId,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: {
      assignee: { select: { id: true, username: true, rank: true } },
      creator: { select: { id: true, username: true } },
    },
  })

  return NextResponse.json({ quest }, { status: 201 })
}
