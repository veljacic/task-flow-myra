import { CustomApiError, type ValidationErrors } from '@/types/api'

export const isApiError = (error: unknown): error is CustomApiError => {
  return error instanceof CustomApiError
}

export const isValidationError = (error: unknown): error is CustomApiError => {
  return isApiError(error) && error.status === 422
}

export const isCredentialsError = (error: unknown): error is CustomApiError => {
  return isApiError(error) && error.status === 401
}

export const extractValidationErrors = (error: unknown): ValidationErrors => {
  if (isApiError(error) && error.validationErrors) {
    return error.validationErrors
  }
  return {}
}

export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message
  }
  return 'An unexpected error occurred'
}
