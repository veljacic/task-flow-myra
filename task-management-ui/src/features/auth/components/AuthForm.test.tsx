import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import AuthForm from './AuthForm'
import * as useLoginModule from '../hooks/useLogin'
import * as useRegisterModule from '../hooks/useRegister'

// Mock the hooks
vi.mock('../hooks/useLogin')
vi.mock('../hooks/useRegister')

const mockLogin = vi.fn()
const mockRegister = vi.fn()

const createMockHook = (
  mutate: any,
  error: any = null,
  isPending = false
) => ({
  mutate,
  error,
  isPending,
})

describe('AuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Setup default mock implementations
    vi.mocked(useLoginModule.default).mockReturnValue(
      createMockHook(mockLogin, null, false)
    )
    vi.mocked(useRegisterModule.default).mockReturnValue(
      createMockHook(mockRegister, null, false)
    )
  })

  it('renders login form by default', () => {
    render(<AuthForm />)

    // Check for title text (it's not a semantic heading)
    expect(screen.getByText('Sign In', { selector: '[data-slot="card-title"]' })).toBeInTheDocument()
    expect(screen.getByText('Enter your credentials to access your account')).toBeInTheDocument()
    // Check for email and password inputs
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('switches to register mode when Sign Up is clicked', async () => {
    const user = userEvent.setup()
    render(<AuthForm />)

    const signUpButton = screen.getByRole('button', { name: 'Sign Up' })
    await user.click(signUpButton)

    expect(screen.getByText('Create Account', { selector: '[data-slot="card-title"]' })).toBeInTheDocument()
    expect(screen.getByText('Enter your details to create a new account')).toBeInTheDocument()
    // Check for email and password inputs in register mode
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('submits login form with valid data', async () => {
    const user = userEvent.setup()
    render(<AuthForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const form = emailInput.closest('form')

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    if (form) {
      await user.click(form.querySelector('button[type="submit"]') as HTMLElement)
    }

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })

  it('submits register form with valid data', async () => {
    const user = userEvent.setup()
    render(<AuthForm />)

    // Switch to register mode
    const signUpButton = screen.getByRole('button', { name: 'Sign Up' })
    await user.click(signUpButton)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const form = emailInput.closest('form')

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    if (form) {
      await user.click(form.querySelector('button[type="submit"]') as HTMLElement)
    }

    expect(mockRegister).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })

  it('displays validation errors for invalid email', async () => {
    const user = userEvent.setup()
    render(<AuthForm />)

    const emailInput = screen.getByLabelText('Email')
    const form = emailInput.closest('form')

    await user.type(emailInput, 'invalid-email')

    if (form) {
      await user.click(form.querySelector('button[type="submit"]') as HTMLElement)
    }

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
  })

  it('displays validation errors for short password', async () => {
    const user = userEvent.setup()
    render(<AuthForm />)

    const passwordInput = screen.getByLabelText('Password')
    const form = passwordInput.closest('form')

    await user.type(passwordInput, '123')

    if (form) {
      await user.click(form.querySelector('button[type="submit"]') as HTMLElement)
    }

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })
  })

  it('shows loading state during login', () => {
    vi.mocked(useLoginModule.default).mockReturnValue(
      createMockHook(mockLogin, null, true)
    )

    render(<AuthForm />)

    expect(screen.getByText('Signing In...')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeDisabled()
    expect(screen.getByLabelText('Password')).toBeDisabled()
  })

  it('shows loading state during registration', async () => {
    const user = userEvent.setup()

    vi.mocked(useRegisterModule.default).mockReturnValue(
      createMockHook(mockRegister, null, true)
    )

    render(<AuthForm />)

    // Switch to register mode
    const signUpButton = screen.getByRole('button', { name: 'Sign Up' })
    await user.click(signUpButton)

    expect(screen.getByText('Creating Account...')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeDisabled()
    expect(screen.getByLabelText('Password')).toBeDisabled()
  })

  it('displays general error for credentials error', () => {
    const credentialsError = {
      message: 'Invalid credentials',
      response: { status: 401 },
    }

    vi.mocked(useLoginModule.default).mockReturnValue(
      createMockHook(mockLogin, credentialsError, false)
    )

    render(<AuthForm />)

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })

  it('displays field-specific validation errors from API', () => {
    const validationError = {
      message: 'Validation failed',
      response: {
        status: 422,
        data: {
          errors: {
            email: 'Email is already taken',
            password: 'Password is too weak',
          },
        },
      },
    }

    vi.mocked(useRegisterModule.default).mockReturnValue(
      createMockHook(mockRegister, validationError, false)
    )

    render(<AuthForm />)

    expect(screen.getByText('Email is already taken')).toBeInTheDocument()
    expect(screen.getByText('Password is too weak')).toBeInTheDocument()
  })

  it('clears errors when switching between modes', async () => {
    const user = userEvent.setup()
    render(<AuthForm />)

    // Trigger validation error
    const submitButton = screen.getByText('Sign In').closest('button')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })

    // Switch to register mode
    const signUpButton = screen.getByRole('button', { name: 'Sign Up' })
    await user.click(signUpButton)

    // Errors should be cleared
    expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument()
  })

  it('applies error styling to input fields', async () => {
    const user = userEvent.setup()
    render(<AuthForm />)

    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByText('Sign In').closest('button')

    await user.type(emailInput, 'invalid-email')
    await user.click(submitButton)

    await waitFor(() => {
      expect(emailInput).toHaveClass('border-destructive')
    })
  })
})