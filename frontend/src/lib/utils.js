import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes = 0) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unit = 0
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit += 1
  }
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unit]}`
}

export function statusTone(status) {
  const key = String(status || '').toLowerCase()
  if (key === 'completed' || key === 'safe') return 'success'
  if (key === 'processing' || key === 'needs review') return 'warning'
  if (key === 'failed' || key === 'suspicious') return 'danger'
  return 'muted'
}
