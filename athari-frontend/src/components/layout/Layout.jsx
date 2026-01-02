import React, { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box
      className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      sx={{ display: 'flex', height: '100vh', bgcolor: '#F8FAFC', overflow: 'hidden' }}
    >
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
          width: `calc(100% - ${sidebarOpen ? '280px' : '80px'})`,
          transition: 'all 0.3s ease',
          minWidth: 0, // Évite les bugs de débordement Flexbox
          overflow: 'hidden'
        }}
      >
        <TopBar sidebarOpen={sidebarOpen} />
        
        {/* Ici s'affichera le contenu de vos pages */}
        <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}