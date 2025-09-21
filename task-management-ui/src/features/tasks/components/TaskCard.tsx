import {
  MoreVertical,
  Calendar,
  Edit2,
  Trash2,
  CheckCircle,
  Circle,
  Clock,
} from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Task } from '@/types/api'

interface TaskCardProps {
  task: Task
  onToggleComplete: (taskId: string) => void
  onUpdate: (taskId: string) => void
  onDelete: (taskId: string) => void
}

function TaskCard({
  task,
  onToggleComplete,
  onUpdate,
  onDelete,
}: TaskCardProps) {
  const isOverdue =
    new Date(task.dueDate) < new Date() && task.status === 'open'
  const isCompleted = task.status === 'closed'

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatUpdatedDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = () => {
    if (isCompleted) {
      return <Badge variant="secondary">Completed</Badge>
    }

    return <Badge>Open</Badge>
  }

  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-start gap-3 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleComplete(task.id)}
            className="mt-1 h-6 w-6 p-0 hover:cursor-pointer"
            data-testid="toggle-status-button"
          >
            {isCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-600" data-testid="check-circle-icon" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400" data-testid="circle-icon" />
            )}
          </Button>
          <div className="flex-1 min-w-0">
            <h3
              className={`font-medium line-clamp-2 leading-tight ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}
            >
              {task.title}
            </h3>
            <p
              className={`text-sm mt-2 line-clamp-2 leading-relaxed ${isCompleted ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}
            >
              {task.description}
            </p>
          </div>
        </div>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="more-actions-button">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[160px] bg-white rounded-md border border-gray-200 shadow-lg p-1 z-50"
              align="end"
              sideOffset={4}
            >
              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-sm outline-none"
                onClick={() => onUpdate(task.id)}
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </DropdownMenu.Item>

              <DropdownMenu.Item
                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-red-50 hover:text-red-600 rounded-sm outline-none"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span
              className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}
            >
              {formatDate(task.dueDate)}
            </span>
          </div>
          {isOverdue && <Badge variant="destructive">Overdue</Badge>}
        </div>

        <div className="mt-3 flex items-center justify-between">
          {getStatusBadge()}
          <div className="flex items-center">
            <Clock className="h-3 w-3 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">
              Updated {formatUpdatedDate(task.updatedAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TaskCard
