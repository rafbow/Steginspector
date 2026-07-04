import api from './client'

export const getReports      = ()    => api.get('/api/reports/')
export const generateReport  = (id)  => api.post(`/api/reports/generate/${id}`)
export const downloadReport  = (id)  => api.get(`/api/reports/${id}/download`, { responseType: 'blob' })
