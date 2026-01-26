import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Divider } from '@mui/material';

const BilanRecapitulatif = ({ data }) => {
  return (
    <Box sx={{ mt: 4, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom color="primary">
        Résumé Consolidé de la Journée
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <TableContainer component={Paper} elevation={0}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell><strong>Indicateur</strong></TableCell>
              <TableCell align="right"><strong>Valeur (XAF)</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Total Entrées (Versements)</TableCell>
              <TableCell align="right" sx={{ color: 'green' }}>+ {data.total_especes_entree}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Sorties (Retraits)</TableCell>
              <TableCell align="right" sx={{ color: 'red' }}>- {data.total_especes_sortie}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Solde Théorique Global</strong></TableCell>
              <TableCell align="right"><strong>{data.solde_theorique_global}</strong></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Solde Réel (Physique)</TableCell>
              <TableCell align="right">{data.solde_reel_global}</TableCell>
            </TableRow>
            <TableRow sx={{ backgroundColor: data.ecart_global !== 0 ? '#fff3e0' : 'inherit' }}>
              <TableCell><strong>Écart Global</strong></TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', color: data.ecart_global < 0 ? 'red' : 'primary.main' }}>
                {data.ecart_global}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BilanRecapitulatif;