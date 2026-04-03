'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-white">Something went wrong</h1>
      <p className="mt-4 max-w-md text-zinc-400">
        An unexpected error occurred. Please try again.
      </p>
      <Button variant="primary" size="lg" className="mt-8" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
