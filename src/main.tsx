import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/app/styles/global.css'
import '@/shared/i18n/config'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
