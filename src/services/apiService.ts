import axios from "axios";

const API_KEY = process.env.REACT_APP_API_KEY;
const BASE_URL = 'http://api.exchangeratesapi.io/v1';
const LATEST_URL = `${BASE_URL}/latest?access_key=${API_KEY}`;
const HISTORICAL_URL = (date: string) =>
  `${BASE_URL}/${date}?access_key=${API_KEY}`;

export interface HistoricalRates {
  [date: string]: { [currency: string]: number };
}

const retryFetch = async (url: string, retries: number = 3): Promise<any> => {
  try {
    const response = await axios.get(url);
    if (response.status === 403 || response.status === 429) {
      throw new Error('Rate limit exceeded');
    }
    return response;
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(res => setTimeout(res, 30000)); 
    return retryFetch(url, retries - 1);
  }
};

export const fetchCurrencies = async (): Promise<{ [key: string]: number }> => {
  try {
    const response = await retryFetch(LATEST_URL);
    return response.data.rates;
  } catch (error) {
    console.error('Error fetching currencies:', error);
    throw new Error('Failed to fetch currencies.');
  }
};

export const fetchHistoricalRates = async (
  baseCurrency: string,
  targetCurrency: string,
  startDate: Date,
  endDate: Date,
  localStorageRates: HistoricalRates,
  setLocalStorageRates: (data: HistoricalRates) => void
): Promise<{ missingDataDates: string[], fetchedData: HistoricalRates }> => {
  const fetchedData: HistoricalRates = {};
  const missingDataDates: string[] = [];
  const requests: Promise<void>[] = [];

  let currentDate = new Date(startDate);

  Object.keys(localStorageRates).forEach(dateString => {
    const date = new Date(dateString);
    if (date < startDate || date > endDate) {
      delete localStorageRates[dateString];
    }
  });

  while (currentDate <= endDate) {
    const dateString = currentDate.toISOString().split('T')[0];
    if (localStorageRates[dateString]) {
      fetchedData[dateString] = localStorageRates[dateString];
    } else {
      const requestURL = HISTORICAL_URL(dateString);
      const request = retryFetch(requestURL).then(response => {
        if (response.data.success && response.data.rates) {
          fetchedData[dateString] = response.data.rates;
          localStorageRates[dateString] = response.data.rates;
        } else {
          missingDataDates.push(dateString);
        }
      }).catch(error => {
        console.error(`Error fetching rates for ${dateString}:`, error);
        missingDataDates.push(dateString);
      });
      requests.push(request);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  await Promise.all(requests);

  setLocalStorageRates(localStorageRates);

  return { missingDataDates, fetchedData };
};

