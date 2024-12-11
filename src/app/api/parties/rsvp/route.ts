import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { partyId } = body

    if (!partyId) {
      return NextResponse.json({ message: 'Party ID is required' }, { status: 400 })
    }

    // Check if party exists and is verified
    const party = await prisma.party.findUnique({
      where: { id: partyId },
    })

    if (!party) {
      return NextResponse.json({ message: 'Party not found' }, { status: 404 })
    }

    if (!party.isVerified) {
      return NextResponse.json({ message: 'Party is not verified yet' }, { status: 400 })
    }

    // Check if user already RSVPed
    const existingRSVP = await prisma.rSVP.findFirst({
      where: {
        partyId,
        userEmail: session.user.email,
      },
    })

    if (existingRSVP) {
      return NextResponse.json({ message: 'You have already RSVPed to this party' }, { status: 400 })
    }

    // Check if party is full
    const rsvpCount = await prisma.rSVP.count({
      where: { partyId },
    })

    if (rsvpCount >= party.maxAttendees) {
      return NextResponse.json({ message: 'Party is full' }, { status: 400 })
    }

    // Create RSVP
    const rsvp = await prisma.rSVP.create({
      data: {
        partyId,
        userEmail: session.user.email,
        userName: session.user.name || 'Anonymous',
      },
    })

    return NextResponse.json(rsvp)
  } catch (error) {
    console.error('Error creating RSVP:', error)
    return NextResponse.json({ message: 'Error creating RSVP' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const partyId = searchParams.get('partyId')

    if (!partyId) {
      return NextResponse.json({ message: 'Party ID is required' }, { status: 400 })
    }

    // Delete RSVP
    await prisma.rSVP.deleteMany({
      where: {
        partyId,
        userEmail: session.user.email,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error canceling RSVP:', error)
    return NextResponse.json({ message: 'Error canceling RSVP' }, { status: 500 })
  }
}
