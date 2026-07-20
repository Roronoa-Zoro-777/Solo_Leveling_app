import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader, getXPForLevel, getRankFromLevel, getStatBoost } from '@/lib/auth'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const token = getTokenFromHeader(req.headers.get('Authorization'))
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const quest = await prisma.quest.findUnique({
    where: { id: params.id },
    include: {
      assignee: { select: { id: true, username: true, rank: true } },
      creator: { select: { id: true, username: true } },
    },
  })
  if (!quest) return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
  return NextResponse.json({ quest })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const token = getTokenFromHeader(req.headers.get('Authorization'))
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const body = await req.json()
  const { action, assignedToId, title, description, rank, dueDate } = body

  const quest = await prisma.quest.findUnique({ where: { id: params.id } })
  if (!quest) return NextResponse.json({ error: 'Quest not found' }, { status: 404 })

  let updateData: Record<string, unknown> = {}
  let rankUp = false
  let newRank = ''

  if (action === 'start') {
    updateData = { status: 'ACTIVE' }
  } else if (action === 'complete') {
    updateData = { status: 'COMPLETED', completedAt: new Date(), isShadow: true }

    // Award XP to the hunter
    const hunter = await prisma.hunter.findUnique({ where: { id: payload.hunterId } })
    if (hunter) {
      const newXP = hunter.xp + quest.xpReward
      let newLevel = hunter.level
      let xpNeeded = getXPForLevel(newLevel + 1)

      // Level up check
      while (newXP >= xpNeeded) {
        newLevel++
        xpNeeded = getXPForLevel(newLevel + 1)
      }

      newRank = getRankFromLevel(newLevel)
      rankUp = newRank !== hunter.rank
      const statBoost = getStatBoost(quest.rank) * (newLevel - hunter.level + 1)

      await prisma.hunter.update({
        where: { id: payload.hunterId },
        data: {
          xp: newXP,
          level: newLevel,
          rank: newRank || hunter.rank,
          totalQuests: hunter.totalQuests + 1,
          shadowCount: hunter.shadowCount + 1,
          strength: hunter.strength + statBoost,
          agility: hunter.agility + statBoost,
          intelligence: hunter.intelligence + statBoost,
          vitality: hunter.vitality + Math.floor(statBoost / 2),
          perception: hunter.perception + Math.floor(statBoost / 2),
        },
      })
    }
  } else if (action === 'fail') {
    updateData = { status: 'FAILED' }
  } else if (action === 'assign') {
    updateData = { assignedToId }
  } else {
    // General update
    if (title) updateData.title = title
    if (description) updateData.description = description
    if (rank) updateData.rank = rank
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
  }

  const updated = await prisma.quest.update({
    where: { id: params.id },
    data: updateData,
    include: {
      assignee: { select: { id: true, username: true, rank: true } },
      creator: { select: { id: true, username: true } },
    },
  })

  return NextResponse.json({ quest: updated, rankUp, newRank, xpReward: quest.xpReward })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const token = getTokenFromHeader(req.headers.get('Authorization'))
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const quest = await prisma.quest.findUnique({ where: { id: params.id } })
  if (!quest) return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
  if (quest.createdById !== payload.hunterId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  await prisma.quest.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
