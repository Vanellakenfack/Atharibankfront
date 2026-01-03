import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../assets/css/dash.css';
import { 
  BarChart3, TrendingUp, Users, Zap, ArrowUpRight, 
  ArrowDownRight, Wallet, PlusCircle 
} from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import TitanicPie from '../../components/charts/TitanicPie';
import ApiClient from '../../services/api/ApiClient'; // Import de votre client API

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('overview');
  
  // État pour stocker les statistiques réelles de la BD
  const [statsData, setStatsData] = useState({
    totalClients: 0,
    totalComptes: 0,
    actifs: 0,
    performance: 0,
    loading: true
  });

  // Récupération des données au montage du composant
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Remplacez '/dashboard/stats' par votre véritable route API Laravel
        const response = await ApiClient.get('/dashboard/stats');
        const data = response.data;

        setStatsData({
          totalClients: data.total_clients || 0,
          totalComptes: data.total_comptes || 0,
          actifs: data.actifs_en_direct || 0,
          performance: data.performance || 98.5,
          loading: false
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des stats:", error);
        setStatsData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  // Configuration des cartes avec les données dynamiques
  const stats = [
    { 
      icon: Users, 
      label: 'Total Clients', 
      value: statsData.loading ? "..." : statsData.totalClients.toLocaleString(), 
      change: '+12.5%', 
      gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
      trend: 'up' 
    },
    { 
      icon: Wallet, 
      label: 'Nombre Comptes', 
      value: statsData.loading ? "..." : statsData.totalComptes.toLocaleString(), 
      change: '+8.2%', 
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)', 
      trend: 'up' 
    },
    { 
      icon: Zap, 
      label: 'Actifs en direct', 
      value: statsData.loading ? "..." : statsData.actifs.toLocaleString(), 
      change: '+23.1%', 
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
      trend: 'up' 
    },
    { 
      icon: TrendingUp, 
      label: 'Performance', 
      value: statsData.loading ? "..." : `${statsData.performance}%`, 
      change: '+2.3%', 
      gradient: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)', 
      trend: 'up' 
    },
  ];

  const recentTransactions = [
    { id: 101, client: 'martin Jean', amount: 150000, type: 'Dépôt', date: '13 Jan, 14:32', status: 'Validé' },
    { id: 102, client: 'boubp Sophie', amount: 75000, type: 'Retrait', date: '13 Jan, 13:15', status: 'Validé' },
    { id: 103, client: 'siewe Pierre', amount: 250000, type: 'Dépôt', date: '13 Jan, 11:45', status: 'En attente' },
    { id: 104, client: 'gnandeu Marie', amount: 125000, type: 'Retrait', date: '13 Jan, 10:20', status: 'Validé' },
  ];

  return (
    <div className={`dashboard-container d-flex vh-100 bg-white text-dark ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeNav={activeNav} setActiveNav={setActiveNav} />

      <div className="main-content flex-fill d-flex flex-column bg-light">
        <TopBar sidebarOpen={sidebarOpen} />

        <div className="dashboard-content p-4 overflow-auto">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-0">Tableau de bord</h2>
              <p className="text-muted small">Données en temps réel de la base de données</p>
            </div>
            <button className="btn btn-primary d-flex align-items-center gap-2 rounded-3 shadow-sm px-3">
              <PlusCircle size={18} /> Nouvelle opération
            </button>
          </div>

          {/* Cartes de Stats Dynamiques */}
          <div className="row g-3 mb-4">
            {stats.map((stat, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-3">
                <div className="card border-0 shadow-sm text-white h-100" style={{ background: stat.gradient, borderRadius: '16px' }}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="bg-white bg-opacity-25 rounded-3 p-2">
                        <stat.icon size={24} />
                      </div>
                      <span className="badge bg-white bg-opacity-25 rounded-pill small">
                        {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {stat.change}
                      </span>
                    </div>
                    <h6 className="mb-1 text-white text-opacity-75 small fw-bold">{stat.label}</h6>
                    <h3 className="mb-0 fw-bold font-monospace">{stat.value}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            {/* Graphique */}
            <div className="col-12 col-lg-8">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Flux de trésorerie</h5>
                    <select className="form-select form-select-sm w-auto border-0 bg-light">
                      <option>7 derniers jours</option>
                    </select>
                  </div>
                  <div className="bg-light rounded-4 p-4">
                     <TitanicPie />
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions */}
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 h-100">
                <div className="card-body p-4">
                  <h5 className="fw-bold mb-4">Derniers mouvements</h5>
                  {recentTransactions.map(tx => (
                    <div key={tx.id} className="d-flex align-items-center mb-3 pb-3 border-bottom border-light">
                      <div className={`rounded-circle p-2 me-3 ${tx.type === 'Dépôt' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                        {tx.type === 'Dépôt' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                      </div>
                      <div className="flex-fill">
                        <div className="fw-bold small">{tx.client}</div>
                        <div className="text-muted small-xs">{tx.date}</div>
                      </div>
                      <div className={`fw-bold small ${tx.type === 'Dépôt' ? 'text-success' : 'text-danger'}`}>
                        {tx.type === 'Dépôt' ? '+' : '-'}{tx.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-light w-100 btn-sm rounded-3 mt-2 text-primary fw-bold">Voir tout</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}