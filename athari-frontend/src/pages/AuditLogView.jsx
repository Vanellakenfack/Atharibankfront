import React, { useState, useEffect, useCallback } from 'react';
import ApiClient from '../services/api/ApiClient';
import { Clock, User, Target, Info, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import Layout from '../components/layout/Layout';

const AuditLogView = () => {
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(15);

    // --- Fonctions d'Aide ---

    const formatDate = (dateString) => {
        const options = { 
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit' 
        };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    /** Couleurs de badges modernes (Subtle) */
    const getLogBadgeStyle = (logName) => {
        const name = logName.toLowerCase();
        if (name.includes('login') || name.includes('created')) 
            return { bg: '#dcfce7', text: '#15803d', label: 'Succès / Création' };
        if (name.includes('failed') || name.includes('deleted')) 
            return { bg: '#fee2e2', text: '#b91c1c', label: 'Alerte / Suppr.' };
        if (name.includes('updated')) 
            return { bg: '#fef9c3', text: '#854d0e', label: 'Modification' };
        return { bg: '#f1f5f9', text: '#475569', label: 'Info' };
    };

    const loadLogs = useCallback(async (page, pageSize) => {
        setLoading(true);
        setError(null);
        try {
            const response = await ApiClient.get('/audit/logs', { 
                params: { page, per_page: pageSize }
            });
            setLogs(response.data.data || []);
            setPagination(response.data.pagination || {});
        } catch (err) {
            setError("Impossible de charger les journaux d'audit.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadLogs(currentPage, perPage);
    }, [loadLogs, currentPage, perPage]);

    if (loading) {
        return (
            <div className="main-content flex-fill bg-light">
                <div className="d-flex flex-column align-items-center justify-content-center vh-100">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-3 text-muted fw-medium">Analyse des journaux en cours...</p>
                </div>
            </div>
        );
    }

    return (
        <Layout>
        <div className="main-content flex-fill bg-light min-vh-100">

            <div className="p-4">
                {/* Header avec dégradé subtil */}
                <div className="mb-4 d-flex justify-content-between align-items-end"> 
                    <div>
                        <h2 className="fw-bold text-dark mb-1">Journal d'Audit</h2>
                        <p className="text-muted mb-0">Traçabilité complète des actions du système</p>
                    </div>
                    <div className="badge bg-primary px-3 py-2 rounded-3 shadow-sm">
                        {pagination.total || 0} Activités enregistrées
                    </div>
                </div>

                {error && <div className="alert alert-danger border-0 shadow-sm">{error}</div>}

                {/* Table Card */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="bg-white border-bottom">
                                    <tr>
                                        <th className="ps-4 py-3 text-muted small fw-bold uppercase">Action</th>
                                        <th className="py-3 text-muted small fw-bold uppercase">Utilisateur</th>
                                        <th className="py-3 text-muted small fw-bold uppercase">Cible</th>
                                        <th className="py-3 text-muted small fw-bold uppercase">Propriétés</th>
                                        <th className="py-3 text-muted small fw-bold uppercase text-end pe-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => {
                                        const style = getLogBadgeStyle(log.log_name);
                                        return (
                                            <tr key={log.id}>
                                                <td className="ps-4 py-3">
                                                    <div className="fw-bold text-dark">{log.description}</div>
                                                    <span className="badge mt-1" style={{ backgroundColor: style.bg, color: style.text }}>
                                                        {log.log_name}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-light rounded-circle p-2 me-2">
                                                            <User size={16} className="text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="small fw-bold">{log.causer?.name || 'Système'}</div>
                                                            <div className="text-muted small" style={{fontSize: '0.7rem'}}>{log.causer?.email || 'Automatique'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <Target size={14} className="text-muted me-2" />
                                                        <span className="small">{log.subject?.name || log.subject?.id || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td style={{ maxWidth: '300px' }}>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {Object.entries(log.properties).slice(0, 3).map(([key, value]) => (
                                                            <span key={key} className="badge bg-light text-dark border fw-normal small">
                                                                <span className="text-primary fw-bold">{key}:</span> {JSON.stringify(value)}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="text-end pe-4">
                                                    <div className="d-flex align-items-center justify-content-end text-muted small">
                                                        <Clock size={14} className="me-1" />
                                                        {formatDate(log.created_at)}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Pagination Modernisée */}
                {pagination.last_page > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-4 bg-white p-3 rounded-4 shadow-sm">
                        <div className="text-muted small">
                            Page <strong>{currentPage}</strong> sur {pagination.last_page}
                        </div>
                        <nav>
                            <ul className="pagination pagination-sm mb-0 gap-1">
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link rounded-3 border-0 bg-light" onClick={() => setCurrentPage(1)}>
                                        <ChevronsLeft size={18} />
                                    </button>
                                </li>
                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link rounded-3 border-0 bg-light" onClick={() => setCurrentPage(currentPage - 1)}>
                                        <ChevronLeft size={18} />
                                    </button>
                                </li>
                                <li className="page-item active">
                                    <span className="page-link rounded-3 border-0 px-3 fw-bold">{currentPage}</span>
                                </li>
                                <li className={`page-item ${currentPage === pagination.last_page ? 'disabled' : ''}`}>
                                    <button className="page-link rounded-3 border-0 bg-light" onClick={() => setCurrentPage(currentPage + 1)}>
                                        <ChevronRight size={18} />
                                    </button>
                                </li>
                                <li className={`page-item ${currentPage === pagination.last_page ? 'disabled' : ''}`}>
                                    <button className="page-link rounded-3 border-0 bg-light" onClick={() => setCurrentPage(pagination.last_page)}>
                                        <ChevronsRight size={18} />
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </div>
        </Layout>

    );
};

export default AuditLogView;