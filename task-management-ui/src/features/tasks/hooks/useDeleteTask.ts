import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient from '@/api/apiClient'

const useDeleteTask = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => apiClient.doDeleteTask(taskId),
    onSuccess: () => {
      // Invalidate and refetch tasks query to remove the deleted task
      queryClient.invalidateQueries({
        queryKey: ['tasks']
      })

      // Show success toast
      toast.success('Task deleted successfully')
    },
    onError: () => {
      // Show error toast
      toast.error('Failed to delete task')
    },
  })
}

export default useDeleteTask