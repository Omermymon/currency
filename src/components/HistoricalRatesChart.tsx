import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Typography } from '@mui/material';
import { ChartHistoricalRates } from '../types';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

interface HistoricalRatesChartProps {
  data: ChartHistoricalRates;
}

const HistoricalRatesChart: React.FC<HistoricalRatesChartProps> = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: data.datasets,
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <Typography variant="h5" color="secondary" gutterBottom>
        Historical Rates
      </Typography>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
          },
        }}
      />
    </div>
  );
};

export default HistoricalRatesChart;
