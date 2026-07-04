import { Copy } from 'lucide-react'
import { Button } from '../ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx'

export function HashCard({ hashes = {} }) {
  async function copy(value) {
    await navigator.clipboard.writeText(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hashes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(hashes || {}).map(([key, value]) => (
          <div key={key} className="grid gap-2 rounded-md border bg-background p-3 md:grid-cols-[90px_1fr_auto] md:items-center">
            <span className="text-xs font-semibold uppercase text-muted-foreground">{key}</span>
            <code className="break-all font-mono text-xs text-foreground">{value}</code>
            <Button variant="ghost" size="icon" onClick={() => copy(value)} aria-label={`Copy ${key}`}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
