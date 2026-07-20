import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'

export async function GET(req: Request) {
  const token = getTokenFromHeader(req.headers.get('Authorization'))
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const today = new Date().toISOString().split('T')[0]

  // Auto-create daily quests if they don't exist for today
  let dailyQuests = await prisma.dailyQuest.findMany({
    where: { hunterId: payload.hunterId, date: today },
  })

  if (dailyQuests.length === 0) {
    const defaultQuests = [
      { title: '100 Push-ups', xpReward: 50 },
      { title: '100 Sit-ups', xpReward: 50 },
      { title: '10km Run', xpReward: 75 },
      { title: 'Meditate for 30 minutes', xpReward: 40 },
      { title: 'Study for 2 hours', xpReward: 60 },
    ]
    await prisma.dailyQuest.createMany({
      data: defaultQuests.map(q => ({ ...q, hunterId: payload.hunterId, date: today })),
    })
    dailyQuests = await prisma.dailyQuest.findMany({
      where: { hunterId: payload.hunterId, date: today },
    })
  }

  return NextResponse.json({ dailyQuests })
}

export async function POST(req: Request) {
  const token = getTokenFromHeader(req.headers.get('Authorization'))
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { questId } = await req.json()
  const quest = await prisma.dailyQuest.findUnique({ where: { id: questId } })
  if (!quest || quest.hunterId !== payload.hunterId)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (quest.completed)
    return NextResponse.json({ error: 'Already completed' }, { status: 400 })

  await prisma.dailyQuest.update({ where: { id: questId }, data: { completed: true } })

  // Award XP
  await prisma.hunter.update({
    where: { id: payload.hunterId },
    data: { xp: { increment: quest.xpReward } },
  })

  return NextResponse.json({ xpReward: quest.xpReward })
}
