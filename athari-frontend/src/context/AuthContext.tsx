// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

// CORRECTION SUGGÉRÉE :
useEffect(() => {
  const initAuth = async () => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");
    
    if (token) {
      // AMÉLIORATION : Vérifier la validité du token avec l'API
      try {
        // Optionnel : valider le token côté serveur
        setIsAuthenticated(true);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        // Token invalide, nettoyer
        logout();
      }
    }
    setLoading(false);
  };
  
  initAuth();
}, []);

  const login = (token, userData) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};