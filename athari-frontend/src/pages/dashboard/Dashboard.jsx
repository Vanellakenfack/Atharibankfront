import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../../assets/css/dash.css'
import { BarChart3, TrendingUp, Users, Zap, Settings, Bell, Search } from 'lucide-react'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeNav, setActiveNav] = useState('overview')

  const stats = [
    { icon: Users, label: 'Total utilisateur', value: '12,543', change: '+12.5%', color: 'primary' },
    { icon: TrendingUp, label: 'nombre compte', value: '$45,231', change: '+8.2%', color: 'success' },
    { icon: Zap, label: 'Active Now', value: '3,421', change: '+23.1%', color: 'warning' },
    { icon: BarChart3, label: 'Performance', value: '98.5%', change: '+2.3%', color: 'danger' },
  ]

  const recentActivity = [
    { id: 1, user: 'ad bobo', action: 'a rejoint', time: '2 minutes ago' },
    { id: 2, user: 'Jane Smith', action: 'Completed task', time: '15 minutes ago' },
    { id: 3, user: 'Mike Johnson', action: 'modifier profil', time: '1 hour ago' },
    { id: 4, user: 'Sarah Williams', action: 'partage document', time: '3 hours ago' },
  ]

  // Three small colored cards
  const smallCards = [
    { id: 'c1', title: "Dépôts du jour", value: '125,000', color: 'primary' },
    { id: 'c2', title: 'Retraits du jour', value: '65,400', color: 'danger' },
    { id: 'c3', title: 'Nouveaux comptes', value: '24', color: 'success' },
        { id: 'c3', title: 'Nouveaux comptes', value: '24', color: 'primary' },

  ]

  const recentTransactions = [
    { id: 101, client: 'Dupont Jean', amount: 150000, type: 'Dépôt', date: '2025-01-13 14:32', status: 'Validé' },
    { id: 102, client: 'Martin Sophie', amount: 75000, type: 'Retrait', date: '2025-01-13 13:15', status: 'Validé' },
    { id: 103, client: 'Bernard Pierre', amount: 250000, type: 'Dépôt', date: '2025-01-13 11:45', status: 'En attente' },
    { id: 104, client: 'Leclerc Marie', amount: 125000, type: 'Retrait', date: '2025-01-13 10:20', status: 'Validé' },
    { id: 105, client: 'Moreau Claude', amount: 300000, type: 'Dépôt', date: '2025-01-13 09:50', status: 'Validé' },
  ]

  return (
    <div className="d-flex vh-100 bg-light text-dark">
      {/* Sidebar */}
      <div className={`d-flex flex-column ${sidebarOpen ? 'col-2' : 'col-1'} bg-white text-dark border-end`} style={{transition: 'width .25s'}}>
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between sidebar-header">
          {sidebarOpen && <h5 className="m-0">Dashboard</h5>}
          <button className="btn btn-sm btn-outline-light sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-expanded={sidebarOpen}>☰</button>
        </div>

        <nav className="flex-fill p-2 sidebar-nav">
          {[
            { id: 'overview', icon: BarChart3, label: 'tableau bord' },
            { id: 'users', icon: Users, label: 'utilisateur' },
           { id: 'accounts', icon: Users, label: 'comptes' },
              { id: 'trans', icon: Users, label: 'transactions' },

            { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
            { id: 'performance', icon: Zap, label: 'Performance' },
          ].map((item) => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveNav(item.id)}
              className={`sidebar-item d-flex align-items-center gap-3 p-2 rounded ${activeNav === item.id ? 'active' : ''}`}
              style={{cursor: 'pointer'}}
            >
              <item.icon size={18} />
              {sidebarOpen && <span className="sidebar-label">{item.label}</span>}
            </div>
          ))}
        </nav>

        <div className="p-3 border-top">
          <div className="d-flex align-items-center gap-2">
            <Settings size={16} />
            {sidebarOpen && <small>parametres</small>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-fill d-flex flex-column">
        {/* Top Bar */}
        <div className="top-bar d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2 w-50 search-box">
            <Search size={18} className="text-white-50" />
            <input type="text" className="form-control form-control-sm" placeholder="Search..." />
          </div>
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-light btn-sm position-relative">
              <Bell size={16} />
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger rounded-circle"></span>
            </button>
            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{width:36,height:36}}>JD</div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 overflow-auto">
          <div className="mb-4">
            <h2 className="h3"> bienvenue</h2>
          </div>

          {/* Stats */}
          <div className="row g-3 mb-4">
            {stats.map((stat, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-3">
                      <div className={`card bg-${stat.color} shadow-sm ${stat.color === 'warning' ? 'text-dark' : 'text-white'}`}> 
                        <div className={`card-body d-flex align-items-center`}> 
                          <div className="me-3">
                            <stat.icon size={28} />
                          </div>
                          <div>
                            <h6 className="mb-0">{stat.label}</h6>
                            <p className="mb-0 fw-bold">{stat.value}</p>
                            <small className={`${stat.color === 'warning' ? 'text-dark' : 'text-white'}`}>{stat.change}</small>
                          </div>
                        </div>
                      </div>
              </div>
            ))}
          </div>

              {/* Small colored cards */}
          <div className="row g-3 mb-4">
            {smallCards.map((c) => (
              <div key={c.id} className="col-12 col-md-6 col-lg-3">
                <div className={`card card text-white bg-${c.color} border-0`}> 
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <div className="small-card-title">{c.title}</div>
                      <div className="small-card-value h5 mb-0">{c.value}</div>
                    </div>
                    <div className="small-card-icon">
                      <BarChart3 size={28} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>


          {/* Main panels */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-lg-8">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Revenue Trend</h5>
                  <div className="bg-light rounded p-3" style={{height:220}}>
                    <div className="h-100 d-flex align-items-end gap-2">
                      {[40, 60, 45, 70, 55, 80, 65, 90].map((h, idx) => (
                        <div key={idx} style={{flex:1}}>
                          <div style={{height: `${h}%`, background: 'linear-gradient(180deg,#0d6efd,#3b82f6)', borderTopLeftRadius:8, borderTopRightRadius:8}} title={`${h}%`}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            

            <div className="col-12 col-lg-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">Activites recentes</h5>
                  <ul className="list-unstyled mb-0">
                    {recentActivity.map(a => (
                      <li key={a.id} className="mb-3 border-start ps-3">
                        <div className="fw-semibold">{a.user}</div>
                        <div className="small text-muted">{a.action} · {a.time}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

         
          {/* Recent Transactions section */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title">Transactions Récentes</h5>
              <div className="table-responsive mt-3">
                <table className="table table-borderless transactions-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Client</th>
                      <th>Montant</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map(tx => (
                      <tr key={tx.id}>
                        <td>#{tx.id}</td>
                        <td>{tx.client}</td>
                        <td className="fw-bold">{Number(tx.amount).toLocaleString()} FCFA</td>
                        <td>
                          <span className={`badge bg-${tx.type === 'Dépôt' ? 'success' : 'danger'}`}>{tx.type}</span>
                        </td>
                        <td className="text-muted small">{tx.date}</td>
                        <td>
                          <span className={`badge ${tx.status === 'Validé' ? 'bg-primary' : 'bg-warning text-dark'}`}>{tx.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
