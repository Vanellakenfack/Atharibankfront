// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// Liste des clés de session métier à conserver
const BUSINESS_SESSION_KEYS = [
  // Agence
  'session_agence_id',
  'jour_comptable_id',
  'date_comptable',
  'agence_id',
  
  // Guichet
  'guichet_session_id',
  'guichet_id',
  'code_guichet',
  
  // Caisse
  'caisse_session_id',
  'caisse_id',
  'code_caisse',
  'solde_caisse'
];

// Liste des clés d'authentification à supprimer
const AUTH_KEYS = [
  'authToken',
  'authUser',
  'user_id',
  'user_name',
  'user_role',
  'permissions'
];

export const AuthProvider = ({ children }) => {
  // Initialisation directe depuis le localStorage
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
      // Vérifier si le token est toujours valide côté serveur
      // ApiClient.get('/user').catch(() => logout());
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    // 1. Sauvegarder les sessions métier AVANT de nettoyer
    const businessSessions = {};
    
    BUSINESS_SESSION_KEYS.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        businessSessions[key] = value;
      }
    });
    
    // 2. Nettoyer TOUT le localStorage
    localStorage.clear();
    
    // 3. Réinsérer UNIQUEMENT les sessions métier
    Object.entries(businessSessions).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
    
    // 4. Mettre à jour l'état React
    setIsAuthenticated(false);
    setUser(null);
    
    // 5. Log pour débogage
    console.log('✅ Déconnexion réussie. Sessions métier conservées:', businessSessions);
    
    // 6. Redirection
    window.location.href = "/login";
  };

  // Fonction utilitaire pour vérifier si des sessions sont actives
  const getActiveSessions = () => {
    return {
      agence: {
        isOpen: !!localStorage.getItem('session_agence_id'),
        id: localStorage.getItem('session_agence_id'),
        date: localStorage.getItem('date_comptable')
      },
      guichet: {
        isOpen: !!localStorage.getItem('guichet_session_id'),
        id: localStorage.getItem('guichet_session_id'),
        code: localStorage.getItem('code_guichet')
      },
      caisse: {
        isOpen: !!localStorage.getItem('caisse_session_id'),
        id: localStorage.getItem('caisse_session_id'),
        code: localStorage.getItem('code_caisse')
      }
    };
  };

  // Fonction pour forcer la fermeture de toutes les sessions
  const forceCloseAllSessions = () => {
    BUSINESS_SESSION_KEYS.forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('✅ Toutes les sessions métier fermées');
    return getActiveSessions();
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      loading,
      getActiveSessions,
      forceCloseAllSessions
    }}>
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