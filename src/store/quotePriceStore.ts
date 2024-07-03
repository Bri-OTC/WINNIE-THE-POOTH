import { create } from "zustand";

interface QuoteState {
  bidQty: number;
  askQty: number;
  setBidQty: (qty: number) => void;
  setAskQty: (qty: number) => void;
}

const useQuoteStore = create<QuoteState>((set) => ({
  bidQty: 1000,
  askQty: 1000,
  setBidQty: (qty: number) => set({ bidQty: qty }),
  setAskQty: (qty: number) => set({ askQty: qty }),
}));

export { useQuoteStore };
