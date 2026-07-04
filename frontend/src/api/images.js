import api from './client'

export const uploadImages = (formData, onProgress) =>
  api.post('/api/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total)),
  })

export const getImages   = ()     => api.get('/api/images/')
export const getImage    = (id)   => api.get(`/api/images/${id}`)
export const deleteImage = (id)   => api.delete(`/api/images/${id}`)
