import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password)
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

    const hunter = await prisma.hunter.findUnique({ where: { email } })
    if (!hunter)
      return NextResponse.json({ error: 'Hunter not found in the system' }, { status: 404 })

    const valid = await bcrypt.compare(password, hunter.passwordHash)
    if (!valid)
      return NextResponse.json({ error: 'Invalid security key' }, { status: 401 })

    const token = signToken({ hunterId: hunter.id, email: hunter.email })
    const { passwordHash: _, ...safeHunter } = hunter

    return NextResponse.json({ token, hunter: safeHunter })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'System error' }, { status: 500 })
  }
}
