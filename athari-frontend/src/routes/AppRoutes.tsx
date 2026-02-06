import { Routes, Route, Link } from 'react-router-dom';
import ComiteAgenceDashboard from "../pages/credit/ComiteAgenceDashboard";
import Home from '../pages/Home';
import Login from '../pages/Login';
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
import FormClient from '../pages/client/FormClient';
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
import NouvelleDemandeCredit from "../pages/credit/nouvelle-demande.jsx";
import NouvelleDemandeFlash from "../pages/credit/nouvelle-demande-flash";
import MesDemandes from "../pages/credit/MesDemandes.jsx";
import CreditAnalystDashboard from "../pages/credit/CreditAnalystDashboard";
import ChefAgenceDashboard from "../pages/credit/ChefAgenceDashboard";
import AssistantComptableDashboard from "../pages/credit/AssistantComptableDashboard";
import ChefComptableDashboard from "../pages/credit/ChefComptableDashboard";
import AssistantJuridiqueDashboard from "../pages/credit/AssistantJuridiqueDashboard";

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

      {/* Gestion des transactions front office */}
      <Route path='/Versement' element={<Versement />} />
      <Route path='/versement/client' element={<BordereauVersementClient />} />
      <Route path='/versement/ac' element={<BordereauVersementAC />} />
      <Route path='/entrees-sorties-caisse' element={<EntreesSortiesCaisse />} />
      <Route path='/Transfert-Inter-Caisse' element={<TransfertInterCaisse />} />
      <Route path='/Dashboard-Caissieres' element={<DashboardCaissieres />} />
      <Route path='/Retrait-Especes' element={<RetraitEspeces />} />
      <Route path='/validation-transaction' element={<ValidationTransaction />} />

      {/* Credit routes */}
      <Route path="/credit/nouvelle-demande" element={<NouvelleDemandeCredit />} />
      <Route path="/credit/nouvelle-demande-flash" element={<NouvelleDemandeFlash />} />
      <Route path="/credit/MesDemandes" element={<MesDemandes />} />
      <Route path="/credit/analyste-dashboard" element={<CreditAnalystDashboard />} />
      <Route path="/credit/chef-agence-dashboard" element={<ChefAgenceDashboard />} />
      <Route path="/credit/assistant-comptable-dashboard" element={<AssistantComptableDashboard />} />
      <Route path="/credit/chef-comptable-dashboard" element={<ChefComptableDashboard />} />
      <Route path="/credit/comite-agence-dashboard" element={<ComiteAgenceDashboard />} />
      <Route path="/credit/assistant-juridique-dashboard" element={<AssistantJuridiqueDashboard />} />
      </Route>

      {/* ==========================================
          GESTION DES ERREURS
          ========================================== */}
      <Route path="*" element={<div className="p-5 text-center"><h3>Page Non Trouvée (404)</h3><Link to="/">Retourner à l'accueil</Link></div>} />
    </Routes>
  );
};

export default AppRoutes;