// API Response interfaces for exact backend formats
export interface CredentialsErrorResponse {
  error: string
  error_description: string
  message: string
}

export interface ValidationErrorResponse {
  errors: JsonApiValidationError[]
}

// Application interfaces
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  expires_in: number
  user: {
    email: string
  }
}

export interface RegisterResponse {
  access_token: string
  expires_in: number
  user: {
    email: string
  }
}

export interface RefreshResponse {
  access_token: string
  expires_in: number
  user: { email: string }
}

// JSON API error format from backend
export interface JsonApiValidationError {
  status: string
  title: string
  code: string
  detail?: string
  source?: {
    pointer: string
  }
}

// Field-based validation errors for UI components
export interface ValidationErrors {
  [field: string]: string
}

// Task-related types
export type TaskStatus = 'open' | 'closed'

export interface CreateTaskRequest {
  title: string
  description: string
  due_date: string
  status: TaskStatus
}

export interface UpdateTaskStatusRequest {
  status: TaskStatus
}

export interface UpdateTaskRequest {
  title: string
  description: string
  due_date: string
  status: TaskStatus
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
  dueDate: string
}

export interface TaskData {
  id: string
  type: 'tasks'
  attributes: Omit<Task, 'id'>
}

export interface Pagination {
  page: string
  limit: string
  total: number
  totalPages: number
}

export interface Stats {
  open: number
  closed: number
  total: number
  overdue: number
}

export interface TasksResponse {
  data: TaskData[]
  meta: {
    pagination: Pagination
    stats: Stats
  }
}

export class CustomApiError extends Error {
  public status: number
  public code?: string
  public title?: string
  public detail?: string
  public validationErrors?: ValidationErrors

  constructor(
    status: number,
    message: string,
    code?: string,
    title?: string,
    detail?: string,
    validationErrors?: ValidationErrors
  ) {
    super(message)
    this.name = 'CustomApiError'
    this.status = status
    this.code = code
    this.title = title
    this.detail = detail
    this.validationErrors = validationErrors
  }
}
