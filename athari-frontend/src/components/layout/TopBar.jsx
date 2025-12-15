import React from 'react'
import { Search, Bell } from 'lucide-react'
import 'bootstrap/dist/css/bootstrap.min.css'
import '../../assets/css/dash.css'
export default function TopBar({ sidebarOpen }) {
  return (
    <header className="top-bar d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center gap-2 search-box">
        <Search size={18} className="text-white-50" />
        <input type="text" className="form-control form-control-sm" placeholder="Search..." />
      </div>

      <div className="d-flex align-items-center gap-3">
        <button className="notification-btn btn btn-transparent">
          <Bell size={16} />
        </button>
        <div className="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{width:36,height:36}}>JD</div>
      </div>
    </header>
  )
}
