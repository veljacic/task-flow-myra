import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/api/apiClient'
import type { CreateTaskRequest } from '@/types/api'

const useCreateTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskData: CreateTaskRequest) =>
      apiClient.doCreateTask(taskData),
    onSuccess: () => {
      // Invalidate and refetch tasks query to show the new task
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
      })
    },
  })
}

export default useCreateTask
