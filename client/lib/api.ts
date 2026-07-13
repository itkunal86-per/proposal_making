// src/lib/api.ts
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.dev.pitchsuite.io'
const MAIN_APP_URL = import.meta.env.VITE_MAIN_APP_URL ?? 'https://pitchsuite.io'

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,               // send the .dev.pitchsuite.io session cookie
  withXSRFToken: true,                 // axios >=1.6: echo XSRF-TOKEN cookie as header
  headers: { Accept: 'application/json' },
})

// Call once before any POST/PUT/DELETE so Laravel sets the XSRF-TOKEN cookie.
export const ensureCsrf = () =>
  api.get('/sanctum/csrf-cookie')

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      window.location.href = MAIN_APP_URL   // no session -> re-auth via main app
    }
    return Promise.reject(err)
  },
)