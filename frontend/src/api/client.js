import axios from 'axios'

/**
 * Axios instance.
 * - In development: Vite proxy forwards /api → localhost:8000
 * - In production:  VITE_API_URL points to Render backend
 */
const BASE = import.meta.env.VITE_API_URL || ''

export const api = axios.create({
  baseURL: BASE,
  timeout: 60000,
})

export function getApiError(err) {
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.message ||
    'Unknown error'
  )
}

export default api
