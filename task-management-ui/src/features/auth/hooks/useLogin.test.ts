import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import useLogin from './useLogin'
import SessionService from '../services/sessionService'
import apiClient from '@/api/apiClient'

vi.mock('../services/sessionService')
vi.mock('@/api/apiClient')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(BrowserRouter, null, children)
    )
  }

  return Wrapper
}

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call doLogin with correct parameters', async () => {
    const mockLoginData = {
      access_token: 'mock-token',
      expires_in: 3600,
      user: { email: 'test@example.com' },
    }
    ;(apiClient.doLogin as Mock).mockResolvedValue(mockLoginData)

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'test@example.com',
      password: 'password',
    })

    await waitFor(() => {
      expect(apiClient.doLogin).toHaveBeenCalledWith(
        'test@example.com',
        'password'
      )
    })
  })

  it('should set session on successful login', async () => {
    const mockLoginData = {
      access_token: 'mock-token',
      expires_in: 3600,
      user: { email: 'test@example.com' },
    }
    ;(apiClient.doLogin as Mock).mockResolvedValue(mockLoginData)

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      email: 'test@example.com',
      password: 'password',
    })

    await waitFor(() => {
      expect(SessionService.setSession).toHaveBeenCalledWith({
        token: 'mock-token',
        expiresIn: 3600,
        email: 'test@example.com',
      })
    })
  })
})
