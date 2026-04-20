/**
 * API Service Layer for Authentication and HTTP Requests
 * Handles JWT token management, automatic token refresh, and error handling
 */

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  message?: string
  error?: string
}

export interface User {
  id: string
  email: string
  name: string
  picture?: string
  verified?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RefreshTokenResponse {
  success: boolean
  user?: User
  message?: string
  error?: string
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Token management utilities
class TokenManager {
  private static readonly TOKEN_KEY = 'auth_token'
  private static readonly REFRESH_KEY = 'refresh_token'

  static async getToken(): Promise<string | null> {
    // Since we're using httpOnly cookies, we don't store tokens in localStorage
    // The token is automatically sent with requests via cookies
    return null
  }

  static async setTokens(accessToken?: string, refreshToken?: string): Promise<void> {
    // With httpOnly cookies, token storage is handled by the browser automatically
    // This method is kept for compatibility but doesn't need to do anything
    return
  }

  static async clearTokens(): Promise<void> {
    // Tokens will be cleared by the logout endpoint setting expired cookies
    return
  }

  static async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Include httpOnly cookies
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new ApiError('Token refresh failed', response.status)
      }

      const data: RefreshTokenResponse = await response.json()
      return data.success
    } catch (error) {
      console.error('Token refresh error:', error)
      return false
    }
  }
}

// Base fetch wrapper with error handling and token management
class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  // Request interceptor
  private async prepareRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<[string, RequestInit]> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers = {
      ...this.defaultHeaders,
      ...options.headers,
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Always include cookies for httpOnly token handling
    }

    return [url, requestOptions]
  }

  // Response interceptor with automatic token refresh
  private async handleResponse<T>(response: Response): Promise<T> {
    // Handle 401 errors with token refresh
    if (response.status === 401) {
      const refreshSuccess = await TokenManager.refreshToken()
      if (refreshSuccess) {
        // Retry the original request once after successful refresh
        // Note: This requires the calling code to handle retries
        throw new ApiError('Token expired - retry needed', 401)
      } else {
        // Refresh failed, user needs to log in again
        await TokenManager.clearTokens()
        throw new ApiError('Authentication failed', 401)
      }
    }

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // If response is not JSON, use status text
      }

      throw new ApiError(errorMessage, response.status, response)
    }

    try {
      return await response.json()
    } catch (error) {
      throw new ApiError('Invalid JSON response', response.status)
    }
  }

  // Generic request method with retry logic for 401 errors
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    try {
      const [url, requestOptions] = await this.prepareRequest(endpoint, options)
      const response = await fetch(url, requestOptions)
      return await this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof ApiError && error.status === 401 && retryCount === 0) {
        // Retry once after token refresh
        return this.request<T>(endpoint, options, 1)
      }
      throw error
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<T> {
    const body = data ? JSON.stringify(data) : undefined
    return this.request<T>(endpoint, { ...options, method: 'POST', body })
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<T> {
    const body = data ? JSON.stringify(data) : undefined
    return this.request<T>(endpoint, { ...options, method: 'PUT', body })
  }

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<T> {
    const body = data ? JSON.stringify(data) : undefined
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body })
  }
}

// Create singleton API client instance
export const apiClient = new ApiClient()

// Authentication API methods
export const authApi = {
  // Login with email/password
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', credentials)
  },

  // Login with Google OAuth
  async loginWithGoogle(code: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/google', { code })
  },

  // Logout
  async logout(): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/auth/logout')
  },

  // Get current user
  async getCurrentUser(): Promise<AuthResponse> {
    return apiClient.get<AuthResponse>('/auth/me')
  },

  // Refresh token
  async refreshToken(): Promise<RefreshTokenResponse> {
    return apiClient.post<RefreshTokenResponse>('/auth/refresh')
  },

  // Register new user
  async register(userData: {
    email: string
    password: string
    name: string
  }): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', userData)
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/auth/forgot-password', { email })
  },

  // Reset password
  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/auth/reset-password', {
      token,
      password,
    })
  },

  // Verify email
  async verifyEmail(token: string): Promise<ApiResponse> {
    return apiClient.post<ApiResponse>('/auth/verify-email', { token })
  },
}

// Export the token manager for direct access if needed
export { TokenManager }

// Export API error class
export { ApiError }

// Helper function to check if an error is an API error
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

// Helper function to handle API errors in components
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}