import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import {
  CloudUpload, X, Loader2, CheckCircle, AlertCircle,
  Microscope, Play, FileImage, Trash2,
} from 'lucide-react'
import { uploadImages } from '../../api/images'
import { runAnalysis } from '../../api/analysis'
import { getApiError } from '../../api/client'
import { formatBytes } from '../../utils/helpers'
import toast from 'react-hot-toast'

const ACCEPT = { 'image/*': ['.jpg','.jpeg','.png','.bmp','.gif','.tiff','.tif','.webp'] }
const MAX_SIZE = 50 * 1024 * 1024

export function DropZone() {
  const [files, setFiles]       = useState([])
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  const onDrop = useCallback((accepted, rejected) => {
    rejected.forEach(({ file, errors }) =>
      errors.forEach((e) => toast.error(`${file.name}: ${e.message}`))
    )
    const items = accepted.map((f) => ({
      file, preview: URL.createObjectURL(f),
      progress: 0, status: 'pending', imageId: null, error: null,
    }))
    setFiles((p) => [...p, ...items])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPT, maxSize: MAX_SIZE, multiple: true,
  })

  const remove = (idx) =>
    setFiles((p) => { URL.revokeObjectURL(p[idx].preview); return p.filter((_, i) => i !== idx) })

  const uploadAll = async () => {
    const pending = files.filter((f) => f.status === 'pending')
    if (!pending.length) return
    setUploading(true)
    for (let idx = 0; idx < files.length; idx++) {
      if (files[idx].status !== 'pending') continue
      setFiles((p) => p.map((f, i) => i === idx ? { ...f, status: 'uploading' } : f))
      try {
        const form = new FormData()
        form.append('files', files[idx].file)
        const { data } = await uploadImages(form, (pct) =>
          setFiles((p) => p.map((f, i) => i === idx ? { ...f, progress: pct } : f))
        )
        const imageId = data[0]?.id
        setFiles((p) => p.map((f, i) =>
          i === idx ? { ...f, status: 'done', progress: 100, imageId } : f
        ))
        toast.success(`${files[idx].file.name} uploaded!`)
      } catch (err) {
        const msg = getApiError(err)
        setFiles((p) => p.map((f, i) => i === idx ? { ...f, status: 'error', error: msg } : f))
        toast.error(msg)
      }
    }
    setUploading(false)
  }

  const analyzeNow = async (idx) => {
    const item = files[idx]
    if (!item.imageId) return
    setFiles((p) => p.map((f, i) => i === idx ? { ...f, status: 'analyzing' } : f))
    try {
      await runAnalysis(item.imageId)
      toast.success('Analysis started!')
      navigate(`/analysis/${item.imageId}`)
    } catch (err) {
      toast.error(getApiError(err))
      setFiles((p) => p.map((f, i) => i === idx ? { ...f, status: 'done' } : f))
    }
  }

  const hasPending = files.some((f) => f.status === 'pending')
  const hasDone    = files.some((f) => f.status === 'done')

  return (
    <div className="space-y-3">
      {/* Drop area */}
      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed min-h-[180px] cursor-pointer transition-all duration-200 select-none px-6 py-8
          ${isDragActive
            ? 'border-primary bg-primary/5 shadow-[0_0_30px_hsl(187_100%_50%/0.15)]'
            : 'border-border hover:border-primary/40 hover:bg-primary/3 bg-card/40'
          }`}
      >
        <input {...getInputProps()} />
        <div className={`h-12 w-12 rounded-xl border flex items-center justify-center transition-all
          ${isDragActive ? 'border-primary bg-primary/15' : 'border-border bg-secondary/60'}`}>
          <CloudUpload className={`h-6 w-6 transition-colors ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        <div className="text-center">
          <p className={`font-semibold text-sm ${isDragActive ? 'text-primary' : 'text-foreground'}`}>
            {isDragActive ? 'Release to drop' : 'Drag & drop images here'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or <span className="text-primary underline underline-offset-2">browse files</span>
            {' · '}JPG PNG BMP GIF TIFF WebP · max 50 MB
          </p>
        </div>
      </div>

      {/* File queue */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-colors
                ${item.status === 'done' || item.status === 'analyzing' ? 'border-green-500/20 bg-green-500/3' : 'border-border bg-card/60'}`}
            >
              {/* Preview */}
              <img src={item.preview} alt="" className="h-11 w-11 rounded-lg object-cover shrink-0 border border-border" />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-foreground truncate">{item.file.name}</p>
                  <span className="text-[10px] text-muted-foreground shrink-0">{formatBytes(item.file.size)}</span>
                </div>
                {/* Progress bar */}
                {item.status === 'uploading' && (
                  <div className="mt-1.5 h-1 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${item.progress}%`, boxShadow: '0 0 6px hsl(187 100% 50% / 0.6)' }}
                    />
                  </div>
                )}
                {item.error && <p className="text-[11px] text-red-400 mt-1">{item.error}</p>}
                {item.status === 'done' && (
                  <p className="text-[11px] text-green-400 mt-0.5">Ready to analyze</p>
                )}
              </div>

              {/* Action */}
              <div className="shrink-0">
                {item.status === 'uploading' && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
                {item.status === 'error'     && <AlertCircle className="h-4 w-4 text-red-400" />}
                {item.status === 'analyzing' && <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />}
                {item.status === 'done' && (
                  <button
                    onClick={() => analyzeNow(idx)}
                    className="flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-2.5 py-1.5 text-xs font-semibold hover:opacity-90 transition"
                  >
                    <Play className="h-3 w-3" /> Analyze
                  </button>
                )}
                {item.status === 'pending' && (
                  <button onClick={() => remove(idx)} className="p-1 text-muted-foreground hover:text-red-400 transition">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload / Analyze all buttons */}
      {(hasPending || hasDone) && (
        <div className="flex gap-2">
          {hasPending && (
            <button
              onClick={uploadAll}
              disabled={uploading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
              {uploading ? 'Uploading…' : `Upload ${files.filter(f=>f.status==='pending').length} file(s)`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
