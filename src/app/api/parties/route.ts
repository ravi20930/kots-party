import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const parties = await prisma.party.findMany({
      include: {
        host: true,
        rsvps: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    if (!parties) {
      return NextResponse.json({ error: "No parties found" }, { status: 404 });
    }

    return NextResponse.json({ data: parties });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("Prisma error:", error.code, error.message);
      return NextResponse.json(
        { error: "Database error", code: error.code },
        { status: 400 }
      );
    }

    console.error("Error fetching parties:", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch parties", details: errorMessage },
      { status: 500 }
    );
  } finally {
    // Always disconnect after the request
    await prisma.$disconnect();
  }
}
