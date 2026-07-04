import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx'

export function BitPlaneGrid({ data = {} }) {
  const planes = Object.entries(data || {}).sort(([a], [b]) => a.localeCompare(b))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bit planes</CardTitle>
      </CardHeader>
      <CardContent>
        {planes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bit-plane previews</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {planes.map(([key, src]) => (
              <div key={key} className="rounded-md border bg-background p-2">
                <img src={src} alt={key} className="aspect-square w-full rounded-sm object-contain" />
                <p className="mt-2 text-center font-mono text-xs uppercase text-muted-foreground">{key}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
