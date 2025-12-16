// src/main.jsx - Modification pour désactiver le double rendu
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { StrictMode } from 'react';
import { AuthProvider } from  './context/AuthContext.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(

  <StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* 👈 Tu enveloppes ton App ici */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)

