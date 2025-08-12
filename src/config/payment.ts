export interface PaymentMethod {
  id: string;
  name: string;
  symbol: string;
  network: string;
  address: string;
  qrCode: string;
  icon: string;
  description: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "usdt-solana",
    name: "USDT",
    symbol: "USDT",
    network: "Solana",
    address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    icon: "💎",
    description: "USDT on Solana network - Fast and low fees"
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    network: "Bitcoin",
    address: "bc1qxy2kgdygjrsqtzq2n0yf4jf2j0vwpw4hqcqw8",
    qrCode: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bc1qxy2kgdygjrsqtzq2n0yf4jf2j0vwpw4hqcqw8",
    icon: "₿",
    description: "Bitcoin - The original cryptocurrency"
  }
];

export const getPaymentMethod = (id: string): PaymentMethod | undefined => {
  return PAYMENT_METHODS.find(method => method.id === id);
};

export const getPaymentMethodsByNetwork = (network: string): PaymentMethod[] => {
  return PAYMENT_METHODS.filter(method => method.network === network);
};
