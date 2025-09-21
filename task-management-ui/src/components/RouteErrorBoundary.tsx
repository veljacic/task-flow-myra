import { useRouteError, isRouteErrorResponse } from 'react-router-dom'
import ErrorFallback from './ErrorFallback'

const RouteErrorBoundary = () => {
  const error = useRouteError()

  let errorMessage = 'An unexpected error occurred'

  if (isRouteErrorResponse(error)) {
    errorMessage = `${error.status} ${error.statusText}`
  } else if (error instanceof Error) {
    errorMessage = error.message
  } else if (typeof error === 'string') {
    errorMessage = error
  }

  const errorObject = new Error(errorMessage)

  return <ErrorFallback error={errorObject} />
}

export default RouteErrorBoundary
