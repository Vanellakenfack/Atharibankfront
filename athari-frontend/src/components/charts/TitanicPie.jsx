import * as React from 'react';
import { PieChart as MuiPieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { styled } from '@mui/material/styles';

// Données pour le graphique
const data = [
  { id: 0, value: 10, label: 'Série A' },
  { id: 1, value: 15, label: 'Série B' },
  { id: 2, value: 20, label: 'Série C' },
];

// Styles pour le texte au centre du graphique
const StyledText = styled('text')(({ theme }) => ({
  fill: theme.palette.text.primary,
  textAnchor: 'middle',
  dominantBaseline: 'central',
  fontSize: 16,
  fontWeight: 'bold',
}));

// Composant pour le texte au centre du graphique
function PieCenterLabel({ children }) {
  const { width, height, left, top } = useDrawingArea();
  return (
    <StyledText x={left + width / 2} y={top + height / 2}>
      {children}
    </StyledText>
  );
}

const TitanicPie = () => {
  const [view, setView] = React.useState('simple');

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Répartition</h5>
        <ToggleButtonGroup
          color="primary"
          size="small"
          value={view}
          exclusive
          onChange={handleViewChange}
        >
          <ToggleButton value="simple">Simple</ToggleButton>
          <ToggleButton value="detailed">Détaillé</ToggleButton>
        </ToggleButtonGroup>
      </div>
      
      <div style={{ height: 'calc(100% - 50px)' }}>
        <MuiPieChart
          series={[
            {
              data: view === 'simple' ? data : [
                ...data,
                { id: 3, value: 15, label: 'Série D' },
                { id: 4, value: 10, label: 'Série E' },
              ],
              innerRadius: 40,
              outerRadius: 100,
              paddingAngle: 2,
              cornerRadius: 4,
              highlightScope: { fade: 'global', highlighted: 'item' },
              faded: { innerRadius: 30, additionalRadius: -10, color: 'gray' },
              arcLabel: (item) => `${item.label} (${item.value}%)`,
            },
          ]}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: {
              fill: 'white',
              fontWeight: 'bold',
              fontSize: 12,
            },
          }}
          width={400}
          height={300}
        >
          <PieCenterLabel>Total</PieCenterLabel>
        </MuiPieChart>
      </div>
    </Box>
  );
};

export default TitanicPie;
