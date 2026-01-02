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
  solde: string | number;
  solde_disponible?: number;
  solde_bloque?: number;
  devise: string;
  statut: string;
  created_at: string;
  updated_at: string;
  date_ouverture: string;
  date_cloture: string | null;
  type_compte: {
    id: number;
    code: string;
    libelle: string;
    description: string;
    a_vue: number;
  };
  client: {
    id: number;
    num_client: string;
    nom: string;
    prenom: string;
    email?: string;
    telephone: string;
    type_client: string;
  };
  plan_comptable?: {
    id: number;
    code: string;
    libelle: string;
    categorie_id?: number;
    nature_solde?: string;
  };
  gestionnaire_nom?: string;
  gestionnaire_prenom?: string;
  gestionnaire_code?: string;
  notice_acceptee?: boolean;
  date_acceptation_notice?: string;
  signature_path?: string;
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
              value={typeof compte.solde === 'number' 
                ? compte.solde.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : parseFloat(compte.solde).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              label="Numéro client"
              value={compte.client?.num_client || 'Non spécifié'}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Type de client"
              value={compte.client?.type_client ? compte.client.type_client.charAt(0).toUpperCase() + compte.client.type_client.slice(1) : 'Non spécifié'}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Nom"
              value={compte.client?.nom || 'Non spécifié'}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Prénom"
              value={compte.client?.prenom || 'Non spécifié'}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Email"
              value={compte.client?.email || 'Non spécifié'}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Téléphone"
              value={compte.client?.telephone || 'Non spécifié'}
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
              label="Date d'ouverture"
              value={compte.date_ouverture ? formatDate(compte.date_ouverture) : 'Non spécifiée'}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Date de clôture"
              value={compte.date_cloture ? formatDate(compte.date_cloture) : 'Non clôturé'}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Gestionnaire"
              value={compte.gestionnaire_nom && compte.gestionnaire_prenom 
                ? `${compte.gestionnaire_prenom} ${compte.gestionnaire_nom} (${compte.gestionnaire_code || 'N/A'})` 
                : 'Non spécifié'}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              label="Notice acceptée"
              value={compte.notice_acceptee ? 'Oui' : 'Non'}
              fullWidth
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
            />
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
