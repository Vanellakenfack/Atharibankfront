import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
}));

const AvisDetailComponent = ({ avis }) => {
  const getRoleDisplayName = (role) => {
    const roleNames = {
      'analyste': 'Analyste de Crédit',
      'chef_agence': 'Chef d\'Agence',
      'comptable': 'Assistant Comptable',
      'comite': 'Membre du Comité',
      'juridique': 'Assistant Juridique'
    };
    return roleNames[role] || role;
  };

  const getOpinionColor = (opinion) => {
    return opinion === 'approuver' ? 'success' : 'error';
  };

  const getOpinionIcon = (opinion) => {
    return opinion === 'approuver' ? <CheckCircleIcon /> : <CancelIcon />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!avis) {
    return (
      <StyledPaper elevation={2}>
        <Typography variant="body1" color="textSecondary">
          Aucun avis sélectionné.
        </Typography>
      </StyledPaper>
    );
  }

  return (
    <StyledPaper elevation={2}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon />
        Détails de l'Avis #{avis.id}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <ListItem sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getOpinionColor(avis.opinion) + '.main' }}>
                    {getOpinionIcon(avis.opinion)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="h6">
                        {getRoleDisplayName(avis.role)}
                      </Typography>
                      <Chip
                        label={avis.opinion === 'approuver' ? 'Approuvé' : 'Rejeté'}
                        color={getOpinionColor(avis.opinion)}
                        icon={getOpinionIcon(avis.opinion)}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="textSecondary">
                      Par {avis.user?.name || 'Utilisateur inconnu'}
                    </Typography>
                  }
                />
              </ListItem>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Commentaire
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                {avis.commentaire || 'Aucun commentaire'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Date de création:</strong>
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(avis.created_at)}
                  </Typography>
                </Grid>
                {avis.updated_at && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Dernière modification:</strong>
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(avis.updated_at)}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>ID de l'application:</strong>
                  </Typography>
                  <Typography variant="body1">
                    {avis.credit_application_id}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    <strong>ID Utilisateur:</strong>
                  </Typography>
                  <Typography variant="body1">
                    {avis.user_id}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </StyledPaper>
  );
};

export default AvisDetailComponent;
