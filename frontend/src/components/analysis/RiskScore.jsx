import { ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react'
import { Badge } from '../ui/badge.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx'

export function RiskScore({ score = 0, level = 'Unknown', details }) {
  const Icon = level === 'Suspicious' ? ShieldAlert : level === 'Safe' ? ShieldCheck : ShieldQuestion
  const tone = level === 'Suspicious' ? 'danger' : level === 'Safe' ? 'success' : 'warning'

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Risk score</CardTitle>
          <p className="text-sm text-muted-foreground">{details?.summary || 'No summary available'}</p>
        </div>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-3">
          <span className="text-5xl font-semibold tracking-normal">{score}</span>
          <span className="pb-2 text-sm text-muted-foreground">/ 100</span>
          <Badge tone={tone} className="mb-2">{level}</Badge>
        </div>
        <div className="mt-5 grid gap-2 md:grid-cols-2">
          {(details?.factors || []).map((factor) => (
            <div key={factor.name} className="rounded-md border bg-background p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{factor.name}</p>
                <Badge tone={factor.triggered ? 'warning' : 'muted'}>
                  {factor.triggered ? `+${factor.points}` : 'Clear'}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{factor.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
