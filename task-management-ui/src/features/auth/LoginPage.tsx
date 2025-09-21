import AuthForm from './components/AuthForm'

function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Column - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-muted/50 dark:bg-muted/20 flex-col justify-center px-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-6">
            MYRA Security
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Task Management Platform
          </p>
          <div className="space-y-4 text-muted-foreground">
            <p className="flex items-center">
              <span className="w-2 h-2 bg-primary rounded-full mr-3" />
              Streamline your workflow
            </p>
            <p className="flex items-center">
              <span className="w-2 h-2 bg-primary rounded-full mr-3" />
              Secure task collaboration
            </p>
            <p className="flex items-center">
              <span className="w-2 h-2 bg-primary rounded-full mr-3" />
              Real-time progress tracking
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Auth Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-background">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    </div>
  )
}

export default LoginPage
