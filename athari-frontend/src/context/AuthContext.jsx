// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import ApiClient from "../services/api/ApiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialisation directe depuis le localStorage pour éviter un flash d'état
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem("authToken"));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("authUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
      // Optionnel : Tu pourrais ici appeler ApiClient.get('/user')
      // pour vérifier si le token est toujours valide côté serveur
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  }, []);

  const hasPermission = (permissionName) => {
    if (!user || !user.abilities) return false;
    return user.abilities.includes(permissionName) || user.abilities.includes('*');
  };

  const login = (token, userData, refreshToken = null) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", JSON.stringify(userData)); // Sauvegarde l'user
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
    setIsAuthenticated(true);
    setUser(userData);
  };

  const refreshToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      logout();
      return false;
    }
    try {
      const response = await ApiClient.post('/auth/refresh', { refreshToken });
      const newToken = response.data.token;
      const newUser = response.data.user;
      localStorage.setItem("authToken", newToken);
      localStorage.setItem("authUser", JSON.stringify(newUser));
      setUser(newUser);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  const logout = async () => {
    try {
      await ApiClient.post('/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    localStorage.clear(); // Nettoie tout pour éviter les résidus
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = "/login"; // Force la redirection
  };

  const getCurrentUser = async () => {
    try {
      const response = await ApiClient.get('/me');
      const userData = response.data;
      setUser(userData);
      localStorage.setItem("authUser", JSON.stringify(userData));
      return userData;
    } catch (error) {
      console.error('Get current user failed:', error);
      if (error.response?.status === 401) {
        await refreshToken();
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, refreshToken, getCurrentUser, loading, hasPermission }}>
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

export default AuthContext;
