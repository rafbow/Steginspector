import { cn } from '../../lib/utils.js'

export function Progress({ value = 0, className }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-sm bg-muted', className)}>
      <div
        className="h-full rounded-sm bg-primary transition-all"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}
