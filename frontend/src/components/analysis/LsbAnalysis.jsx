import { AlertTriangle, CheckCircle } from 'lucide-react'

/**
 * LsbAnalysis — detailed LSB steganography indicator display
 */
export function LsbAnalysis({ data }) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-32 rounded-lg border border-border bg-card text-muted-foreground text-sm">
        No LSB analysis data.
      </div>
    )
  }

  const randomness = typeof data.randomness_score === 'number' ? data.randomness_score : 0
  const randomnessPct = Math.round(randomness * 100)

  const probColor = {
    'Low': 'text-green-400',
    'Medium': 'text-yellow-400',
    'High': 'text-orange-400',
    'Very High': 'text-red-400',
  }[data.hidden_data_probability] || 'text-muted-foreground'

  const probBg = {
    'Low': 'bg-green-500/10 border-green-500/20',
    'Medium': 'bg-yellow-500/10 border-yellow-500/20',
    'High': 'bg-orange-500/10 border-orange-500/20',
    'Very High': 'bg-red-500/10 border-red-500/20',
  }[data.hidden_data_probability] || 'bg-card border-border'

  return (
    <div className="space-y-4">
      {data.suspicious && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-sm font-semibold text-red-400">LSB anomaly detected — possible steganographic content</p>
        </div>
      )}
      {!data.suspicious && (
        <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-3">
          <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
          <p className="text-sm text-green-400">No significant LSB anomalies detected</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Randomness Score */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Randomness Score</p>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold font-mono text-primary">{randomnessPct}%</span>
            <span className="text-xs text-muted-foreground">Higher = more suspicious</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${randomnessPct}%`,
                background: randomnessPct > 75 ? '#ff3366' : randomnessPct > 50 ? '#ffd700' : '#00d9ff',
                boxShadow: `0 0 8px ${randomnessPct > 75 ? '#ff3366' : randomnessPct > 50 ? '#ffd700' : '#00d9ff'}40`,
              }}
            />
          </div>
        </div>

        {/* Hidden Data Probability */}
        <div className={`rounded-lg border p-4 ${probBg}`}>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Hidden Data Probability</p>
          <p className={`text-2xl font-bold ${probColor}`}>{data.hidden_data_probability || '—'}</p>
          {data.statistical_result && (
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{data.statistical_result}</p>
          )}
        </div>
      </div>

      {/* Per-channel density */}
      {data.lsb_density && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-semibold">LSB Density per Channel</p>
          <div className="space-y-3">
            {[
              { ch: 'R', color: '#ff4444' },
              { ch: 'G', color: '#44ff44' },
              { ch: 'B', color: '#4488ff' },
            ].map(({ ch, color }) => {
              const val = data.lsb_density?.[ch.toLowerCase()] || 0
              const pct = Math.round(val * 100)
              return (
                <div key={ch} className="flex items-center gap-3">
                  <span className="w-4 text-xs font-mono font-bold" style={{ color }}>{ch}</span>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-10 text-right">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Chi-square values */}
      {data.chi_square && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-semibold">Chi-Square Test Results</p>
          <div className="grid grid-cols-3 gap-4">
            {['r', 'g', 'b'].map((ch) => (
              <div key={ch} className="text-center">
                <p className="text-xs text-muted-foreground uppercase mb-1">{ch}</p>
                <p className="font-mono text-lg font-bold text-foreground">
                  {typeof data.chi_square[ch] === 'number' ? data.chi_square[ch].toFixed(2) : '—'}
                </p>
              </div>
            ))}
          </div>
          {data.chi_square.interpretation && (
            <p className="text-xs text-muted-foreground mt-3 text-center">{data.chi_square.interpretation}</p>
          )}
        </div>
      )}

      {data.bit_pattern?.description && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Bit Pattern</p>
          <p className="text-sm text-foreground">{data.bit_pattern.description}</p>
        </div>
      )}
    </div>
  )
}
