import queryClient from '@/app/queryClient'
import queryKeys from '@/lib/queryKeys'
import apiClient from '@/api/apiClient'

const setSession = ({
  token,
  email,
  expiresIn,
}: {
  token: string
  email: string
  expiresIn: number
}) => {
  // Calculate actual expiration timestamp
  const currentTime = Math.floor(Date.now() / 1000) // Current time in seconds
  const expirationTime = currentTime + expiresIn // Add duration to current time

  queryClient.setQueryData(queryKeys.session(), {
    token,
    email,
    expiresAt: expirationTime, // Store the actual expiration timestamp
  })
}

const getSession = () => {
  return queryClient.getQueryData<
    { token: string; email: string; expiresAt: number } | undefined
  >(queryKeys.session())
}

const clearSession = async () => {
  try {
    // Call logout API endpoint to invalidate session server-side
    await apiClient.doLogout()
  } catch (error) {
    // Log error but continue with local cleanup
    console.error('Failed to logout on server:', error)
  } finally {
    // Always clear local session data
    queryClient.setQueryData(queryKeys.session(), null)
    // Redirect to login page
    window.location.href = '/login'
  }
}

export default { setSession, getSession, clearSession }
