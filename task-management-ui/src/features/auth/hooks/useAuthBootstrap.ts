import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/apiClient'
import queryKeys from '@/lib/queryKeys'

export function useAuthBootstrap() {
  return useQuery({
    queryKey: queryKeys.session(),
    queryFn: async () => {
      const response = await apiClient.doRefreshToken()

      const currentTime = Math.floor(Date.now() / 1000) // Current time in seconds
      const expirationTime = currentTime + response.expires_in

      return {
        token: response.access_token,
        email: response.user.email,
        expiresAt: expirationTime, // Store the actual expiration timestamp
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 0,
  })
}
