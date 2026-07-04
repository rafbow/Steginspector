import { Gauge } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx'
import { Progress } from '../ui/progress.jsx'

export function EntropyGauge({ data }) {
  const value = data?.value || 0
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Entropy</CardTitle>
        <Gauge className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-semibold">{value}</span>
          <span className="text-sm text-muted-foreground">bits</span>
        </div>
        <Progress value={data?.gauge_percentage || 0} className="mt-4" />
        <p className="mt-3 text-sm text-muted-foreground">{data?.description || 'No entropy data'}</p>
      </CardContent>
    </Card>
  )
}
