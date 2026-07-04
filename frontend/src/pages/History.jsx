import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, Download, Eye, Trash2 } from 'lucide-react'
import { getHistory, exportHistory } from '../api/history'
import { getApiError } from '../api/client'
import { formatDate, downloadBlob, getRiskColor } from '../utils/helpers'
import { formatBytes } from '../utils/formatters'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['all', 'completed', 'suspicious', 'needs review', 'safe', 'pending', 'failed']

const statusBadge = {
  completed: 'text-green-400 bg-green-400/10',
  processing: 'text-cyan-400 bg-cyan-400/10',
  pending: 'text-yellow-400 bg-yellow-400/10',
  failed: 'text-red-400 bg-red-400/10',
}

function Skeleton() {
  return <div className="skeleton h-12 rounded-lg" />
}

export default function History() {
  const [items,   setItems]   = useState([])
  const [total,   setTotal]   = useState(0)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)
  const limit = 10

  const load = useCallback(async (s = search, f = filter, p = page) => {
    setLoading(true)
    try {
      const { data } = await getHistory({ search: s, filter: f, page: p, limit })
      setItems(data.items)
      setTotal(data.total)
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(search, filter, 1) }, 350)
    return () => clearTimeout(t)
  }, [search])

  function handleFilter(f) {
    setFilter(f)
    setPage(1)
    load(search, f, 1)
  }

  function handlePage(p) {
    setPage(p)
    load(search, filter, p)
  }

  async function handleExport() {
    try {
      const { data } = await exportHistory()
      downloadBlob(data, 'steginspector_history.csv')
      toast.success('CSV exported')
    } catch (err) {
      toast.error(getApiError(err))
    }
  }

  const pages = Math.ceil(total / limit)

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analysis History</h2>
          <p className="text-sm text-muted-foreground mt-1">{total} total records</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-4 py-2 text-sm hover:bg-secondary transition"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by filename…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary/40 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => handleFilter(opt)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition capitalize ${
                filter === opt
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/30 border-b border-border">
              <tr>
                {['Filename', 'Status', 'Upload Date', 'Risk Score', 'Risk Level', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton /></td></tr>
                  ))
                : items.map((item) => (
                    <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="font-medium text-foreground truncate">{item.original_name}</p>
                        <p className="text-xs text-muted-foreground">{item.extension?.toUpperCase()} · {formatBytes(item.file_size)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[item.status] || 'text-muted-foreground'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(item.upload_date)}</td>
                      <td className="px-4 py-3 font-mono text-sm font-bold text-foreground">
                        {item.risk_score != null ? item.risk_score : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${getRiskColor(item.risk_level)}`}>
                          {item.risk_level || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/analysis/${item.id}`}
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <Eye className="h-3 w-3" /> View
                        </Link>
                      </td>
                    </tr>
                  ))
              }
              {!loading && items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">Page {page} of {pages}</p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePage(p)}
                  className={`h-7 w-7 rounded text-xs transition ${
                    p === page ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-secondary text-muted-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
