import React from 'react';
import { Select, MenuItem, Typography } from '@mui/material';

interface CurrencySelectProps {
  baseCurrency: string;
  targetCurrency: string;
  currencies: string[];
  setBaseCurrency: React.Dispatch<React.SetStateAction<string>>;
  setTargetCurrency: React.Dispatch<React.SetStateAction<string>>;
}

interface CurrencyDropdownProps {
  label: string;
  value: string;
  currencies: string[];
  onChange: (value: string) => void;
}

const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({ label, value, currencies, onChange }) => (
  <div style={{ margin: '20px 0' }}>
    <Typography variant="h6">{label}</Typography>
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as string)}
      fullWidth
      variant="outlined"
    >
      {currencies.map((currency) => (
        <MenuItem key={currency} value={currency}>
          {currency}
        </MenuItem>
      ))}
    </Select>
  </div>
);

const CurrencySelect: React.FC<CurrencySelectProps> = ({ baseCurrency, targetCurrency, currencies, setBaseCurrency, setTargetCurrency }) => (
  <>
    <CurrencyDropdown
      label="Base Currency:"
      value={baseCurrency}
      currencies={currencies}
      onChange={setBaseCurrency}
    />
    <CurrencyDropdown
      label="Target Currency:"
      value={targetCurrency}
      currencies={currencies}
      onChange={setTargetCurrency}
    />
  </>
);

export default CurrencySelect;
