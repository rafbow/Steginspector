/** Format resolution WxH */
export const formatResolution = (w, h) => (w && h ? `${w} × ${h} px` : 'Unknown')

/** Format aspect ratio (e.g. 16:9) */
export function formatAspectRatio(w, h) {
  if (!w || !h) return 'Unknown'
  function gcd(a, b) { return b === 0 ? a : gcd(b, a % b) }
  const g = gcd(w, h)
  return `${w / g}:${h / g}`
}

/** Shorten a long hash for display */
export const truncateHash = (hash, chars = 16) =>
  hash ? `${hash.slice(0, chars)}…` : '—'

/** Format entropy to 4 decimal places */
export const formatEntropy = (v) => (typeof v === 'number' ? v.toFixed(4) : '—')

/** Score → label */
export function formatRiskLevelFromScore(score) {
  if (score <= 30) return 'Safe'
  if (score <= 60) return 'Needs Review'
  return 'Suspicious'
}

/** Risk level string → CSS color */
export function riskLevelToColor(level) {
  const l = (level || '').toLowerCase()
  if (l === 'safe') return '#39ff14'
  if (l === 'needs review') return '#ffd700'
  if (l === 'suspicious') return '#ff3366'
  return '#8892a4'
}

/** Format file size */
export function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}
