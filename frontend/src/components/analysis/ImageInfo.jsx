import { formatBytes, formatDate } from '../../utils/helpers'

/**
 * ImageInfo — displays detailed file & image properties
 */
export function ImageInfo({ data }) {
  if (!data) return <EmptyState text="No image information available." />

  const rows = [
    { label: 'Filename',      value: data.filename },
    { label: 'Extension',     value: data.extension },
    { label: 'File Size',     value: data.size_formatted || formatBytes(data.size_bytes) },
    { label: 'Resolution',    value: data.resolution || `${data.width} × ${data.height}` },
    { label: 'Aspect Ratio',  value: data.aspect_ratio },
    { label: 'Color Mode',    value: data.color_mode },
    { label: 'Bit Depth',     value: data.bit_depth ? `${data.bit_depth}-bit` : '—' },
    { label: 'MIME Type',     value: data.mime_type },
    { label: 'Magic Number',  value: data.magic_number },
    { label: 'File Signature',value: data.file_signature },
    { label: 'Created Date',  value: data.created_date || formatDate(data.created_at) },
    { label: 'Modified Date', value: data.modified_date || formatDate(data.updated_at) },
  ]

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-secondary/30">
        <h3 className="text-sm font-semibold text-primary tracking-wider uppercase">Image Information</h3>
      </div>
      <div className="divide-y divide-border">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center px-4 py-3 hover:bg-secondary/20 transition-colors">
            <span className="w-40 text-xs text-muted-foreground shrink-0">{label}</span>
            <span className="font-mono text-sm text-foreground break-all">{value || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="flex items-center justify-center h-32 rounded-lg border border-border bg-card text-muted-foreground text-sm">
      {text}
    </div>
  )
}
