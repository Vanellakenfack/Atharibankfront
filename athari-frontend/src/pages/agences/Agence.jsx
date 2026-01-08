import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Building2, 
  Trash2, 
  Search, 
  RotateCw, 
  Edit2, 
  Filter,
  MoreVertical,
  MapPin,
  Users,
  Phone,
  Mail,
  Globe,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import apiClient from '../../services/api/ApiClient';
import { Modal, Button, Form, Table, Badge, InputGroup, Dropdown } from 'react-bootstrap';
import TopBar from '../../components/layout/TopBar';
import Sidebar from '../../components/layout/Sidebar';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Composants stylisés avec dégradé bleu
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: 'none',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4F6BED 0%, #3B82F6 100%)',
  border: 'none',
  borderRadius: 12,
  padding: '10px 24px',
  fontWeight: 600,
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(135deg, #3B56D4 0%, #2563EB 100%)',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, #93C5FD 0%, #60A5FA 100%)',
    opacity: 0.7,
  }
}));

const GradientAvatar = styled(Avatar)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4F6BED 0%, #3B82F6 100%)',
  color: 'white',
  fontWeight: 600,
}));

const GradientIcon = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #4F6BED 0%, #3B82F6 100%)',
  color: 'white',
  borderRadius: '12px',
  padding: '12px',
}));

const SearchInput = styled(InputGroup)(({ theme }) => ({
  '& .form-control': {
    border: '2px solid #e2e8f0',
    borderRadius: 12,
    padding: '12px 20px',
    fontSize: '14px',
    '&:focus': {
      borderColor: '#3B82F6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    }
  },
  '& .input-group-text': {
    backgroundColor: 'white',
    border: '2px solid #e2e8f0',
    borderRight: 'none',
    borderRadius: '12px 0 0 12px',
    padding: '0 15px',
  }
}));

const AgencyCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: '1px solid #e2e8f0',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    borderColor: '#3B82F6',
    boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)',
  }
}));

const Agence = () => {
    // États pour le layout
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [viewMode, setViewMode] = useState('grid');

    // États pour les données
    const [agencies, setAgencies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    
    // États pour les modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    // États pour les formulaires
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ 
      code: '', 
      name: '', 
      short_name: '' 
    });
    const [editFormData, setEditFormData] = useState({ 
      id: '',
      code: '', 
      name: '', 
      short_name: '' 
    });
    const [agencyToDelete, setAgencyToDelete] = useState(null);
    
    // États pour les erreurs
    const [errors, setErrors] = useState({});
    const [editErrors, setEditErrors] = useState({});

    // 1. Fetch data
    const loadAgencies = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/agencies');
            setAgencies(data.data || []);
        } catch (err) {
            console.error("Échec du chargement:", err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAgencies(); }, []);

    // 2. Filtrage côté client
    const filteredAgencies = useMemo(() => {
        return agencies.filter(a => 
            a.agency_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.initials.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [agencies, searchTerm]);

    // 3. Création d'agence
    const handleCreateAgency = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            await apiClient.post('/agencies', formData);
            setShowCreateModal(false);
            setFormData({ code: '', name: '', short_name: '' });
            loadAgencies();
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // 4. Préparation de la modification
    const handleEditClick = (agency) => {
        setEditFormData({
            id: agency.id,
            code: agency.code,
            name: agency.agency_name,
            short_name: agency.initials
        });
        setEditErrors({});
        setShowEditModal(true);
    };

    // 5. Soumission de la modification
    const handleUpdateAgency = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setEditErrors({});

        try {
            await apiClient.put(`/agencies/${editFormData.id}`, {
                code: editFormData.code,
                name: editFormData.name,
                short_name: editFormData.short_name
            });
            setShowEditModal(false);
            loadAgencies();
        } catch (err) {
            if (err.response?.status === 422) {
                setEditErrors(err.response.data.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // 6. Suppression d'agence
    const handleDeleteClick = (agency) => {
        setAgencyToDelete(agency);
        setShowDeleteModal(true);
    };

    const handleDeleteAgency = async () => {
        try {
            await apiClient.delete(`/agencies/${agencyToDelete.id}`);
            setShowDeleteModal(false);
            setAgencyToDelete(null);
            loadAgencies();
        } catch (err) {
            console.error("Échec de la suppression:", err.response?.data?.message);
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
            {/* SIDEBAR */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* CONTENU PRINCIPAL */}
            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    width: `calc(100% - ${sidebarOpen ? '260px' : '80px'})`,
                    transition: 'width 0.3s ease'
                }}
            >
                {/* TOPBAR */}
                <TopBar sidebarOpen={sidebarOpen} />

                {/* ZONE DE TRAVAIL */}
                <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
                    {/* Header avec statistiques */}
                    <StyledCard sx={{ mb: 4, p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <GradientIcon>
                                        <Building2 size={24} />
                                    </GradientIcon>
                                    <Typography variant="h4" sx={{ 
                                        fontWeight: 700, 
                                        color: '#1a202c'
                                    }}>
                                        Réseau d'Agences
                                    </Typography>
                                </Box>
                                <Typography variant="body1" sx={{ 
                                    color: '#718096',
                                    mb: 3 
                                }}>
                                    Gérez votre réseau de {agencies.length} agences à travers le pays
                                </Typography>
                                
                                <Box sx={{ display: 'flex', gap: 3 }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ color: '#3B82F6', fontWeight: 600 }}>
                                            {agencies.length}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#718096' }}>
                                            Agences actives
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ color: '#10B981', fontWeight: 600 }}>
                                            {agencies.length * 5}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#718096' }}>
                                            Employés actifs
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ color: '#F59E0B', fontWeight: 600 }}>
                                            98%
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#718096' }}>
                                            Satisfaction
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                            
                            <GradientButton 
                                className="d-flex align-items-center gap-2"
                                onClick={() => setShowCreateModal(true)}
                            >
                                <Plus size={20} /> Nouvelle Agence
                            </GradientButton>
                        </Box>
                    </StyledCard>

                    {/* Barre de recherche et contrôles */}
                    <StyledCard sx={{ mb: 4 }}>
                        <CardContent>
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 2
                            }}>
                                <Box sx={{ flex: 1, minWidth: 300 }}>
                                    <SearchInput>
                                        <InputGroup.Text>
                                            <Search size={18} className="text-muted" />
                                        </InputGroup.Text>
                                        <Form.Control 
                                            placeholder="Rechercher une agence par nom, code ou abréviation..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        {searchTerm && (
                                            <Button 
                                                variant="link" 
                                                className="position-absolute end-0 top-50 translate-middle-y me-3"
                                                style={{ zIndex: 10 }}
                                                onClick={() => setSearchTerm('')}
                                            >
                                                <X size={16} />
                                            </Button>
                                        )}
                                    </SearchInput>
                                </Box>
                                
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Tooltip title="Vue grille">
                                        <IconButton 
                                            onClick={() => setViewMode('grid')}
                                            sx={{ 
                                                bgcolor: viewMode === 'grid' ? '#3B82F610' : 'transparent',
                                                color: viewMode === 'grid' ? '#3B82F6' : '#718096',
                                                borderRadius: 3
                                            }}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                                                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                                                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                                                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                                            </svg>
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Vue liste">
                                        <IconButton 
                                            onClick={() => setViewMode('list')}
                                            sx={{ 
                                                bgcolor: viewMode === 'list' ? '#3B82F610' : 'transparent',
                                                color: viewMode === 'list' ? '#3B82F6' : '#718096',
                                                borderRadius: 3
                                            }}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                <rect x="4" y="6" width="16" height="2" rx="1" fill="currentColor"/>
                                                <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor"/>
                                                <rect x="4" y="16" width="16" height="2" rx="1" fill="currentColor"/>
                                            </svg>
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                        </CardContent>
                    </StyledCard>

                    {/* Liste des Agences */}
                    {loading ? (
                        <StyledCard sx={{ p: 4, textAlign: 'center' }}>
                            <RotateCw className="spinner-border spinner-border-lg" style={{ color: '#3B82F6' }} />
                            <Typography variant="body1" sx={{ mt: 2, color: '#718096' }}>
                                Chargement des agences...
                            </Typography>
                        </StyledCard>
                    ) : viewMode === 'grid' ? (
                        // Vue Grille
                        <Box sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
                            gap: 3 
                        }}>
                            {filteredAgencies.map(agency => (
                                <AgencyCard key={agency.id}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'flex-start',
                                            mb: 2
                                        }}>
                                            <GradientAvatar sx={{ width: 50, height: 50, mb: 2 }}>
                                                <Building2 size={24} />
                                            </GradientAvatar>
                                            
                                            <Dropdown>
                                                <Dropdown.Toggle 
                                                    variant="link" 
                                                    className="p-0 border-0"
                                                    id={`dropdown-${agency.id}`}
                                                >
                                                    <MoreVertical size={20} className="text-muted" />
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item onClick={() => handleEditClick(agency)}>
                                                        <Edit2 size={16} className="me-2" />
                                                        Modifier
                                                    </Dropdown.Item>
                                                    <Dropdown.Item 
                                                        className="text-danger"
                                                        onClick={() => handleDeleteClick(agency)}
                                                    >
                                                        <Trash2 size={16} className="me-2" />
                                                        Supprimer
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </Box>
                                        
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                            {agency.agency_name}
                                        </Typography>
                                        
                                        <Chip 
                                            label={agency.code}
                                            size="small"
                                            sx={{ 
                                                bgcolor: '#3B82F615',
                                                color: '#3B82F6',
                                                fontWeight: 500,
                                                mb: 2
                                            }}
                                        />
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Building2 size={14} className="text-muted" />
                                            <Typography variant="body2" sx={{ color: '#718096' }}>
                                                {agency.initials}
                                            </Typography>
                                        </Box>
                                        
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            pt: 2,
                                            borderTop: '1px solid #e2e8f0'
                                        }}>
                                            <Typography variant="caption" sx={{ color: '#a0aec0' }}>
                                                Créée le {new Date(agency.created_at).toLocaleDateString('fr-FR')}
                                            </Typography>
                                            <Badge bg="success" className="px-2 py-1 rounded-pill">
                                                <Check size={12} className="me-1" /> Active
                                            </Badge>
                                        </Box>
                                    </CardContent>
                                </AgencyCard>
                            ))}
                        </Box>
                    ) : (
                        // Vue Tableau
                        <StyledCard>
                            <Table hover className="mb-0">
                                <thead>
                                    <tr>
                                        <th className="ps-4 py-3">Agence</th>
                                        <th className="py-3">Code</th>
                                        <th className="py-3">Abréviation</th>
                                        <th className="py-3">Date Création</th>
                                        <th className="py-3">Statut</th>
                                        <th className="text-end pe-4 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAgencies.map(agency => (
                                        <tr key={agency.id}>
                                            <td className="ps-4 py-3">
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <GradientAvatar sx={{ width: 40, height: 40 }}>
                                                        <Building2 size={18} />
                                                    </GradientAvatar>
                                                    <Box>
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            {agency.agency_name}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: '#718096' }}>
                                                            ID: {agency.id}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </td>
                                            <td className="py-3">
                                                <Chip 
                                                    label={agency.code}
                                                    size="small"
                                                    sx={{ 
                                                        bgcolor: '#3B82F615',
                                                        color: '#3B82F6',
                                                        fontWeight: 500
                                                    }}
                                                />
                                            </td>
                                            <td className="py-3">
                                                <Typography variant="body2" sx={{ color: '#4a5568' }}>
                                                    {agency.initials}
                                                </Typography>
                                            </td>
                                            <td className="py-3">
                                                <Typography variant="body2" sx={{ color: '#718096' }}>
                                                    {new Date(agency.created_at).toLocaleDateString('fr-FR')}
                                                </Typography>
                                            </td>
                                            <td className="py-3">
                                                <Badge bg="success" className="px-3 py-1 rounded-pill">
                                                    <Check size={12} className="me-1" /> Active
                                                </Badge>
                                            </td>
                                            <td className="text-end pe-4 py-3">
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                    <Tooltip title="Modifier">
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={() => handleEditClick(agency)}
                                                            sx={{ 
                                                                bgcolor: '#3B82F610',
                                                                '&:hover': { bgcolor: '#3B82F620' }
                                                            }}
                                                        >
                                                            <Edit2 size={16} className="text-primary" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Supprimer">
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={() => handleDeleteClick(agency)}
                                                            sx={{ 
                                                                bgcolor: '#EF444410',
                                                                '&:hover': { bgcolor: '#EF444420' }
                                                            }}
                                                        >
                                                            <Trash2 size={16} className="text-danger" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </StyledCard>
                    )}

                    {!loading && filteredAgencies.length === 0 && (
                        <StyledCard sx={{ p: 6, textAlign: 'center' }}>
                            <GradientAvatar sx={{ width: 80, height: 80, mx: 'auto', mb: 3 }}>
                                <Building2 size={32} />
                            </GradientAvatar>
                            <Typography variant="h6" sx={{ mb: 1, color: '#4a5568' }}>
                                Aucune agence trouvée
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#718096', mb: 3 }}>
                                {searchTerm ? 
                                    `Aucune agence ne correspond à "${searchTerm}"` : 
                                    "Vous n'avez pas encore créé d'agences"}
                            </Typography>
                            <GradientButton onClick={() => setShowCreateModal(true)}>
                                <Plus size={20} className="me-2" />
                                Créer une nouvelle agence
                            </GradientButton>
                        </StyledCard>
                    )}

                    {/* Modal de création */}
                    <Modal 
                        show={showCreateModal} 
                        onHide={() => setShowCreateModal(false)} 
                        centered
                        size="lg"
                    >
                        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <GradientIcon>
                                    <Plus size={20} />
                                </GradientIcon>
                                <Modal.Title className="fw-bold">
                                    Nouvelle Agence
                                </Modal.Title>
                            </Box>
                        </Modal.Header>
                        
                        <Form onSubmit={handleCreateAgency}>
                            <Modal.Body className="px-4">
                                <Alert variant="info" className="mb-4">
                                    <AlertCircle size={16} className="me-2" />
                                    Tous les champs marqués d'un astérisque (*) sont obligatoires
                                </Alert>
                                
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">
                                            Code Unique *
                                        </Form.Label>
                                        <Form.Control 
                                            isInvalid={!!errors.code}
                                            placeholder="ex: AGE-DOU-01"
                                            value={formData.code}
                                            onChange={e => setFormData({...formData, code: e.target.value})}
                                            className="rounded-2"
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.code?.[0]}
                                        </Form.Control.Feedback>
                                        <Form.Text className="text-muted">
                                            Code unique d'identification de l'agence
                                        </Form.Text>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">
                                            Abréviation *
                                        </Form.Label>
                                        <Form.Control 
                                            isInvalid={!!errors.short_name}
                                            placeholder="ex: ACY"
                                            value={formData.short_name}
                                            onChange={e => setFormData({...formData, short_name: e.target.value})}
                                            className="rounded-2"
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.short_name?.[0]}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Box>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted">
                                        Nom Complet de l'Agence *
                                    </Form.Label>
                                    <Form.Control 
                                        isInvalid={!!errors.name}
                                        placeholder="ex: Agence Centre Ville"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        className="rounded-2"
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.name?.[0]}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Modal.Body>
                            
                            <Modal.Footer className="border-0 pt-0 pb-4 px-4">
                                <Button 
                                    variant="light" 
                                    onClick={() => setShowCreateModal(false)}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Annuler
                                </Button>
                                <GradientButton 
                                    type="submit" 
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <RotateCw className="spinner-border spinner-border-sm me-2" />
                                            Création en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={18} className="me-2" />
                                            Créer l'agence
                                        </>
                                    )}
                                </GradientButton>
                            </Modal.Footer>
                        </Form>
                    </Modal>

                    {/* Modal de modification */}
                    <Modal 
                        show={showEditModal} 
                        onHide={() => setShowEditModal(false)} 
                        centered
                        size="lg"
                    >
                        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <GradientIcon>
                                    <Edit2 size={20} />
                                </GradientIcon>
                                <Box>
                                    <Modal.Title className="fw-bold">
                                        Modification d'Agence
                                    </Modal.Title>
                                    <Typography variant="body2" className="text-muted">
                                        Code: <strong>{editFormData.code}</strong>
                                    </Typography>
                                </Box>
                            </Box>
                        </Modal.Header>
                        
                        <Form onSubmit={handleUpdateAgency}>
                            <Modal.Body className="px-4">
                                <Alert variant="info" className="mb-4">
                                    <AlertCircle size={16} className="me-2" />
                                    Modification des informations de l'agence {editFormData.code}
                                </Alert>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted">
                                        Code Unique
                                    </Form.Label>
                                    <Form.Control 
                                        value={editFormData.code}
                                        readOnly
                                        className="rounded-2 bg-light"
                                    />
                                    <Form.Text className="text-muted">
                                        Le code de l'agence ne peut pas être modifié
                                    </Form.Text>
                                </Form.Group>

                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">
                                            Nom Complet *
                                        </Form.Label>
                                        <Form.Control 
                                            isInvalid={!!editErrors.name}
                                            value={editFormData.name}
                                            onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                                            className="rounded-2"
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {editErrors.name?.[0]}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted">
                                            Abréviation *
                                        </Form.Label>
                                        <Form.Control 
                                            isInvalid={!!editErrors.short_name}
                                            value={editFormData.short_name}
                                            onChange={e => setEditFormData({...editFormData, short_name: e.target.value})}
                                            className="rounded-2"
                                            required
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {editErrors.short_name?.[0]}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Box>
                            </Modal.Body>
                            
                            <Modal.Footer className="border-0 pt-0 pb-4 px-4">
                                <Button 
                                    variant="light" 
                                    onClick={() => setShowEditModal(false)}
                                    sx={{ borderRadius: 2 }}
                                >
                                    Annuler
                                </Button>
                                <GradientButton 
                                    type="submit" 
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <RotateCw className="spinner-border spinner-border-sm me-2" />
                                            Mise à jour...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} className="me-2" />
                                            Enregistrer les modifications
                                        </>
                                    )}
                                </GradientButton>
                            </Modal.Footer>
                        </Form>
                    </Modal>

                    {/* Modal de suppression */}
                    <Modal 
                        show={showDeleteModal} 
                        onHide={() => setShowDeleteModal(false)} 
                        centered
                    >
                        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
                            <Modal.Title className="fw-bold text-danger">
                                <AlertCircle size={24} className="me-2" />
                                Confirmer la suppression
                            </Modal.Title>
                        </Modal.Header>
                        
                        <Modal.Body className="px-4">
                            <Alert variant="danger" className="mb-4">
                                <strong>Attention !</strong> Cette action est irréversible.
                            </Alert>
                            
                            <Box sx={{ textAlign: 'center', py: 3 }}>
                                <GradientAvatar sx={{ width: 80, height: 80, mx: 'auto', mb: 3 }}>
                                    <Building2 size={32} />
                                </GradientAvatar>
                                
                                <Typography variant="h6" sx={{ mb: 1 }}>
                                    {agencyToDelete?.agency_name}
                                </Typography>
                                
                                <Chip 
                                    label={agencyToDelete?.code}
                                    size="small"
                                    sx={{ 
                                        bgcolor: '#3B82F615',
                                        color: '#3B82F6',
                                        fontWeight: 500,
                                        mb: 2
                                    }}
                                />
                                
                                <Typography variant="body2" sx={{ color: '#718096' }}>
                                    Êtes-vous sûr de vouloir supprimer cette agence ? Toutes les données associées seront perdues.
                                </Typography>
                            </Box>
                        </Modal.Body>
                        
                        <Modal.Footer className="border-0 pt-0 pb-4 px-4">
                            <Button 
                                variant="light" 
                                onClick={() => setShowDeleteModal(false)}
                                sx={{ borderRadius: 2 }}
                            >
                                Annuler
                            </Button>
                            <Button 
                                variant="danger" 
                                onClick={handleDeleteAgency}
                                sx={{ borderRadius: 2 }}
                                className="d-flex align-items-center gap-2"
                            >
                                <Trash2 size={18} />
                                Supprimer définitivement
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Box>
            </Box>
        </Box>
    );
};

export default Agence;