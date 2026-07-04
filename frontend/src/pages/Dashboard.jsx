import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle, FileImage, Gauge, TrendingUp, FileText, ScrollText, Upload,
} from 'lucide-react'
import { getDashboardStats } from '../api/dashboard'
import { getApiError } from '../api/client'
import { StatsCard }         from '../components/dashboard/StatsCard'
import { RecentFiles }       from '../components/dashboard/RecentFiles'
import { DashboardPieChart } from '../components/dashboard/DashboardPieChart'
import { DashboardBarChart } from '../components/dashboard/DashboardBarChart'
import toast from 'react-hot-toast'

function Skeleton({ className }) {
  return <div className={`skeleton rounded-xl ${className}`} />
}

export default function Dashboard() {
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const { data } = await getDashboardStats()
      setStats(data)
    } catch (err) {
      toast.error(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 30000)
    return () => clearInterval(t)
  }, [])

  const riskDist = (stats?.recent_files || []).reduce(
    (acc, f) => {
      if (f.risk_level === 'Safe')         acc.safe++
      else if (f.risk_level === 'Needs Review') acc.needs_review++
      else if (f.risk_level === 'Suspicious')   acc.suspicious++
      return acc
    },
    { safe: 0, needs_review: 0, suspicious: 0 }
  )

  const cards = [
    { label: 'Total Images',     value: stats?.total_images ?? 0,    icon: FileImage,    color: 'cyan'   },
    { label: "Today's Analyses", value: stats?.today_analyses ?? 0,  icon: TrendingUp,   color: 'green'  },
    { label: 'Suspicious Files', value: stats?.suspicious_files ?? 0,icon: AlertTriangle,color: 'red'    },
    { label: 'Avg Entropy',      value: stats?.average_entropy ?? 0, icon: Gauge,        color: 'purple' },
    { label: 'Total Reports',    value: stats?.total_reports ?? 0,   icon: FileText,     color: 'yellow' },
    { label: 'Analyses Today',   value: stats?.today_analyses ?? 0,  icon: ScrollText,   color: 'cyan'   },
  ]

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Workspace Overview</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time forensic analysis statistics</p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition"
        >
          <Upload className="h-4 w-4" /> Upload Image
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {loading
          ? Array.from({length:6}).map((_,i) => <Skeleton key={i} className="h-24" />)
          : cards.map((c) => <StatsCard key={c.label} {...c} />)
        }
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {loading ? (
          <><Skeleton className="h-56" /><Skeleton className="h-56" /></>
        ) : (
          <><DashboardPieChart data={riskDist} /><DashboardBarChart data={stats?.analyses_per_day} /></>
        )}
      </div>

      {/* Recent files */}
      <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Recent Files</h3>
          <Link to="/history" className="text-xs text-primary hover:underline">View all →</Link>
        </div>
        <div className="p-5">
          {loading ? <Skeleton className="h-20" /> : <RecentFiles files={stats?.recent_files} />}
        </div>
      </div>
    </div>
  )
}
