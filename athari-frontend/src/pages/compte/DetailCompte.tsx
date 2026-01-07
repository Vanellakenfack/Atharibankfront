import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  Box,
  Tab,
  Tabs
} from '@mui/material';
import PropTypes from 'prop-types';
import {
  Person,
  AccountBalance,
  Description,
  History,
  AttachMoney
} from '@mui/icons-material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`account-tabpanel-${index}`}
      aria-labelledby={`account-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const AccountDetails = ({ account, onBack, onEdit, hasPermission }) => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      inactive: 'default',
      blocked: 'warning',
      banned: 'error',
      pending: 'info'
    };
    return colors[status] || 'default';
  };

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Détails du Compte
        </Typography>
        <Box>
          <Button variant="outlined" onClick={onBack} sx={{ mr: 1 }}>
            Retour
          </Button>
          {hasPermission('gerer utilisateurs') && (
            <Button variant="contained" onClick={onEdit}>
              Modifier
            </Button>
          )}
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                <Person sx={{ verticalAlign: 'middle', mr: 1 }} />
                Informations Client
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                      {account.client?.type_client === 'physique' ? 'Nom complet' : 'Raison Sociale'}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {/* L'accesseur nom_complet suffit à lui seul */}
                      {account.client?.nom_complet || 'Chargement...'}
                  </Typography>
              </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">CNI</Typography>
                  <Typography variant="body1">{account.client?.cni}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Téléphone</Typography>
                  <Typography variant="body1">{account.client?.telephone}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Email</Typography>
                  <Typography variant="body1">{account.client?.email}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Adresse</Typography>
                  <Typography variant="body1">{account.client?.adresse}</Typography>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                <AccountBalance sx={{ verticalAlign: 'middle', mr: 1 }} />
                Informations Compte
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">N° Compte</Typography>
                  <Typography variant="h6">{account.account_number}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Statut</Typography>
                  <Chip
                    label={account.status}
                    color={getStatusColor(account.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Type</Typography>
                  <Typography variant="body1">{account.account_type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Sous-type</Typography>
                  <Typography variant="body1">{account.account_sub_type || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Solde</Typography>
                  <Typography variant="h6" color="primary">
                    {new Intl.NumberFormat('fr-FR').format(account.balance || 0)} FCFA
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Date ouverture</Typography>
                  <Typography variant="body1">
                    {new Date(account.created_at).toLocaleDateString('fr-FR')}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Mandataires" icon={<Person />} iconPosition="start" />
            <Tab label="Documents" icon={<Description />} iconPosition="start" />
            <Tab label="Frais" icon={<AttachMoney />} iconPosition="start" />
            <Tab label="Historique" icon={<History />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {account.mandataire1 && (
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Mandataire 1
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <Typography><strong>Nom:</strong> {account.mandataire1.noms} {account.mandataire1.prenoms}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography><strong>CNI:</strong> {account.mandataire1.cni}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography><strong>Téléphone:</strong> {account.mandataire1.telephone}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography><strong>Relation:</strong> Mandataire principal</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {account.mandataire2 && account.mandataire2.noms && (
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Mandataire 2
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <Typography><strong>Nom:</strong> {account.mandataire2.noms} {account.mandataire2.prenoms}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography><strong>CNI:</strong> {account.mandataire2.cni}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography><strong>Téléphone:</strong> {account.mandataire2.telephone}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography><strong>Relation:</strong> Mandataire secondaire</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Documents associés
          </Typography>
          <Grid container spacing={2}>
            {account.documents?.cni_client && (
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography><strong>CNI Client:</strong> Téléchargée</Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                      href={account.documents.cni_client_url}
                      target="_blank"
                    >
                      Voir le document
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {account.documents?.autres_documents?.map((doc, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography><strong>Document {index + 1}:</strong> {doc.name}</Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1 }}
                      href={doc.url}
                      target="_blank"
                    >
                      Télécharger
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Frais et Commissions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="textSecondary">Frais d'ouverture</Typography>
                  <Typography variant="h6">
                    {new Intl.NumberFormat('fr-FR').format(account.fees?.opening || 0)} FCFA
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="textSecondary">Commission mensuelle</Typography>
                  <Typography variant="h6">
                    {new Intl.NumberFormat('fr-FR').format(account.fees?.monthly || 0)} FCFA
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="textSecondary">Frais SMS</Typography>
                  <Typography variant="h6">
                    {new Intl.NumberFormat('fr-FR').format(account.fees?.sms || 0)} FCFA
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="textSecondary">Frais retrait</Typography>
                  <Typography variant="h6">
                    {new Intl.NumberFormat('fr-FR').format(account.fees?.withdrawal || 0)} FCFA
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Historique des opérations
          </Typography>
          {account.transactions && account.transactions.length > 0 ? (
            <Card variant="outlined">
              <CardContent>
                <Grid container spacing={2}>
                  {account.transactions.slice(0, 5).map((transaction, index) => (
                    <Grid item xs={12} key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <div>
                          <Typography>{transaction.description}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(transaction.date).toLocaleString('fr-FR')}
                          </Typography>
                        </div>
                        <Typography
                          variant="body1"
                          color={transaction.type === 'credit' ? 'success.main' : 'error.main'}
                        >
                          {transaction.type === 'credit' ? '+' : '-'}
                          {new Intl.NumberFormat('fr-FR').format(transaction.amount)} FCFA
                        </Typography>
                      </Box>
                      {index < account.transactions.slice(0, 5).length - 1 && <Divider />}
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          ) : (
            <Typography color="textSecondary">Aucune opération enregistrée</Typography>
          )}
        </TabPanel>
      </Card>
    </div>
  );
};

export default AccountDetails;