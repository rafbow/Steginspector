import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as authApi from '../api/auth'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      /** Login: call API, store token + user */
      login: async (email, password) => {
        const { data } = await authApi.login(email, password)
        localStorage.setItem('token', data.access_token)
        set({ user: data.user, token: data.access_token, isAuthenticated: true })
        return data
      },

      /** Register: call API */
      register: async (payload) => {
        const { data } = await authApi.register(payload)
        localStorage.setItem('token', data.access_token)
        set({ user: data.user, token: data.access_token, isAuthenticated: true })
        return data
      },

      /** Logout: clear all auth state */
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false })
      },

      /** Refresh user from /me */
      refreshUser: async () => {
        try {
          const { data } = await authApi.getMe()
          set({ user: data })
        } catch {
          get().logout()
        }
      },

      setAuth: (user, token) => {
        localStorage.setItem('token', token)
        set({ user, token, isAuthenticated: true })
      },
    }),
    { name: 'auth-storage', partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }) }
  )
)

export default useAuthStore
