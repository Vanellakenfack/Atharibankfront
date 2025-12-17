import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  ButtonGroup
} from '@mui/material';
import {
  Visibility,
  Edit,
  Delete,
  Block,
  CheckCircle,
  Cancel,
  Gavel
} from '@mui/icons-material';

const statusColors = {
  active: 'success',
  inactive: 'default',
  blocked: 'warning',
  banned: 'error',
  pending: 'info'
};

const statusLabels = {
  active: 'Actif',
  inactive: 'Inactif',
  blocked: 'Bloqué',
  banned: 'Banni',
  pending: 'En attente'
};

const AccountList = ({
  accounts,
  loading,
  onEdit,
  onViewDetails,
  onStatusChange,
  onDelete,
  hasPermission
}) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <CircularProgress />
        <p>Chargement des comptes...</p>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <Alert severity="info">
        Aucun compte trouvé. Cliquez sur "Ouvrir un Nouveau Compte" pour en créer un.
      </Alert>
    );
  }

  const getAccountTypeLabel = (type, subType) => {
    const types = {
      'Courant': 'Compte Courant',
      'Épargne': `Épargne ${subType || ''}`,
      'Mata Boost': `Mata Boost ${subType || ''}`,
      'Collecte': `Collecte ${subType || ''}`
    };
    return types[type] || type;
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>N° Compte</TableCell>
            <TableCell>Client</TableCell>
            <TableCell>Type de Compte</TableCell>
            <TableCell>Solde</TableCell>
            <TableCell>Statut</TableCell>
            <TableCell>Date création</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell>
                <strong>{account.account_number}</strong>
              </TableCell>
              <TableCell>
                <div>
                  <strong>{account.client?.nom} {account.client?.prenom}</strong>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    {account.client?.cni} • {account.client?.telephone}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {getAccountTypeLabel(account.account_type, account.account_sub_type)}
              </TableCell>
              <TableCell>
                <strong>{new Intl.NumberFormat('fr-FR').format(account.balance || 0)} FCFA</strong>
              </TableCell>
              <TableCell>
                <Chip
                  label={statusLabels[account.status] || account.status}
                  color={statusColors[account.status] || 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {new Date(account.created_at).toLocaleDateString('fr-FR')}
              </TableCell>
              <TableCell>
                <ButtonGroup size="small" variant="outlined">
                  <Tooltip title="Voir détails">
                    <IconButton
                      size="small"
                      onClick={() => onViewDetails(account)}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  {hasPermission('gerer utilisateurs') && (
                    <Tooltip title="Modifier">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(account)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}

                  {hasPermission('supprimer compte') && (
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(account.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}

                  {hasPermission('gerer utilisateurs') && (
                    <>
                      <Tooltip title="Activer">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => onStatusChange(account.id, 'active')}
                          disabled={account.status === 'active'}
                        >
                          <CheckCircle fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Désactiver">
                        <IconButton
                          size="small"
                          color="default"
                          onClick={() => onStatusChange(account.id, 'inactive')}
                          disabled={account.status === 'inactive'}
                        >
                          <Cancel fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Bloquer">
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => onStatusChange(account.id, 'blocked')}
                          disabled={account.status === 'blocked'}
                        >
                          <Block fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Bannir">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onStatusChange(account.id, 'banned')}
                          disabled={account.status === 'banned'}
                        >
                          <Gavel fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </ButtonGroup>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AccountList;