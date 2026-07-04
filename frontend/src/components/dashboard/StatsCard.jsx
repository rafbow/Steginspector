/** StatsCard — dashboard metric card with icon, value, label */
export function StatsCard({ label, value, icon: Icon, color = 'cyan', sub }) {
  const colorMap = {
    cyan:   { text: 'text-cyan-400',   border: 'border-cyan-500/20',   bg: 'bg-cyan-500/5',   icon: 'text-cyan-400' },
    green:  { text: 'text-green-400',  border: 'border-green-500/20',  bg: 'bg-green-500/5',  icon: 'text-green-400' },
    purple: { text: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/5', icon: 'text-purple-400' },
    red:    { text: 'text-red-400',    border: 'border-red-500/20',    bg: 'bg-red-500/5',    icon: 'text-red-400' },
    yellow: { text: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/5', icon: 'text-yellow-400' },
  }
  const c = colorMap[color] || colorMap.cyan

  return (
    <div className={`rounded-xl border p-5 transition-all hover:scale-[1.02] hover:shadow-lg group ${c.border} ${c.bg} bg-card`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        {Icon && (
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center bg-card border ${c.border}`}>
            <Icon className={`h-5 w-5 ${c.icon}`} />
          </div>
        )}
      </div>
      <p className={`text-3xl font-black font-mono ${c.text}`}>{value ?? 0}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}
