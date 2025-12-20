import React, { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Sidebar fixe */}
      
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Zone de droite (TopBar + Page) */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          // Ajustement dynamique de la largeur
          width: `calc(100% - ${sidebarOpen ? '260px' : '80px'})`,
          transition: 'all 0.3s ease',
          minWidth: 0 // Évite les bugs de débordement Flexbox
        }}
      >
        <TopBar sidebarOpen={sidebarOpen} />
        
        {/* Ici s'affichera le contenu de vos pages */}
        <Box sx={{ flexGrow: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}