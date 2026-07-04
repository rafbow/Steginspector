import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'hsl(217 25% 10%)',
          color: 'hsl(210 30% 92%)',
          border: '1px solid hsl(220 18% 20%)',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          borderRadius: '10px',
        },
        success: { iconTheme: { primary: '#00d9ff', secondary: 'hsl(215 28% 7%)' } },
        error:   { iconTheme: { primary: '#ff3366', secondary: 'hsl(215 28% 7%)' } },
      }}
    />
  </BrowserRouter>
)
