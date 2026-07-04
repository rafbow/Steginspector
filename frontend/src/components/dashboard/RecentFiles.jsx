import { Link } from 'react-router-dom'
import { timeAgo } from '../../utils/helpers'

const statusColors = {
  completed: 'text-green-400 bg-green-400/10',
  processing: 'text-cyan-400 bg-cyan-400/10',
  pending:    'text-yellow-400 bg-yellow-400/10',
  failed:     'text-red-400 bg-red-400/10',
}

const riskColors = {
  'Safe':         'text-green-400',
  'Needs Review': 'text-yellow-400',
  'Suspicious':   'text-red-400',
}

/** Recent files table for dashboard */
export function RecentFiles({ files }) {
  if (!files?.length) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
        No recent files. <Link to="/upload" className="ml-1 text-primary hover:underline">Upload one?</Link>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm text-left">
        <thead className="bg-secondary/40">
          <tr>
            <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">File</th>
            <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
            <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">When</th>
            <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Risk</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {files.map((f) => (
            <tr key={f.id} className="hover:bg-secondary/20 transition-colors">
              <td className="px-4 py-3 max-w-[200px]">
                <Link to={`/analysis/${f.id}`} className="font-medium text-foreground hover:text-primary transition-colors truncate block">
                  {f.original_name}
                </Link>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[f.status] || 'text-muted-foreground'}`}>
                  {f.status}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">
                {timeAgo(f.upload_date)}
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <span className={`text-xs font-medium ${riskColors[f.risk_level] || 'text-muted-foreground'}`}>
                  {f.risk_level || '—'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
