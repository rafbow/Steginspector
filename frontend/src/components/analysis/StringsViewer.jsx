import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx'
import { Badge } from '../ui/badge.jsx'

export function StringsViewer({ data }) {
  const strings = data?.strings || []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Extracted strings</CardTitle>
        <Badge tone="muted">{data?.total || 0} total</Badge>
      </CardHeader>
      <CardContent>
        {strings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No strings</p>
        ) : (
          <div className="max-h-96 overflow-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-muted">
                <tr>
                  <th className="px-3 py-2">Offset</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {strings.map((item, index) => (
                  <tr key={`${item.offset}-${index}`} className="border-t">
                    <td className="px-3 py-2 font-mono text-xs">{item.offset}</td>
                    <td className="px-3 py-2">
                      <Badge tone={item.type === 'base64' || item.type === 'hex' ? 'warning' : 'muted'}>
                        {item.type}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{item.value}</td>
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
