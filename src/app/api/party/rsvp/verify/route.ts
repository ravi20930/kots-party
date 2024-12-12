import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { rsvpId, partyId } = body;

    // Check if the user is the host or admin
    const party = await prisma.party.findUnique({
      where: { id: partyId },
    });

    if (!party) {
      return NextResponse.json({ message: "Party not found" }, { status: 404 });
    }

    // Only allow host or admin to verify RSVPs
    if (
      party.hostEmail !== session.user.email &&
      session.user.email !== "ravi.20930@gmail.com"
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Update RSVP verification status
    const updatedRSVP = await prisma.rSVP.update({
      where: { id: rsvpId },
      data: { isVerified: true },
    });

    return NextResponse.json(updatedRSVP);
  } catch (error) {
    console.error("Error verifying RSVP:", error);
    return NextResponse.json(
      { message: "Error verifying RSVP" },
      { status: 500 }
    );
  }
}
