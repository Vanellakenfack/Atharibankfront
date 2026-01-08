import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import AccountList from './ListCompte';
import AccountForm from './Formulaire';
import AccountDetails from './DetailCompte';
import axios from 'axios';

const AccountManagement = () => {
  const [view, setView] = useState('list');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (view === 'list') {
      fetchAccounts();
    }
  }, [view]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/accounts', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setAccounts(response.data.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des comptes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setView('create');
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setView('edit');
  };

  const handleViewDetails = (account) => {
    setSelectedAccount(account);
    setView('details');
  };

  const handleStatusChange = async (accountId, newStatus) => {
    try {
      await axios.put(
        `/api/accounts/${accountId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      fetchAccounts();
    } catch (err) {
      setError('Erreur lors du changement de statut');
      console.error(err);
    }
  };

  const handleDelete = async (accountId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
      try {
        await axios.delete(`/api/accounts/${accountId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        fetchAccounts();
      } catch (err) {
        setError('Erreur lors de la suppression');
        console.error(err);
      }
    }
  };

  const handleFormSuccess = () => {
    setView('list');
    setSelectedAccount(null);
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedAccount(null);
    setError('');
  };

  return (
    <Container fluid className="py-4">
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {view === 'list' && (
        <>
          <Row className="mb-4">
            <Col>
              <h2>Gestion des Comptes</h2>
            </Col>
            <Col className="text-end">
              <Button variant="primary" onClick={handleCreate}>
                <Plus size={18} className="me-2" />
                Ouvrir un Nouveau Compte
              </Button>
            </Col>
          </Row>

          <AccountList
            accounts={accounts}
            loading={loading}
            onEdit={handleEdit}
            onViewDetails={handleViewDetails}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        </>
      )}

      {view === 'create' && (
        <AccountForm
          onSuccess={handleFormSuccess}
          onCancel={handleBackToList}
          mode="create"
        />
      )}

      {view === 'edit' && selectedAccount && (
        <AccountForm
          account={selectedAccount}
          onSuccess={handleFormSuccess}
          onCancel={handleBackToList}
          mode="edit"
        />
      )}

      {view === 'details' && selectedAccount && (
        <AccountDetails
          account={selectedAccount}
          onBack={handleBackToList}
          onEdit={() => handleEdit(selectedAccount)}
        />
      )}
    </Container>
  );
};

export default AccountManagement;