import { CheckCircle, XCircle, AlertOctagon } from 'lucide-react'

/**
 * RiskAssessment — full risk score panel with factors breakdown
 */
export function RiskAssessment({ data }) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-32 rounded-lg border border-border bg-card text-muted-foreground text-sm">
        No risk assessment data available.
      </div>
    )
  }

  const score  = data.score  ?? 0
  const level  = data.level  ?? 'Unknown'
  const factors = data.factors ?? []

  const scoreColor =
    score <= 30 ? { text: 'text-green-400', border: 'border-green-500/30', bg: 'bg-green-500/10', glow: '#39ff14' }
    : score <= 60 ? { text: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/10', glow: '#ffd700' }
    : { text: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10', glow: '#ff3366' }

  return (
    <div className="space-y-4">
      {/* Score header */}
      <div className={`rounded-xl border p-6 ${scoreColor.border} ${scoreColor.bg} flex flex-col sm:flex-row items-center gap-6`}>
        <div className="relative flex items-center justify-center">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" className="text-border" />
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke={scoreColor.glow}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 314} 314`}
              transform="rotate(-90 60 60)"
              style={{ filter: `drop-shadow(0 0 8px ${scoreColor.glow})` }}
            />
          </svg>
          <div className="absolute text-center">
            <p className={`text-3xl font-black font-mono ${scoreColor.text}`}>{score}</p>
            <p className="text-xs text-muted-foreground">/100</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Risk Level</p>
          <p className={`text-3xl font-bold ${scoreColor.text}`}>{level}</p>
          {data.summary && (
            <p className="mt-2 text-sm text-muted-foreground max-w-sm leading-relaxed">{data.summary}</p>
          )}
        </div>
      </div>

      {/* Factors table */}
      {factors.length > 0 && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-secondary/30">
            <h3 className="text-sm font-semibold text-primary tracking-wider uppercase">Risk Factors</h3>
          </div>
          <div className="divide-y divide-border">
            {factors.map((factor) => (
              <div key={factor.name} className={`flex items-center gap-3 px-4 py-3 ${factor.triggered ? 'bg-red-500/5' : ''}`}>
                {factor.triggered
                  ? <AlertOctagon className="h-4 w-4 text-red-400 shrink-0" />
                  : <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{factor.name}</p>
                  <p className="text-xs text-muted-foreground">{factor.description}</p>
                </div>
                <span className={`font-mono text-sm font-bold shrink-0 ${factor.triggered ? 'text-red-400' : 'text-muted-foreground'}`}>
                  {factor.triggered ? `+${factor.points}` : '0'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
