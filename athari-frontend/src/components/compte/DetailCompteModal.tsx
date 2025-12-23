import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Divider,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface Compte {
  id: number;
  numero_compte: string;
  solde: number;
  solde_disponible: number;
  solde_bloque: number;
  devise: string;
  statut: string;
  created_at: string;
  updated_at: string;
  type_compte: {
    libelle: string;
    description: string;
  };
  client: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
  };
  plan_comptable?: {
    code: string;
    libelle: string;
  };
}

interface DetailCompteModalProps {
  open: boolean;
  onClose: () => void;
  compte: Compte | null;
}

const DetailCompteModal: React.FC<DetailCompteModalProps> = ({ open, onClose, compte }) => {
  if (!compte) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Détails du compte</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Informations générales
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
            <TextField
              label="Numéro de compte"
              value={compte.numero_compte}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Type de compte"
              value={compte.type_compte?.libelle || 'Non spécifié'}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Solde"
              value={compte.solde.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Solde disponible"
              value={compte.solde_disponible?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Devise"
              value={compte.devise}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Statut"
              value={compte.statut}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            {compte.plan_comptable && (
              <TextField
                label="Plan comptable"
                value={`${compte.plan_comptable.code} - ${compte.plan_comptable.libelle}`}
                fullWidth
                margin="normal"
                InputProps={{
                  readOnly: true,
                }}
              />
            )}
          </Box>
        </Box>

        <Box mb={3}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Informations client
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
            <TextField
              label="Nom"
              value={compte.client.nom}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Prénom"
              value={compte.client.prenom}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Email"
              value={compte.client.email || 'Non spécifié'}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Téléphone"
              value={compte.client.telephone || 'Non spécifié'}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Historique
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
            <TextField
              label="Date de création"
              value={formatDate(compte.created_at)}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Dernière mise à jour"
              value={formatDate(compte.updated_at)}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
              onClick={onClose} 
              sx={{
                  background: 'linear-gradient(135deg, #2b56e2e7 0%, #110ddeff 100%)',
                  borderRadius: '50px',
                  padding: '10px 30px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  color: '#ffff',
                  '&.Mui-disabled': {
                    background: '#e0e0e0',
                    color: '#ffff',
                    boxShadow: 'none'
                  }
              }}
                variant="outlined">
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DetailCompteModal;
