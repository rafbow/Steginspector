import { useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

/**
 * SignatureVerification — shows magic number / extension / MIME match results
 */
export function SignatureVerification({ data }) {
  if (!data) return <EmptyState />

  const checks = [
    {
      label: 'Magic Number',
      pass: !data.mismatch,
      actual: data.magic_number || '—',
      expected: data.expected_magic || '—',
    },
    {
      label: 'Extension Match',
      pass: data.extension_match !== false,
      actual: data.detected_format || '—',
      expected: '—',
    },
    {
      label: 'MIME Type Match',
      pass: data.mime_match !== false,
      actual: '—',
      expected: '—',
    },
  ]

  const hasMismatch = data.mismatch || !data.extension_match || !data.mime_match

  return (
    <div className="space-y-4">
      {hasMismatch && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-400">WARNING: File signature mismatch detected</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              The file's actual signature does not match its claimed type. This may indicate file forgery.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {checks.map((c) => (
          <div
            key={c.label}
            className={`rounded-lg border p-4 ${c.pass ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{c.label}</span>
              {c.pass
                ? <CheckCircle className="h-5 w-5 text-green-400" />
                : <XCircle className="h-5 w-5 text-red-400" />
              }
            </div>
            {c.actual !== '—' && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Detected</p>
                <p className="font-mono text-xs text-foreground break-all">{c.actual}</p>
              </div>
            )}
            {c.expected !== '—' && (
              <div className="space-y-1 mt-2">
                <p className="text-xs text-muted-foreground">Expected</p>
                <p className="font-mono text-xs text-foreground break-all">{c.expected}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {data.warnings?.length > 0 && (
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
          <p className="text-sm font-semibold text-yellow-400 mb-2">Warnings</p>
          <ul className="space-y-1">
            {data.warnings.map((w, i) => (
              <li key={i} className="text-sm text-muted-foreground">• {w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-32 rounded-lg border border-border bg-card text-muted-foreground text-sm">
      No signature data available.
    </div>
  )
}
