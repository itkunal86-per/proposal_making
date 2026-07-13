import axios from 'axios'

// Same origin as Laravel (dev.pitchsuite.io), so cookies are sent automatically.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/',
  withCredentials: true,
  headers: { Accept: 'application/json' },
})

const MAIN_APP_URL =
  import.meta.env.VITE_MAIN_APP_URL ?? 'https://pitchsuite.io'

// If the session is gone, send the user back to the main app to re-auth.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      window.location.href = MAIN_APP_URL
    }
    return Promise.reject(err)
  },
)
