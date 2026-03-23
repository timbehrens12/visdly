import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CombinedProvider } from './contexts/CombinedContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CombinedProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </CombinedProvider>
  </StrictMode>,
)
