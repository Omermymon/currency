import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, TextField, Button, Alert, CircularProgress, Box } from '@mui/material';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { fetchCurrencies, fetchHistoricalRates } from './services/apiService';
import useLocalStorage from './hooks/useLocalStorage';
import HistoricalRatesChart from './components/HistoricalRatesChart';
import CurrencySelect from './components/CurrencySelect';
import { formatCurrencyConversion } from './utils/dateUtils';
import { ChartHistoricalRates } from './types';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const DEFAULT_AMOUNT = 100;

const App: React.FC = () => {
  const [baseCurrency, setBaseCurrency] = useState<string>('USD');
  const [targetCurrency, setTargetCurrency] = useState<string>('EUR');
  const [amount, setAmount] = useState<number>(DEFAULT_AMOUNT);
  const [inputAmount, setInputAmount] = useState<number>(DEFAULT_AMOUNT);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [historicalRates, setHistoricalRates] = useState<ChartHistoricalRates | null>(null);
  const [currencies, setCurrencies] = useState<string[]>(['USD', 'EUR']);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [localStorageRates, setLocalStorageRates] = useLocalStorage<{ [date: string]: { [currency: string]: number } }>('historicalRates', {});

  useEffect(() => {
    const loadCurrencies = async () => {
      setLoading(true);
      setError(null);

      try {
        const today = new Date().toISOString().split('T')[0];
        const todayData = localStorageRates[today];

        if (!todayData) {
          const rates = await fetchCurrencies();
          setCurrencies(Object.keys(rates));
        } else {
          setCurrencies(Object.keys(todayData));
        }
      } catch (error) {
        setError("Error fetching currencies.");
      } finally {
        setLoading(false);
      }
    };

    loadCurrencies();
  }, [localStorageRates]);

  const loadHistoricalRates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 3);

      const { fetchedData } = await fetchHistoricalRates(
        baseCurrency, targetCurrency, startDate, endDate, localStorageRates, setLocalStorageRates
      );

      const allData = { ...localStorageRates, ...fetchedData };
      const sortedDates = Object.keys(allData).sort();
      const chartData: ChartHistoricalRates = {
        labels: sortedDates,
        datasets: [
          {
            label: baseCurrency,
            data: sortedDates.map(date => allData[date][baseCurrency] || 0),
            fill: false,
            backgroundColor: 'rgba(75,192,192,0.4)',
            borderColor: 'rgba(75,192,192,1)',
          },
          {
            label: targetCurrency,
            data: sortedDates.map(date => allData[date][targetCurrency] || 0),
            fill: false,
            backgroundColor: 'rgba(192,75,192,0.4)',
            borderColor: 'rgba(192,75,192,1)',
          },
        ],
      };

      setHistoricalRates(chartData);
    } catch (error) {
      console.error('Error fetching historical rates:', error);
      setError('Error fetching historical rates.');
    } finally {
      setLoading(false);
    }
  }, [baseCurrency, targetCurrency, localStorageRates, setLocalStorageRates]);

  const handleConvert = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      const baseCurrencyRate = localStorageRates[today]?.[baseCurrency];
      const targetCurrencyRate = localStorageRates[today]?.[targetCurrency];

      if (baseCurrencyRate === undefined || targetCurrencyRate === undefined) {
        await loadHistoricalRates();
      }

      const updatedBaseCurrencyRate = localStorageRates[today]?.[baseCurrency];
      const updatedTargetCurrencyRate = localStorageRates[today]?.[targetCurrency];

      const conversionRate = (updatedTargetCurrencyRate || targetCurrencyRate) / (updatedBaseCurrencyRate || baseCurrencyRate);
      setConvertedAmount(inputAmount * conversionRate);

      await loadHistoricalRates();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [baseCurrency, targetCurrency, inputAmount, loadHistoricalRates, localStorageRates]);

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h2" gutterBottom color="primary" align="center">
          Currency Converter
        </Typography>
      </Box>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      <CurrencySelect
        baseCurrency={baseCurrency}
        targetCurrency={targetCurrency}
        currencies={currencies}
        setBaseCurrency={setBaseCurrency}
        setTargetCurrency={setTargetCurrency}
      />
      <Box my={2}>
        <Typography variant="h6">Amount:</Typography>
        <TextField
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          onBlur={() => setInputAmount(amount)}
          fullWidth
          variant="outlined"
        />
      </Box>
      <Button variant="contained" color="primary" onClick={handleConvert}>
        Convert
      </Button>
      {convertedAmount !== null && (
        <Typography variant="h6" style={{ marginTop: '20px' }}>
          {formatCurrencyConversion(inputAmount, baseCurrency, convertedAmount, targetCurrency)}
        </Typography>
      )}
      {historicalRates && (
        <HistoricalRatesChart data={historicalRates} />
      )}
    </Container>
  );
};

export default App;
