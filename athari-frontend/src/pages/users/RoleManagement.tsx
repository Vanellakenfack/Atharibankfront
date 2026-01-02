import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { mockRoles, permissionCategories } from './data/mockData';
import { 
  FiShield, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, 
  FiSearch, FiChevronRight, FiLock, FiUsers, FiSettings,
  FiCheckCircle, FiEye
} from 'react-icons/fi';
import Sidebar from '../../components/layout/Sidebar';
import TopBar from '../../components/layout/TopBar';
import { 
  Box, Button, TextField, Typography, Paper, Avatar, 
  Chip, IconButton, Tooltip, Dialog, DialogTitle, 
  DialogContent, DialogActions, InputAdornment,
  Card, CardContent, CardHeader, Divider, Badge,
  Switch, FormControlLabel, LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

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

const RoleManagement = () => {
  const [roles, setRoles] = useState(mockRoles);
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Filtrer les rôles selon la recherche
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Champ requis',
        text: 'Veuillez saisir un nom de rôle',
        confirmButtonColor: '#6366F1'
      });
      return;
    }

    if (roles.find(r => r.name === newRoleName)) {
      Swal.fire({
        icon: 'warning',
        title: 'Rôle existant',
        text: 'Ce rôle existe déjà',
        confirmButtonColor: '#6366F1'
      });
      return;
    }

    const newRole = {
      name: newRoleName,
      permissions: [],
      description: '',
      usersCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setRoles([...roles, newRole]);
    setSelectedRole(newRole);
    setNewRoleName('');
    setShowRoleForm(false);
    
    Swal.fire({
      icon: 'success',
      title: 'Rôle créé',
      text: 'Le rôle a été créé avec succès',
      confirmButtonColor: '#6366F1',
      timer: 2000
    });
  };

  const handleDeleteRole = (roleName) => {
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
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedRoles = roles.filter(r => r.name !== roleName);
        setRoles(updatedRoles);
        if (selectedRole.name === roleName) {
          setSelectedRole(updatedRoles[0] || null);
        }
        Swal.fire({
          icon: 'success',
          title: 'Supprimé !',
          text: 'Rôle supprimé avec succès',
          confirmButtonColor: '#6366F1',
          timer: 2000
        });
      }
    });
  };

  const togglePermission = (permission) => {
    if (!selectedRole) return;

    const updatedPermissions = selectedRole.permissions.includes(permission)
      ? selectedRole.permissions.filter(p => p !== permission)
      : [...selectedRole.permissions, permission];

    const updatedRole = { ...selectedRole, permissions: updatedPermissions };
    
    setRoles(roles.map(r => r.name === selectedRole.name ? updatedRole : r));
    setSelectedRole(updatedRole);
  };

  const toggleAllPermissionsInCategory = (category, enable) => {
    if (!selectedRole) return;

    const categoryPermissions = permissionCategories[category] || [];
    let updatedPermissions;

    if (enable) {
      updatedPermissions = [...new Set([...selectedRole.permissions, ...categoryPermissions])];
    } else {
      updatedPermissions = selectedRole.permissions.filter(
        p => !categoryPermissions.includes(p)
      );
    }

    const updatedRole = { ...selectedRole, permissions: updatedPermissions };
    
    setRoles(roles.map(r => r.name === selectedRole.name ? updatedRole : r));
    setSelectedRole(updatedRole);
  };

  const isAllPermissionsInCategoryEnabled = (category) => {
    const categoryPermissions = permissionCategories[category] || [];
    return categoryPermissions.every(p => selectedRole.permissions.includes(p));
  };

  const isSomePermissionsInCategoryEnabled = (category) => {
    const categoryPermissions = permissionCategories[category] || [];
    return categoryPermissions.some(p => selectedRole.permissions.includes(p));
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getRoleType = (roleName) => {
    if (roleName === 'Admin') return 'admin';
    if (roleName === 'DG') return 'dg';
    return 'custom';
  };

  const getRoleIcon = (roleName) => {
    switch (roleName) {
      case 'Admin': return <FiLock />;
      case 'DG': return <FiShield />;
      default: return <FiUsers />;
    }
  };

  const calculatePermissionPercentage = () => {
    if (!selectedRole) return 0;
    const totalPermissions = Object.values(permissionCategories).flat().length;
    return Math.round((selectedRole.permissions.length / totalPermissions) * 100);
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
                    {selectedRole?.permissions.length || 0}
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
                    {calculatePermissionPercentage()}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    Couverture des permissions
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
                  {filteredRoles.map((role) => (
                    <Box
                      key={role.name}
                      onClick={() => handleRoleSelect(role)}
                      sx={{
                        p: 3,
                        cursor: 'pointer',
                        borderBottom: '1px solid #F1F5F9',
                        backgroundColor: selectedRole?.name === role.name ? '#F8FAFF' : 'transparent',
                        borderLeft: selectedRole?.name === role.name ? '4px solid #6366F1' : '4px solid transparent',
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
                              {role.usersCount || 0} utilisateur(s)
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
                                  handleDeleteRole(role.name);
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
                            Permissions: {role.permissions.length}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: role.permissions.length > 10 ? '#059669' : 
                                   role.permissions.length > 5 ? '#D97706' : '#DC2626',
                            fontWeight: 600
                          }}>
                            {role.permissions.length > 10 ? 'Élevé' : 
                             role.permissions.length > 5 ? 'Moyen' : 'Bas'}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={(role.permissions.length / Object.values(permissionCategories).flat().length) * 100}
                          sx={{ 
                            height: 4,
                            borderRadius: 2,
                            bgcolor: '#F1F5F9',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: role.permissions.length > 10 ? '#10B981' : 
                                       role.permissions.length > 5 ? '#F59E0B' : '#EF4444'
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
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
                            Gérez les permissions et accès pour ce rôle
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" sx={{ 
                          fontWeight: 800,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          {selectedRole.permissions.length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748B' }}>
                          Permissions
                        </Typography>
                      </Box>
                    </Box>

                    {/* Permissions Categories */}
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 3 }}>
                        Catégories de permissions
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {Object.entries(permissionCategories).map(([category, permissions]) => (
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
                                {category}
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
                                    label={`${selectedRole.permissions.filter(p => permissions.includes(p)).length}/${permissions.length}`}
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
                                      key={permission}
                                      active={selectedRole.permissions.includes(permission)}
                                      onClick={() => togglePermission(permission)}
                                    >
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                          width: 20,
                                          height: 20,
                                          borderRadius: '4px',
                                          border: selectedRole.permissions.includes(permission) 
                                            ? '6px solid #6366F1' 
                                            : '2px solid #CBD5E1',
                                          bgcolor: selectedRole.permissions.includes(permission) 
                                            ? 'white' 
                                            : 'transparent',
                                          transition: 'all 0.2s'
                                        }} />
                                        <Typography variant="body2" sx={{ 
                                          fontWeight: 500,
                                          color: selectedRole.permissions.includes(permission) 
                                            ? '#1E293B' 
                                            : '#64748B'
                                        }}>
                                          {permission}
                                        </Typography>
                                        {selectedRole.permissions.includes(permission) && (
                                          <FiCheckCircle 
                                            style={{ 
                                              marginLeft: 'auto',
                                              color: '#059669'
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
        </Box>
      </Box>
    </Box>
  );
};

export default RoleManagement;