import React from 'react';
import { Box, Typography, Container, Link, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(4, 0),
  marginTop: 'auto', // This makes it stick to bottom
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: 'white',
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const Footer: React.FC = () => {
  return (
    <FooterContainer component="footer">
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Athari Bank
            </Typography>
            <Typography variant="body2">
              Votre partenaire bancaire de confiance pour tous vos besoins financiers.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Services
            </Typography>
            <Typography variant="body2">
              <FooterLink href="#">Comptes</FooterLink><br />
              <FooterLink href="#">Crédits</FooterLink><br />
              <FooterLink href="#">Épargne</FooterLink><br />
              <FooterLink href="#">Assurance</FooterLink>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Support
            </Typography>
            <Typography variant="body2">
              <FooterLink href="#">Centre d'aide</FooterLink><br />
              <FooterLink href="#">Contact</FooterLink><br />
              <FooterLink href="#">FAQ</FooterLink><br />
              <FooterLink href="#">Sécurité</FooterLink>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Légal
            </Typography>
            <Typography variant="body2">
              <FooterLink href="#">Conditions d'utilisation</FooterLink><br />
              <FooterLink href="#">Politique de confidentialité</FooterLink><br />
              <FooterLink href="#">Mentions légales</FooterLink><br />
              <FooterLink href="#">Cookies</FooterLink>
            </Typography>
          </Grid>
        </Grid>
        <Box mt={4} pt={2} borderTop={1} borderColor="rgba(255,255,255,0.1)">
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} Athari Bank. Tous droits réservés.
          </Typography>
        </Box>
      </Container>
    </FooterContainer>
  );
};

export default Footer;
