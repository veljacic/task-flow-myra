import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FullPageSpinnerProps {
  className?: string
}

function FullPageSpinner({ className }: FullPageSpinnerProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
    </div>
  )
}

export default FullPageSpinner
