'use client'

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import RSVPForm from "@/components/RSVPForm"
import { toast } from "sonner"

// Helper function to format dates
const formatDate = (dateString: string | Date) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

type Party = {
  id: string
  title: string
  date: Date
  maxAttendees: number
  flatNo: string
  hostName: string
  hostEmail: string
  attendees: Array<{
    id: string
    userId: string
    alcoholRequest?: string | null
    suggestion?: string | null
    createdAt: Date
    user: {
      name: string | null
      email: string
    }
  }>
}

export default function PartyDetails() {
  const params = useParams()
  const id = params?.id as string
  const { data: session } = useSession();
  const [party, setParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRSVPForm, setShowRSVPForm] = useState(false);

  const isAdmin = session?.user?.email === 'ravi.20930@gmail.com'
  const isHost = session?.user?.email === party?.hostEmail
  const canManageRSVPs = isAdmin || isHost

  const fetchParty = useCallback(async () => {
    try {
      const res = await fetch(`/api/party?id=${id}`)
      if (!res.ok) throw new Error('Failed to fetch party')
      const data = await res.json()
      setParty(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch party')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchParty()
  }, [fetchParty])

  const handleCancelRSVP = async (userEmail: string) => {
    if (!canManageRSVPs) return

    try {
      const res = await fetch(`/api/party/rsvp?partyId=${id}&userEmail=${userEmail}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to cancel RSVP')
      }

      toast.success('RSVP cancelled successfully!')
      await fetchParty()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel RSVP')
    }
  }

  if (loading) return <div className="text-white">Loading...</div>
  if (error) return <div className="text-white">Error: {error}</div>
  if (!party) return <div className="text-white">Party not found</div>

  const userRSVP = party.attendees.find(rsvp => rsvp.user.email === session?.user?.email)
  const spotsLeft = party.maxAttendees - party.attendees.length

  return (
    <div className="max-w-2xl mx-auto bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-8">
      <h1 className="text-3xl font-bold text-white mb-6">{party.title}</h1>
      <div className="space-y-4 mb-8">
        <p className="text-white">
          <span className="font-semibold">Date:</span>{" "}
          {formatDate(party.date)}
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
          <button
            onClick={() => handleCancelRSVP(session!.user!.email!)}
            className="px-6 py-3 text-white bg-red-500 rounded-lg font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Cancel My RSVP
          </button>
        </div>
      ) : (
        <div>
          {spotsLeft === 0 ? (
            <button
              disabled
              className="px-6 py-3 text-white bg-gray-600 rounded-lg font-medium opacity-50"
            >
              Party Full
            </button>
          ) : (
            <>
              {!showRSVPForm ? (
                <button
                  onClick={() => setShowRSVPForm(true)}
                  className="px-6 py-3 text-white bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4]"
                >
                  RSVP Now
                </button>
              ) : (
                <RSVPForm
                  partyId={party.id}
                  onSuccess={() => {
                    fetchParty()
                    setShowRSVPForm(false)
                  }}
                />
              )}
            </>
          )}
        </div>
      )}

      {canManageRSVPs && party.attendees.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Guest List ({party.attendees.length})</h2>
          <div className="bg-gray-900/50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    RSVP Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {party.attendees.map((rsvp) => (
                  <tr key={rsvp.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {rsvp.user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {rsvp.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {formatDate(rsvp.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleCancelRSVP(rsvp.user.email!)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Cancel RSVP
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
