import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "ID is required" }, { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const party = await prisma.party.findUnique({
      where: { id },
      include: {
        rsvps: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            userEmail: true,
            userName: true,
            alcoholRequest: true,
            suggestion: true,
            isVerified: true,
            createdAt: true,
          },
        },
      },
    });

    if (!party) {
      return NextResponse.json({ message: "Party not found" }, { status: 404 });
    }

    // Only show RSVPs to host or admin
    const isHostOrAdmin =
      party.hostEmail === session.user.email ||
      session.user.email === "ravi.20930@gmail.com";
    if (!isHostOrAdmin) {
      party.rsvps = party.rsvps.filter((rsvp) => rsvp.isVerified);
    }

    return NextResponse.json(party);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();
    const { title, date, maxAttendees, flatNo } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Party ID is required" },
        { status: 400 }
      );
    }

    // Get party from database
    const party = await prisma.party.findUnique({
      where: { id },
    });

    if (!party) {
      return NextResponse.json({ message: "Party not found" }, { status: 404 });
    }

    // Check if user is admin or party host
    const isAdmin = session.user.email === "ravi.20930@gmail.com";
    const isHost = session.user.email === party.hostEmail;

    if (!isAdmin && !isHost) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Convert the input date (IST) to UTC before storing
    const inputDate = new Date(date);
    const utcDate = new Date(inputDate.getTime() - 5.5 * 60 * 60 * 1000);

    // Update party
    const updatedParty = await prisma.party.update({
      where: { id },
      data: {
        title,
        date: utcDate,
        maxAttendees: parseInt(maxAttendees.toString()),
        flatNo,
      },
    });

    return NextResponse.json(updatedParty);
  } catch (error) {
    console.error("Error updating party:", error);
    return NextResponse.json(
      { message: "Error updating party" },
      { status: 500 }
    );
  }
}
