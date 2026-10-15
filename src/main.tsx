import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { seedIfEmpty } from './db/seed'
import { restoreHandle } from './sync/folder'
import { applyPackage } from './sync/inbox'
import { db } from './db/db'

// ganchos para diagnóstico/testes automatizados
;(window as any).__studio = { applyPackage, db }

async function boot() {
  await seedIfEmpty()
  await restoreHandle().catch(() => {})
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
boot()
