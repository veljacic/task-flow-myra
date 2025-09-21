import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import TaskCard from './TaskCard'
import type { Task } from '@/types/api'

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'This is a test task description',
  status: 'open',
  dueDate: '2024-12-31',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
}

const mockProps = {
  task: mockTask,
  onToggleComplete: vi.fn(),
  onUpdate: vi.fn(),
  onDelete: vi.fn(),
}

describe('TaskCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders task information correctly', () => {
    render(<TaskCard {...mockProps} />)

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('This is a test task description')).toBeInTheDocument()
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('shows completed status for closed tasks', () => {
    const completedTask = { ...mockTask, status: 'closed' as const }
    render(<TaskCard {...mockProps} task={completedTask} />)

    expect(screen.getByText('Completed')).toBeInTheDocument()
    // Check for the CheckCircle icon by its SVG path
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument()
  })

  it('shows open status for open tasks', () => {
    render(<TaskCard {...mockProps} />)

    expect(screen.getByText('Open')).toBeInTheDocument()
    expect(screen.getByTestId('circle-icon')).toBeInTheDocument()
  })

  it('calls onToggleComplete when status button is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskCard {...mockProps} />)

    const statusButton = screen.getByTestId('toggle-status-button')
    await user.click(statusButton)

    expect(mockProps.onToggleComplete).toHaveBeenCalledWith('1')
  })

  it('shows overdue badge for overdue tasks', () => {
    const overdueTask = {
      ...mockTask,
      dueDate: '2020-01-01', // Past date
      status: 'open' as const,
    }
    render(<TaskCard {...mockProps} task={overdueTask} />)

    expect(screen.getByText('Overdue')).toBeInTheDocument()
  })

  it('opens dropdown menu and calls onUpdate when edit is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskCard {...mockProps} />)

    const moreButton = screen.getByTestId('more-actions-button')
    await user.click(moreButton)

    const editButton = screen.getByText('Edit')
    await user.click(editButton)

    expect(mockProps.onUpdate).toHaveBeenCalledWith('1')
  })

  it('opens dropdown menu and calls onDelete when delete is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskCard {...mockProps} />)

    const moreButton = screen.getByTestId('more-actions-button')
    await user.click(moreButton)

    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)

    expect(mockProps.onDelete).toHaveBeenCalledWith('1')
  })

  it('formats dates correctly', () => {
    render(<TaskCard {...mockProps} />)

    expect(screen.getByText('Dec 31, 2024')).toBeInTheDocument()
    expect(screen.getByText('Updated Jan 2')).toBeInTheDocument()
  })

  it('applies strikethrough styling for completed tasks', () => {
    const completedTask = { ...mockTask, status: 'closed' as const }
    render(<TaskCard {...mockProps} task={completedTask} />)

    const title = screen.getByText('Test Task')
    const description = screen.getByText('This is a test task description')

    expect(title).toHaveClass('line-through')
    expect(description).toHaveClass('line-through')
  })
})