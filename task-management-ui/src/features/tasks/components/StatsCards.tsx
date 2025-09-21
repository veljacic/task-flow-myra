import { Card, CardContent } from '@/components/ui/card'
import useTasks from '../hooks/useTasks'
import { useMemo } from 'react'

function StatsCards() {
  const { stats, isLoading, error } = useTasks()

  if (error) {
    return null // Fail silently for stats cards
  }

  const cardData = useMemo(
    () => [
      {
        title: 'Total',
        value: stats.total,
        color: '',
      },
      {
        title: 'Open',
        value: stats.open,
        color: 'text-blue-600',
      },
      {
        title: 'Completed',
        value: stats.closed,
        color: 'text-green-600',
      },
      {
        title: 'Overdue',
        value: stats.overdue,
        color: 'text-red-600',
      },
    ],
    [stats]
  )

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-6">
      {cardData.map(({ title, value, color }) => (
        <Card key={title} className="p-2 sm:p-4">
          <CardContent className="p-0 text-center">
            <div className={`text-lg sm:text-2xl font-bold ${color}`}>
              {isLoading ? '...' : value}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground truncate">
              {title}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default StatsCards
