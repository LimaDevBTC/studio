import { useState, useEffect } from 'react';

interface CurrencyRates {
  USD: {
    BRL: number;
    SOL: number;
  };
}

export const useCurrencyConversion = (usdAmount: number) => {
  const [rates, setRates] = useState<CurrencyRates>({
    USD: {
      BRL: 5.0, // Taxa padrão USD/BRL
      SOL: 0.001, // Taxa padrão USD/SOL
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        
        // API CoinGecko para conversões em tempo real
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=usd-coin,solana&vs_currencies=usd,brl,sol');
        const data = await response.json();
        
        // Taxa USD/BRL (usando USDC como proxy)
        const usdcBrlRate = data['usd-coin']?.brl || 5.0;
        
        // Taxa USD/SOL
        const solUsdRate = data['solana']?.usd || 100;
        const solRate = 1 / solUsdRate;
        
        setRates({
          USD: {
            BRL: usdcBrlRate,
            SOL: solRate,
          }
        });
        
        setError(null);
      } catch (err) {
        console.warn('Erro ao buscar taxas de conversão, usando valores padrão:', err);
        // Em caso de erro, mantém as taxas padrão
        setError('Usando taxas de conversão padrão');
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    
    // Atualiza a cada 5 minutos
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const convertToCurrency = (currency: 'BRL' | 'SOL' | 'USDC' | 'USDT') => {
    if (currency === 'BRL') {
      return (usdAmount * rates.USD.BRL).toFixed(2);
    }
    if (currency === 'SOL') {
      return (usdAmount * rates.USD.SOL).toFixed(6);
    }
    // USDC e USDT são 1:1 com USD
    return usdAmount.toFixed(2);
  };

  const getFormattedAmount = (currency: 'BRL' | 'SOL' | 'USDC' | 'USDT') => {
    const amount = convertToCurrency(currency);
    
    if (currency === 'BRL') {
      return `R$ ${amount}`;
    }
    if (currency === 'SOL') {
      return `${amount} SOL`;
    }
    if (currency === 'USDC') {
      return `${amount} USDC`;
    }
    if (currency === 'USDT') {
      return `${amount} USDT`;
    }
    
    return `${amount}`;
  };

  return {
    rates,
    loading,
    error,
    convertToCurrency,
    getFormattedAmount,
  };
};
