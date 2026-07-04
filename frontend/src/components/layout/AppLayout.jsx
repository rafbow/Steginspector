import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, Upload, Microscope, FileClock,
  FileText, Settings, Shield, Menu, X, Zap,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const NAV = [
  { to: '/upload',    label: 'Upload',    icon: Upload,          color: 'text-cyan-400',   desc: 'Drop images here' },
  { to: '/analysis',  label: 'Analyze',   icon: Microscope,      color: 'text-purple-400', desc: 'Run forensic analysis' },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-green-400',  desc: 'Workspace stats' },
  { to: '/history',   label: 'History',   icon: FileClock,       color: 'text-yellow-400', desc: 'All past analyses' },
  { to: '/reports',   label: 'Reports',   icon: FileText,        color: 'text-orange-400', desc: 'PDF reports' },
  { to: '/settings',  label: 'Settings',  icon: Settings,        color: 'text-muted-foreground', desc: 'App settings' },
]

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border bg-card/60 backdrop-blur-sm">
        <SidebarInner onNav={undefined} />
      </aside>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 flex flex-col w-56 bg-card border-r border-border">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarInner onNav={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="h-11 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-3 shrink-0">
          <div className="flex items-center gap-2">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-1.5 rounded hover:bg-secondary text-muted-foreground"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Breadcrumb-style title */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span className="text-foreground font-semibold">StegInspector</span>
              <span>/</span>
              <span>Forensics Tool</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="hidden sm:flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span>API connected</span>
            </div>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 hover:text-primary transition"
            >
              <Zap className="h-3 w-3" />
              API Docs
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-5 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SidebarInner({ onNav }) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 h-11 px-4 border-b border-border shrink-0">
        <div className="h-7 w-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
          <Shield className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground leading-none">StegInspector</p>
          <p className="text-[10px] text-muted-foreground">Digital Forensics</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        <p className="px-2 mb-1.5 text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Tools</p>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNav}
            title={item.desc}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all',
                isActive
                  ? `bg-primary/10 border border-primary/20 text-primary`
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent',
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn('h-3.5 w-3.5 shrink-0 transition-colors', isActive ? 'text-primary' : item.color)} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3 shrink-0">
        <p className="text-[10px] text-muted-foreground/50 text-center">
          No login required · Open tool
        </p>
      </div>
    </>
  )
}
