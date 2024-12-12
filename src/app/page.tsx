"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiUsers, FiCalendar, FiMapPin } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Party {
  id: string;
  title: string;
  date: string;
  maxAttendees: number;
  flatNo: string;
  hostName: string;
  hostEmail: string;
  isVerified: boolean;
  createdAt: string;
  _count?: {
    rsvps: number;
  };
}

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      const res = await fetch("/api/parties");
      if (!res.ok) throw new Error("Failed to fetch parties");
      const text = await res.text();
      const data = JSON.parse(text.trim());
      setParties(data);
    } catch (error) {
      console.error("Error fetching parties:", error);
      setError("Failed to load parties");
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (partyId: string) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    // Instead of making an API call, navigate to the party details page
    router.push(`/party/${partyId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] text-transparent bg-clip-text mb-4">
            Find Your Vibe
          </h1>
          <p className="text-gray-400 text-lg md:text-xl">
            Join the hottest block parties in your area. Connect, dance, and
            create memories! 🎉
          </p>
          {!session && (
            <div className="mt-8">
              <button
                onClick={() => router.push("/auth/signin")}
                className="px-8 py-3 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] text-white font-medium rounded-xl hover:opacity-90 transition-all duration-200"
              >
                Sign in to RSVP for Parties
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-100">
            {error}
          </div>
        )}

        {parties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No parties scheduled yet.</p>
            {session && (
              <p className="text-gray-400 mt-2">
                Why not{" "}
                <Link href="/host" className="text-[#4ECDC4] hover:underline">
                  host one
                </Link>
                ?
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parties.map((party) => (
              <div
                key={party.id}
                className="bg-gray-800/50 backdrop-blur-lg rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                onClick={() => router.push(`/party/${party.id}`)}
              >
                <div className="p-6">
                  <div className="relative">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                      {party.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 text-gray-300 text-sm md:text-base">
                      <span className="flex items-center">
                        <FiCalendar className="mr-2" />
                        {new Date(party.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <FiUsers className="mr-2" />
                        {party._count?.rsvps || 0}/{party.maxAttendees}{" "}
                        attending
                      </span>
                      <span className="flex items-center">
                        <FiMapPin className="mr-2" />
                        {party.flatNo}
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-gray-400">
                        Hosted by {party.hostName}
                      </p>
                    </div>
                    <div className="mt-4">
                      {session ? (
                        party._count?.rsvps === party.maxAttendees ? (
                          <button
                            disabled
                            className="w-full px-4 py-2 text-white bg-gray-600 rounded-lg font-medium opacity-50"
                          >
                            Party Full
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRSVP(party.id);
                            }}
                            className="w-full px-4 py-2 text-white bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-lg font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4] disabled:opacity-50"
                          >
                            RSVP Now
                          </button>
                        )
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push("/auth/signin");
                          }}
                          className="w-full px-4 py-2 text-white bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-lg font-medium hover:opacity-90"
                        >
                          Sign in to RSVP
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
