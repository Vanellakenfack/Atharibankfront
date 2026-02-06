import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import creditService from '../../services/creditService';
import AvisDetailComponent from './AvisDetailComponent';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
}));

const AvisListComponent = ({ creditApplicationId }) => {
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAvis, setSelectedAvis] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    if (creditApplicationId) {
      loadAvis();
    }
  }, [creditApplicationId]);

  const loadAvis = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await creditService.getAvisFlash(creditApplicationId);

      if (response.success) {
        // Sort avis by creation date (newest first)
        const sortedAvis = response.data.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setAvis(sortedAvis);
      } else {
        setError(response.error || 'Erreur lors du chargement des avis');
        setAvis([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des avis:', err);
      setError('Erreur lors du chargement des avis');
      setAvis([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (avis) => {
    setSelectedAvis(avis);
    setDetailDialogOpen(true);
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'AC': 'Agent de Crédit',
      'CA': 'Chef d\'Agence',
      'ASC': 'Assistant Comptable',
      'COMITE': 'Comité d\'Agence',
      'analyste': 'Analyste de Crédit',
      'chef_agence': 'Chef d\'Agence',
      'comptable': 'Assistant Comptable',
      'comite': 'Membre du Comité',
      'juridique': 'Assistant Juridique'
    };
    return roleNames[role] || role;
  };

  const getLevelDisplayName = (niveauAvis) => {
    const levelNames = {
      'CA': 'Chef d\'Agence',
      'ASC': 'Assistant Comptable',
      'COMITE': 'Comité d\'Agence'
    };
    return levelNames[niveauAvis] || niveauAvis;
  };

  const getOpinionColor = (opinion) => {
    switch (opinion) {
      case 'FAVORABLE':
        return 'success';
      case 'DEFAVORABLE':
        return 'error';
      case 'RESERVE':
        return 'warning';
      case 'approuver':
        return 'success';
      case 'rejeter':
        return 'error';
      default:
        return 'default';
    }
  };

  const getOpinionIcon = (opinion) => {
    switch (opinion) {
      case 'FAVORABLE':
        return <CheckCircleIcon />;
      case 'DEFAVORABLE':
        return <CancelIcon />;
      case 'RESERVE':
        return <WarningIcon />;
      case 'approuver':
        return <CheckCircleIcon />;
      case 'rejeter':
        return <CancelIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getOpinionLabel = (opinion) => {
    switch (opinion) {
      case 'FAVORABLE':
        return 'Favorable';
      case 'DEFAVORABLE':
        return 'Défavorable';
      case 'RESERVE':
        return 'Réserve';
      case 'approuver':
        return 'Approuvé';
      case 'rejeter':
        return 'Rejeté';
      default:
        return opinion;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <StyledPaper elevation={2}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Chargement des avis...
          </Typography>
        </Box>
      </StyledPaper>
    );
  }

  if (error) {
    return (
      <StyledPaper elevation={2}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={loadAvis} variant="outlined" size="small">
          Réessayer
        </Button>
      </StyledPaper>
    );
  }

  return (
    <>
      <StyledPaper elevation={2}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon />
          Avis ({avis.length})
        </Typography>

        {avis.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
            Aucun avis disponible pour cette demande de crédit.
          </Typography>
        ) : (
          <List sx={{ width: '100%' }}>
            {avis.map((avisItem, index) => (
              <React.Fragment key={avisItem.id || index}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getOpinionColor(avisItem.opinion) + '.main' }}>
                      {getOpinionIcon(avisItem.opinion)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {getRoleDisplayName(avisItem.role)}
                          </Typography>
                          <Chip
                            label={avisItem.opinion === 'approuver' ? 'Approuvé' : 'Rejeté'}
                            color={getOpinionColor(avisItem.opinion)}
                            size="small"
                            icon={getOpinionIcon(avisItem.opinion)}
                          />
                        </Box>
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDetail(avisItem)}
                          sx={{ ml: 1 }}
                        >
                          Détails
                        </Button>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          Par {avisItem.user?.name || 'Utilisateur inconnu'} • {formatDate(avisItem.created_at)}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {avisItem.commentaire || 'Aucun commentaire'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < avis.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </StyledPaper>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Détails de l'Avis
        </DialogTitle>
        <DialogContent>
          <AvisDetailComponent avis={selectedAvis} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AvisListComponent;
