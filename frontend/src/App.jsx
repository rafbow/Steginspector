import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import Dashboard  from './pages/Dashboard'
import Upload     from './pages/Upload'
import Analysis   from './pages/Analysis'
import History    from './pages/History'
import Reports    from './pages/Reports'
import Settings   from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/upload" replace />} />
        <Route path="/dashboard"        element={<Dashboard />} />
        <Route path="/upload"           element={<Upload />} />
        <Route path="/analysis"         element={<Analysis />} />
        <Route path="/analysis/:imageId" element={<Analysis />} />
        <Route path="/history"          element={<History />} />
        <Route path="/reports"          element={<Reports />} />
        <Route path="/settings"         element={<Settings />} />
        <Route path="*"                 element={<Navigate to="/upload" replace />} />
      </Route>
    </Routes>
  )
}
