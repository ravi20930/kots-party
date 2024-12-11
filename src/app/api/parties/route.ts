import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from "@/lib/prisma"

const ADMIN_EMAIL = 'ravi.20930@gmail.com'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, date, maxAttendees, flatNo, hostName } = body

    if (!title || !date || !maxAttendees || !flatNo || !hostName) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Create party with verification status
    const party = await prisma.party.create({
      data: {
        title,
        date: new Date(date),
        maxAttendees,
        flatNo,
        hostName,
        hostEmail: session.user.email,
        isVerified: session.user.email === ADMIN_EMAIL,
        host: {
          connect: {
            email: session.user.email,
          },
        },
      },
    })

    return NextResponse.json(party)
  } catch (error) {
    console.error('Error creating party:', error)
    return new NextResponse('Error creating party', { status: 500 })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const parties = await prisma.party.findMany({
      include: {
        host: true,
      },
    })

    if (!parties || parties.length === 0) {
      return NextResponse.json({ error: "No parties found" }, { status: 404 })
    }

    // If admin, return all parties. Otherwise, filter verified ones
    const isAdmin = session.user.email === ADMIN_EMAIL
    const filteredParties = isAdmin 
      ? parties 
      : parties.filter((p) => p.isVerified)

    return NextResponse.json(filteredParties)
  } catch (error) {
    console.error('Error fetching parties:', error)
    return new NextResponse('Error fetching parties', { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return new NextResponse('Missing party ID', { status: 400 })
    }

    // Get party from database
    const party = await prisma.party.findUnique({
      where: {
        id,
      },
    })

    if (!party) {
      return new NextResponse('Party not found', { status: 404 })
    }

    // Only allow admin or party host to delete
    if (session.user.email !== ADMIN_EMAIL && session.user.email !== party.hostEmail) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Delete from database
    await prisma.party.delete({
      where: {
        id,
      },
    })

    return new NextResponse('Party deleted', { status: 200 })
  } catch (error) {
    console.error('Error deleting party:', error)
    return new NextResponse('Error deleting party', { status: 500 })
  }
}
