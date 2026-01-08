import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  FiShield, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, 
  FiSearch, FiChevronRight, FiLock, FiUsers, FiSettings,
  FiCheckCircle, FiEye, FiKey, FiRefreshCw
} from 'react-icons/fi';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import { 
  Box, Button, TextField, Typography, Paper, Avatar, 
  Chip, IconButton, Tooltip, Dialog, DialogTitle, 
  DialogContent, DialogActions, InputAdornment,
  Card, CardContent, CardHeader, Divider, Badge,
  Switch, FormControlLabel, LinearProgress,
  Select, MenuItem, FormControl, InputLabel, OutlinedInput,
  Checkbox, ListItemText, FormGroup
} from '@mui/material';
import { styled } from '@mui/material/styles';
import type { Permission } from '../../services/permissionService';
import type { Role } from '../../services/roleService';

import permissionService from '../../services/permissionService';
import roleService from '../../services/roleService';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)'
  }
}));

const PermissionCard = styled(Paper)(({ theme, active }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  border: `2px solid ${active ? '#6366F1' : '#E2E8F0'}`,
  backgroundColor: active ? '#F8FAFF' : '#FFFFFF',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    borderColor: active ? '#6366F1' : '#CBD5E1',
    backgroundColor: active ? '#F8FAFF' : '#F8FAFC'
  }
}));

const RoleBadge = styled(Chip)(({ roletype }) => ({
  borderRadius: 8,
  fontWeight: 600,
  backgroundColor: roletype === 'admin' ? '#FEF2F2' : 
                   roletype === 'dg' ? '#F0F9FF' : '#F0FDF4',
  color: roletype === 'admin' ? '#DC2626' : 
         roletype === 'dg' ? '#0369A1' : '#059669'
}));

const GradientButton = styled(Button)({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  borderRadius: 12,
  padding: '12px 24px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.9375rem',
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
  '&:hover': {
    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
  }
});

// Interface pour les permissions catégorisées
interface CategorizedPermissions {
  [category: string]: Permission[];
}

const RoleManagement = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [showPermissionForm, setShowPermissionForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newPermission, setNewPermission] = useState({
    name: '',
    description: '',
    roleIds: [] as number[]
  });
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [categorizedPermissions, setCategorizedPermissions] = useState<CategorizedPermissions>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // Charger les rôles et permissions depuis le backend
  useEffect(() => {
    fetchAvailableRoles();
    fetchAllPermissions();
  }, []);

  // Charger les rôles depuis le backend
  const fetchAvailableRoles = async () => {
    setLoadingRoles(true);
    try {
      const rolesData = await roleService.getRoles();
      setAvailableRoles(rolesData);
      setRoles(rolesData);
      if (rolesData.length > 0 && !selectedRole) {
        setSelectedRole(rolesData[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des rôles:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible de charger les rôles',
        confirmButtonColor: '#6366F1'
      });
    } finally {
      setLoadingRoles(false);
    }
  };

  // Charger les permissions depuis le backend
  const fetchAllPermissions = async () => {
    setLoadingPermissions(true);
    try {
      const permissions = await permissionService.getAll();
      setAllPermissions(permissions);
      
      // Catégoriser les permissions dynamiquement
      const categorized = categorizePermissions(permissions);
      setCategorizedPermissions(categorized);
      
    } catch (error) {
      console.error('Erreur lors du chargement des permissions:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible de charger les permissions',
        confirmButtonColor: '#6366F1'
      });
    } finally {
      setLoadingPermissions(false);
    }
  };

  // Fonction pour catégoriser les permissions automatiquement
  const categorizePermissions = (permissions: Permission[]): CategorizedPermissions => {
    const categories: CategorizedPermissions = {
      'Général': [],
      'Utilisateurs': [],
      'Rôles': [],
      'Documents': [],
      'Rapports': [],
      'Système': []
    };

    const categoryKeywords: { [key: string]: string[] } = {
      'Utilisateurs': ['utilisateur', 'user', 'compte', 'profile', 'gerer utilisateurs'],
      'Rôles': ['rôle', 'role', 'permission', 'gerer roles', 'gerer permissions'],
      'Documents': ['document', 'fichier', 'file', 'upload', 'télécharger'],
      'Rapports': ['rapport', 'report', 'statistique', 'analytique', 'exporter'],
      'Système': ['système', 'system', 'paramètre', 'setting', 'configuration', 'log']
    };

    permissions.forEach(permission => {
      let categorized = false;
      const permissionName = permission.name.toLowerCase();

      // Chercher dans les catégories spécifiques
      for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => permissionName.includes(keyword))) {
          categories[category].push(permission);
          categorized = true;
          break;
        }
      }

      // Si non catégorisé, mettre dans Général
      if (!categorized) {
        categories['Général'].push(permission);
      }
    });

    // Supprimer les catégories vides
    Object.keys(categories).forEach(category => {
      if (categories[category].length === 0) {
        delete categories[category];
      }
    });

    return categories;
  };

  // Filtrer les rôles selon la recherche
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculer le total des permissions dynamiquement
  const calculateTotalPermissions = () => {
    return allPermissions.length;
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Champ requis',
        text: 'Veuillez saisir un nom de rôle',
        confirmButtonColor: '#6366F1'
      });
      return;
    }

    // Vérifier si le rôle existe déjà
    if (roles.find(r => r.name === newRoleName)) {
      Swal.fire({
        icon: 'warning',
        title: 'Rôle existant',
        text: 'Ce rôle existe déjà',
        confirmButtonColor: '#6366F1'
      });
      return;
    }

    try {
      // Créer le rôle via l'API
      const newRoleData = await roleService.createRole({
        name: newRoleName,
        description: ''
      });

      // Mettre à jour la liste des rôles
      setRoles([...roles, newRoleData]);
      setSelectedRole(newRoleData);
      setNewRoleName('');
      setShowRoleForm(false);
      
      // Rafraîchir la liste des rôles disponibles
      await fetchAvailableRoles();
      
      Swal.fire({
        icon: 'success',
        title: 'Rôle créé',
        text: 'Le rôle a été créé avec succès',
        confirmButtonColor: '#6366F1',
        timer: 2000
      });
    } catch (error) {
      console.error('Erreur lors de la création du rôle:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.response?.data?.message || 'Impossible de créer le rôle',
        confirmButtonColor: '#6366F1'
      });
    }
  };

  const handleDeleteRole = async (roleName: string, roleId?: number) => {
    if (roleName === 'Admin' || roleName === 'DG') {
      Swal.fire({
        icon: 'error',
        title: 'Action non autorisée',
        text: 'Ce rôle ne peut pas être supprimé',
        confirmButtonColor: '#6366F1'
      });
      return;
    }

    Swal.fire({
      title: 'Confirmer la suppression',
      text: `Voulez-vous vraiment supprimer le rôle "${roleName}" ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed && roleId) {
        try {
          // Supprimer le rôle via l'API
          await roleService.deleteRole(roleId);
          
          // Mettre à jour la liste locale
          const updatedRoles = roles.filter(r => r.id !== roleId);
          setRoles(updatedRoles);
          
          if (selectedRole?.id === roleId) {
            setSelectedRole(updatedRoles[0] || null);
          }
          
          // Rafraîchir la liste des rôles disponibles
          await fetchAvailableRoles();
          
          Swal.fire({
            icon: 'success',
            title: 'Supprimé !',
            text: 'Rôle supprimé avec succès',
            confirmButtonColor: '#6366F1',
            timer: 2000
          });
        } catch (error) {
          console.error('Erreur lors de la suppression du rôle:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: error.response?.data?.message || 'Impossible de supprimer le rôle',
            confirmButtonColor: '#6366F1'
          });
        }
      }
    });
  };

  const togglePermission = async (permissionName: string) => {
    if (!selectedRole) return;

    const updatedPermissions = selectedRole.permissions.includes(permissionName)
      ? selectedRole.permissions.filter(p => p !== permissionName)
      : [...selectedRole.permissions, permissionName];

    try {
      // Mettre à jour les permissions du rôle via l'API
      const updatedRole = await roleService.syncRolePermissions(
        selectedRole.id!,
        updatedPermissions
      );
      
      // Mettre à jour la liste locale des rôles
      const updatedRoles = roles.map(r => 
        r.id === selectedRole.id ? { ...r, permissions: updatedPermissions } : r
      );
      
      setRoles(updatedRoles);
      setSelectedRole({ ...selectedRole, permissions: updatedPermissions });
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour des permissions:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible de mettre à jour les permissions',
        confirmButtonColor: '#6366F1'
      });
    }
  };

  const handleAddPermission = async () => {
    if (!newPermission.name.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Champ requis',
        text: 'Veuillez saisir un nom de permission',
        confirmButtonColor: '#6366F1'
      });
      return;
    }

    if (newPermission.roleIds.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Rôle requis',
        text: 'Veuillez sélectionner au moins un rôle',
        confirmButtonColor: '#6366F1'
      });
      return;
    }

    // Vérifier si la permission existe déjà
    if (allPermissions.some(p => p.name === newPermission.name)) {
      Swal.fire({
        icon: 'warning',
        title: 'Permission existante',
        text: 'Cette permission existe déjà',
        confirmButtonColor: '#6366F1'
      });
      return;
    }

    try {
      // Créer la permission via l'API
      const createdPermission = await permissionService.create({
        name: newPermission.name,
        description: newPermission.description
      });

      // Assigner la permission aux rôles sélectionnés
      for (const roleId of newPermission.roleIds) {
        const role = availableRoles.find(r => r.id === roleId);
        if (role) {
          const currentPermissions = role.permissions || [];
          await roleService.syncRolePermissions(roleId, [...currentPermissions, newPermission.name]);
        }
      }

      // Réinitialiser le formulaire
      setNewPermission({
        name: '',
        description: '',
        roleIds: []
      });
      setShowPermissionForm(false);

      // Rafraîchir les données
      await fetchAllPermissions();
      await fetchAvailableRoles();

      Swal.fire({
        icon: 'success',
        title: 'Permission créée',
        text: 'La permission a été créée et assignée aux rôles sélectionnés',
        confirmButtonColor: '#6366F1',
        timer: 3000
      });
    } catch (error) {
      console.error('Erreur lors de la création de la permission:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: error.response?.data?.message || 'Impossible de créer la permission',
        confirmButtonColor: '#6366F1'
      });
    }
  };

  const toggleAllPermissionsInCategory = async (category: string, enable: boolean) => {
    if (!selectedRole) return;

    const categoryPermissions = categorizedPermissions[category] || [];
    const permissionNames = categoryPermissions.map(p => p.name);
    
    let updatedPermissions: string[];

    if (enable) {
      updatedPermissions = [...new Set([...selectedRole.permissions, ...permissionNames])];
    } else {
      updatedPermissions = selectedRole.permissions.filter(
        p => !permissionNames.includes(p)
      );
    }

    try {
      // Mettre à jour les permissions via l'API
      const updatedRole = await roleService.syncRolePermissions(
        selectedRole.id!,
        updatedPermissions
      );
      
      // Mettre à jour localement
      const updatedRoles = roles.map(r => 
        r.id === selectedRole.id ? { ...r, permissions: updatedPermissions } : r
      );
      
      setRoles(updatedRoles);
      setSelectedRole({ ...selectedRole, permissions: updatedPermissions });
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour des permissions:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible de mettre à jour les permissions',
        confirmButtonColor: '#6366F1'
      });
    }
  };

  const isAllPermissionsInCategoryEnabled = (category: string): boolean => {
    if (!selectedRole || !Array.isArray(selectedRole.permissions)) return false;
    const categoryPermissions = categorizedPermissions[category] || [];
    const permissionNames = categoryPermissions.map(p => p?.name).filter(Boolean);
    if (permissionNames.length === 0) return false;
    return permissionNames.every(p => selectedRole.permissions?.includes(p));
  };

  const isSomePermissionsInCategoryEnabled = (category: string): boolean => {
    if (!selectedRole || !Array.isArray(selectedRole.permissions)) return false;
    const categoryPermissions = categorizedPermissions[category] || [];
    const permissionNames = categoryPermissions.map(p => p?.name).filter(Boolean);
    if (permissionNames.length === 0) return false;
    return permissionNames.some(p => selectedRole.permissions?.includes(p));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getRoleType = (roleName: string) => {
    if (roleName === 'Admin') return 'admin';
    if (roleName === 'DG') return 'dg';
    return 'custom';
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'Admin': return <FiLock />;
      case 'DG': return <FiShield />;
      default: return <FiUsers />;
    }
  };

  const calculatePermissionPercentage = () => {
    if (!selectedRole) return 0;
    const totalPermissions = calculateTotalPermissions();
    return Math.round((selectedRole.permissions.length / totalPermissions) * 100);
  };

  const handleRoleSelectChange = (event: any) => {
    const { value } = event.target;
    setNewPermission({
      ...newPermission,
      roleIds: typeof value === 'string' ? value.split(',').map(Number) : value,
    });
  };

  const handleRefreshPermissions = () => {
    fetchAllPermissions();
    fetchAvailableRoles();
    Swal.fire({
      icon: 'success',
      title: 'Données rafraîchies',
      text: 'La liste des permissions et rôles a été mise à jour',
      confirmButtonColor: '#6366F1',
      timer: 2000
    });
  };

  // Fonction pour compter les utilisateurs par rôle (à adapter selon votre API)
  const getUsersCount = (roleId?: number) => {
    // Cette fonction dépend de votre API
    // Pour l'instant, on retourne une valeur par défaut
    return 0;
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          width: `calc(100% - ${sidebarOpen ? '280px' : '80px'})`,
          transition: 'width 0.3s ease'
        }}
      >
        {/* TopBar */}
        <TopBar sidebarOpen={sidebarOpen} />

        {/* Page Content */}
        <Box sx={{ px: { xs: 2, md: 4 }, py: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" sx={{ 
                  fontWeight: 800, 
                  color: '#1E293B',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}>
                  Gestion des Rôles
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748B', maxWidth: '600px' }}>
                  Définissez les permissions et accès pour chaque rôle. 
                  Visualisez et modifiez les droits en temps réel.
                </Typography>
              </Box>
              <Tooltip title="Rafraîchir les données">
                <IconButton
                  onClick={handleRefreshPermissions}
                  sx={{
                    bgcolor: '#EEF2FF',
                    color: '#6366F1',
                    '&:hover': { bgcolor: '#E0E7FF' }
                  }}
                >
                  <FiRefreshCw />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Stats Overview */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
            <StyledCard>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#EEF2FF', color: '#6366F1' }}>
                  <FiUsers size={24} />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {roles.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    Rôles configurés
                  </Typography>
                </Box>
              </CardContent>
            </StyledCard>

            <StyledCard>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#F0F9FF', color: '#0EA5E9' }}>
                  <FiCheckCircle size={24} />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {selectedRole?.permissions?.length ?? 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    Permissions actives
                  </Typography>
                </Box>
              </CardContent>
            </StyledCard>

            <StyledCard>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#F0FDF4', color: '#10B981' }}>
                  <FiShield size={24} />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {calculateTotalPermissions()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    Permissions disponibles
                  </Typography>
                </Box>
              </CardContent>
            </StyledCard>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 2fr' }, gap: 4 }}>
            {/* Left Panel - Role List */}
            <Box>
              <StyledCard>
                <CardHeader 
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>
                      Rôles disponibles
                    </Typography>
                  }
                  action={
                    <Tooltip title="Créer un nouveau rôle">
                      <IconButton 
                        onClick={() => setShowRoleForm(true)}
                        sx={{ 
                          bgcolor: '#6366F1', 
                          color: 'white',
                          '&:hover': { bgcolor: '#4F46E5' }
                        }}
                      >
                        <FiPlus />
                      </IconButton>
                    </Tooltip>
                  }
                />
                
                <Box sx={{ px: 3, pb: 2 }}>
                  <TextField
                    fullWidth
                    placeholder="Rechercher un rôle..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FiSearch size={20} color="#94A3B8" />
                        </InputAdornment>
                      ),
                      sx: { 
                        borderRadius: 3,
                        '& fieldset': { borderColor: '#E2E8F0' }
                      }
                    }}
                    size="small"
                  />
                </Box>

                <Divider />

                <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {loadingRoles ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <LinearProgress sx={{ width: '100%', mb: 2 }} />
                      <Typography variant="body2" sx={{ color: '#64748B' }}>
                        Chargement des rôles...
                      </Typography>
                    </Box>
                  ) : filteredRoles.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>
                        Aucun rôle trouvé
                      </Typography>
                    </Box>
                  ) : (
                    filteredRoles.map((role) => (
                      <Box
                        key={role.id}
                        onClick={() => handleRoleSelect(role)}
                        sx={{
                          p: 3,
                          cursor: 'pointer',
                          borderBottom: '1px solid #F1F5F9',
                          backgroundColor: selectedRole?.id === role.id ? '#F8FAFF' : 'transparent',
                          borderLeft: selectedRole?.id === role.id ? '4px solid #6366F1' : '4px solid transparent',
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: '#F8FAFC'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ 
                              bgcolor: getRoleType(role.name) === 'admin' ? '#FEF2F2' : 
                                       getRoleType(role.name) === 'dg' ? '#F0F9FF' : '#F0FDF4',
                              color: getRoleType(role.name) === 'admin' ? '#DC2626' : 
                                     getRoleType(role.name) === 'dg' ? '#0369A1' : '#059669'
                            }}>
                              {getRoleIcon(role.name)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1E293B' }}>
                                {role.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
                                {getUsersCount(role.id)} utilisateur(s)
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <RoleBadge 
                              label={getRoleType(role.name)}
                              roletype={getRoleType(role.name)}
                              size="small"
                            />
                            {(role.name !== 'Admin' && role.name !== 'DG') && (
                              <Tooltip title="Supprimer">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteRole(role.name, role.id);
                                  }}
                                  sx={{ 
                                    color: '#DC2626',
                                    '&:hover': { bgcolor: '#FEF2F2' }
                                  }}
                                >
                                  <FiTrash2 size={16} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                        
                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              Permissions: {role.permissions?.length || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              color: (role.permissions?.length || 0) > (calculateTotalPermissions() / 2) ? '#059669' : 
                                     (role.permissions?.length || 0) > (calculateTotalPermissions() / 4) ? '#D97706' : '#DC2626',
                              fontWeight: 600
                            }}>
                              {(role.permissions?.length || 0) > (calculateTotalPermissions() / 2) ? 'Élevé' : 
                               (role.permissions?.length || 0) > (calculateTotalPermissions() / 4) ? 'Moyen' : 'Bas'}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={role.permissions?.length ? (role.permissions.length / calculateTotalPermissions()) * 100 : 0}
                            sx={{ 
                              height: 4,
                              borderRadius: 2,
                              bgcolor: '#F1F5F9',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: (role.permissions?.length || 0) > (calculateTotalPermissions() / 2) ? '#10B981' : 
                                         (role.permissions?.length || 0) > (calculateTotalPermissions() / 4) ? '#F59E0B' : '#EF4444'
                              }
                            }}
                          />
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              </StyledCard>
            </Box>

            {/* Right Panel - Role Details & Permissions */}
            <Box>
              {selectedRole ? (
                <StyledCard>
                  <CardContent>
                    {/* Role Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Avatar sx={{ 
                          width: 64, 
                          height: 64,
                          bgcolor: getRoleType(selectedRole.name) === 'admin' ? '#FEF2F2' : 
                                   getRoleType(selectedRole.name) === 'dg' ? '#F0F9FF' : '#F0FDF4',
                          color: getRoleType(selectedRole.name) === 'admin' ? '#DC2626' : 
                                 getRoleType(selectedRole.name) === 'dg' ? '#0369A1' : '#059669'
                        }}>
                          {getRoleIcon(selectedRole.name)}
                        </Avatar>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E293B' }}>
                              {selectedRole.name}
                            </Typography>
                            <RoleBadge 
                              label={getRoleType(selectedRole.name)}
                              roletype={getRoleType(selectedRole.name)}
                            />
                          </Box>
                          <Typography variant="body1" sx={{ color: '#64748B' }}>
                            {selectedRole.description || 'Gérez les permissions et accès pour ce rôle'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography variant="h3" sx={{ 
                          fontWeight: 800,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          {selectedRole?.permissions?.length ?? 0}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748B', mb: 1 }}>
                          Permissions
                        </Typography>
                        <Tooltip title="Ajouter une permission">
                          <IconButton
                            onClick={() => setShowPermissionForm(true)}
                            sx={{
                              bgcolor: '#10B981',
                              color: 'white',
                              '&:hover': { bgcolor: '#059669' }
                            }}
                          >
                            <FiKey />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    {/* Permissions Categories */}
                    <Box sx={{ mt: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B' }}>
                          Catégories de permissions
                        </Typography>
                        <Chip 
                          label={`${allPermissions.length} permissions totales`}
                          sx={{ bgcolor: '#EEF2FF', color: '#6366F1', fontWeight: 600 }}
                        />
                      </Box>

                      {loadingPermissions ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                          <LinearProgress sx={{ width: '100%', mb: 2 }} />
                          <Typography variant="body1" sx={{ color: '#64748B' }}>
                            Chargement des permissions...
                          </Typography>
                        </Box>
                      ) : Object.keys(categorizedPermissions).length === 0 ? (
                        <StyledCard sx={{ textAlign: 'center', py: 8 }}>
                          <FiKey style={{ fontSize: '64px', color: '#CBD5E1', margin: '0 auto 16px' }} />
                          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 1 }}>
                            Aucune permission disponible
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#64748B', mb: 3 }}>
                            Créez votre première permission pour commencer
                          </Typography>
                          <GradientButton onClick={() => setShowPermissionForm(true)}>
                            <FiPlus style={{ marginRight: 8 }} />
                            Créer une permission
                          </GradientButton>
                        </StyledCard>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {Object.entries(categorizedPermissions).map(([category, permissions]) => (
                            <Paper 
                              key={category} 
                              elevation={0}
                              sx={{ 
                                border: '1px solid #E2E8F0', 
                                borderRadius: 3,
                                overflow: 'hidden'
                              }}
                            >
                              {/* Category Header */}
                              <Box 
                                onClick={() => toggleCategory(category)}
                                sx={{
                                  p: 3,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  cursor: 'pointer',
                                  bgcolor: '#F8FAFC',
                                  '&:hover': { bgcolor: '#F1F5F9' }
                                }}
                              >
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1E293B' }}>
                                  {category} ({permissions.length})
                                </Typography>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Tooltip title="Tout cocher">
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleAllPermissionsInCategory(category, true);
                                        }}
                                        sx={{
                                          color: isAllPermissionsInCategoryEnabled(category) ? '#059669' : '#94A3B8',
                                          '&:hover': { bgcolor: '#F0FDF4' }
                                        }}
                                      >
                                        <FiCheck />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Tout décocher">
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleAllPermissionsInCategory(category, false);
                                        }}
                                        sx={{
                                          color: !isSomePermissionsInCategoryEnabled(category) ? '#DC2626' : '#94A3B8',
                                          '&:hover': { bgcolor: '#FEF2F2' }
                                        }}
                                      >
                                        <FiX />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip 
                                      label={`${(selectedRole?.permissions?.filter(p => permissions?.some(perm => perm?.name === p)) || []).length}/${permissions?.length || 0}`}
                                      size="small"
                                      sx={{ 
                                        bgcolor: '#EEF2FF',
                                        color: '#6366F1',
                                        fontWeight: 600
                                      }}
                                    />
                                    <FiChevronRight 
                                      style={{ 
                                        transform: expandedCategories[category] ? 'rotate(90deg)' : 'none',
                                        transition: 'transform 0.2s',
                                        color: '#64748B'
                                      }}
                                    />
                                  </Box>
                                </Box>
                              </Box>

                              {/* Permissions List */}
                              {expandedCategories[category] && (
                                <Box sx={{ p: 3, pt: 2 }}>
                                  <Box sx={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' },
                                    gap: 2 
                                  }}>
                                    {permissions.map((permission) => (
                                      <PermissionCard 
                                        key={permission.id}
                                        active={selectedRole?.permissions?.includes(permission.name) || false}
                                        onClick={() => togglePermission(permission.name)}
                                      >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                          <Box sx={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: '4px',
                                            border: selectedRole?.permissions?.includes(permission.name) 
                                              ? '6px solid #6366F1' 
                                              : '2px solid #CBD5E1',
                                            bgcolor: selectedRole?.permissions?.includes(permission.name) 
                                              ? 'white' 
                                              : 'transparent',
                                            transition: 'all 0.2s'
                                          }} />
                                          <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" sx={{ 
                                              fontWeight: 500,
                                              color: selectedRole?.permissions?.includes(permission.name) 
                                                ? '#1E293B' 
                                                : '#64748B'
                                            }}>
                                              {permission.name}
                                            </Typography>
                                            {permission.description && (
                                              <Typography variant="caption" sx={{ 
                                                color: '#94A3B8',
                                                display: 'block',
                                                mt: 0.5
                                              }}>
                                                {permission.description}
                                              </Typography>
                                            )}
                                          </Box>
                                          {selectedRole?.permissions?.includes(permission.name) && (
                                            <FiCheckCircle 
                                              style={{ 
                                                color: '#059669',
                                                flexShrink: 0
                                              }}
                                            />
                                          )}
                                        </Box>
                                      </PermissionCard>
                                    ))}
                                  </Box>
                                </Box>
                              )}
                            </Paper>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </StyledCard>
              ) : (
                <StyledCard sx={{ textAlign: 'center', py: 8 }}>
                  <FiShield style={{ fontSize: '64px', color: '#CBD5E1', margin: '0 auto 16px' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1E293B', mb: 1 }}>
                    Aucun rôle sélectionné
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748B', mb: 3 }}>
                    Sélectionnez un rôle dans la liste pour visualiser et modifier ses permissions
                  </Typography>
                  <GradientButton onClick={() => setShowRoleForm(true)}>
                    <FiPlus style={{ marginRight: 8 }} />
                    Créer un nouveau rôle
                  </GradientButton>
                </StyledCard>
              )}
            </Box>
          </Box>

          {/* Dialog for New Role */}
          <Dialog 
            open={showRoleForm} 
            onClose={() => setShowRoleForm(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ 
              borderBottom: '1px solid #E2E8F0',
              pb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Avatar sx={{ bgcolor: '#EEF2FF', color: '#6366F1' }}>
                <FiPlus />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Nouveau Rôle
              </Typography>
            </DialogTitle>
            
            <DialogContent sx={{ pt: 3 }}>
              <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                Créez un nouveau rôle et définissez ses permissions par la suite.
              </Typography>
              
              <TextField
                autoFocus
                fullWidth
                label="Nom du rôle"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Ex: Superviseur"
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Description (optionnel)"
                multiline
                rows={3}
                placeholder="Décrivez le rôle et ses responsabilités..."
                sx={{ mb: 2 }}
              />
            </DialogContent>
            
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button 
                onClick={() => setShowRoleForm(false)}
                sx={{ 
                  color: '#64748B',
                  '&:hover': { bgcolor: '#F1F5F9' }
                }}
              >
                Annuler
              </Button>
              <GradientButton onClick={handleAddRole}>
                Créer le rôle
              </GradientButton>
            </DialogActions>
          </Dialog>

          {/* Dialog for New Permission */}
          <Dialog 
            open={showPermissionForm} 
            onClose={() => setShowPermissionForm(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ 
              borderBottom: '1px solid #E2E8F0',
              pb: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Avatar sx={{ bgcolor: '#10B981', color: 'white' }}>
                <FiKey />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Nouvelle Permission
              </Typography>
            </DialogTitle>
            
            <DialogContent sx={{ pt: 3 }}>
              <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
                Créez une nouvelle permission et assignez-la aux rôles sélectionnés.
              </Typography>
              
              <TextField
                autoFocus
                fullWidth
                label="Nom de la permission *"
                value={newPermission.name}
                onChange={(e) => setNewPermission({...newPermission, name: e.target.value})}
                placeholder="Ex: consulter rapports"
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newPermission.description}
                onChange={(e) => setNewPermission({...newPermission, description: e.target.value})}
                placeholder="Décrivez l'action permise..."
                sx={{ mb: 3 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="roles-select-label">Rôles associés *</InputLabel>
                <Select
                  labelId="roles-select-label"
                  id="roles-select"
                  multiple
                  value={newPermission.roleIds}
                  onChange={handleRoleSelectChange}
                  input={<OutlinedInput label="Rôles associés *" />}
                  renderValue={(selected) => {
                    const selectedRoles = availableRoles.filter(role => 
                      selected.includes(role.id!)
                    ).map(role => role.name);
                    return selectedRoles.join(', ');
                  }}
                >
                  {availableRoles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      <Checkbox checked={newPermission.roleIds.indexOf(role.id!) > -1} />
                      <ListItemText primary={role.name} />
                      <Chip 
                        label={`${role.permissions?.length || 0} perm.`}
                        size="small"
                        sx={{ ml: 1, bgcolor: '#EEF2FF', color: '#6366F1' }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedRole && newPermission.roleIds.includes(selectedRole.id!)}
                      onChange={(e) => {
                        if (selectedRole) {
                          if (e.target.checked) {
                            setNewPermission({
                              ...newPermission,
                              roleIds: [...newPermission.roleIds, selectedRole.id!]
                            });
                          } else {
                            setNewPermission({
                              ...newPermission,
                              roleIds: newPermission.roleIds.filter(id => id !== selectedRole.id)
                            });
                          }
                        }
                      }}
                    />
                  }
                  label={`Inclure le rôle actuel (${selectedRole?.name || 'Aucun'})`}
                />
              </FormGroup>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button 
                onClick={() => setShowPermissionForm(false)}
                sx={{ 
                  color: '#64748B',
                  '&:hover': { bgcolor: '#F1F5F9' }
                }}
              >
                Annuler
              </Button>
              <GradientButton onClick={handleAddPermission}>
                <FiKey style={{ marginRight: 8 }} />
                Créer la permission
              </GradientButton>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
};

export default RoleManagement;