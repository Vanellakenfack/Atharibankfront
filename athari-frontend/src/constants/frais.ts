/**
 * Constantes pour la gestion des frais et des opérations MATA
 */

// Types de frais
// export const TYPES_FRAIS = {
//   OUVERTURE: 'Frais d\'ouverture',
//   TENUE: 'Frais de tenue de compte',
//   OPERATION: 'Frais d\'opération'
// };

// Rubriques MATA
export const RUBRIQUES_MATA = [
  { value: 'COTISATION', label: 'Cotisation' },
  { value: 'EPARGNE', label: 'Épargne' },
  { value: 'AUTRE', label: 'Autre' }
];

// Types de mouvement
export const TYPES_MOUVEMENT = [
  { value: 'CREDIT', label: 'Crédit' },
  { value: 'DEBIT', label: 'Débit' }
];

// Options pour les sélecteurs de période
export const PERIODES = [
  { value: 'today', label: 'Aujourd\'hui' },
  { value: 'yesterday', label: 'Hier' },
  { value: 'this_week', label: 'Cette semaine' },
  { value: 'last_week', label: 'La semaine dernière' },
  { value: 'this_month', label: 'Ce mois-ci' },
  { value: 'last_month', label: 'Le mois dernier' },
  { value: 'this_year', label: 'Cette année' },
  { value: 'last_year', label: 'L\'année dernière' },
  { value: 'custom', label: 'Période personnalisée' }
];

// Options pour les filtres de statut
export const FILTRES_STATUT = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'active', label: 'Actifs uniquement' },
  { value: 'inactive', label: 'Inactifs uniquement' }
];

// Options pour les filtres d'annulation
export const FILTRES_ANNULE = [
  { value: 'all', label: 'Tous' },
  { value: 'active', label: 'Effectifs uniquement' },
  { value: 'cancelled', label: 'Annulés uniquement' }
];

// Colonnes pour l'export Excel
export const COLONNES_EXPORT = {
  FRAIS_COMMISSION: [
    { header: 'Type de compte', key: 'type_compte', width: 30 },
    { header: 'Frais ouverture', key: 'frais_ouverture', width: 15 },
    { header: 'Frais tenue', key: 'frais_tenue_compte', width: 15 },
    { header: 'Comm. mouvement', key: 'commission_mouvement', width: 15 },
    { header: 'Comm. retrait', key: 'commission_retrait', width: 15 },
    { header: 'Statut', key: 'statut', width: 15 }
  ],
  FRAIS_APPLICATION: [
    { header: 'Date', key: 'date_application', width: 20 },
    { header: 'Type', key: 'type_frais', width: 20 },
    { header: 'N° Compte', key: 'compte_numero', width: 20 },
    { header: 'Client', key: 'client_nom', width: 30 },
    { header: 'Montant', key: 'montant', width: 15 },
    { header: 'Statut', key: 'statut', width: 15 }
  ],
  MOUVEMENTS_MATA: [
    { header: 'Date', key: 'date_operation', width: 20 },
    { header: 'Rubrique', key: 'rubrique', width: 20 },
    { header: 'Type', key: 'type_mouvement', width: 15 },
    { header: 'Montant', key: 'montant', width: 15 },
    { header: 'Solde après opération', key: 'solde_apres_operation', width: 20 },
    { header: 'Référence', key: 'reference', width: 25 },
    { header: 'Statut', key: 'statut', width: 15 }
  ]
};

// Messages d'erreur
export const MESSAGES_ERREUR = {
  REQUIS: 'Ce champ est requis',
  NOMBRE: 'Veuillez entrer un nombre valide',
  TAUX: 'Le taux doit être compris entre 0 et 100',
  MONTANT_POSITIF: 'Le montant doit être supérieur à 0',
  DATE_INVALIDE: 'Date invalide',
  DATE_DEBUT_AVANT_FIN: 'La date de début doit être antérieure à la date de fin'
};

// Messages de succès
export const MESSAGES_SUCCES = {
  CREATION: 'Enregistrement créé avec succès',
  MODIFICATION: 'Enregistrement modifié avec succès',
  SUPPRESSION: 'Enregistrement supprimé avec succès',
  ANNULATION: 'Opération annulée avec succès',
  EXPORT: 'Export terminé avec succès'
};

// Options pour les sélecteurs de type de compte
export const getTypeCompteOptions = (typesCompte: any[]) => {
  return typesCompte.map(type => ({
    value: type.id.toString(),
    label: type.libelle
  }));
};
