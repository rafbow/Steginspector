import { useEffect, useState } from 'react'
import { FileDown, FileText } from 'lucide-react'
import { getReports, downloadReport } from '../api/reports'
import { getApiError } from '../api/client'
import { formatDate, downloadBlob } from '../utils/helpers'
import toast from 'react-hot-toast'

function Skeleton() {
  return <div className="skeleton h-16 rounded-lg" />
}

export default function Reports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getReports()
      .then(({ data }) => setReports(data))
      .catch((err) => toast.error(getApiError(err)))
      .finally(() => setLoading(false))
  }, [])

  async function handleDownload(report) {
    try {
      const { data } = await downloadReport(report.id)
      downloadBlob(data, report.pdf_filename || `report_${report.id}.pdf`)
      toast.success('Report downloaded')
    } catch (err) {
      toast.error(getApiError(err))
    }
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Reports</h2>
        <p className="text-sm text-muted-foreground mt-1">Generated PDF forensic analysis reports</p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)}</div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
            <FileText className="h-10 w-10 opacity-30" />
            <p className="text-sm">No reports yet. Run an analysis and generate a report.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {reports.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-4 hover:bg-secondary/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.image_name || r.pdf_filename}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(r)}
                  className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs hover:bg-secondary transition"
                >
                  <FileDown className="h-3.5 w-3.5" /> Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
