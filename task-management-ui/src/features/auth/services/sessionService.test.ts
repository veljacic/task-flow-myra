import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest'
import SessionService from './sessionService'
import queryClient from '@/app/queryClient'
import queryKeys from '@/lib/queryKeys'
import apiClient from '@/api/apiClient'

// Mock dependencies
vi.mock('@/app/queryClient')
vi.mock('@/lib/queryKeys')
vi.mock('@/api/apiClient')

// Mock window.location
const mockLocation = {
  href: '',
}
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
})

// Mock Date.now for predictable timestamps
const mockDateNow = vi.fn(() => 1640995200000) // 2022-01-01 00:00:00 UTC

describe('SessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(Date, 'now').mockImplementation(mockDateNow)

    // Setup default mocks
    ;(queryKeys.session as Mock).mockReturnValue(['session'])
    ;(queryClient.setQueryData as Mock).mockImplementation(() => {})
    ;(queryClient.getQueryData as Mock).mockImplementation(() => undefined)
    ;(apiClient.doLogout as Mock).mockResolvedValue({})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('setSession', () => {
    it('should store session data with calculated expiration time', () => {
      const sessionData = {
        token: 'test-token',
        email: 'test@example.com',
        expiresIn: 3600, // 1 hour
      }

      SessionService.setSession(sessionData)

      expect(queryClient.setQueryData).toHaveBeenCalledWith(
        ['session'],
        {
          token: 'test-token',
          email: 'test@example.com',
          expiresAt: 1640998800, // Current time (1640995200) + expiresIn (3600)
        }
      )
    })

    it('should calculate expiration time correctly for different durations', () => {
      const sessionData = {
        token: 'test-token',
        email: 'test@example.com',
        expiresIn: 7200, // 2 hours
      }

      SessionService.setSession(sessionData)

      expect(queryClient.setQueryData).toHaveBeenCalledWith(
        ['session'],
        {
          token: 'test-token',
          email: 'test@example.com',
          expiresAt: 1641002400, // Current time + 2 hours
        }
      )
    })
  })

  describe('getSession', () => {
    it('should return session data from query client', () => {
      const mockSessionData = {
        token: 'test-token',
        email: 'test@example.com',
        expiresAt: 1640998800,
      }

      ;(queryClient.getQueryData as Mock).mockReturnValue(mockSessionData)

      const result = SessionService.getSession()

      expect(queryClient.getQueryData).toHaveBeenCalledWith(['session'])
      expect(result).toEqual(mockSessionData)
    })

    it('should return undefined when no session exists', () => {
      ;(queryClient.getQueryData as Mock).mockReturnValue(undefined)

      const result = SessionService.getSession()

      expect(result).toBeUndefined()
    })
  })

  describe('clearSession', () => {
    it('should call logout API and clear session data', async () => {
      await SessionService.clearSession()

      expect(apiClient.doLogout).toHaveBeenCalledOnce()
      expect(queryClient.setQueryData).toHaveBeenCalledWith(['session'], null)
      expect(window.location.href).toBe('/login')
    })

    it('should clear session data even if logout API fails', async () => {
      const logoutError = new Error('Network error')
      ;(apiClient.doLogout as Mock).mockRejectedValue(logoutError)

      // Spy on console.error to verify error logging
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await SessionService.clearSession()

      expect(apiClient.doLogout).toHaveBeenCalledOnce()
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to logout on server:', logoutError)
      expect(queryClient.setQueryData).toHaveBeenCalledWith(['session'], null)
      expect(window.location.href).toBe('/login')

      consoleErrorSpy.mockRestore()
    })

    it('should always redirect to login page', async () => {
      // Test successful logout
      await SessionService.clearSession()
      expect(window.location.href).toBe('/login')

      // Reset location
      mockLocation.href = ''

      // Test failed logout
      ;(apiClient.doLogout as Mock).mockRejectedValue(new Error('API Error'))
      await SessionService.clearSession()
      expect(window.location.href).toBe('/login')
    })
  })

  describe('session expiration calculation', () => {
    it('should handle different timestamp scenarios', () => {
      // Test with different mock timestamps
      mockDateNow.mockReturnValue(1609459200000) // 2021-01-01 00:00:00 UTC

      const sessionData = {
        token: 'test-token',
        email: 'test@example.com',
        expiresIn: 1800, // 30 minutes
      }

      SessionService.setSession(sessionData)

      expect(queryClient.setQueryData).toHaveBeenCalledWith(
        ['session'],
        {
          token: 'test-token',
          email: 'test@example.com',
          expiresAt: 1609461000, // 1609459200 + 1800
        }
      )
    })

    it('should handle zero expiration time', () => {
      const sessionData = {
        token: 'test-token',
        email: 'test@example.com',
        expiresIn: 0,
      }

      SessionService.setSession(sessionData)

      expect(queryClient.setQueryData).toHaveBeenCalledWith(
        ['session'],
        {
          token: 'test-token',
          email: 'test@example.com',
          expiresAt: 1640995200, // Same as current time
        }
      )
    })
  })
})