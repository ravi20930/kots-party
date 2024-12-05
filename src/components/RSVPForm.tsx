"use client";

import { useState } from "react";

export default function RSVPForm({
  createRSVP,
  alcoholRequestsAllowed,
}: {
  createRSVP: (formData: FormData) => void;
  alcoholRequestsAllowed: boolean;
}) {
  const [rsvpDetails, setRsvpDetails] = useState({
    alcoholRequest: "",
    suggestion: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRsvpDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createRSVP(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {alcoholRequestsAllowed && (
        <div>
          <label htmlFor="alcoholRequest" className="block text-white mb-2">
            Alcohol Request (Optional)
          </label>
          <input
            type="text"
            id="alcoholRequest"
            name="alcoholRequest"
            value={rsvpDetails.alcoholRequest}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-white bg-opacity-20 rounded-md text-white placeholder-gray-300"
            placeholder="Beer, Wine, etc."
          />
        </div>
      )}
      <div>
        <label htmlFor="suggestion" className="block text-white mb-2">
          Suggestion or Comment (Optional)
        </label>
        <textarea
          id="suggestion"
          name="suggestion"
          value={rsvpDetails.suggestion}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white bg-opacity-20 rounded-md text-white placeholder-gray-300"
          placeholder="Any ideas or comments for the party?"
        ></textarea>
      </div>
      <button
        type="submit"
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
      >
        RSVP
      </button>
    </form>
  );
}
