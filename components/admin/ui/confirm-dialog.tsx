'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
  title: string
  description?: string
  action: string
  isDangerous?: boolean
  isLoading?: boolean
  onConfirm: () => void | Promise<void>
  children: React.ReactNode
}

export function ConfirmDialog({
  title,
  description,
  action,
  isDangerous = false,
  isLoading = false,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      await onConfirm()
      setIsOpen(false)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{children}</div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur">
          <div className="rounded-lg border border-white/[0.06] bg-zinc-900 p-6 shadow-xl max-w-sm w-full mx-4">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {description && (
              <p className="mt-2 text-sm text-zinc-400">{description}</p>
            )}

            <div className="mt-6 flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isProcessing || isLoading}
                className={isDangerous ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {isProcessing ? 'Processing...' : action}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
