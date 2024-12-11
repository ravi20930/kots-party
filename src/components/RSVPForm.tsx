'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { toast } from 'sonner'

interface RSVPFormProps {
  partyId: string
  onSuccess?: () => void
}

export default function RSVPForm({ partyId, onSuccess }: RSVPFormProps) {
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alcoholRequest, setAlcoholRequest] = useState('')
  const [suggestion, setSuggestion] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.email) {
      toast.error('Please sign in to RSVP')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/party/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partyId,
          alcoholRequest,
          suggestion,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to RSVP')
      }

      toast.success('RSVP submitted successfully! An admin will review your request.')
      setAlcoholRequest('')
      setSuggestion('')
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to RSVP')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 mt-6">
      <h3 className="text-xl font-bold text-white mb-4">RSVP Details</h3>

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

        <Button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 text-white bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4] disabled:opacity-50">
          {isSubmitting ? 'Submitting...' : 'RSVP'}
        </Button>
      </form>
    </div>
  )
}
