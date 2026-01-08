import React from 'react'
import { Search, Bell } from 'lucide-react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../../assets/css/dash.css'

export default function TopBar({ sidebarOpen }) {
  return (
    <header className="top-bar d-flex align-items-center px-4 w-100">
      <div className="d-flex justify-content-between align-items-center w-100">
        
        {/* BLOC GAUCHE : RECHERCHE */}
        <div className="search-box d-flex align-items-center gap-2">
          <Search size={18} className="text-white-50" />
          <input 
            type="text" 
            className="form-control form-control-sm bg-transparent border-0 text-white shadow-none" 
            placeholder="Rechercher..." 
          />
        </div>

        {/* BLOC DROITE : NOTIFICATIONS & PROFIL */}
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-link text-white p-0 shadow-none">
            <Bell size={20} />
          </button>
          
          <div className="avatar rounded-circle bg-white text-primary d-flex align-items-center justify-content-center fw-bold">
            JD
          </div>
        </div>

      </div>
    </header>
  )
}