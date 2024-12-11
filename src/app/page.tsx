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
      <div className="min-h-screen bg-[#0F172A] p-8 flex items-center justify-center">
        <div className="text-2xl font-bold gradient-text animate-pulse">Loading the vibe...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F172A] p-8 flex items-center justify-center">
        <div className="text-red-400 text-xl">Oops! {error}</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F172A] px-6 py-12 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold gradient-text mb-6">
            Find Your Vibe
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Join the hottest block parties in your area. Connect, dance, and create memories! 🎉
          </p>
        </div>

        {parties.length === 0 ? (
          <div className="text-center">
            <div className="text-white text-xl">No parties yet... Start one? 🎈</div>
            <Link 
              href="/host" 
              className="inline-block mt-4 px-8 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-full text-white font-semibold hover:opacity-90 transition-all"
            >
              Host a Party
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {parties.map((party) => (
              <Link href={`/party/${party.id}`} key={party.id} className="block party-card">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/10 to-white/5 p-6 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B6B]/10 to-[#4ECDC4]/10 opacity-50"></div>
                  <div className="relative">
                    <h2 className="text-2xl font-bold text-white mb-3">
                      {party.name}
                    </h2>
                    <div className="flex items-center space-x-4 text-gray-300">
                      <span className="flex items-center">
                        📅 {new Date(party.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        👥 {party.maxGuests} max
                      </span>
                    </div>
                    {party.alcoholRequests && (
                      <div className="mt-3 inline-block px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm">
                        🍻 BYOB Welcome
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link 
            href="/host" 
            className="inline-block px-8 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-full text-white font-semibold hover:opacity-90 transition-all"
          >
            Host Your Own Party 🎉
          </Link>
        </div>
      </div>
    </main>
  );
}
