import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useCreateTask from '../hooks/useCreateTask'
import useUpdateTask from '../hooks/useUpdateTask'
import type { Task } from '@/types/api'
import { getISODate } from '@/utils/dateUtils'
import { toast } from 'sonner'

// Form validation schema
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  status: z.enum(['open', 'closed'] as const),
  dueDate: z
    .string()
    .min(1, 'Due date is required')
    .refine((dateString) => {
      const selectedDate = new Date(dateString)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate >= today
    }, 'Due date cannot be in the past'),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskDialogProps {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  task?: Task
}

function TaskDialog({ isOpen, onClose, mode, task }: TaskDialogProps) {
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'open',
      dueDate: getISODate(new Date()),
    },
  })

  const isLoading = createTaskMutation.isPending || updateTaskMutation.isPending

  // Reset form when dialog opens or task changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && task) {
        reset({
          title: task.title,
          description: task.description,
          status: task.status,
          dueDate: getISODate(new Date(task.dueDate)),
        })
      } else {
        reset({
          title: '',
          description: '',
          status: 'open',
          dueDate: getISODate(new Date()),
        })
      }
    }
  }, [isOpen, mode, task, reset])

  const onSubmit = async (data: TaskFormData) => {
    try {
      const taskData = {
        title: data.title.trim(),
        description: data.description.trim(),
        due_date: data.dueDate,
        status: data.status,
      }

      if (mode === 'edit' && task) {
        await updateTaskMutation.mutateAsync({
          taskId: task.id,
          taskData,
        })
      } else {
        await createTaskMutation.mutateAsync(taskData)
      }

      onClose()
    } catch (error) {
      toast.error(`Failed to ${mode} task. Please try again.`)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md z-50 shadow-lg">
          <Dialog.Title className="text-lg font-semibold mb-4">
            {mode === 'edit' ? 'Edit Task' : 'Add New Task'}
          </Dialog.Title>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="title" className="mb-2">
                Title
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter task title..."
                {...register('title')}
                className={errors.title ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="mb-2">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter task description..."
                {...register('description')}
                className={errors.description ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="status" className="mb-2">
                  Status
                </Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={mode === 'create' || isLoading}
                    >
                      <SelectTrigger
                        className={`w-full ${errors.status ? 'border-destructive' : ''}`}
                      >
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="closed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.status.message}
                  </p>
                )}
              </div>

              <div className="flex-1">
                <Label htmlFor="dueDate" className="mb-2">
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  {...register('dueDate')}
                  className={errors.dueDate ? 'border-destructive' : ''}
                  disabled={isLoading}
                />
                {errors.dueDate && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.dueDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? mode === 'edit'
                    ? 'Updating...'
                    : 'Adding...'
                  : mode === 'edit'
                    ? 'Update Task'
                    : 'Add Task'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default TaskDialog
