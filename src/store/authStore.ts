// src/store/authStore.ts
import { create } from "zustand";
import Cookies from "js-cookie";
import jwt, { JwtPayload } from "jsonwebtoken";
import { createWalletClient, custom, JsonRpcAccount } from "viem";
import { EIP1193Provider } from "@privy-io/react-auth";
import { Wallet } from "ethers";
import { config } from "@/config";

interface AuthState {
  token: string | null;
  isMarketOpen: boolean;
  provider: EIP1193Provider | null;
  walletClient: ReturnType<typeof createWalletClient> | null;
  wallet: Wallet | null;

  setToken: (token: string | null) => void;
  setIsMarketOpen: (isOpen: boolean) => void;
  setProvider: (provider: EIP1193Provider | null) => void;
  setWalletClient: (
    walletClient: ReturnType<typeof createWalletClient> | null
  ) => void;
  setWallet: (wallet: Wallet | null) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isMarketOpen: true,
  provider: null,
  walletClient: null,
  wallet: null,
  setToken: (token) => {
    if (token) {
      const decodedToken = jwt.decode(token) as JwtPayload;
      if (decodedToken && decodedToken.exp) {
        const expirationDate = new Date(decodedToken.exp * 1000);
        set({ token });
        Cookies.set("token", token, { expires: expirationDate });
      }
    } else {
      set({ token: null });
      Cookies.remove("token");
    }
  },
  setIsMarketOpen: (isOpen) => set({ isMarketOpen: isOpen }),
  setProvider: (provider) => {
    if (provider !== useAuthStore.getState().provider) {
      set({ provider, token: null });
      Cookies.remove("token");
    }
  },
  setWalletClient: (walletClient) => {
    if (walletClient !== useAuthStore.getState().walletClient) {
      set({ walletClient, token: null });
      Cookies.remove("token");
    }
  },
  setWallet: (wallet) => {
    if (wallet !== useAuthStore.getState().wallet) {
      set({ wallet, token: null });
      Cookies.remove("token");
    }
  },
}));

export { useAuthStore };
