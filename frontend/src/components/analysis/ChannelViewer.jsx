import { useState } from 'react'
import { ZoomIn } from 'lucide-react'

/**
 * ChannelViewer — shows Original / Red / Green / Blue channel images
 */
export function ChannelViewer({ data }) {
  const [enlarged, setEnlarged] = useState(null)

  if (!data) {
    return (
      <div className="flex items-center justify-center h-40 rounded-lg border border-border bg-card text-muted-foreground text-sm">
        No channel data available.
      </div>
    )
  }

  const channels = [
    { key: 'original', label: 'Original', color: 'text-foreground' },
    { key: 'red',      label: 'Red Channel',   color: 'text-red-400' },
    { key: 'green',    label: 'Green Channel',  color: 'text-green-400' },
    { key: 'blue',     label: 'Blue Channel',   color: 'text-blue-400' },
  ]

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {channels.map(({ key, label, color }) => {
          const src = data[key]
          return (
            <div
              key={key}
              className="group relative rounded-lg border border-border bg-card overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => src && setEnlarged({ src, label })}
            >
              {src ? (
                <img
                  src={`data:image/png;base64,${src}`}
                  alt={label}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center text-xs text-muted-foreground bg-muted">
                  N/A
                </div>
              )}
              <div className="px-2 py-1.5 border-t border-border flex items-center justify-between">
                <span className={`text-xs font-medium ${color}`}>{label}</span>
                {src && <ZoomIn className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />}
              </div>
            </div>
          )
        })}
      </div>

      {enlarged && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setEnlarged(null)}
        >
          <div className="max-w-3xl max-h-[90vh] overflow-auto rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-semibold text-primary mb-3">{enlarged.label}</p>
            <img src={`data:image/png;base64,${enlarged.src}`} alt={enlarged.label} className="max-w-full rounded-lg" />
          </div>
        </div>
      )}
    </>
  )
}
