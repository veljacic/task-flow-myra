// useSession.ts
import { useQuery } from '@tanstack/react-query'
import queryKeys from '@/lib/queryKeys'

interface Session {
  token: string
  email: string
  expiresAt: number
}

export function useSession() {
  const { data } = useQuery({
    queryKey: queryKeys.session(),
    queryFn: (): Promise<Session | null> =>
      new Promise((resolve) => resolve(null)), // No fetching function needed - data is set manually
    enabled: false, // Disable automatic fetching
    staleTime: Infinity, // Never consider stale
    gcTime: Infinity, // Never garbage collect
  })

  return data
}
