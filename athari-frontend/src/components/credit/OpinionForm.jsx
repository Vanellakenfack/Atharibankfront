import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Error as ErrorIcon,
  ThumbUp as ThumbUpIcon
} from '@mui/icons-material';
import creditService from '../../services/creditService';

const OpinionForm = ({ creditId, onSubmit, title = "Donner un avis", expectedLevel = null }) => {
  const [loading, setLoading] = useState(false);
  const [canGiveOpinion, setCanGiveOpinion] = useState(false);
  const [level, setLevel] = useState(expectedLevel);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    opinion: '',
    commentaire: '',
    niveau_avis: expectedLevel || '',
    score_risque: ''
  });

  useEffect(() => {
    const checkPermissions = async () => {
      if (!creditId) return;
      
      try {
        setLoading(true);
        
        // Si le niveau n'est pas fourni, obtenir le niveau attendu
        if (!expectedLevel && creditId) {
          const levelResponse = await creditService.getExpectedLevel(creditId);
          if (levelResponse.success) {
            setLevel(levelResponse.data.expected_level);
            setFormData(prev => ({ ...prev, niveau_avis: levelResponse.data.expected_level }));
          }
        }
        
        // Vérifier si l'utilisateur peut donner un avis
        if (level) {
          const canGiveResponse = await creditService.canGiveOpinion(creditId, level);
          if (canGiveResponse.success) {
            setCanGiveOpinion(canGiveResponse.data.can_give_opinion);
          }
        }
      } catch (err) {
        console.error('Erreur lors de la vérification des permissions:', err);
        setError('Erreur lors de la vérification des permissions');
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [creditId, expectedLevel, level]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.opinion) {
      setError('Veuillez sélectionner une opinion');
      return;
    }

    if (!formData.commentaire.trim()) {
      setError('Le commentaire est obligatoire');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await onSubmit(creditId, formData);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Erreur lors de la soumission');
      }
      
      // Reset form on success
      setFormData({
        opinion: '',
        commentaire: '',
        niveau_avis: level || '',
        score_risque: ''
      });
      
    } catch (err) {
      setError(err.message || 'Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  const handleOpinionChange = (opinion) => {
    setFormData({ ...formData, opinion });
    setError('');
  };

  if (loading && !canGiveOpinion) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!canGiveOpinion && level) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        Vous n'êtes pas autorisé à donner un avis à ce niveau ({level})
      </Alert>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ThumbUpIcon />
        {title}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Sélectionnez votre opinion:
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Button
            type="button"
            fullWidth
            variant={formData.opinion === 'FAVORABLE' ? 'contained' : 'outlined'}
            color="success"
            onClick={() => handleOpinionChange('FAVORABLE')}
            startIcon={<CheckCircleIcon />}
            sx={{ py: 1.5, flex: 1, minWidth: 150 }}
          >
            Favorable
          </Button>
          <Button
            type="button"
            fullWidth
            variant={formData.opinion === 'DEFAVORABLE' ? 'contained' : 'outlined'}
            color="error"
            onClick={() => handleOpinionChange('DEFAVORABLE')}
            startIcon={<CancelIcon />}
            sx={{ py: 1.5, flex: 1, minWidth: 150 }}
          >
            Défavorable
          </Button>
          <Button
            type="button"
            fullWidth
            variant={formData.opinion === 'RESERVE' ? 'contained' : 'outlined'}
            color="warning"
            onClick={() => handleOpinionChange('RESERVE')}
            startIcon={<ErrorIcon />}
            sx={{ py: 1.5, flex: 1, minWidth: 150 }}
          >
            Réserve
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Commentaire (obligatoire):
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={formData.commentaire}
            onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
            placeholder="Ajoutez un commentaire pour justifier votre opinion..."
            variant="outlined"
            required
            error={!!error && !formData.commentaire.trim()}
            helperText={!!error && !formData.commentaire.trim() ? 'Ce champ est obligatoire' : ''}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Score de risque (optionnel):
          </Typography>
          <TextField
            fullWidth
            type="number"
            inputProps={{ min: 0, max: 100 }}
            value={formData.score_risque}
            onChange={(e) => setFormData({ ...formData, score_risque: e.target.value })}
            placeholder="Score de risque (0-100)"
            variant="outlined"
          />
        </Box>

        <input type="hidden" name="niveau_avis" value={formData.niveau_avis} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!formData.opinion || !formData.commentaire.trim() || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <ThumbUpIcon />}
          >
            {loading ? 'Soumission...' : 'Soumettre l\'Avis'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default OpinionForm;