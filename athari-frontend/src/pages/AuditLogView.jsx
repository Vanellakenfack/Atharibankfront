import React, { useState, useEffect, useCallback } from 'react';
// Importation du client Axios configuré
import ApiClient from '../services/api/ApiClient' ;
import TopBar from '../components/layout/TopBar';

/**
 * Composant de Conteneur et de Présentation pour les Logs d'Audit.
 * Récupère les données via ApiClient et utilise les classes CSS de Bootstrap pour l'affichage.
 */
const AuditLogView = () => {
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    // Les états pour les filtres (recherche, date, utilisateur) pourraient être ajoutés ici

    // --- Fonctions d'Aide pour le Rendu ---

    /** Formatte la chaîne de date UTC en date et heure locale française. */
    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    /** Détermine la classe de badge Bootstrap en fonction du log_name. */
    const getLogColor = (logName) => {
        if (logName.includes('auth.login')) return 'bg-success';
        if (logName.includes('failed')) return 'bg-danger';
        if (logName.includes('deleted')) return 'bg-danger';
        if (logName.includes('created')) return 'bg-primary';
        if (logName.includes('updated')) return 'bg-warning';
        return 'bg-secondary';
    };

    // --- Logique de Récupération des Données ---

    const loadLogs = useCallback(async (page, pageSize) => {
        setLoading(true);
        setError(null);
        try {
            // L'appel se fait vers BASE_URL/api/audit/logs
            const response = await ApiClient.get('/audit/logs', { 
                params: {
                    page: page, 
                    per_page: pageSize,
                }
            });

            const responseData = response.data;
            
            setLogs(responseData.data || []);
            setPagination(responseData.pagination || {});
            
        } catch (err) {
            console.error("Erreur lors de la récupération des logs:", err);
            
            let errorMessage = "Échec du chargement des logs. Le serveur est-il accessible ?";
            
            if (err.response) {
                if (err.response.status === 403) {
                    errorMessage = "Accès refusé (403). Vérifiez vos permissions.";
                } else if (err.response.status === 401) {
                    errorMessage = "Session expirée (401). Veuillez vous reconnecter.";
                } else {
                    errorMessage = `Erreur API ${err.response.status}: ${err.response.data.message || 'Problème serveur'}`;
                }
            } else if (err.request) {
                errorMessage = "Erreur réseau : Le serveur ne répond pas (Vérifiez la connexion).";
            } else {
                errorMessage = `Erreur : ${err.message}`;
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []); 

    // Déclencher le chargement initial et lors des changements de page
    useEffect(() => {
        loadLogs(currentPage, perPage);
    }, [loadLogs, currentPage, perPage]);

    // Gérer les changements de page
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // --- Rendu des États (Chargement/Erreur) ---

    if (loading) {
        return (
            
    
            <div className="container text-center py-5">
                      <div>        <TopBar/></div>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="mt-2 text-muted">Chargement des journaux d'audit en cours...</p>
            </div>
        );
    }

    if (error) {
        return <div className="alert alert-danger m-3" role="alert">{error}</div>;
    }

    // --- Rendu du Tableau et de la Pagination ---
    return (
        <div className="container-fluid my-4">
            <h2 className="mb-4">Journal d'Audit des Activités ({pagination.total || 0} entrées)</h2>
            
            <div className="card shadow-sm">
                <div className="card-body">
                    <table className="table table-responsive table-hover table-striped align-middle">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Action / Description</th>
                                <th>Acteur (Causer)</th>
                                <th>Cible (Subject)</th>
                                <th>Détails Techniques</th>
                                <th>Horodatage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log.id}>
                                        <td>{log.id}</td>
                                        <td>
                                            <strong>{log.description}</strong>
                                            <br />
                                            <span className={`badge ${getLogColor(log.log_name)} mt-1`}>
                                                {log.log_name}
                                            </span>
                                        </td>
                                        <td>
                                            {log.causer ? `${log.causer.name}` : 'Système'}
                                            <br/><small className="text-muted">{log.causer ? log.causer.email : 'N/A'}</small>
                                        </td>
                                        <td>
                                            {log.subject ? log.subject.name || log.subject.id : 'N/A'}
                                            <br/><small className="text-muted">{log.subject ? log.subject_type.split('\\').pop() : ''}</small>
                                        </td>
                                        <td style={{ maxWidth: '250px', fontSize: '0.85rem' }}>
                                            {Object.entries(log.properties).map(([key, value]) => (
                                                <div key={key}>
                                                    <strong className="text-primary">{key}:</strong> {value}
                                                </div>
                                            ))}
                                        </td>
                                        <td>{formatDate(log.created_at)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted">Aucun log d'activité trouvé.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Interactive */}
            {pagination.last_page > 1 && (
                <div className="d-flex justify-content-center mt-3">
                    <ul className="pagination">
                        {/* Flèche Début */}
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                                &laquo;
                            </button>
                        </li>
                        {/* Flèche Précédent */}
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                &lsaquo;
                            </button>
                        </li>
                        
                        {/* Page Actuelle */}
                        <li className="page-item active">
                            <span className="page-link">{currentPage}</span>
                        </li>
                        
                        {/* Ellipsis et Dernière Page */}
                        {pagination.last_page > 1 && currentPage !== pagination.last_page && (
                            <>
                                <li className="page-item disabled"><span className="page-link">...</span></li>
                                <li className="page-item">
                                    <button className="page-link" onClick={() => handlePageChange(pagination.last_page)}>
                                        {pagination.last_page}
                                    </button>
                                </li>
                            </>
                        )}

                        {/* Flèche Suivant */}
                        <li className={`page-item ${currentPage === pagination.last_page ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.last_page}>
                                &rsaquo;
                            </button>
                        </li>
                        {/* Flèche Fin */}
                        <li className={`page-item ${currentPage === pagination.last_page ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(pagination.last_page)} disabled={currentPage === pagination.last_page}>
                                &raquo;
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AuditLogView;