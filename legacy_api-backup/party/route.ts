import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'

export async function GET(req: Request) {
  const token = getTokenFromHeader(req.headers.get('Authorization'))
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const parties = await prisma.party.findMany({
    where: {
      OR: [
        { leaderId: payload.hunterId },
        { members: { some: { hunterId: payload.hunterId } } },
      ],
    },
    include: {
      leader: { select: { id: true, username: true, rank: true } },
      members: {
        include: { hunter: { select: { id: true, username: true, rank: true } } },
      },
    },
  })

  return NextResponse.json({ parties })
}

export async function POST(req: Request) {
  const token = getTokenFromHeader(req.headers.get('Authorization'))
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const { name, memberEmails } = await req.json()
  if (!name) return NextResponse.json({ error: 'Party name required' }, { status: 400 })

  const party = await prisma.party.create({
    data: {
      name,
      leaderId: payload.hunterId,
      members: {
        create: [{ hunterId: payload.hunterId, role: 'VICE_LEADER' }],
      },
    },
    include: {
      leader: { select: { id: true, username: true, rank: true } },
      members: {
        include: { hunter: { select: { id: true, username: true, rank: true } } },
      },
    },
  })

  // Invite additional members by email
  if (memberEmails && Array.isArray(memberEmails)) {
    for (const email of memberEmails) {
      const hunter = await prisma.hunter.findUnique({ where: { email } })
      if (hunter && hunter.id !== payload.hunterId) {
        await prisma.partyMember.create({
          data: { hunterId: hunter.id, partyId: party.id, role: 'MEMBER' },
        })
      }
    }
  }

  return NextResponse.json({ party }, { status: 201 })
}
