import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json()

    if (!username || !email || !password)
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })

    if (password.length < 6)
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

    const existing = await prisma.hunter.findFirst({
      where: { OR: [{ email }, { username }] },
    })
    if (existing)
      return NextResponse.json({ error: 'Hunter ID or name already registered' }, { status: 409 })

    const passwordHash = await bcrypt.hash(password, 10)
    const hunter = await prisma.hunter.create({
      data: { username, email, passwordHash },
    })

    // Seed daily quests for new hunter
    const today = new Date().toISOString().split('T')[0]
    await prisma.dailyQuest.createMany({
      data: [
        { title: '100 Push-ups', xpReward: 50, hunterId: hunter.id, date: today },
        { title: '100 Sit-ups', xpReward: 50, hunterId: hunter.id, date: today },
        { title: '10km Run', xpReward: 75, hunterId: hunter.id, date: today },
      ],
    })

    const token = signToken({ hunterId: hunter.id, email: hunter.email })
    const { passwordHash: _, ...safeHunter } = hunter

    return NextResponse.json({ token, hunter: safeHunter }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'System error' }, { status: 500 })
  }
}
