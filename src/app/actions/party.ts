'use server'

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function createRSVP(partyId: string, formData: FormData) {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("Unauthorized")
  }

  const party = await prisma.party.findUnique({
    where: { id: partyId },
  })

  if (!party) {
    throw new Error("Party not found")
  }

  const alcoholRequest = formData.get("alcoholRequest") as string
  const suggestion = formData.get("suggestion") as string

  await prisma.attendee.create({
    data: {
      userId: session.user.id,
      partyId: party.id,
      alcoholRequest,
      suggestion,
    },
  })

  redirect(`/party/${party.id}`)
}
