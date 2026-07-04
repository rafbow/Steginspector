/**
 * AuthContext — thin wrapper so existing components using useAuth() keep working.
 * State is actually managed by Zustand (authStore).
 */
import { createContext, useContext } from 'react'
import useAuthStore from './authStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const store = useAuthStore()
  return <AuthContext.Provider value={store}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
