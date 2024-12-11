import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import RSVPForm from "@/components/RSVPForm"
import { createRSVP } from "@/app/actions/party"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PartyDetails({
  params,
}: PageProps): Promise<JSX.Element> {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/api/auth/signin")
  }

  const party = await prisma.party.findUnique({
    where: { id: resolvedParams.id },
    include: {
      host: true,
      attendees: {
        include: {
          user: true,
        },
      },
    },
  })

  if (!party) {
    return <div className="text-white">Party not found</div>
  }

  const userRSVP = party.attendees.find((rsvp) => rsvp.userId === session.user.id)

  return (
    <div className="max-w-2xl mx-auto bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-8">
      <h1 className="text-3xl font-bold text-white mb-6">{party.title}</h1>
      <div className="space-y-4 mb-8">
        <p className="text-white">
          <span className="font-semibold">Date:</span>{" "}
          {new Date(party.date).toLocaleDateString()}
        </p>
        <p className="text-white">
          <span className="font-semibold">Host:</span> {party.hostName}
        </p>
        <p className="text-white">
          <span className="font-semibold">Guests:</span> {party.attendees.length}/
          {party.maxAttendees}
        </p>
        <p className="text-white">
          <span className="font-semibold">Flat No:</span> {party.flatNo}
        </p>
      </div>
      {userRSVP ? (
        <div className="text-white">
          <p>You have already RSVPed to this party!</p>
          {userRSVP.alcoholRequest && (
            <p>Your alcohol request: {userRSVP.alcoholRequest}</p>
          )}
          {userRSVP.suggestion && <p>Your suggestion: {userRSVP.suggestion}</p>}
        </div>
      ) : (
        <RSVPForm
          createRSVP={async (formData: FormData) => {
            "use client"
            await createRSVP(party.id, formData)
          }}
          alcoholRequestsAllowed={true}
        />
      )}
    </div>
  )
}
