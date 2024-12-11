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
        <div className="loading-spinner text-2xl md:text-3xl font-bold gradient-text animate-pulse">
          Loading the vibe...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F172A] p-4 md:p-8 flex items-center justify-center">
        <div className="text-red-400 text-lg md:text-xl text-center px-4">
          <div className="text-4xl mb-4">😕</div>
          Oops! {error}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F172A] px-4 py-8 md:px-6 md:py-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16 px-4">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold gradient-text mb-4 md:mb-6">
            Find Your Vibe
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto">
            Join the hottest block parties in your area. Connect, dance, and create memories! 🎉
          </p>
        </div>

        {parties.length === 0 ? (
          <div className="text-center px-4">
            <div className="text-white text-lg md:text-xl mb-6">No parties yet... Start one? 🎈</div>
            <Link 
              href="/host" 
              className="inline-flex items-center justify-center w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-full text-white font-semibold hover:opacity-90 active:opacity-100 active:scale-95 transition-all shadow-lg"
            >
              Host a Party
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 px-2 md:px-4">
            {parties.map((party) => (
              <Link href={`/party/${party.id}`} key={party.id} className="block party-card">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-5 md:p-6 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B6B]/10 to-[#4ECDC4]/10 opacity-50"></div>
                  <div className="relative">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                      {party.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 text-gray-300 text-sm md:text-base">
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

        <div className="mt-12 md:mt-16 text-center px-4">
          <Link 
            href="/host" 
            className="inline-flex items-center justify-center w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-full text-white font-semibold hover:opacity-90 active:opacity-100 active:scale-95 transition-all shadow-lg"
          >
            Host Your Own Party 🎉
          </Link>
        </div>
      </div>
    </main>
  );
}
