import axios, { AxiosError } from 'axios'
import Cookies from 'js-cookie'

// Create axios instance
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: send cookies with requests
})

// Request interceptor - Add token to every request
apiClient.interceptors.request.use(
  (config) => {
    // Get token from cookies
    const token = Cookies.get('token')

    // Add token to Authorization header if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    console.error('[API] Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    // Handle errors
    console.error('[API] Response error:', error.response?.status, error.config?.url)

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.error('[API] Unauthorized - clearing token and redirecting to login')
      // Clear invalid token
      Cookies.remove('token')
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('[API] Forbidden - insufficient permissions')
    }

    return Promise.reject(error)
  }
)

export default apiClient
