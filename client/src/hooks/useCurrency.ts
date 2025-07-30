import { useState, useEffect } from 'react';

interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Exchange rate to USD
}

interface LocationData {
  country: string;
  country_code: string;
  currency: {
    code: string;
    symbol: string;
    name: string;
  };
}

// Currency mapping with exchange rates (approximate, would typically come from a real API)
const currencyRates: Record<string, number> = {
  USD: 1.0,
  INR: 83.12,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.35,
  AUD: 1.52,
  JPY: 149.50,
  SGD: 1.34,
  CHF: 0.88,
  SEK: 10.52,
  NOK: 10.87,
  DKK: 6.85,
  PLN: 4.02,
  CZK: 22.85,
  HUF: 360.25,
  RON: 4.56,
  BGN: 1.80,
  HRK: 6.93,
  RSD: 107.50,
  TRY: 29.85,
  RUB: 92.15,
  UAH: 36.25,
  BRL: 5.12,
  MXN: 17.85,
  ARS: 350.75,
  COP: 4125.50,
  CLP: 925.75,
  PEN: 3.72,
  UYU: 39.45,
  CNY: 7.24,
  KRW: 1325.75,
  THB: 35.62,
  MYR: 4.72,
  IDR: 15750.25,
  PHP: 56.85,
  VND: 24350.50,
  ZAR: 18.92,
  EGP: 30.85,
  NGN: 785.50,
  KES: 127.85,
  GHS: 12.45,
  MAD: 9.85,
  TND: 3.12,
  DZD: 135.25,
  ILS: 3.72,
  SAR: 3.75,
  AED: 3.67,
  QAR: 3.64,
  KWD: 0.31,
  BHD: 0.38,
  OMR: 0.38,
  JOD: 0.71,
  LBP: 15000.0,
  SYP: 2512.0
};

// Country to currency mapping for fallback
const countryCurrencyMap: Record<string, CurrencyInfo> = {
  US: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0 },
  IN: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.12 },
  GB: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  CA: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.35 },
  AU: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.52 },
  DE: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  FR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  IT: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  ES: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  NL: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  BE: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  AT: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  CH: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rate: 0.88 },
  SE: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', rate: 10.52 },
  NO: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', rate: 10.87 },
  DK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', rate: 6.85 },
  JP: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 149.50 },
  SG: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 1.34 },
  CN: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 7.24 },
  KR: { code: 'KRW', symbol: '₩', name: 'South Korean Won', rate: 1325.75 },
  BR: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', rate: 5.12 },
  MX: { code: 'MXN', symbol: '$', name: 'Mexican Peso', rate: 17.85 },
  ZA: { code: 'ZAR', symbol: 'R', name: 'South African Rand', rate: 18.92 },
  NG: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 785.50 },
  EG: { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', rate: 30.85 },
  AE: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', rate: 3.67 },
  SA: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', rate: 3.75 },
  IL: { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', rate: 3.72 },
  TR: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rate: 29.85 },
  RU: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', rate: 92.15 },
  UA: { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', rate: 36.25 },
  PL: { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', rate: 4.02 },
  CZ: { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', rate: 22.85 },
  HU: { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', rate: 360.25 },
  TH: { code: 'THB', symbol: '฿', name: 'Thai Baht', rate: 35.62 },
  MY: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', rate: 4.72 },
  ID: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', rate: 15750.25 },
  PH: { code: 'PHP', symbol: '₱', name: 'Philippine Peso', rate: 56.85 },
  VN: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', rate: 24350.50 }
};

export function useCurrency() {
  const [currency, setCurrency] = useState<CurrencyInfo>({
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rate: 1.0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const convertPrice = (usdPrice: number): number => {
    if (currency.code === 'USD') return usdPrice;
    
    const convertedPrice = usdPrice * currency.rate;
    
    // Format based on currency
    if (currency.code === 'JPY' || currency.code === 'KRW' || currency.code === 'VND' || currency.code === 'IDR') {
      return Math.round(convertedPrice); // No decimals for these currencies
    }
    
    return Math.round(convertedPrice * 100) / 100; // Round to 2 decimals
  };

  const formatPrice = (usdPrice: number): string => {
    if (usdPrice === 0) return 'Free';
    
    const convertedPrice = convertPrice(usdPrice);
    
    // Special formatting for different currencies
    if (currency.code === 'INR') {
      // Indian Rupee formatting with commas
      return `${currency.symbol}${convertedPrice.toLocaleString('en-IN')}`;
    } else if (currency.code === 'JPY' || currency.code === 'KRW') {
      // No decimals for Yen and Won
      return `${currency.symbol}${convertedPrice.toLocaleString()}`;
    } else if (currency.code === 'EUR') {
      // Euro formatting
      return `${convertedPrice.toLocaleString('de-DE', { minimumFractionDigits: 2 })}${currency.symbol}`;
    } else {
      // Standard formatting
      return `${currency.symbol}${convertedPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
  };

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to get location from IPWhois.io (free, no API key needed)
        const response = await fetch('https://ipwho.is/?fields=country_code,country,currency', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }

        const data: LocationData = await response.json();
        
        if (data.currency && data.currency.code) {
          // Use currency from API response
          const detectedCurrency: CurrencyInfo = {
            code: data.currency.code,
            symbol: data.currency.symbol || '$',
            name: data.currency.name || data.currency.code,
            rate: currencyRates[data.currency.code] || 1.0
          };
          
          setCurrency(detectedCurrency);
        } else if (data.country_code && countryCurrencyMap[data.country_code]) {
          // Fallback to country mapping
          setCurrency(countryCurrencyMap[data.country_code]);
        } else {
          // Default to USD
          setCurrency(countryCurrencyMap.US);
        }
      } catch (err) {
        console.warn('Currency detection failed, using USD as fallback:', err);
        setError('Failed to detect currency');
        setCurrency(countryCurrencyMap.US); // Fallback to USD
      } finally {
        setIsLoading(false);
      }
    };

    detectCurrency();
  }, []);

  const setCurrencyManually = (currencyCode: string) => {
    const selectedCurrency = Object.values(countryCurrencyMap).find(c => c.code === currencyCode);
    if (selectedCurrency) {
      setCurrency(selectedCurrency);
    }
  };

  return {
    currency,
    isLoading,
    error,
    convertPrice,
    formatPrice,
    setCurrencyManually,
    availableCurrencies: Object.values(countryCurrencyMap).reduce((acc, curr) => {
      if (!acc.find(c => c.code === curr.code)) {
        acc.push(curr);
      }
      return acc;
    }, [] as CurrencyInfo[])
  };
}