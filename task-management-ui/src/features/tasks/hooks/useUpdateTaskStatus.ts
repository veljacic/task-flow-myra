import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/apiClient'
import type { TaskStatus } from '@/types/api'

interface UpdateTaskStatusParams {
  taskId: string
  status: TaskStatus
}

const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, status }: UpdateTaskStatusParams) =>
      apiClient.doUpdateTaskStatus(taskId, { status }),
    onSuccess: () => {
      // Invalidate and refetch tasks query to show the updated task
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
      })
    },
  })
}

export default useUpdateTaskStatus
