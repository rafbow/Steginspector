import api from './client'

export const runAnalysis  = (id) => api.post(`/api/analysis/run/${id}`)
export const getStatus    = (id) => api.get(`/api/analysis/${id}/status`)
export const getResults   = (id) => api.get(`/api/analysis/${id}/results`)
