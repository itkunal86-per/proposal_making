// src/lib/api.ts
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.dev.pitchsuite.io'
const MAIN_APP_URL = import.meta.env.VITE_MAIN_APP_URL ?? 'https://pitchsuite.io'

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  withXSRFToken: true,
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Call once before any POST/PUT/DELETE so Laravel sets the XSRF-TOKEN cookie.
export const ensureCsrf = () =>
  api.get('/sanctum/csrf-cookie')

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err?.response?.status === 401 &&
      window.location.pathname !== '/sso-login'
    ) {
      //window.location.href = MAIN_APP_URL
    }
    return Promise.reject(err)
  },
)
