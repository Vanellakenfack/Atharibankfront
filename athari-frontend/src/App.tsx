import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from "./context/AuthContext";

function App() {

  return (
    <AuthProvider>
      <Router>
        <AppRoutes />  {/* AppRoutes gère ses propres Routes */}
      </Router>
    </AuthProvider>
  )
}

export default App