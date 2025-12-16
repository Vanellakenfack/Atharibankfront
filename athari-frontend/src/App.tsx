import React from 'react'
// On retire l'import de BrowserRouter ici car il doit être dans main.jsx
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
       <AppRoutes /> 
    </AuthProvider>
  )
}

export default App