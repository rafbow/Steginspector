import { useState } from 'react'
import { Server, Shield, Bell, Info } from 'lucide-react'

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-secondary/20">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-5 space-y-3">{children}</div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background/50 px-4 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground font-mono">{value || '—'}</span>
    </div>
  )
}

export default function Settings() {
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="space-y-5 max-w-2xl animate-slide-up">
      <div>
        <h2 className="text-xl font-bold text-foreground">Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Application configuration and preferences</p>
      </div>

      <Section icon={Server} title="Backend Connection">
        <Row label="API URL"     value="http://localhost:8000" />
        <Row label="Mode"        value="No-Auth / Open Tool" />
        <Row label="Frontend"    value="http://localhost:5173" />
        <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-2.5">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <p className="text-xs text-green-400 font-medium">Backend connected</p>
        </div>
      </Section>

      <Section icon={Shield} title="About">
        <Row label="Tool"        value="StegInspector" />
        <Row label="Version"     value="2.0.0 (No-Auth)" />
        <Row label="Stack"       value="FastAPI + React + Vite" />
        <Row label="Analysis Modules" value="10 modules" />
        <Row label="Database"    value="SQLite (local)" />
      </Section>

      <Section icon={Bell} title="Notifications">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Analysis complete alerts</p>
            <p className="text-xs text-muted-foreground mt-0.5">Toast notification when done</p>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`relative h-6 w-11 rounded-full transition-colors ${notifications ? 'bg-primary' : 'bg-secondary border border-border'}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </Section>

      <Section icon={Info} title="API Docs">
        <p className="text-xs text-muted-foreground">
          Full Swagger UI available while the backend is running.
        </p>
        <a
          href="http://localhost:8000/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 text-primary px-4 py-2 text-xs font-semibold hover:bg-primary/20 transition"
        >
          Open API Docs →
        </a>
      </Section>
    </div>
  )
}
