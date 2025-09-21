import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-muted-foreground">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground max-w-md">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <Button asChild>
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFound
