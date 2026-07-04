import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx'

export function MetadataTable({ data = {}, title = 'Metadata' }) {
  const rows = Object.entries(data || {})

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No records</p>
        ) : (
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-left text-sm">
              <tbody>
                {rows.map(([key, value]) => (
                  <tr key={key} className="border-b last:border-b-0">
                    <th className="w-48 bg-muted/40 px-3 py-2 align-top text-xs font-medium uppercase text-muted-foreground">
                      {key.replaceAll('_', ' ')}
                    </th>
                    <td className="px-3 py-2 text-foreground">
                      <span className="break-words font-mono text-xs">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
