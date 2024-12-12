import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const ADMIN_EMAIL = "ravi.20930@gmail.com";

// Helper function to convert local time to UTC
function convertToUTC(dateStr: string) {
  // Parse the input date string (which is in IST)
  const date = new Date(dateStr);

  // Subtract 5 hours and 30 minutes to convert from IST to UTC
  return new Date(date.getTime() - 5.5 * 60 * 60 * 1000);
}

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

    // Convert the input date (IST) to UTC before storing
    const utcDate = convertToUTC(date);

    // Create party with verification status and UTC date
    const party = await prisma.party.create({
      data: {
        title,
        date: utcDate,
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
  if (!session?.user?.email || session.user.email !== "ravi.20930@gmail.com") {
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

    // Delete party and all related RSVPs in a single transaction
    await prisma.$transaction([
      prisma.rSVP.deleteMany({
        where: { partyId: id },
      }),
      prisma.party.delete({
        where: { id },
      }),
    ]);

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
