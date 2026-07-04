import api from './client'

export const getHistory    = (params) => api.get('/api/history/', { params })
export const exportHistory = ()       => api.get('/api/history/export', { responseType: 'blob' })
