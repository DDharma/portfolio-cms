import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-white">404</h1>
      <p className="mt-4 text-lg text-zinc-400">Page not found</p>
      <Link href="/" className={buttonVariants({ variant: 'primary', size: 'lg', className: 'mt-8' })}>
        Back to home
      </Link>
    </div>
  )
}
