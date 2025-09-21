import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/apiClient'
import type { UpdateTaskRequest } from '@/types/api'

interface UpdateTaskParams {
  taskId: string
  taskData: UpdateTaskRequest
}

const useUpdateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ taskId, taskData }: UpdateTaskParams) =>
      apiClient.doUpdateTask(taskId, taskData),
    onSuccess: () => {
      // Invalidate and refetch tasks query to show the updated task
      queryClient.invalidateQueries({
        queryKey: ['tasks']
      })
    },
  })
}

export default useUpdateTask