// examples/three-tier-demo/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { VoiceThemeProvider } from '../../../packages/react/src/hooks/useVoiceTheme'

ReactDOM.createRoot(document.getElementById('root')!).render(
 <React.StrictMode>
   <VoiceThemeProvider>
     <App />
   </VoiceThemeProvider>
 </React.StrictMode>,
)