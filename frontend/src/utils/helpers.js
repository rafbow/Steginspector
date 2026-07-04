/**
 * Shared utility helpers — no auth references.
 */

/** Format bytes to human-readable string */
export function formatBytes(bytes) {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/** Format ISO date string */
export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/** Time ago string */
export function timeAgo(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'just now'
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

/** Download a Blob as a file */
export function downloadBlob(data, filename) {
  const url = window.URL.createObjectURL(new Blob([data]))
  const a   = document.createElement('a')
  a.href    = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

/** Risk level CSS class */
export function getRiskColor(level) {
  if (level === 'Safe')         return 'text-green-400'
  if (level === 'Needs Review') return 'text-yellow-400'
  if (level === 'Suspicious')   return 'text-red-400'
  return 'text-muted-foreground'
}

/** Greeting (unused but kept for reference) */
export function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
