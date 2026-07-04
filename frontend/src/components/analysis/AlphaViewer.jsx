import { Layers } from 'lucide-react'

/**
 * AlphaViewer — shows alpha channel or "no alpha" message
 */
export function AlphaViewer({ data }) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-48 rounded-lg border border-border bg-card gap-3">
        <Layers className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No alpha channel data available.</p>
      </div>
    )
  }

  if (!data.has_alpha) {
    return (
      <div className="flex flex-col items-center justify-center h-48 rounded-lg border border-border bg-card gap-3">
        <Layers className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">No Alpha Channel</p>
        <p className="text-xs text-muted-foreground/60">This image does not contain transparency (alpha) data.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-secondary/30">
        <h3 className="text-sm font-semibold text-primary tracking-wider uppercase">Alpha Channel</h3>
      </div>
      <div className="p-4 flex justify-center">
        <div className="max-w-sm">
          <img
            src={`data:image/png;base64,${data.alpha}`}
            alt="Alpha Channel"
            className="w-full rounded-lg border border-border"
          />
          <p className="mt-2 text-xs text-center text-muted-foreground">
            Alpha channel — white = fully opaque, black = fully transparent
          </p>
        </div>
      </div>
    </div>
  )
}
