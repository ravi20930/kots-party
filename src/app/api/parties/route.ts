import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const ADMIN_EMAIL = "ravi.20930@gmail.com";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, date, maxAttendees, flatNo, hostName } = body;

    if (!title || !date || !maxAttendees || !flatNo || !hostName) {
      return NextResponse.json(
        {
          message: "Missing required fields",
        },
        { status: 400 }
      );
    }

    if (
      typeof maxAttendees !== "number" ||
      maxAttendees < 1 ||
      maxAttendees > 100
    ) {
      return NextResponse.json(
        {
          message: "Invalid maxAttendees. Must be a number between 1 and 100",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        { status: 404 }
      );
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
        hostId: user.id,
      },
    });

    return NextResponse.json(party);
  } catch (error) {
    console.error("Error creating party:", error);
    return NextResponse.json(
      {
        message: "Error creating party",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.email === ADMIN_EMAIL;

    const parties = await prisma.party.findMany({
      include: {
        _count: {
          select: {
            rsvps: {
              where: {
                isVerified: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // If admin, return all parties. Otherwise, filter verified ones
    const filteredParties = isAdmin
      ? parties
      : parties.filter((p) => p.isVerified);

    // Return with proper content type and encoding
    return new Response(JSON.stringify(filteredParties), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error fetching parties:", error);
    return new Response(JSON.stringify({ message: "Error fetching parties" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          message: "Missing party ID",
        },
        { status: 400 }
      );
    }

    // Get party from database
    const party = await prisma.party.findUnique({
      where: { id },
    });

    if (!party) {
      return NextResponse.json(
        {
          message: "Party not found",
        },
        { status: 404 }
      );
    }

    // Delete party
    await prisma.party.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting party:", error);
    return NextResponse.json(
      {
        message: "Error deleting party",
      },
      { status: 500 }
    );
  }
}
