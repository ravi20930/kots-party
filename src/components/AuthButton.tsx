'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import Image from 'next/image'

export default function AuthButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt={session.user.name || 'User'}
              width={32}
              height={32}
              className="rounded-full ring-2 ring-white/10"
            />
          )}
          <span className="text-sm font-medium text-gray-300">
            {session.user?.name}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] text-white font-medium py-2 px-6 rounded-xl hover:opacity-90 active:opacity-100 transition-all duration-200 shadow-lg shadow-black/10"
    >
      Sign In
    </button>
  )
}
