import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  Typography,
  Chip,
  Avatar,
  Tooltip,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import GavelIcon from '@mui/icons-material/Gavel';
import DescriptionIcon from '@mui/icons-material/Description';

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${StepConnector.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${StepConnector.active}`]: {
    [`& .${StepConnector.line}`]: {
      backgroundImage:
        'linear-gradient(95deg, #1976d2 0%, #42a5f5 50%, #1976d2 100%)',
    },
  },
  [`&.${StepConnector.completed}`]: {
    [`& .${StepConnector.line}`]: {
      backgroundImage:
        'linear-gradient(95deg, #4caf50 0%, #81c784 50%, #4caf50 100%)',
    },
  },
  [`& .${StepConnector.line}`]: {
    height: 3,
    border: 0,
    backgroundColor:
      theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ccc',
  zIndex: 1,
  color: '#fff',
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  ...(ownerState.active && {
    backgroundImage:
      'linear-gradient(136deg, #1976d2 0%, #42a5f5 50%, #1976d2 100%)',
    boxShadow: '0 4px 10px 0 rgba(0,0,0,.25)',
  }),
  ...(ownerState.completed && {
    backgroundImage:
      'linear-gradient(136deg, #4caf50 0%, #81c784 50%, #4caf50 100%)',
  }),
}));

function ColorlibStepIcon(props) {
  const { active, completed, className, icon } = props;

  const icons = {
    1: <PersonIcon />,
    2: <BusinessIcon />,
    3: <AccountBalanceIcon />,
    4: <GavelIcon />,
    5: <DescriptionIcon />,
    6: <CheckCircleIcon />
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(icon)]}
    </ColorlibStepIconRoot>
  );
}

const WorkflowStatus = ({ currentStatus, workflowHistory = [], compact = false }) => {
  // Define workflow steps for Flash Credit
  const steps = [
    {
      label: 'Soumis',
      description: 'En attente CA',
      status: 'SOUMIS'
    },
    {
      label: 'CA Validé',
      description: 'En attente ASC',
      status: 'CA_VALIDE'
    },
    {
      label: 'ASC Validé',
      description: 'Comité requis',
      status: 'ASC_VALIDE'
    },
    {
      label: 'Comité',
      description: 'Validation comité',
      status: 'COMITE'
    },
    {
      label: 'Approuvé',
      description: 'Crédit approuvé',
      status: 'APPROUVE'
    },
    {
      label: 'Rejeté',
      description: 'Crédit rejeté',
      status: 'REJETE'
    }
  ];

  // Determine active step based on current status
  const getActiveStep = () => {
    const statusMap = {
      'SOUMIS': 0,
      'CA_VALIDE': 1,
      'ASC_VALIDE': 2,
      'COMITE': 3,
      'APPROUVE': 4,
      'REJETE': 5
    };
    return statusMap[currentStatus] || 0;
  };

  const activeStep = getActiveStep();

  // Get status color and icon
  const getStatusInfo = (stepIndex) => {
    if (stepIndex < activeStep) {
      return { color: 'success', variant: 'filled', icon: <CheckCircleIcon /> };
    } else if (stepIndex === activeStep) {
      return { color: 'primary', variant: 'filled', icon: <RadioButtonUncheckedIcon /> };
    } else {
      return { color: 'default', variant: 'outlined', icon: <RadioButtonUncheckedIcon /> };
    }
  };

  // Get opinions for each step
  const getStepOpinions = (stepStatus) => {
    return workflowHistory.filter(item => item.step === stepStatus);
  };

  if (compact) {
    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Statut du Workflow
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {steps.map((step, index) => {
            const statusInfo = getStatusInfo(index);
            const opinions = getStepOpinions(step.status);

            return (
              <Tooltip
                key={step.status}
                title={
                  <Box>
                    <Typography variant="subtitle2">{step.label}</Typography>
                    <Typography variant="body2">{step.description}</Typography>
                    {opinions.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {opinions.map((opinion, idx) => (
                          <Typography key={idx} variant="caption" display="block">
                            {opinion.user}: {opinion.opinion} {opinion.comment && `(${opinion.comment})`}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                }
              >
                <Chip
                  icon={statusInfo.icon}
                  label={step.label}
                  color={statusInfo.color}
                  variant={statusInfo.variant}
                  size="small"
                  sx={{ mb: 1 }}
                />
              </Tooltip>
            );
          })}
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Statut actuel: {steps[activeStep]?.label || 'En attente'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        Progression du Workflow de Crédit
      </Typography>

      <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
        {steps.map((step, index) => {
          const statusInfo = getStatusInfo(index);
          const opinions = getStepOpinions(step.status);

          return (
            <Step key={step.status} completed={index < activeStep}>
              <StepLabel
                StepIconComponent={ColorlibStepIcon}
                optional={
                  <Box sx={{ textAlign: 'center', mt: 1 }}>
                    <Typography variant="caption" display="block">
                      {step.description}
                    </Typography>
                    {opinions.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {opinions.slice(0, 2).map((opinion, idx) => (
                          <Chip
                            key={idx}
                            label={`${opinion.user}: ${opinion.opinion}`}
                            size="small"
                            color={opinion.opinion === 'approuver' ? 'success' : 'error'}
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                        {opinions.length > 2 && (
                          <Typography variant="caption" color="textSecondary">
                            +{opinions.length - 2} autres
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                }
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  {step.label}
                </Typography>
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>

      {/* Current status summary */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Chip
          label={`Statut actuel: ${steps[activeStep]?.label || 'En attente'}`}
          color={activeStep === steps.length - 1 ? 'success' : 'primary'}
          size="medium"
        />
        {currentStatus === 'rejected' && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Cette demande a été rejetée
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default WorkflowStatus;
