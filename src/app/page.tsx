"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiUsers, FiCalendar, FiMapPin } from 'react-icons/fi';
import { useSession } from 'next-auth/react';

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
}

export default function Home() {
  const { data: session } = useSession();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      const res = await fetch('/api/parties');
      if (!res.ok) throw new Error('Failed to fetch parties');
      const data = await res.json();
      setParties(data);
    } catch (error) {
      console.error('Error fetching parties:', error);
    } finally {
      setLoading(false);
    }
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
            Join the hottest block parties in your area. Connect, dance, and create memories! 🎉
          </p>
        </div>

        {parties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No parties scheduled yet.</p>
            {session && (
              <p className="text-gray-400 mt-2">
                Why not{' '}
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
                className="bg-gray-800/50 backdrop-blur-lg rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300"
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
                        {party.maxAttendees} max
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
