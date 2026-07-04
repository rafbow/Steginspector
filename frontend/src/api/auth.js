import api from './client'
export const login    = (email, password) => api.post('/api/auth/login',    { email, password })
export const register = (data)            => api.post('/api/auth/register',  data)
export const getMe    = ()                => api.get('/api/auth/me')
