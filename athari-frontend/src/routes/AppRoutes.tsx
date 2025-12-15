import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import AccountsPage from '../pages/compte/ComptePage';
import AccountCreatePage from '../pages/compte/CreationCompte';
import AccountEditPage from '../pages/compte/EditionPage';
import AccountDetailPage from '../pages/compte/DetailCompte';
import FormClient from '../pages/client/FormClient';
//import Home from '../pages/Home';
import Login from '../pages/Login'; 
import Home from '../pages/Home';
import ListeClient from '../pages/client/ListeClient';
import RoleManagement from "../pages/users/RoleManagement";
import UserManagement from "../pages/users/UserManagement";
import ProtectedRoute from "../components/users/ProtectedRoute";
import Dashboard from '../pages/dashboard/Dashboard';
import AuditLogView from '../pages/AuditLogView'
const AppRoutes = () => {
  return (
    <Routes>
      {/* Route de connexion (URL: /login) */}
      <Route 
          path="/login" 
          element={<Login />} 
        />

      {/* Page d'Accueil (URL: /) */}
      <Route path="/" element={<Home />} />


      
      {/* Routes proteger */}
    <Route element={<ProtectedRoute />}>
      <Route path="/users/roles" element={<RoleManagement />}/>

      <Route path="/users/management" element={ <UserManagement />}/>

      <Route path="/accounts" element={<AccountsPage />} />
      <Route path="/accounts/create" element={<AccountCreatePage />} />
      <Route path="/accounts/:id" element={<AccountDetailPage />} />
      <Route path="/accounts/:id/edit" element={<AccountEditPage />} />
        

      <Route path='/client' element= {<ListeClient/>} /> 
      <Route path='/client/creer' element= {<FormClient/>} /> 
      <Route path='/client/:id/edit' element= {<FormClient/>} />
      <Route path='Dashboard' element= {<Dashboard/>} /> 
    </Route>
           <Route path='/log' element= {<AuditLogView/>} /> 

      

      {/* Route Catch-all (URL inexistante / 404) */}
      <Route path="*" element={<div>Page Non Trouvée (404)</div>} />

    </Routes>
  );
};

export default AppRoutes;