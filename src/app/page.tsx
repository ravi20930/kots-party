"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Party } from "@prisma/client";

export default function Home() {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const response = await fetch("/api/parties");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch parties");
        }

        setParties(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load parties");
      } finally {
        setLoading(false);
      }
    };

    fetchParties();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <h1 className="text-4xl font-bold text-white">Upcoming Block Parties</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parties.length === 0 ? (
          <div className="text-white">No parties found</div>
        ) : (
          parties.map((party) => (
            <Link href={`/party/${party.id}`} key={party.id} className="block">
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 hover:bg-opacity-20 transition duration-300">
                <h2 className="text-xl font-semibold text-white">
                  {party.name}
                </h2>
                <p className="text-gray-400 mt-2">
                  {new Date(party.date).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
