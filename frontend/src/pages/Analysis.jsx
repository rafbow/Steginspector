import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Play, RefreshCw, FileDown, AlertTriangle, Trash2 } from 'lucide-react'
import { getImages, deleteImage } from '../api/images'
import { runAnalysis, getStatus, getResults } from '../api/analysis'
import { generateReport } from '../api/reports'
import { getApiError } from '../api/client'
import toast from 'react-hot-toast'

import { ImageInfo }             from '../components/analysis/ImageInfo'
import { HashCard }              from '../components/analysis/HashCard'
import { MetadataTable }         from '../components/analysis/MetadataTable'
import { HistogramChart }        from '../components/analysis/HistogramChart'
import { ChannelViewer }         from '../components/analysis/ChannelViewer'
import { AlphaViewer }           from '../components/analysis/AlphaViewer'
import { BitPlaneGrid }          from '../components/analysis/BitPlaneGrid'
import { LsbAnalysis }           from '../components/analysis/LsbAnalysis'
import { StringsViewer }         from '../components/analysis/StringsViewer'
import { EntropyGauge }          from '../components/analysis/EntropyGauge'
import { SignatureVerification } from '../components/analysis/SignatureVerification'
import { RiskAssessment }        from '../components/analysis/RiskAssessment'

const TABS = [
  { id: 'info',      label: 'Info' },
  { id: 'hashes',   label: 'Hashes' },
  { id: 'metadata', label: 'Metadata' },
  { id: 'histogram',label: 'Histogram' },
  { id: 'channels', label: 'RGB Channels' },
  { id: 'alpha',    label: 'Alpha Channel' },
  { id: 'bitplanes',label: 'Bit Planes' },
  { id: 'lsb',      label: 'LSB Analysis' },
  { id: 'strings',  label: 'Strings' },
  { id: 'entropy',  label: 'Entropy' },
  { id: 'signature',label: 'Signature' },
  { id: 'risk',     label: 'Risk' },
]

function Sk({ h = 'h-48' }) { return <div className={`skeleton rounded-xl w-full ${h}`} /> }

export default function Analysis() {
  const { imageId } = useParams()
  const navigate    = useNavigate()
  const [images,  setImages]  = useState([])
  const [selected, setSelected] = useState(imageId || '')
  const [results,  setResults]  = useState(null)
  const [status,   setStatus]   = useState(null)
  const [tab,      setTab]      = useState('info')
  const [loading,  setLoading]  = useState(false)
  const [genLoad,  setGenLoad]  = useState(false)

  useEffect(() => {
    getImages().then(({ data }) => {
      setImages(data)
      if (!selected && data[0]) setSelected(String(data[0].id))
    }).catch(() => {})
  }, [])

  useEffect(() => { if (imageId) setSelected(imageId) }, [imageId])
  useEffect(() => { if (selected) loadResults(selected) }, [selected])

  // Poll while processing
  useEffect(() => {
    if (!selected || !['processing','pending'].includes(status?.status)) return
    const t = setInterval(async () => {
      try {
        const { data } = await getStatus(selected)
        setStatus(data)
        if (['completed','failed'].includes(data.status)) {
          clearInterval(t)
          await loadResults(selected)
        }
      } catch {}
    }, 2000)
    return () => clearInterval(t)
  }, [selected, status?.status])

  async function loadResults(id) {
    if (!id) return
    setLoading(true)
    try {
      const { data: s } = await getStatus(id)
      setStatus(s)
      if (['completed','failed'].includes(s.status)) {
        const { data: r } = await getResults(id)
        setResults(r)
      } else { setResults(null) }
    } catch { setResults(null) }
    finally  { setLoading(false) }
  }

  async function analyze() {
    if (!selected) return
    try {
      await runAnalysis(selected)
      toast.success('Analysis started!')
      setStatus({ status: 'processing', progress: 0, message: 'Starting…' })
    } catch (err) { toast.error(getApiError(err)) }
  }

  async function handleReport() {
    if (!selected) return
    setGenLoad(true)
    try {
      await generateReport(selected)
      toast.success('Report generated! Check Reports tab.')
    } catch (err) { toast.error(getApiError(err)) }
    finally { setGenLoad(false) }
  }

  async function handleDelete() {
    if (!selected || !window.confirm('Delete this image and its analysis?')) return
    try {
      await deleteImage(selected)
      toast.success('Image deleted')
      const { data } = await getImages()
      setImages(data)
      const next = data[0]
      if (next) { setSelected(String(next.id)); navigate(`/analysis/${next.id}`) }
      else      { setSelected(''); setResults(null); navigate('/analysis') }
    } catch (err) { toast.error(getApiError(err)) }
  }

  const image = useMemo(() => images.find((i) => String(i.id) === String(selected)), [images, selected])

  const riskColor =
    results?.risk_level === 'Safe'         ? 'text-green-400 bg-green-400/10 border-green-400/20'
    : results?.risk_level === 'Needs Review' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    : results?.risk_level === 'Suspicious'   ? 'text-red-400 bg-red-400/10 border-red-400/20'
    : ''

  function renderTab() {
    if (loading) return <Sk h="h-64" />
    if (!results) return (
      <div className="flex flex-col items-center justify-center h-48 rounded-xl border border-border bg-card gap-3 text-muted-foreground">
        <AlertTriangle className="h-8 w-8 opacity-30" />
        <p className="text-sm">No results yet. Run analysis first.</p>
        <button onClick={analyze} className="text-xs bg-primary text-primary-foreground rounded-xl px-4 py-2 hover:opacity-90">
          Start Analysis
        </button>
      </div>
    )
    const map = {
      info: <ImageInfo data={results.image_info} />,
      hashes: <HashCard hashes={results.hashes} />,
      metadata: <MetadataTable data={results.metadata_exif} />,
      histogram: <HistogramChart data={results.histogram_data} />,
      channels: <ChannelViewer data={results.channels_data} />,
      alpha: <AlphaViewer data={results.alpha_data} />,
      bitplanes: <BitPlaneGrid data={results.bit_planes_data} />,
      lsb: <LsbAnalysis data={results.lsb_results} />,
      strings: <StringsViewer data={results.strings_data} />,
      entropy: <EntropyGauge data={results.entropy_data} />,
      signature: <SignatureVerification data={results.signature_data} />,
      risk: <RiskAssessment data={results.risk_details} />,
    }
    return map[tab] || null
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Image selector */}
      <div className="rounded-2xl border border-border bg-card/60 p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">Image</label>
          <select
            value={selected}
            onChange={(e) => navigate(`/analysis/${e.target.value}`)}
            className="w-full rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">— Select an image —</option>
            {images.map((i) => <option key={i.id} value={i.id}>{i.original_name}</option>)}
          </select>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={analyze} disabled={!selected}
            className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground px-3 py-2.5 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" /> Analyze
          </button>
          <button
            onClick={() => loadResults(selected)} disabled={!selected || loading}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-xs hover:bg-secondary disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {results && (
            <button
              onClick={handleReport} disabled={genLoad}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-xs hover:bg-secondary disabled:opacity-50"
            >
              <FileDown className="h-3.5 w-3.5" /> {genLoad ? '…' : 'Report'}
            </button>
          )}
          {selected && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 px-3 py-2.5 text-xs hover:bg-red-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Image status bar */}
      {image && (
        <div className="rounded-2xl border border-border bg-card/60 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-sm text-foreground">{image.original_name}</p>
            <p className="text-[10px] text-muted-foreground">
              {image.width && image.height ? `${image.width} × ${image.height} · ` : ''}
              {image.extension?.toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {results?.risk_level && (
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${riskColor}`}>
                {results.risk_level} · {results.risk_score ?? 0}/100
              </span>
            )}
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border
              ${status?.status==='completed' ? 'text-green-400 border-green-400/20 bg-green-400/5'
              : status?.status==='processing' ? 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5'
              : status?.status==='failed'     ? 'text-red-400 border-red-400/20 bg-red-400/5'
              : 'text-muted-foreground border-border bg-card'}`}>
              {status?.status || image.status}
            </span>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {['processing','pending'].includes(status?.status) && (
        <div className="rounded-2xl border border-border bg-card/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{status?.message || 'Analyzing…'}</span>
            <span className="font-mono text-primary">{status?.progress ?? 0}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${status?.progress ?? 0}%`, boxShadow: '0 0 8px hsl(187 100% 50% / 0.5)' }}
            />
          </div>
        </div>
      )}

      {/* Tab bar */}
      {(results || loading) && (
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card/60 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition whitespace-nowrap
                ${tab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* No image selected */}
      {!selected && !loading && (
        <div className="flex flex-col items-center justify-center h-64 rounded-2xl border border-dashed border-border text-muted-foreground gap-3">
          <AlertTriangle className="h-10 w-10 opacity-20" />
          <p className="text-sm">Select an image above or</p>
          <Link to="/upload" className="text-xs text-primary hover:underline">Upload a new image →</Link>
        </div>
      )}

      {/* Tab content */}
      {selected && <div className="min-h-[200px]">{renderTab()}</div>}
    </div>
  )
}
