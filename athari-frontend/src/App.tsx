import React from 'react'
// On retire l'import de BrowserRouter ici car il doit être dans main.jsx
import AppRoutes from './routes/AppRoutes'
import { QueryProvider } from './providers/QueryProvider'

import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <QueryProvider>
       <AppRoutes /> 
       </QueryProvider>
    </AuthProvider>
  )
}

export default App