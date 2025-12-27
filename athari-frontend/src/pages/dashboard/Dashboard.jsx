import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../../assets/css/dash.css'
import { BarChart3, TrendingUp, Users, Zap, ArrowUpRight, ArrowDownRight, Wallet, PlusCircle } from 'lucide-react'
import Sidebar from '../../components/layout/Sidebar'
import TopBar from '../../components/layout/TopBar'

import TitanicPie from '../../components/charts/TitanicPie';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeNav, setActiveNav] = useState('overview')

  // Stats avec des dégradés raffinés
  const stats = [
    { 
      icon: Users, label: 'Total Utilisateurs', value: '12,543', change: '+12.5%', 
      gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', trend: 'up' 
    },
    { 
      icon: Wallet, label: 'Nombre Comptes', value: '45,231', change: '+8.2%', 
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)', trend: 'up' 
    },
    { 
      icon: Zap, label: 'Actifs en direct', value: '3,421', change: '+23.1%', 
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', trend: 'up' 
    },
    { 
      icon: TrendingUp, label: 'Performance', value: '98.5%', change: '+2.3%', 
      gradient: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)', trend: 'up' 
    },
  ]

  const recentTransactions = [
    { id: 101, client: 'Dupont Jean', amount: 150000, type: 'Dépôt', date: '13 Jan, 14:32', status: 'Validé' },
    { id: 102, client: 'Martin Sophie', amount: 75000, type: 'Retrait', date: '13 Jan, 13:15', status: 'Validé' },
    { id: 103, client: 'Bernard Pierre', amount: 250000, type: 'Dépôt', date: '13 Jan, 11:45', status: 'En attente' },
    { id: 104, client: 'Leclerc Marie', amount: 125000, type: 'Retrait', date: '13 Jan, 10:20', status: 'Validé' },
  ]

  return (
    <div className={`dashboard-container d-flex vh-100 bg-white text-dark ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeNav={activeNav} setActiveNav={setActiveNav} />

      <div className="main-content flex-fill d-flex flex-column bg-light">
        <TopBar sidebarOpen={sidebarOpen} />

        <div className="dashboard-content p-4 overflow-auto">
          {/* Header avec action rapide */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-0">Tableau de bord</h2>
              <p className="text-muted small">Aperçu de votre activité aujourd'hui</p>
            </div>
            <button className="btn btn-primary d-flex align-items-center gap-2 rounded-3 shadow-sm px-3">
              <PlusCircle size={18} /> Nouvelle opération
            </button>
          </div>

          {/* Stats Cards avec Dégradés */}
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
            {/* Graphique modernisé */}
            <div className="col-12 col-lg-8">
              <div className="card border-0 shadow-sm rounded-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Flux de trésorerie</h5>
                    <select className="form-select form-select-sm w-auto border-0 bg-light">
                      <option>7 derniers jours</option>
                    </select>
                     
                  </div>
                  <div className="bg-light rounded-4 p-4" style={{ height: 'auto' }}>
                     <TitanicPie />
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions épurées */}
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
  )
}