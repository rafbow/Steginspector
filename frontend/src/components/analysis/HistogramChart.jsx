import { Card, CardContent, CardHeader, CardTitle } from '../ui/card.jsx'

const channelColors = {
  red: '#f87171',
  green: '#34d399',
  blue: '#60a5fa',
}

export function HistogramChart({ data = {} }) {
  const width = 720
  const height = 220
  const values = ['red', 'green', 'blue'].flatMap((key) => data?.[key] || [])
  const max = Math.max(...values, 1)

  function points(values = []) {
    if (!values.length) return ''
    return values
      .map((value, index) => {
        const x = (index / 255) * width
        const y = height - (value / max) * height
        return `${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>RGB histogram</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border bg-background p-3">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full" role="img" aria-label="RGB histogram">
            <rect width={width} height={height} fill="transparent" />
            {['red', 'green', 'blue'].map((key) => (
              <polyline
                key={key}
                fill="none"
                stroke={channelColors[key]}
                strokeWidth="1.8"
                points={points(data?.[key])}
                opacity="0.9"
              />
            ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}
