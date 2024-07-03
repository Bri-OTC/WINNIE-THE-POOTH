import { create } from "zustand";

interface Market {
  name: string;
  icon: string;
}

interface StoreState {
  selectedMarket: Market | null;
  setSelectedMarket: (market: Market | null) => void;
}

const useStore = create<StoreState>((set) => ({
  selectedMarket: null,
  setSelectedMarket: (market) => set({ selectedMarket: market }),
}));

export { useStore };
