export const formatCurrencyConversion = (
    amount: number, 
    baseCurrency: string, 
    convertedAmount: number, 
    targetCurrency: string
  ): string => `${amount} ${baseCurrency} = ${convertedAmount.toFixed(2)} ${targetCurrency}`;
  
  export const getMissingDataDates = (startDate: Date, endDate: Date, storedDates: string[]): string[] => {
    let missingDataDates: string[] = [];
  
    const earliestDate = storedDates.length > 0 ? new Date(Math.min(...storedDates.map(date => new Date(date).getTime()))) : new Date();
    if (earliestDate > startDate) {
      missingDataDates = Array.from({ length: Math.floor((earliestDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        return date.toISOString().split('T')[0];
      }).filter(date => !storedDates.includes(date));
    } else {
      missingDataDates = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      });
    }
  
    return missingDataDates;
  };
  