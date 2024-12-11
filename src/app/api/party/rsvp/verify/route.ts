import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rsvpId, partyId } = await req.json();

    // Verify that the user is the host of the party
    const party = await prisma.party.findUnique({
      where: { id: partyId },
      include: {
        attendees: {
          where: { id: rsvpId },
          include: { user: true },
        },
      },
    });

    if (!party) {
      return NextResponse.json({ error: "Party not found" }, { status: 404 });
    }

    if (party.hostEmail !== session.user.email) {
      return NextResponse.json(
        { error: "Only the host can verify RSVPs" },
        { status: 403 }
      );
    }

    // Check if we've reached max attendees
    const verifiedCount = await prisma.rSVP.count({
      where: {
        partyId,
        isVerified: true,
      },
    });

    if (verifiedCount >= party.maxAttendees) {
      return NextResponse.json(
        { error: "Party has reached maximum attendees" },
        { status: 400 }
      );
    }

    // Update the RSVP verification status
    const updatedRSVP = await prisma.rSVP.update({
      where: { id: rsvpId },
      data: { isVerified: true },
    });

    return NextResponse.json(updatedRSVP);
  } catch (error) {
    console.error("Error verifying RSVP:", error);
    return NextResponse.json(
      { error: "Failed to verify RSVP" },
      { status: 500 }
    );
  }
}
