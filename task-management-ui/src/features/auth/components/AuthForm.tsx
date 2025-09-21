import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

import useLogin from '../hooks/useLogin'
import useRegister from '../hooks/useRegister'
import {
  isCredentialsError,
  isValidationError,
  extractValidationErrors,
  getErrorMessage,
} from '@/utils/errorUtils'

// Form validation schema
const authSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'), // usually with special chars and numbers
})

type AuthFormData = z.infer<typeof authSchema>

type AuthMode = 'login' | 'register'

function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('login')
  const isLogin = mode === 'login'

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  })

  const {
    mutate: login,
    error: loginError,
    isPending: isLoginLoading,
  } = useLogin()
  const {
    mutate: registerUser,
    error: registerError,
    isPending: isRegisterLoading,
  } = useRegister()

  const currentError = isLogin ? loginError : registerError
  const isLoading = isLogin ? isLoginLoading : isRegisterLoading

  // Clear errors when switching modes
  useEffect(() => {
    clearErrors()
  }, [mode, clearErrors])

  // Handle API validation errors
  useEffect(() => {
    if (currentError && isValidationError(currentError)) {
      const validationErrors = extractValidationErrors(currentError)

      // Set field-level errors for any field returned by API
      Object.entries(validationErrors).forEach(([field, message]) => {
        setError(field as keyof AuthFormData, { message })
      })
    }
  }, [currentError, setError])

  const onSubmit = (data: AuthFormData) => {
    if (isLogin) {
      login(data)
    } else {
      registerUser(data)
    }
  }

  const showGeneralError = currentError && isCredentialsError(currentError)

  return (
    <Card className="border shadow-lg">
      <CardHeader className="space-y-2 text-center">
        <div className="flex space-x-1 mb-4">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
              isLogin
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors ${
              !isLogin
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            Sign Up
          </button>
        </div>
        <CardTitle className="text-2xl font-bold">
          {isLogin ? 'Sign In' : 'Create Account'}
        </CardTitle>
        <CardDescription>
          {isLogin
            ? 'Enter your credentials to access your account'
            : 'Enter your details to create a new account'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showGeneralError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{getErrorMessage(currentError)}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register('password')}
              className={errors.password ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full mt-6"
            size="lg"
            disabled={isLoading}
          >
            {isLoading
              ? isLogin
                ? 'Signing In...'
                : 'Creating Account...'
              : isLogin
                ? 'Sign In'
                : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default AuthForm
