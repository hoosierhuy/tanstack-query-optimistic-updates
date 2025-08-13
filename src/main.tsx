// Libraries
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Local imports
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')

const queryClient = new QueryClient()

if (rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <ReactQueryDevtools />
                <ReactQueryDevtools initialIsOpen={false} />
                <App />
            </QueryClientProvider>
        </StrictMode>,
    )
} else {
    console.error('Root element not found')
}
