// pages/ChoicePage.jsx
import { Container, Grid, Paper, Typography, Box, Button, useTheme } from "@mui/material";
import { Person, Business, ArrowForward } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
export default function ChoicePage() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Layout>
    
          <Box
        
        sx={{ 
           minHeight: '100vh', 
            bgcolor: '#F8FAFC', // Fond ultra-moderne (Slate 50)
            pb: 10
            
        }}
        > 
           
              
      <Container maxWidth="md">
        <Box sx={{ mb: 8, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            fontWeight="800" 
            gutterBottom 
            sx={{ color: '#1a237e', letterSpacing: '-0.5px' }}
          >
         
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ maxWidth: 600, mx: 'auto', fontWeight: 400 }}
          >
            Choisissez le type d'entité pour commencer l'enregistrement
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {/* Option Personne Physique */}
          <Grid item xs={12} sm={6}>
            <Paper 
              elevation={0} 
              onClick={() => navigate("/client/creer")}
              sx={{ 
                p: 5, 
                textAlign: 'center', 
                cursor: 'pointer',
                borderRadius: 4,
                border: '1px solid #e0e4e8',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': { 
                  transform: 'translateY(-10px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                  borderColor: theme.palette.primary.main,
                  '& .icon-box': { backgroundColor: theme.palette.primary.main, color: '#fff' }
                }
              }}
            >
              <Box 
                className="icon-box"
                sx={{ 
                  width: 80, height: 80, borderRadius: '20px', 
                  backgroundColor: '#e8eaf6', color: '#303f9f', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  mx: 'auto', mb: 3, transition: '0.3s'
                }}
              >
                <Person sx={{ fontSize: 40 }} />
              </Box>
              
              <Typography variant="h5" fontWeight="700" gutterBottom>
                Personne Physique
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, height: 40 }}>
                Particuliers, salariés ou entrepreneurs individuels.
              </Typography>
              
              <Button 
                variant="outlined" 
                fullWidth 
                endIcon={<ArrowForward />}
                sx={{ borderRadius: '10px', py: 1.2, fontWeight: 'bold' }}
              >
                Sélectionner
              </Button>
            </Paper>
          </Grid>

          {/* Option Personne Morale */}
          <Grid item xs={12} sm={6}>
            <Paper 
              elevation={0} 
              onClick={() => navigate("/client/creermorale")}
              sx={{ 
                p: 5, 
                textAlign: 'center', 
                cursor: 'pointer',
                borderRadius: 4,
                border: '1px solid #e0e4e8',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': { 
                  transform: 'translateY(-10px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                  borderColor: theme.palette.secondary.main,
                  '& .icon-box-2': { backgroundColor: theme.palette.secondary.main, color: '#fff' }
                }
              }}
            >
              <Box 
                className="icon-box-2"
                sx={{ 
                  width: 80, height: 80, borderRadius: '20px', 
                  backgroundColor: '#e0f7fa', color: '#00b8d4', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  mx: 'auto', mb: 3, transition: '0.3s'
                }}
              >
                <Business sx={{ fontSize: 40 }} />
              </Box>
              
              <Typography variant="h5" fontWeight="700" gutterBottom>
                Personne Morale
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, height: 40 }}>
                Entreprises (SARL, SA), Associations ou GIE.
              </Typography>
              
              <Button 
                variant="outlined" 
                color="secondary"
                fullWidth 
                endIcon={<ArrowForward />}
                sx={{ borderRadius: '10px', py: 1.2, fontWeight: 'bold' }}
              >
                Sélectionner
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
    </Layout>
  );
}