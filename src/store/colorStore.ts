// colorStore.ts
import { create } from "zustand";

interface ColorState {
  color: string;
  setColor: (method: string) => void;
}

export const useColorStore = create<ColorState>((set) => ({
  color: "#089981",
  setColor: (method: string) =>
    set({ color: method === "Buy" ? "#089981" : "#F23645" }),
}));
