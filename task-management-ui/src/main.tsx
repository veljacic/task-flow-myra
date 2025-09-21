import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AppProviders } from './app/providers'
import { AppRouter } from './app/router'
import GlobalErrorBoundary from './components/GlobalErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </GlobalErrorBoundary>
  </StrictMode>
)
