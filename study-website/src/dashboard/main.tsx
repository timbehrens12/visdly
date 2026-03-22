import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './dashboard.css'
import { DashboardApp } from './DashboardApp'
import { ClerkAuthProvider } from '../lib/clerk'
import { ProfileProvider } from '../contexts/ProfileContext'
import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from '../contexts/ThemeContext'

// Ensure root element exists
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <ClerkAuthProvider>
      <ProfileProvider>
        <ThemeProvider>
          <Router basename="/dashboard">
            <DashboardApp />
          </Router>
        </ThemeProvider>
      </ProfileProvider>
    </ClerkAuthProvider>
  </StrictMode>,
)
