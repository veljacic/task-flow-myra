import {
  CustomApiError,
  type LoginResponse,
  type RegisterResponse,
  type RefreshResponse,
  type ValidationErrorResponse,
  type ValidationErrors,
  type JsonApiValidationError,
  type TasksResponse,
  type CreateTaskRequest,
  type UpdateTaskStatusRequest,
  type UpdateTaskRequest,
} from '@/types/api'
import SessionService from '@/features/auth/services/sessionService'
import tokenRefreshService from '@/services/tokenRefreshService'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

// Authentication helpers
const getAuthHeaders = (): HeadersInit => {
  const session = SessionService.getSession()

  if (!session?.token) {
    throw new CustomApiError(401, 'No authentication token available')
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.token}`,
  }
}

const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  return tokenRefreshService.executeWithRefresh(async () => {
    const authHeaders = getAuthHeaders()
    return fetch(url, {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      },
    })
  }, doRefreshToken)
}

const parseValidationErrors = (
  errorResponse: ValidationErrorResponse
): ValidationErrors => {
  const fieldErrors: ValidationErrors = {}

  errorResponse.errors.forEach((error: JsonApiValidationError) => {
    if (error.source?.pointer) {
      const fieldName = error.source.pointer.split('/').pop()
      const errorMessage = error.detail || error.title

      if (fieldName && errorMessage) {
        fieldErrors[fieldName] = errorMessage
      }
    }
  })

  return fieldErrors
}

const createApiError = (
  status: number,
  errorResponse: ValidationErrorResponse
): CustomApiError => {
  const firstError = errorResponse.errors[0]
  const validationErrors = parseValidationErrors(errorResponse)

  return new CustomApiError(
    status,
    firstError?.title || 'An error occurred',
    firstError?.code,
    firstError?.title,
    firstError?.detail,
    validationErrors
  )
}

const doRefreshToken = async (): Promise<RefreshResponse> => {
  const response = await fetch(`${API}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new CustomApiError(response.status, 'Token refresh failed')
  }

  const data = await response.json()

  return data
}

const doLogin = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await fetch(`${API}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    try {
      const errorResponse = (await response.json()) as ValidationErrorResponse
      throw createApiError(response.status, errorResponse)
    } catch (error) {
      if (error instanceof CustomApiError) {
        throw error
      }
      // If response body is not JSON, use default error
      throw new CustomApiError(response.status, 'Login failed')
    }
  }

  return response.json()
}

const doRegister = async (
  email: string,
  password: string
): Promise<RegisterResponse> => {
  const response = await fetch(`${API}/auth/register`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    try {
      const errorResponse = (await response.json()) as ValidationErrorResponse
      throw createApiError(response.status, errorResponse)
    } catch (error) {
      if (error instanceof CustomApiError) {
        throw error
      }
      // If response body is not JSON, use default error
      throw new CustomApiError(response.status, 'Registration failed')
    }
  }

  return response.json()
}

const doFetchTasks = async (
  page: number = 1,
  limit: number = 10,
  status?: string,
  search?: string,
  dateFilter?: string
): Promise<TasksResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })

  if (status && status !== 'all') {
    params.append('status', status)
  }
  if (search) {
    params.append('search', search)
  }
  if (dateFilter && dateFilter !== 'all') {
    params.append('dateFilter', dateFilter)
  }

  const response = await authenticatedFetch(`${API}/tasks?${params}`, {
    method: 'GET',
  })

  if (!response.ok) {
    try {
      const errorResponse = (await response.json()) as ValidationErrorResponse
      throw createApiError(response.status, errorResponse)
    } catch (error) {
      if (error instanceof CustomApiError) {
        throw error
      }
      // If response body is not JSON, use default error
      throw new CustomApiError(response.status, 'Failed to fetch tasks')
    }
  }

  return response.json()
}

const doCreateTask = async (taskData: CreateTaskRequest): Promise<any> => {
  const response = await authenticatedFetch(`${API}/tasks`, {
    method: 'POST',
    body: JSON.stringify(taskData),
  })

  if (!response.ok) {
    try {
      const errorResponse = (await response.json()) as ValidationErrorResponse
      throw createApiError(response.status, errorResponse)
    } catch (error) {
      if (error instanceof CustomApiError) {
        throw error
      }
      // If response body is not JSON, use default error
      throw new CustomApiError(response.status, 'Failed to create task')
    }
  }

  return response.json()
}

const doUpdateTaskStatus = async (
  taskId: string,
  statusData: UpdateTaskStatusRequest
): Promise<any> => {
  const response = await authenticatedFetch(`${API}/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(statusData),
  })

  if (!response.ok) {
    try {
      const errorResponse = (await response.json()) as ValidationErrorResponse
      throw createApiError(response.status, errorResponse)
    } catch (error) {
      if (error instanceof CustomApiError) {
        throw error
      }
      // If response body is not JSON, use default error
      throw new CustomApiError(response.status, 'Failed to update task status')
    }
  }

  return response.json()
}

const doUpdateTask = async (
  taskId: string,
  taskData: UpdateTaskRequest
): Promise<any> => {
  const response = await authenticatedFetch(`${API}/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  })

  if (!response.ok) {
    try {
      const errorResponse = (await response.json()) as ValidationErrorResponse
      throw createApiError(response.status, errorResponse)
    } catch (error) {
      if (error instanceof CustomApiError) {
        throw error
      }
      // If response body is not JSON, use default error
      throw new CustomApiError(response.status, 'Failed to update task')
    }
  }

  return response.json()
}

const doDeleteTask = async (taskId: string): Promise<void> => {
  const response = await authenticatedFetch(`${API}/tasks/${taskId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    try {
      const errorResponse = (await response.json()) as ValidationErrorResponse
      throw createApiError(response.status, errorResponse)
    } catch (error) {
      if (error instanceof CustomApiError) {
        throw error
      }
      // If response body is not JSON, use default error
      throw new CustomApiError(response.status, 'Failed to delete task')
    }
  }

  // DELETE typically returns no content, so no need to parse JSON
}

const doLogout = async (): Promise<void> => {
  const response = await authenticatedFetch(`${API}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    try {
      const errorResponse = (await response.json()) as ValidationErrorResponse
      throw createApiError(response.status, errorResponse)
    } catch (error) {
      if (error instanceof CustomApiError) {
        throw error
      }
      // If response body is not JSON, use default error
      throw new CustomApiError(response.status, 'Failed to logout')
    }
  }
}

export default {
  doLogin,
  doRegister,
  doFetchTasks,
  doCreateTask,
  doUpdateTaskStatus,
  doUpdateTask,
  doDeleteTask,
  doLogout,
  doRefreshToken,
}
