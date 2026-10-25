import '@fontsource-variable/inter'
import '@fontsource-variable/plus-jakarta-sans'
import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App'

const container = document.getElementById('root')

if (!container) {
  throw new Error('The root element was not found.')
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
