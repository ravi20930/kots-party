'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { toast } from 'sonner'

interface Props {
  partyId: string
  maxAttendees: number
  currentAttendees: Array<{
    id: string
    user: {
      email: string
    }
    isVerified: boolean
  }>
  onRSVP: () => void
}

export default function RSVPForm({ partyId, maxAttendees, currentAttendees, onRSVP }: Props) {
  const [alcoholRequest, setAlcoholRequest] = useState("")
  const [suggestion, setSuggestion] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { data: session } = useSession()

  const verifiedAttendees = currentAttendees.filter(rsvp => rsvp.isVerified);
  const remainingSeats = maxAttendees - verifiedAttendees.length;
  const hasUserRSVPd = currentAttendees.some(
    (rsvp) => rsvp.user.email === session?.user?.email
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.email) {
      toast.error("Please sign in to RSVP")
      return
    }

    if (remainingSeats <= 0) {
      toast.error("Sorry, this party is full!")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch("/api/party/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          partyId,
          alcoholRequest,
          suggestion,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to RSVP")
      }

      toast.success("RSVP submitted! Waiting for host verification.")
      onRSVP()
      setAlcoholRequest("")
      setSuggestion("")
    } catch (error) {
      console.error("Error submitting RSVP:", error)
      toast.error("Failed to submit RSVP")
    } finally {
      setSubmitting(false)
    }
  }

  if (hasUserRSVPd) {
    const userRSVP = currentAttendees.find(
      (rsvp) => rsvp.user.email === session?.user?.email
    );
    return (
      <div className="bg-gray-800 rounded-lg p-6 mt-4">
        <p className="text-white mb-2">
          You have already RSVP&apos;d to this party.
          {userRSVP?.isVerified 
            ? " Your seat is confirmed!"
            : " Waiting for host verification..."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 mt-4">
      <div className="mb-4">
        <p className="text-white">
          Remaining Seats:{" "}
          <span className={remainingSeats <= 5 ? "text-red-500" : "text-green-500"}>
            {remainingSeats}
          </span>{" "}
          out of {maxAttendees}
        </p>
      </div>

      {remainingSeats > 0 ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="alcoholRequest">Alcohol Request (Optional)</Label>
            <Input
              id="alcoholRequest"
              value={alcoholRequest}
              onChange={(e) => setAlcoholRequest(e.target.value)}
              placeholder="What would you like to bring? (e.g., Beer, Wine)"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suggestion">Suggestions (Optional)</Label>
            <Textarea
              id="suggestion"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="Any suggestions for the party? (e.g., music, food)"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[100px]"
            />
          </div>

          <Button type="submit" disabled={submitting} className="flex-1 px-4 py-2 text-white bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4] disabled:opacity-50">
            {submitting ? 'Submitting...' : 'RSVP'}
          </Button>
        </form>
      ) : (
        <p className="text-white">Sorry, this party is full!</p>
      )}
    </div>
  )
}
