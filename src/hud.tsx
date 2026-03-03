import React from 'react'
import ReactDOM from 'react-dom/client'
import HudApp from './HudApp'
import './assets/main.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HudApp />
  </React.StrictMode>
)
