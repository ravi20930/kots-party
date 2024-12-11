'use client'

import { useState } from 'react'

interface RSVPFormProps {
  createRSVP: (formData: FormData) => Promise<void>
  alcoholRequestsAllowed: boolean
}

export default function RSVPForm({
  createRSVP,
  alcoholRequestsAllowed,
}: RSVPFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(event.currentTarget)
      await createRSVP(formData)
    } catch (error) {
      console.error('Failed to RSVP:', error)
      alert('Failed to RSVP. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {alcoholRequestsAllowed && (
        <div>
          <label
            htmlFor="alcoholRequest"
            className="block text-sm font-medium text-white mb-2"
          >
            Alcohol Request (optional)
          </label>
          <input
            type="text"
            id="alcoholRequest"
            name="alcoholRequest"
            className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            placeholder="What would you like to bring?"
          />
        </div>
      )}

      <div>
        <label
          htmlFor="suggestion"
          className="block text-sm font-medium text-white mb-2"
        >
          Suggestions (optional)
        </label>
        <textarea
          id="suggestion"
          name="suggestion"
          rows={3}
          className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
          placeholder="Any suggestions for the party?"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-4 py-2 text-white bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4] disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'RSVP to Party'}
      </button>
    </form>
  )
}
