import React from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { Box, Card, Button, Typography, IconButton, Stack } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon } from '@mui/icons-material';
import MouvementRubriqueMataList from '../components/frais/MouvementRubriqueMataList';
import RecapitulatifMata from '../components/frais/RecapitulatifMata';

const MataManagementPage: React.FC = () => {
  const { compteId } = useParams<{ compteId: string }>();
  const navigate = useNavigate();

  const renderRoutes = () => (
    <Routes>
      <Route 
        path="/" 
        element={
          <Card sx={{ p: 2 }}>
            {compteId ? (
              <>
                <RecapitulatifMata compteId={compteId} />
                <Box sx={{ mt: 2 }}>
                  <MouvementRubriqueMataList compteId={compteId} />
                </Box>
              </>
            ) : (
              <Box>
                <Typography variant="h4" sx={{ mb: 2 }}>
                  Sélectionnez un compte MATA
                </Typography>
                <Typography variant="body1">
                  Veuillez sélectionner un compte pour gérer ses opérations MATA.
                </Typography>
              </Box>
            )}
          </Card>
        } 
      />
      <Route path=":compteId" element={<RecapitulatifMata />} />
      <Route path=":compteId/mouvements" element={<MouvementRubriqueMataList />} />
    </Routes>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{ mr: 1 }}
            color="inherit"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            Gestion des MATA
          </Typography>
        </Box>
        
        {compteId && (
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            alignItems="center"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Typography variant="subtitle1" color="text.secondary">
              Compte: {compteId}
            </Typography>
            <Button 
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/comptes/${compteId}/mata/ajouter`)}
              fullWidth={!compteId}
            >
              Ajouter un MATA
            </Button>
            <Button 
              variant="outlined"
              onClick={() => navigate(`/comptes/${compteId}/mouvements-mata`)}
              fullWidth={!compteId}
            >
              Voir tous les mouvements
            </Button>
          </Stack>
        )}
      </Box>
      
      <Box sx={{ p: { xs: 0, sm: 2 } }}>
        {renderRoutes()}
      </Box>
    </Box>
  );
};

export default MataManagementPage;
