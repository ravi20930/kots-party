'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav>
      <ul className="flex items-center gap-6">
        <li>
          <Link
            href="/"
            className={`text-sm font-medium transition-all duration-200 ${
              isActive('/')
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Explore
          </Link>
        </li>
        {session && (
          <li>
            <Link
              href="/host"
              className={`text-sm font-medium transition-all duration-200 ${
                isActive('/host')
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Host a Party
            </Link>
          </li>
        )}
      </ul>
    </nav>
  )
}
