'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Party {
  id: string
  title: string
  date: string
  maxAttendees: number
  flatNo: string
  hostName: string
  hostEmail: string
  isVerified: boolean
}

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [parties, setParties] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (session?.user?.email !== 'ravi.20930@gmail.com') {
      router.push('/')
      return
    }

    fetchParties()
  }, [session, router])

  const fetchParties = async () => {
    try {
      const res = await fetch('/api/parties')
      if (!res.ok) throw new Error('Failed to fetch parties')
      const data = await res.json()
      setParties(data)
    } catch (error) {
      console.error('Error fetching parties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (id: string) => {
    try {
      const res = await fetch(`/api/parties/verify?id=${id}`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to verify party')
      fetchParties()
    } catch (error) {
      console.error('Error verifying party:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/parties?id=${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete party')
      fetchParties()
    } catch (error) {
      console.error('Error deleting party:', error)
    }
  }

  if (session?.user?.email !== 'ravi.20930@gmail.com') {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  const displayedParties = showAll ? parties : parties.filter(party => !party.isVerified)
  const pendingCount = parties.filter(party => !party.isVerified).length

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">
              {pendingCount} {pendingCount === 1 ? 'party' : 'parties'} pending verification
            </p>
          </div>
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            {showAll ? 'Show Pending Only' : 'Show All Parties'}
          </button>
        </div>
        
        <div className="space-y-4">
          {displayedParties.map((party) => (
            <div
              key={party.id}
              className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">{party.title}</h2>
                  <p className="text-gray-400 mt-1">
                    Hosted by {party.hostName} ({party.hostEmail})
                  </p>
                  <p className="text-gray-400">Flat: {party.flatNo}</p>
                  <p className="text-gray-400">
                    Date: {new Date(party.date).toLocaleString()}
                  </p>
                  <p className="text-gray-400">Max Attendees: {party.maxAttendees}</p>
                  <div className="mt-2">
                    {party.isVerified ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Verification
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!party.isVerified && (
                    <button
                      onClick={() => handleVerify(party.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Verify
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(party.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {displayedParties.length === 0 && (
            <p className="text-gray-400 text-center py-8">
              {showAll ? 'No parties found' : 'No pending parties to review'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
