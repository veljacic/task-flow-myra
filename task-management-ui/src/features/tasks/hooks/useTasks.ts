import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/apiClient'
import queryKeys from '@/lib/queryKeys'
import { useSession } from '@/features/auth/hooks/useSession'
import type { Task, TasksResponse } from '@/types/api'

interface UseTasksOptions {
  page?: number
  limit?: number
  status?: string
  search?: string
  dateFilter?: string
}

interface UseTasksReturn {
  tasks: Task[]
  pagination: TasksResponse['meta']['pagination'] | undefined
  stats: TasksResponse['meta']['stats']
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

const useTasks = ({
  page = 1,
  limit = 10,
  status = 'all',
  search = '',
  dateFilter = 'all',
}: UseTasksOptions = {}): UseTasksReturn => {
  const session = useSession()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.tasks(page, limit, status, search, dateFilter),
    queryFn: (): Promise<TasksResponse> => {
      return apiClient.doFetchTasks(page, limit, status, search, dateFilter)
    },
    enabled: !!session?.token, // Only run query if token exists
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })

  // Transform JSON:API format to simple task objects
  const tasks: Task[] =
    data?.data.map((taskData) => ({
      id: taskData.id,
      ...taskData.attributes,
    })) || []

  return {
    tasks,
    pagination: data?.meta.pagination,
    stats: data?.meta.stats || { total: 0, open: 0, closed: 0, overdue: 0 },
    isLoading,
    error,
    refetch,
  }
}

export default useTasks
