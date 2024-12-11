'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-3xl font-bold text-white">Authentication Error</h1>
        <p className="text-red-400">{error || 'Something went wrong'}</p>
        <Link
          href="/"
          className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
