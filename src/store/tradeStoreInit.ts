import { create } from "zustand";

export interface StoreState {
  balance: number;
  currentMethod: string;
  entryPrice: string;
  takeProfit: string;
  takeProfitPercentage: string;
  stopLoss: string;
  stopLossPercentage: string;
  amount: string;
  amountUSD: string;
  maxAmount: number;
  minAmount: number;
  isReduceTP: boolean;
  isReduceSL: boolean;
  sliderValue: number;
  exitPnL: number;
  stopPnL: number;
  riskRewardPnL: number;
  accountLeverage: number;
  bidPrice: number;
  askPrice: number;
  symbol: string;
  leverage: number;
  currentTabIndex: string;
  estimatedLiquidationPrice: number;
  entryPriceModified: boolean;

  setBalance: (balance: number) => void;
  setCurrentMethod: (method: string) => void;
  setEntryPrice: (price: string) => void;
  setTakeProfit: (price: string) => void;
  setTakeProfitPercentage: (percentage: string) => void;
  setStopLoss: (price: string) => void;
  setStopLossPercentage: (percentage: string) => void;
  setAmount: (amount: string) => void;
  setAmountUSD: (amountUSD: string) => void;
  setMaxAmount: (maxAmount: number) => void;
  setMinAmount: (minAmount: number) => void;
  setIsReduceTP: (reduce: boolean) => void;
  setIsReduceSL: (reduce: boolean) => void;
  setSliderValue: (value: number) => void;
  setAccountLeverage: (leverage: number) => void;
  setBidPrice: (price: number) => void;
  setAskPrice: (price: number) => void;
  setSymbol: (symbol: string) => void;
  setLeverage: (leverage: number) => void;
  setCurrentTabIndex: (index: string) => void;
  setEstimatedLiquidationPrice: (price: number) => void;

  initializeLeverage: () => void; // Add this line
}

export const initialState: StoreState = {
  balance: 0,
  currentMethod: "Buy",
  entryPrice: "0",
  takeProfit: "0",
  takeProfitPercentage: "0",
  stopLoss: "0",
  stopLossPercentage: "0",
  amount: "0",
  amountUSD: "0",
  minAmount: 0,
  maxAmount: 10,
  isReduceTP: true,
  isReduceSL: true,
  sliderValue: 50,
  exitPnL: 0,
  stopPnL: 0,
  riskRewardPnL: 0,
  accountLeverage: 500,
  bidPrice: 1,
  askPrice: 1,
  symbol: "GBPUSD/EURUSD",
  leverage:
    typeof window !== "undefined"
      ? parseFloat(localStorage.getItem("leverage") || "500")
      : 500,
  currentTabIndex: "Limit",
  estimatedLiquidationPrice: 0,
  entryPriceModified: false,
  setBalance: () => {},
  setCurrentMethod: () => {},
  setEntryPrice: () => {},
  setTakeProfit: () => {},
  setTakeProfitPercentage: () => {},
  setStopLoss: () => {},
  setStopLossPercentage: () => {},
  setAmount: () => {},
  setAmountUSD: () => {},
  setMaxAmount: () => {},
  setMinAmount: () => {},
  setIsReduceTP: () => {},
  setIsReduceSL: () => {},
  setSliderValue: () => {},
  setAccountLeverage: () => {},
  setBidPrice: () => {},
  setAskPrice: () => {},
  setSymbol: () => {},
  setLeverage: () => {},
  setCurrentTabIndex: () => {},
  setEstimatedLiquidationPrice: () => {},

  initializeLeverage: () => {},
};
