import { create } from "zustand";
import { config } from "@/config";

export interface RfqRequest {
  chainId: number;
  expiration: string;
  assetAId: string;
  assetBId: string;
  sPrice: string;
  sQuantity: string;
  sInterestRate: string;
  sIsPayingApr: boolean;
  sImA: string;
  sImB: string;
  sDfA: string;
  sDfB: string;
  sExpirationA: string;
  sExpirationB: string;
  sTimelockA: string;
  sTimelockB: string;
  lPrice: string;
  lQuantity: string;
  lInterestRate: string;
  lIsPayingApr: boolean;
  lImA: string;
  lImB: string;
  lDfA: string;
  lDfB: string;
  lExpirationA: string;
  lExpirationB: string;
  lTimelockA: string;
  lTimelockB: string;
}

interface RfqRequestStore {
  rfqRequest: RfqRequest;
  updateRfqRequest: (updatedRfqRequest: Partial<RfqRequest>) => void;
}

const initialRfqRequest: RfqRequest = {
  chainId: config.activeChainId,
  expiration: "600",
  assetAId: "forex.GBPUSD",
  assetBId: "forex.EURUSD",
  sPrice: "1000000000000000000n",
  sQuantity: "1000000000000000000n",
  sInterestRate: "625000000000000000000n",
  sIsPayingApr: false,
  sImA: "200000000000000000n",
  sImB: "200000000000000000n",
  sDfA: "50000000000000000n",
  sDfB: "50000000000000000n",
  sExpirationA: "600",
  sExpirationB: "600",
  sTimelockA: "600",
  sTimelockB: "600",
  lPrice: "1000000000000000000n",
  lQuantity: "1000000000000000000n",
  lInterestRate: "625000000000000000000n",
  lIsPayingApr: false,
  lImA: "600",
  lImB: "600",
  lDfA: "600",
  lDfB: "600",
  lExpirationA: "50000000000000000n",
  lExpirationB: "50000000000000000n",
  lTimelockA: "50000000000000000n",
  lTimelockB: "50000000000000000n",
};

export const useRfqRequestStore = create<RfqRequestStore>((set) => ({
  rfqRequest: initialRfqRequest,
  updateRfqRequest: (updatedRfqRequest) =>
    set((state) => ({
      rfqRequest: {
        ...state.rfqRequest,
        ...updatedRfqRequest,
      },
    })),
}));
