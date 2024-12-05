'use client'

import { useState } from 'react'

export default function HostPartyForm({ createParty }: { createParty: (formData: FormData) => void }) {
  const [partyDetails, setPartyDetails] = useState({
    name: '',
    date: '',
    maxGuests: '',
    maleRatio: '',
    femaleRatio: '',
    entryType: 'free',
    alcoholRequests: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setPartyDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="max-w-2xl mx-auto bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Host a Block Party</h1>
      <form action={createParty} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-white mb-2">Party Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={partyDetails.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-white bg-opacity-20 rounded-md text-white placeholder-gray-300"
            placeholder="Summer Rooftop Bash"
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-white mb-2">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={partyDetails.date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-white bg-opacity-20 rounded-md text-white placeholder-gray-300"
          />
        </div>
        <div>
          <label htmlFor="maxGuests" className="block text-white mb-2">Max Guests</label>
          <input
            type="number"
            id="maxGuests"
            name="maxGuests"
            value={partyDetails.maxGuests}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-white bg-opacity-20 rounded-md text-white placeholder-gray-300"
            placeholder="30"
          />
        </div>
        <div>
          <label htmlFor="maleRatio" className="block text-white mb-2">Male Ratio (%)</label>
          <input
            type="number"
            id="maleRatio"
            name="maleRatio"
            value={partyDetails.maleRatio}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white bg-opacity-20 rounded-md text-white placeholder-gray-300"
            placeholder="50"
          />
        </div>
        <div>
          <label htmlFor="femaleRatio" className="block text-white mb-2">Female Ratio (%)</label>
          <input
            type="number"
            id="femaleRatio"
            name="femaleRatio"
            value={partyDetails.femaleRatio}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white bg-opacity-20 rounded-md text-white placeholder-gray-300"
            placeholder="50"
          />
        </div>
        <div>
          <label htmlFor="entryType" className="block text-white mb-2">Entry Type</label>
          <select
            id="entryType"
            name="entryType"
            value={partyDetails.entryType}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white bg-opacity-20 rounded-md text-white"
          >
            <option value="free">Free</option>
            <option value="byob">Bring Your Own Booze</option>
            <option value="donation">Optional Donation</option>
          </select>
        </div>
        <div>
          <label className="flex items-center text-white">
            <input
              type="checkbox"
              name="alcoholRequests"
              checked={partyDetails.alcoholRequests}
              onChange={handleChange}
              className="mr-2"
            />
            Allow Alcohol Requests
          </label>
        </div>
        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">
          Create Party
        </button>
      </form>
    </div>
  )
}

