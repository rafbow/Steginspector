import { cn, statusTone } from '../../lib/utils.js'

const tones = {
  success: 'border-emerald-500/30 bg-emerald-500/12 text-emerald-300',
  warning: 'border-amber-500/30 bg-amber-500/12 text-amber-300',
  danger: 'border-red-500/30 bg-red-500/12 text-red-300',
  muted: 'border-border bg-muted text-muted-foreground',
}

export function Badge({ tone, status, className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium',
        tones[tone || statusTone(status)],
        className,
      )}
      {...props}
    />
  )
}
