import { Navigate, useLocation } from 'react-router-dom'
import { useAuthBootstrap } from './hooks/useAuthBootstrap'
import FullPageSpinner from '@/components/FullPageSpinner'
import { useSession } from './hooks/useSession'

interface RequireAuthProps {
  children: React.ReactNode
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { status } = useAuthBootstrap()

  const location = useLocation()
  const session = useSession()

  if (status === 'pending' && session === undefined) return <FullPageSpinner />

  // Check if user is authenticated
  const isAuthenticated = () => {
    console.log('Checking authentication, session:', session)

    if (!session?.token) {
      return false
    }

    // Check if token has expired
    if (session.expiresAt) {
      const currentTime = Math.floor(Date.now() / 1000) // Current time in seconds
      const expirationTime = session.expiresAt // This is now an absolute timestamp

      if (currentTime >= expirationTime) {
        return false
      }
    }

    return true
  }

  // Store the attempted location for post-login redirect
  const storeIntendedLocation = () => {
    if (location.pathname !== '/login') {
      sessionStorage.setItem(
        'intendedLocation',
        location.pathname + location.search
      )
    }
  }

  if (!isAuthenticated()) {
    storeIntendedLocation()
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default RequireAuth
