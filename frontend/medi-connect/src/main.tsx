import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './utils/authContext'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { SystemSettingsProvider } from './context/SystemSettingsContext.tsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SystemSettingsProvider>
          <App />
        </SystemSettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode >,
)
