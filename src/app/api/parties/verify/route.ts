import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

const ADMIN_EMAIL = 'ravi.20930@gmail.com'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (session?.user?.email !== ADMIN_EMAIL) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return new NextResponse('Missing party ID', { status: 400 })
    }

    const party = await prisma.party.update({
      where: { id },
      data: { isVerified: true },
    })

    return NextResponse.json(party)
  } catch (error) {
    console.error('Error verifying party:', error)
    return new NextResponse('Error verifying party', { status: 500 })
  }
}
