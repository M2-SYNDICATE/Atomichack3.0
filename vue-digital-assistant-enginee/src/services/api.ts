// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Types for API requests and responses
export interface LoginRequest {
  login: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    name: string
    email: string
  }
}

export interface StatusUpdateRequest {
  status: 'approved' | 'rejected' | 'removed'
}

export interface CriterionStatusUpdateRequest {
  occ_id: string
  error_point: string
  status: 'fixed' | 'rejected'
  comment?: string
}

export interface StatusUpdateResponse {
  message: string
  new_status: string
}

export interface UploadResponse {
  doc_id: string
  filename: string
  upload_date: string
  status: 'processing' | 'completed' | 'error'
}

export interface ErrorPoint {
  gostNumber: string
  section: string
  description: string
  severity: 'critical' | 'warning' | 'info'
  line?: number
  page?: number
}

export interface ErrorCounts {
  [gostNumber: string]: number
  total: number
}

export interface HistoryItem {
  id: number
  filename: string
  upload_date: string
  total_violations: number
  error_counts: Record<string, number>
  status: 'approved' | 'rejected' | 'removed' | 'waiting' | 'processing' | 'completed'
  processing_status?: 'in_progress' | 'complete' | 'queued' | 'error'
  status_author?: string
  developer_login?: string
  developer_full_name?: string
}

export interface DetailedResult {
  id: string
  filename: string
  upload_date: string
  error_points: string[]
  error_counts: ErrorCounts
  total_violations: number
  full_report: string
}

export interface ProcessSession {
  prev_version_id: number
  curr_version_id: number
  detect_at: string
  fixed_at: string
  review_at: string
  fix_duration: number
  review_duration: number
  fix_duration_minutes: number
  review_duration_minutes: number
  fix_duration_hours: number
  review_duration_hours: number
  error_point: string
  occ_id: string
  outcome: 'fixed' | 'rejected' | 'approved' | string
}

export interface ProcessDocument {
  doc_id: string
  filename: string
  upload_date: string
  fix_duration: number
  review_duration: number
  fix_duration_minutes: number
  review_duration_minutes: number
  fix_duration_hours: number
  review_duration_hours: number
  iterations: number
  sessions: ProcessSession[]
}

export interface ProcessAnalysisData {
  average_fix_duration: number
  average_review_duration: number
  max_fix_duration: number
  min_fix_duration: number
  max_review_duration: number
  min_review_duration: number
  average_fix_duration_minutes: number
  average_review_duration_minutes: number
  average_fix_duration_hours: number
  average_review_duration_hours: number
  max_fix_duration_minutes: number
  min_fix_duration_minutes: number
  max_review_duration_minutes: number
  min_review_duration_minutes: number
  max_fix_duration_hours: number
  min_fix_duration_hours: number
  max_review_duration_hours: number
  min_review_duration_hours: number
  average_iterations: number
  max_iterations: number
  min_iterations: number
  total_documents: number
  documents: ProcessDocument[]
}

// Admin Types
export interface User {
  id: string
  login: string
  full_name: string
  role: 'developer' | 'norm_controller' | 'admin'
  created_at?: string
  is_active?: boolean
}

export interface CreateUserRequest {
  login: string
  password: string
  role: 'developer' | 'norm_controller' | 'admin'
  full_name: string
}

export interface CreateUserResponse {
  message: string
  user_id: string
}

export interface WorkTimeSchedule {
  monday?: { start: string; end: string } | null
  tuesday?: { start: string; end: string } | null
  wednesday?: { start: string; end: string } | null
  thursday?: { start: string; end: string } | null
  friday?: { start: string; end: string } | null
  saturday?: { start: string; end: string } | null
  sunday?: { start: string; end: string } | null
}

export interface WorkTimeSettingsRequest {
  holidays: string // comma-separated dates in YYYY-MM-DD format
  schedule: WorkTimeSchedule
}

export interface WorkTimeSettingsResponse {
  message: string
  holidays: string[]
  schedule: WorkTimeSchedule
}

export class ApiError extends Error {
  code?: string
  status?: number

  constructor({ message, code, status }: { message: string; code?: string; status?: number }) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status

    // Сохраняем стек вызовов (опционально, но рекомендуется)
    // Используем проверку через 'in' для совместимости с браузерами
    if ('captureStackTrace' in Error) {
      ;(Error as any).captureStackTrace(this, ApiError)
    }
  }
}

// JWT Token Management
class TokenManager {
  private static readonly TOKEN_KEY = 'jwt_token'

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token)
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY)
  }

  static isTokenExpired(token: string): boolean {
    try {
      const tokenParts = token.split('.')
      if (tokenParts.length !== 3) {
        return true
      }

      const payloadBase64 = tokenParts[1]
      if (!payloadBase64) {
        return true
      }

      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/')
      const payloadJson = atob(base64)
      const payload = JSON.parse(payloadJson)

      const currentTime = Date.now() / 1000
      return typeof payload.exp === 'number' && payload.exp < currentTime
    } catch (error) {
      return true
    }
  }

  static isAuthenticated(): boolean {
    const token = this.getToken()
    return token !== null && !this.isTokenExpired(token)
  }
}

// HTTP Client with JWT Authentication
class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private getAuthHeaders(): HeadersInit {
    const token = TokenManager.getToken()
    const headers: HeadersInit = {}

    if (token && !TokenManager.isTokenExpired(token)) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      let errorCode = response.status.toString()

      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
        errorCode = errorData.code || errorCode
      } catch {
        // If response is not JSON, use default error message
      }

      const error = new ApiError({
        message: errorMessage,
        code: errorCode,
        status: response.status,
      })

      // Handle authentication errors
      if (response.status === 401) {
        TokenManager.removeToken()
        error.message = 'Authentication failed. Please login again.'
      }

      throw error
    }

    // Handle different content types
    const contentType = response.headers.get('content-type')

    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }

    // For file downloads, return the response itself
    return response as unknown as T
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      })
      return await this.handleResponse<T>(response)
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError({
          message: 'Network error. Please check your connection.',
          code: 'NETWORK_ERROR',
        })
      }
      throw error
    }
  }

  // 1. POST /login - Authentication
  async login(credentials: LoginRequest): Promise<any> {
    const response = await this.request<any>('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: credentials.login,
        password: credentials.password,
      }),
    })

    // Сохраняем JWT токен
    TokenManager.setToken(response.access_token)

    // Возвращаем реальные данные пользователя
    return {
      access_token: response.access_token,
      token_type: response.token_type,
      full_name: response.full_name,
      role: response.role,
      login: credentials.login, // чтобы знать, кто вошёл
    }
  }

  // 2. POST /upload - File Upload
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    return await this.request<UploadResponse>('/upload', {
      method: 'POST',
      body: formData,
    })
  }

  // 3. GET /download/{doc_id} - File Download
  async downloadFile(docId: string): Promise<Blob> {
    const response = await this.request<Response>(`/download/${docId}`, {
      method: 'GET',
    })

    if (response instanceof Response) {
      return await response.blob()
    }

    throw new ApiError({
      message: 'Invalid response format for file download',
      code: 'INVALID_RESPONSE',
    })
  }

  // 4. GET /download_annotated/{doc_id} - Annotated File Download
  async downloadAnnotatedFile(docId: string): Promise<Blob> {
    const response = await this.request<Response>(`/download_annotated/${docId}`, {
      method: 'GET',
    })

    if (response instanceof Response) {
      return await response.blob()
    }

    throw new ApiError({
      message: 'Invalid response format for annotated file download',
      code: 'INVALID_RESPONSE',
    })
  }

  // 5. GET /history - Get User's Check History
  async getHistory(): Promise<HistoryItem[]> {
    return await this.request<HistoryItem[]>('/history', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  // 6. GET /result/{doc_id} - Get Detailed Result
  async getResult(docId: string): Promise<DetailedResult> {
    return await this.request<DetailedResult>(`/result/${docId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  // 7. POST /upload?doc_id={id}&fixed_ids={ids} - Upload fixed version
  async submitFixes(docId: string, file: File, fixedIds: string[]): Promise<{ message: string }> {
    const formData = new FormData()
    formData.append('file', file)

    // Собираем строку параметров
    const query = `?doc_id=${encodeURIComponent(docId)}&fixed_ids=${fixedIds.join(',')}`

    return await this.request<{ message: string }>(`/upload${query}`, {
      method: 'POST',
      body: formData,
    })
  }

  // 8. GET /download_fixed/{doc_id}?occ_id=... - Скачать исправленный PDF для конкретного пункта
  async downloadFixedPdf(docId: string, occId: string): Promise<Blob> {
    const response = await this.request<Response>(`/download_fixed/${docId}?occ_id=${occId}`, {
      method: 'GET',
    })

    if (response instanceof Response) {
      return await response.blob()
    }

    throw new ApiError({
      message: 'Invalid response format for fixed PDF download',
      code: 'INVALID_RESPONSE',
    })
  }

  // 9. GET /process-analysis - Анализ процессов
  async getProcessAnalysis(
    startDate: string,
    endDate: string,
    includeSessions: boolean = true,
  ): Promise<ProcessAnalysisData> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      include_sessions: includeSessions.toString(),
    })

    return await this.request<ProcessAnalysisData>(`/process-analysis?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  // 9.1. GET /export-process-analysis-csv — экспорт анализа в CSV
  async exportProcessAnalysisCsv(startDate: string, endDate: string): Promise<Blob> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
    })

    const response = await this.request<Response>(
      `/export-process-analysis-csv?${params.toString()}`,
      {
        method: 'GET',
      },
    )

    if (response instanceof Response) {
      return await response.blob()
    }

    throw new ApiError({
      message: 'Invalid response format for CSV export',
      code: 'INVALID_RESPONSE',
    })
  }

  // 10. GET /requirements-stats — статистика по ГОСТ
  async getRequirementsStats(): Promise<any> {
    return await this.request<any>('/requirements-stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  // 11. POST /result/{doc_id}/status?status=approved
  async updateDocumentStatus(
    docId: string,
    statusData: StatusUpdateRequest,
  ): Promise<StatusUpdateResponse> {
    const params = new URLSearchParams({
      status: statusData.status,
    })

    return await this.request<StatusUpdateResponse>(
      `/result/${docId}/status?${params.toString()}`,
      {
        method: 'POST',
      },
    )
  }

  // 12. POST /result/{doc_id}/criterion-status?occ_id=...&error_point=...&status=...&comment=...
  async updateCriterionStatus(
    docId: string,
    criterionData: CriterionStatusUpdateRequest,
  ): Promise<StatusUpdateResponse> {
    const params = new URLSearchParams({
      occ_id: criterionData.occ_id,
      error_point: criterionData.error_point,
      status: criterionData.status,
    })

    if (criterionData.comment) {
      params.append('comment', criterionData.comment)
    }

    return await this.request<StatusUpdateResponse>(
      `/result/${docId}/criterion-status?${params.toString()}`,
      {
        method: 'POST',
      },
    )
  }

  // ADMIN ENDPOINTS

  // 13. GET /admin/users - Get all users
  async getAdminUsers(): Promise<User[]> {
    return await this.request<User[]>('/admin/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  // 14. POST /admin/reg - Create new user
  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    return await this.request<CreateUserResponse>('/admin/reg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
  }

  // 15. POST /admin/worktime-settings - Set work time settings
  async setWorkTimeSettings(settings: WorkTimeSettingsRequest): Promise<WorkTimeSettingsResponse> {
    return await this.request<WorkTimeSettingsResponse>('/admin/worktime-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    })
  }

  // 16. GET /admin/worktime-settings - Get work time settings
  async getWorkTimeSettings(): Promise<WorkTimeSettingsResponse> {
    return await this.request<WorkTimeSettingsResponse>('/admin/worktime-settings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  // Logout - Clear stored token
  logout(): void {
    TokenManager.removeToken()
  }

  // Check authentication status
  isAuthenticated(): boolean {
    return TokenManager.isAuthenticated()
  }
}

// Create singleton API client instance
export const apiClient = new ApiClient(API_BASE_URL)

// Convenience API functions
export const api = {
  // Authentication
  login: (login: string, password: string) => apiClient.login({ login, password }),
  logout: () => apiClient.logout(),
  isAuthenticated: () => apiClient.isAuthenticated(),

  // File operations
  uploadFile: (file: File) => apiClient.uploadFile(file),
  downloadFile: (docId: string) => apiClient.downloadFile(docId),
  downloadAnnotatedFile: (docId: string) => apiClient.downloadAnnotatedFile(docId),

  // Data retrieval
  getHistory: () => apiClient.getHistory(),
  getResult: (docId: string) => apiClient.getResult(docId),
  submitFixes: (docId: string, file: File, fixedIds: string[]) =>
    apiClient.submitFixes(docId, file, fixedIds),
  downloadFixedPdf: (docId: string, occId: string) => apiClient.downloadFixedPdf(docId, occId),

  // Analysis
  getProcessAnalysis: (startDate: string, endDate: string, includeSessions = true) =>
    apiClient.getProcessAnalysis(startDate, endDate, includeSessions),

  getRequirementsStats: () => apiClient.getRequirementsStats(),

  updateDocumentStatus: (docId: string, statusData: StatusUpdateRequest) =>
    apiClient.updateDocumentStatus(docId, statusData),
  updateCriterionStatus: (docId: string, criterionData: CriterionStatusUpdateRequest) =>
    apiClient.updateCriterionStatus(docId, criterionData),

  exportProcessAnalysisCsv: (startDate: string, endDate: string) =>
    apiClient.exportProcessAnalysisCsv(startDate, endDate),

  // Admin functions
  getAdminUsers: () => apiClient.getAdminUsers(),
  createUser: (userData: CreateUserRequest) => apiClient.createUser(userData),
  setWorkTimeSettings: (settings: WorkTimeSettingsRequest) =>
    apiClient.setWorkTimeSettings(settings),
  getWorkTimeSettings: () => apiClient.getWorkTimeSettings(),
}

// Error handling utilities
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

// Helper function to download file with proper filename
export const downloadFileWithName = async (docId: string, filename?: string): Promise<void> => {
  try {
    const blob = await api.downloadFile(docId)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `document_${docId}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    throw new Error(`Failed to download file: ${handleApiError(error)}`)
  }
}

// Helper function to download annotated file with proper filename
export const downloadAnnotatedFileWithName = async (
  docId: string,
  filename?: string,
): Promise<void> => {
  try {
    const blob = await api.downloadAnnotatedFile(docId)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `annotated_${docId}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    throw new Error(`Failed to download annotated file: ${handleApiError(error)}`)
  }
}

// Type guards
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError
}

export const isLoginResponse = (response: unknown): response is LoginResponse => {
  return (
    typeof response === 'object' && response !== null && 'token' in response && 'user' in response
  )
}

// Authentication status checker for route guards
export const checkAuthStatus = (): boolean => {
  return TokenManager.isAuthenticated()
}

// Token refresh checker
export const validateToken = (): boolean => {
  const token = TokenManager.getToken()
  if (!token) return false
  if (TokenManager.isTokenExpired(token)) {
    TokenManager.removeToken()
    return false
  }
  return true
}

// Export token manager for direct access if needed
export { TokenManager }
