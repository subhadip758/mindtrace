import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppContent } from './App'
import { AuthProvider } from './context/AuthContext'
import { SystemProvider } from './context/SystemContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <SystemProvider>
        <AppContent />
      </SystemProvider>
    </AuthProvider>
  </React.StrictMode>,
)
