import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create a demo hunter
  const hashedPassword = await bcrypt.hash('arise1234', 10)

  const hunter = await prisma.hunter.upsert({
    where: { email: 'sung@system.net' },
    update: {},
    create: {
      username: 'Sung Jinwoo',
      email: 'sung@system.net',
      passwordHash: hashedPassword,
      rank: 'E',
      xp: 0,
      level: 1,
      strength: 10,
      agility: 10,
      intelligence: 10,
      vitality: 10,
      perception: 10,
    },
  })

  console.log(`✅ Demo hunter created: ${hunter.username} (${hunter.email})`)

  // Seed quests of various ranks
  const quests = [
    {
      title: 'Clear the Dungeon Basement',
      description: 'Eliminate all monsters lurking in the E-rank dungeon basement.',
      rank: 'E',
      status: 'PENDING',
      xpReward: 100,
      createdById: hunter.id,
    },
    {
      title: 'Escort the Guild Merchant',
      description: 'Safely escort a merchant through the goblin-infested forest path.',
      rank: 'D',
      status: 'PENDING',
      xpReward: 300,
      createdById: hunter.id,
    },
    {
      title: 'Retrieve Mana Crystal Shards',
      description: 'Venture into the C-rank gate and recover 10 mana crystal shards.',
      rank: 'C',
      status: 'ACTIVE',
      xpReward: 700,
      createdById: hunter.id,
    },
    {
      title: 'Defeat the Ant Queen',
      description: 'Enter Jeju Island and slay the dreaded Ant Queen before she fully awakens.',
      rank: 'B',
      status: 'PENDING',
      xpReward: 1500,
      createdById: hunter.id,
    },
    {
      title: 'Neutralize the Red Gate Threat',
      description: 'A red gate has appeared. Investigate and neutralize it within 24 hours.',
      rank: 'A',
      status: 'PENDING',
      xpReward: 4000,
      createdById: hunter.id,
    },
    {
      title: 'Face the Architect',
      description: 'Confront the Architect in a final system trial. Only the strongest survive.',
      rank: 'S',
      status: 'PENDING',
      xpReward: 10000,
      createdById: hunter.id,
    },
  ]

  for (const quest of quests) {
    await prisma.quest.create({ data: quest })
  }

  console.log(`✅ ${quests.length} sample quests seeded.`)

  // Seed daily quests
  const today = new Date().toISOString().split('T')[0]
  const dailyQuests = [
    { title: '100 Push-ups', xpReward: 50, hunterId: hunter.id, date: today },
    { title: '100 Sit-ups', xpReward: 50, hunterId: hunter.id, date: today },
    { title: '10km Run', xpReward: 75, hunterId: hunter.id, date: today },
  ]

  for (const dq of dailyQuests) {
    await prisma.dailyQuest.create({ data: dq })
  }

  console.log(`✅ ${dailyQuests.length} daily quests seeded.`)
  console.log('\n🌑 System: Database seeding complete. ARISE.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
