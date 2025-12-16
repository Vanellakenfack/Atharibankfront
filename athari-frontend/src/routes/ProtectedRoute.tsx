import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CircularProgress, Box } from "@mui/material"; // Ajout

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth(); // AJOUT de loading
  const location = useLocation();

  // AMÉLIORATION : Afficher un loader pendant la vérification
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  return <Outlet />;
}