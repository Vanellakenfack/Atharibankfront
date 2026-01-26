import React from 'react';
import { Routes, Route, Navigate,Link } from "react-router-dom";
import FormClient from '../pages/client/FormClient';
import Login from '../pages/Login'; 
import Home from '../pages/Home';
import ListeClient from '../pages/client/ListeClient';
import RoleManagement from "../pages/users/RoleManagement";
import UserManagement from "../pages/users/UserManagement";
import Formulaire from '../pages/compte/Formulaire';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from '../pages/dashboard/Dashboard';
import AuditLogView from '../pages/AuditLogView';
import Agence from '../pages/agences/Agence';
import FormClientMorale from '../pages/client/FormClientMorale';
import ChoicePage from '../pages/client/ChoicePage';
import DetailsClient from '../pages/client/DetailsClient';
import ModifierClient from '../pages/client/ModifierClient';
import TypeCompteForm from '../pages/compte/TypeCompteForm';
import TypeCompteList from '../pages/compte/TypeCompteList';
import ListeComptes from '../pages/compte/ListeComptes';
import FraisCommissionPage from '../pages/FraisCommissionPage';
import FraisApplicationPage from '../pages/FraisApplicationPage';
import MataManagementPage from '../pages/MataManagementPage';
import PlanComptableList from '../pages/plancomptable/PlanComptableList';
import CategoryManager from '../pages/plancomptable/CategoryManager.jsx';
import DatContractManager from '../pages/compte/DatContractManager.jsx';
import DatTypeManager from '../pages/compte/DatTypeManager.jsx';
import JournalComptablePage from '../pages/journal/JournalComptablePage.js';
import AgenceForm from '../pages/TransactionsAdministratives/AgenceForm.js';
import GuichetForm from '../pages/TransactionsAdministratives/GuichetForm.js';
import CaisseForm from '../pages/TransactionsAdministratives/CaisseForm.js';
import Versement from '../pages/TransactionFrontOffice/TransactionCaisseEspece/Versement.js';
import BordereauVersementAC from '../pages/TransactionFrontOffice/TransactionCaisseEspece/BordereauVersementAC.js';
import BordereauVersementClient from '../pages/TransactionFrontOffice/TransactionCaisseEspece/BordereauVersementClient.js';
import EntreesSortiesCaisse from '../pages/TransactionFrontOffice/TransactionCaisseEspece/EntreesSortiesCaisse.js';
import TransfertInterCaisse from '../pages/TransactionFrontOffice/TransactionCaisseEspece/TransfertInterCaisse.js';
import DashboardCaissieres from '../pages/TransactionFrontOffice/DasbordCaisse/DashboardCaissieres.js';
import RetraitEspeces from '../pages/TransactionFrontOffice/TransactionCaisseEspece/RetraitEspeces.js';
import ValidationTransaction from '../pages/TransactionsAdministratives/ValidationTransaction.js';
import JournalCaissePage from '../pages/journal/JournalCaissePage.js';
import AddGestionnaire from '../pages/gestionnaire/AddGestionnaire.js';
import ListGestionnaire from '../pages/gestionnaire/ListGestionnaire.js';
import EditGestionnaire from '../pages/gestionnaire/EditGestionnaire.js';
import ValidationComptes from '../pages/validerCompte/ValidationComptes.js';
import TraitementFinJournee from '../pages/TransactionsAdministratives/TraitementFinJournee.js';


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


        
        {/* Types de comptes */}
        <Route path="/ajout-type-de-compte" element={<TypeCompteForm />} />
        <Route path="/Liste-type-de-compte" element={<TypeCompteList />} />

        {/* Clients */}
        <Route path='/client' element={<ListeClient />} /> 
        <Route path="/client/choix" element={<ChoicePage />} />
        <Route path='/client/creer' element={<FormClient />} /> 
        <Route path='/client/creermorale' element={<FormClientMorale />} /> 
        <Route path="/clients/:id" element={<DetailsClient />} />
        <Route path='/client/:id/edit' element={<ModifierClient />} />
          
        {/* Logs d'Audit */}
        <Route path='/log' element={<AuditLogView />} />

        {/* gestion de s agences */}
        <Route path='/agence' element={<Agence />} />

        {/* gestion des comptes clients */}
        <Route path='/compte' element={<Formulaire />} />
        <Route path='/liste-des-comptes' element={<ListeComptes />} />

        {/* Gestion des frais et commissions */}
        <Route path="/frais/commissions/*" element={<FraisCommissionPage />} />
        <Route path="/frais/applications/*" element={<FraisApplicationPage />} />
        
        {/* Gestion des opérations MATA */}
        <Route path="/comptes/:compteId/mata/*" element={<MataManagementPage />} />
        <Route path="/mata" element={<MataManagementPage />} />
        {/* Plan Comptable */}     
           <Route path='/plan-comptable' element={<PlanComptableList />} />
           <Route path='plan-comptable/categories' element={<CategoryManager/>} />

     {/* Gestion des contrats DAT */}
        <Route path='/dat/contracts' element={<DatContractManager/>} />
        <Route path='/dat/types' element={<DatTypeManager/>} />

      {/* Gestion  des journaux */}
      <Route path='/Journal-Comptable' element={<JournalComptablePage/>} />
      <Route path='/Journal-Caisse' element={<JournalCaissePage/>}/>

      {/* Gestion  des Transactions administratives  */}
      <Route path='/agence/form' element={<AgenceForm />} />
      <Route path='/guichet/form' element={<GuichetForm />} />
      <Route path='/caisse/form' element={<CaisseForm />} />
      <Route path='/Traitement-Fin-Journee' element={<TraitementFinJournee />} />
       


      {/* Gestion des transactions front office */}
      <Route path='/Versement' element={<Versement />} />
      <Route path='/versement/client' element={<BordereauVersementClient />} />
      <Route path='/versement/ac' element={<BordereauVersementAC />} />
      <Route path='/entrees-sorties-caisse' element={<EntreesSortiesCaisse />} />
      <Route path='/Transfert-Inter-Caisse' element={<TransfertInterCaisse />} />
      <Route path='/Dashboard-Caissieres' element={<DashboardCaissieres />} />            
      <Route path='/Retrait-Especes' element={<RetraitEspeces />} />
      <Route path='/validation-transaction' element={<ValidationTransaction />} />

      <Route path='/AddGestionnaire' element={<AddGestionnaire />} />
      <Route path='/ListGestionnaire' element={<ListGestionnaire />} />
      <Route path='/ValidationComptes' element={<ValidationComptes />} />

      </Route>

      {/* ==========================================
          GESTION DES ERREURS
          ========================================== */}
      <Route path="*" element={<div className="p-5 text-center"><h3>Page Non Trouvée (404)</h3><Link to="/">Retourner à l'accueil</Link></div>} />
    </Routes>
  );
};

export default AppRoutes;