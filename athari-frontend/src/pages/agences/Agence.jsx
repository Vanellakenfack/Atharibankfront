import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Building2, Trash2, Search, RotateCw, AlertCircle } from 'lucide-react';
import apiClient from '../../services/api/ApiClient'; // Ton instance configurée
import { Modal, Button, Form, Table, Badge, InputGroup } from 'react-bootstrap';
import TopBar from '../../components/layout/TopBar';


const Agence = () => {
    // États pour les données
    const [agencies, setAgencies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    
    // États pour le formulaire et UI
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ code: '', name: '', short_name: '' });
    const [errors, setErrors] = useState({});

    // 1. Fetch data avec gestion d'erreurs pro
    const loadAgencies = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/agencies');
            // On accède à .data.data car Laravel API Resource wrap dans une clé 'data'
            setAgencies(data.data || []);
        } catch (err) {
            console.error("Échec du chargement:", err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAgencies(); }, []);

    // 2. Filtrage côté client (plus rapide pour de petits volumes)
    const filteredAgencies = useMemo(() => {
        return agencies.filter(a => 
            a.agency_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [agencies, searchTerm]);

    // 3. Soumission avec gestion de validation Laravel
    const handleCreateAgency = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            await apiClient.post('/agencies', formData);
            setShowModal(false);
            setFormData({ code: '', name: '', short_name: '' });
            loadAgencies(); // Rafraîchissement propre
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 bg-light min-vh-100">
           
            <TopBar/>
            {/* Header Stratégique */}
            <div className="d-flex justify-content-between align-items-end mb-4">
                <div>
                    <h3 className="fw-bold mb-1 text-dark">Réseau d'Agences</h3>
                    <p className="text-muted mb-0">Gestion centralisée des points de service Athari.</p>
                </div>
                <Button variant="primary" className="d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
                    <Plus size={19} /> Créer une agence
                </Button>
            </div>

            {/* Barre de recherche et Filtres */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <InputGroup style={{ maxWidth: '400px' }}>
                        <InputGroup.Text className="bg-white border-end-0">
                            <Search size={18} className="text-muted" />
                        </InputGroup.Text>
                        <Form.Control 
                            placeholder="Rechercher par code ou nom..." 
                            className="border-start-0 ps-0"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </div>
            </div>

            {/* Liste des Agences */}
            <div className="card border-0 shadow-sm rounded-3">
                <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr className="text-uppercase small fw-bold">
                            <th className="ps-4">Code</th>
                            <th>Nom complet</th>
                            <th>Abréviation</th>
                            <th>Date Création</th>
                            <th className="text-end pe-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-5"><RotateCw className="spinner-border border-0 text-primary" /></td></tr>
                        ) : filteredAgencies.length > 0 ? (
                            filteredAgencies.map(agency => (
                                <tr key={agency.id}>
                                    <td className="ps-4 fw-bold text-primary">{agency.code}</td>
                                    <td className="fw-medium">{agency.agency_name}</td>
                                    <td><Badge bg="secondary" className="px-2 py-1">{agency.initials}</Badge></td>
                                    <td className="text-muted">{agency.created_at}</td>
                                    <td className="text-end pe-4">
                                        <Button variant="link" className="text-danger p-0 border-0">
                                            <Trash2 size={18} />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5" className="text-center py-5 text-muted">Aucune agence trouvée.</td></tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Modal de création */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Nouvelle Agence</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCreateAgency}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">CODE UNIQUE</Form.Label>
                            <Form.Control 
                                isInvalid={!!errors.code}
                                placeholder="ex: AGE-DOU-01"
                                onChange={e => setFormData({...formData, code: e.target.value})}
                            />
                            <Form.Control.Feedback type="invalid">{errors.code?.[0]}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">NOM DE L'AGENCE</Form.Label>
                            <Form.Control 
                                isInvalid={!!errors.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                            <Form.Control.Feedback type="invalid">{errors.name?.[0]}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">ABRÉVIATION (NOM COURT)</Form.Label>
                            <Form.Control 
                                isInvalid={!!errors.short_name}
                                placeholder="ex: ACY"
                                onChange={e => setFormData({...formData, short_name: e.target.value})}
                            />
                            <Form.Control.Feedback type="invalid">{errors.short_name?.[0]}</Form.Control.Feedback>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0 pt-0">
                        <Button variant="light" onClick={() => setShowModal(false)}>Annuler</Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Enregistrement...' : 'Confirmer la création'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Agence;