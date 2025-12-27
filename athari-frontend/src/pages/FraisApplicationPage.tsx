import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Card, Typography } from '@mui/material';
import FraisApplicationList from '../components/frais/FraisApplicationList';

const FraisApplicationPage: React.FC = () => {
  return (
    <Box>
        <Routes>
          <Route path="/" element={<FraisApplicationList />} />
          {/* Ajoutez d'autres routes si nécessaire, par exemple pour les détails d'un frais spécifique */}
        </Routes>
    </Box>
  );
};

export default FraisApplicationPage;
