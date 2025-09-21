interface ErrorFallbackProps {
  error: Error
}

const ErrorFallback = ({ error }: ErrorFallbackProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card border rounded-lg p-6 text-center">
          <div className="text-destructive text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-card-foreground mb-2">
            Something went wrong
          </h1>
          <p className="text-muted-foreground mb-4">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <details className="text-left mb-4">
            <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
              Error details
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded font-medium"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorFallback
