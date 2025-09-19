import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

//https://aws-us-east-2-1.rag.progress.cloud/api/v1/kb/739e03a5-97e5-4ead-86ac-1c55c3ee6ede