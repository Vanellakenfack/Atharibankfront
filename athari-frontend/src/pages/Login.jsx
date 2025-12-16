import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiClient from "../services/api/ApiClient"; 
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import logo from "../assets/img/logo.png";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);

  // Mise à jour de l'état lors de la saisie
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
  };

  // Logique de connexion 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const deviceName = 'Web Client';

    try {
      const response = await ApiClient.post('/login', {
        email: formData.email,
        password: formData.password,
        device_name: deviceName
      });

      console.log('Réponse API:', response.data); // DEBUG: vérifier la structure

        // ADAPTEZ selon votre API :
      const authToken = response.data.authToken || response.data.token;
      const user = response.data.user;
        
      if (!authToken || !user) {
          throw new Error('Token ou utilisateur manquant dans la réponse');
      }
      
      login(authToken, user);
      navigate('/dashboard', { replace: true });

    } catch (err) {
      console.error('Erreur de connexion:', err);
      
      const errorData = err.response?.data;
      
      if (errorData?.errors?.email) {
        setError(errorData.errors.email[0]); 
      } else if (errorData?.errors?.password) {
        setError(errorData.errors.password[0]);
      } else if (errorData?.message) {
        setError(errorData.message);
      } else if (err.message === 'Network Error') {
        setError('Erreur de connexion au serveur. Vérifiez votre connexion internet.');
      } else {
        setError('Une erreur inattendue est survenue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(to right, #6a11cb, #2575fc)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        zIndex: 1,
      }}
    >
      {/* Bulles animées */}
      <div className="financial-bubbles">
        <div className="bubble">$</div>
        <div className="bubble">€</div>
        <div className="bubble">FCFA</div>
        <div className="bubble">£</div>
      </div>

      <Card
        component='form'
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 430,
          borderRadius: "20px",
          boxShadow: 5,
          backdropFilter: "blur(20px)",
          background: "rgba(255,255,255,0.9)",
          position: "relative",
          zIndex: 10,
          mx: 2,
        }}
      >
        <CardContent sx={{ textAlign: "center", p: 4 }}>
          {/* Logo */}
          <Box sx={{ mb: 2, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img
              src={logo}
              alt="Logo"
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                border: "3px solid white",
                objectFit: "cover",
                display: "block",
              }}
            />
          </Box>

          <Typography variant="h5" color="primary" gutterBottom fontWeight={600}>
            Connexion
          </Typography>

          <Typography sx={{ color: "text.secondary", mb: 3 }}>
            Accédez à votre espace sécurisé
          </Typography>

          {/* Affichage de l'erreur */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            margin="normal"
            label="Adresse Email"
            type="email"
            name="email"
            placeholder="exemple@atharibank.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            autoComplete="email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="secondary" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Mot de passe"
            type="password"
            name="password"
            placeholder="Votre mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
            autoComplete="current-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon color="secondary" />
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !formData.email || !formData.password}
            sx={{
              mt: 3,
              py: 1.3,
              fontWeight: 600,
              position: 'relative',
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                Connexion en cours...
              </>
            ) : (
              "Se connecter"
            )}
          </Button>

          <Button
            href="/"
            variant="text"
            color="secondary"
            disabled={loading}
            startIcon={<span>{"←"}</span>}
            sx={{ mt: 2 }}
          >
            Retour à l'accueil
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}