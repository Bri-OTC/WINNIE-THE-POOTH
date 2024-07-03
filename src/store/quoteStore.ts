// useQuoteStore.ts
import { create } from "zustand";

export interface QuoteResponse {
  id: string;
  chainId: number;
  createdAt: string;
  userId: string;
  userAddress: string;
  rfqId: string;
  expiration: string;
  sMarketPrice: string;
  sPrice: string;
  sQuantity: string;
  lMarketPrice: string;
  lPrice: string;
  lQuantity: string;
  minAmount: string;
  maxAmount: string;
}

interface QuoteStore {
  quotes: QuoteResponse[];
  addQuote: (quote: QuoteResponse) => void;
  cleanExpiredQuotes: () => void;
  flushStore: () => void;
}

const isQuoteValid = (quote: QuoteResponse): boolean => {
  const currentTime = Date.now();
  const expirationTime = parseInt(quote.createdAt) + parseInt(quote.expiration);
  return currentTime < expirationTime;
};

export const useQuoteStore = create<QuoteStore>((set) => ({
  quotes: [],

  addQuote: (quote: QuoteResponse) => {
    set((state) => ({
      quotes: [...state.quotes, quote].filter(isQuoteValid),
    }));
  },

  cleanExpiredQuotes: () => {
    set((state) => ({
      quotes: state.quotes.filter(isQuoteValid),
    }));
  },

  flushStore: () => {
    console.log("flushing store");
    set({ quotes: [] });
  },
}));
