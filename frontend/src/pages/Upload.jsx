import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Microscope, Clock, FileImage, Zap, Shield, Database,
  Search, Eye, Hash, Layers, Binary, ScanLine, Fingerprint,
  ArrowRight, Play,
} from 'lucide-react'
import { DropZone } from '../components/upload/DropZone'
import { getImages } from '../api/images'
import { runAnalysis } from '../api/analysis'
import { getApiError } from '../api/client'
import { formatBytes, timeAgo } from '../utils/helpers'
import toast from 'react-hot-toast'

const FEATURES = [
  { icon: Hash,        label: 'Hash Verification',   color: 'text-cyan-400',   desc: 'MD5 · SHA1 · SHA256 · SHA512' },
  { icon: Database,    label: 'EXIF Metadata',        color: 'text-green-400',  desc: 'GPS · Camera · Timestamps' },
  { icon: Eye,         label: 'LSB Analysis',         color: 'text-purple-400', desc: 'Chi-square · Randomness test' },
  { icon: ScanLine,    label: 'Histogram',            color: 'text-yellow-400', desc: 'RGB channel distribution' },
  { icon: Layers,      label: 'Bit Plane Viewer',     color: 'text-orange-400', desc: '8-bit plane decomposition' },
  { icon: Shield,      label: 'Signature Check',      color: 'text-red-400',    desc: 'Magic number · MIME match' },
  { icon: Binary,      label: 'Strings Extractor',    color: 'text-indigo-400', desc: 'URL · Email · Hidden text' },
  { icon: Fingerprint, label: 'Risk Assessment',      color: 'text-pink-400',   desc: 'Automated scoring 0–100' },
]

function RecentImageCard({ img, onAnalyze }) {
  const statusColor = {
    completed: 'text-green-400', processing: 'text-cyan-400',
    pending: 'text-yellow-400', failed: 'text-red-400',
  }
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border bg-card/60 hover:border-primary/30 hover:bg-card transition-all p-3">
      <div className="h-10 w-10 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
        <FileImage className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{img.original_name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-[10px] font-medium ${statusColor[img.status] || 'text-muted-foreground'}`}>
            {img.status}
          </span>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-[10px] text-muted-foreground">{timeAgo(img.upload_date)}</span>
        </div>
      </div>
      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
        {img.status === 'pending' && (
          <button
            onClick={() => onAnalyze(img.id)}
            className="flex items-center gap-1 rounded-lg bg-primary text-primary-foreground px-2 py-1 text-[10px] font-semibold hover:opacity-90 transition"
          >
            <Play className="h-2.5 w-2.5" /> Run
          </button>
        )}
        <Link
          to={`/analysis/${img.id}`}
          className="flex items-center gap-1 rounded-lg border border-border bg-secondary px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground transition"
        >
          <Eye className="h-2.5 w-2.5" /> View
        </Link>
      </div>
    </div>
  )
}

export default function Upload() {
  const [recent, setRecent]   = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    getImages().then(({ data }) => setRecent(data.slice(0, 5))).catch(() => {})
  }, [])

  async function quickAnalyze(imageId) {
    try {
      await runAnalysis(imageId)
      toast.success('Analysis started!')
      navigate(`/analysis/${imageId}`)
    } catch (err) {
      toast.error(getApiError(err))
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-slide-up">

      {/* Hero header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary font-medium mb-2">
          <Zap className="h-3 w-3" />
          No login required · Instant analysis
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
          Steganography <span className="text-primary text-glow-cyan">Inspector</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Drop an image and instantly detect hidden data, verify signatures, extract metadata,
          and run a full forensic analysis — no account needed.
        </p>
      </div>

      {/* Drop zone + recent side by side */}
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">

        {/* Main drop zone */}
        <div className="rounded-2xl border border-border bg-card/40 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Microscope className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Upload & Analyze</h2>
          </div>
          <DropZone />
        </div>

        {/* Recent images panel */}
        <div className="rounded-2xl border border-border bg-card/40 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-foreground">Recent</h3>
            </div>
            <Link to="/history" className="text-[10px] text-primary hover:underline">
              All history →
            </Link>
          </div>
          <div className="space-y-2 flex-1">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
                <FileImage className="h-8 w-8 opacity-30" />
                <p className="text-xs">No images yet</p>
              </div>
            ) : (
              recent.map((img) => (
                <RecentImageCard key={img.id} img={img} onAnalyze={quickAnalyze} />
              ))
            )}
          </div>
          {recent.length > 0 && (
            <Link
              to="/analysis"
              className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/40 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition"
            >
              <Microscope className="h-3 w-3" />
              Open Analysis Tool
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Feature grid */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest mb-3 text-center">
          10 Analysis Modules
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {FEATURES.map(({ icon: Icon, label, color, desc }) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-card/40 p-3 hover:border-primary/20 hover:bg-card transition-all group"
            >
              <Icon className={`h-4 w-4 mb-2 ${color} group-hover:scale-110 transition-transform`} />
              <p className="text-xs font-semibold text-foreground">{label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
