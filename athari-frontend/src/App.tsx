import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import fr from 'date-fns/locale/fr';

import AppRoutes from './routes/AppRoutes'
import { QueryProvider } from './providers/QueryProvider'
import { AuthProvider } from "./context/AuthContext";

// Thème MUI avec corrections pour l'accessibilité
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiDialog: {
      defaultProps: {
        disablePortal: false,
        keepMounted: false,
      },
    },
    MuiModal: {
      defaultProps: {
        // Important pour éviter les problèmes aria-hidden
        disablePortal: true,
      },
    },
    MuiIconButton: {
      defaultProps: {
        // Ajouter des labels d'accessibilité par défaut
        'aria-label': 'button',
      },
    },
  },
});

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <QueryProvider>
            <AppRoutes /> 
          </QueryProvider>
        </AuthProvider>
      </ThemeProvider>
    </LocalizationProvider>
  )
}

export default App