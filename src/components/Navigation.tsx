'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function Navigation() {
  const { data: session } = useSession()

  return (
    <nav className="mb-8">
      <ul className="flex gap-4">
        <li>
          <Link
            href="/"
            className="text-white hover:text-purple-400 transition duration-300"
          >
            Home
          </Link>
        </li>
        {session && (
          <li>
            <Link
              href="/host"
              className="text-white hover:text-purple-400 transition duration-300"
            >
              Host a Party
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}
