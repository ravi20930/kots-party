"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Navigation() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.email === "ravi.20930@gmail.com";

  return (
    <nav className="flex items-center gap-6">
      <Link
        href="/"
        className="text-gray-300 hover:text-white transition-colors duration-200"
      >
        Explore
      </Link>
      <Link
        href="/host"
        className="text-gray-300 hover:text-white transition-colors duration-200"
      >
        Host a Party
      </Link>
      {isAdmin && (
        <Link
          href="/admin"
          className="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:opacity-90 transition-opacity duration-200"
        >
          Admin Panel
        </Link>
      )}
    </nav>
  );
}
