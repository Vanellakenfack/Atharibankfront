import React from 'react';
import { Routes, Route, Navigate,Link } from "react-router-dom";
import AccountsPage from '../pages/compte/ComptePage';
import AccountCreatePage from '../pages/compte/CreationCompte';
import AccountEditPage from '../pages/compte/EditionPage';
import AccountDetailPage from '../pages/compte/DetailCompte';
import FormClient from '../pages/client/FormClient';
import Login from '../pages/Login'; 
import Home from '../pages/Home';
import ListeClient from '../pages/client/ListeClient';
import RoleManagement from "../pages/users/RoleManagement";
import UserManagement from "../pages/users/UserManagement";
import ProtectedRoute from './ProtectedRoute';
import Dashboard from '../pages/dashboard/Dashboard';
import AuditLogView from '../pages/AuditLogView';
import Agence from '../pages/agences/Agence';
import FormClientMorale from '../pages/client/FormClientMorale';
// Ajoute "Link" dans l'importation existante


const AppRoutes = () => {
  return (
    <Routes>
      {/* ==========================================
          ROUTES PUBLIQUES
          ========================================== */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />

      {/* ==========================================
          ROUTES PROTÉGÉES (GROUPE)
          Toutes les routes ici utilisent <Outlet /> du ProtectedRoute
          ========================================== */}
      <Route element={<ProtectedRoute />}>
        
        {/* Dashboard (Note : ajout du "/" et respect de la casse) */}
        <Route path="/dashboard" element={<Dashboard />} /> 

        {/* Gestion des utilisateurs */}
        <Route path="/users/roles" element={<RoleManagement />} />
        <Route path="/users/management" element={<UserManagement />} />

        {/* Comptes bancaires */}
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/accounts/create" element={<AccountCreatePage />} />
        <Route path="/accounts/:id" element={<AccountDetailPage />} />
        <Route path="/accounts/:id/edit" element={<AccountEditPage />} />

        {/* Clients */}
        <Route path='/client' element={<ListeClient />} /> 
        <Route path='/client/creer' element={<FormClient />} /> 
          <Route path='/client/creermorale' element={<FormClientMorale />} /> 

        <Route path='/client/:id/edit' element={<FormClient />} />

        {/* Logs d'Audit */}
        <Route path='/log' element={<AuditLogView />} />

        {/* gestion de s agences */}
        <Route path='/agence' element={<Agence />} />

      </Route>

      {/* ==========================================
          GESTION DES ERREURS
          ========================================== */}
      <Route path="*" element={<div className="p-5 text-center"><h3>Page Non Trouvée (404)</h3><Link to="/">Retourner à l'accueil</Link></div>} />
    </Routes>
  );
};

export default AppRoutes;