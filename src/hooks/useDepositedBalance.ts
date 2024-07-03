import { useAuthStore } from "@/store/authStore";
import { usePrivy } from "@privy-io/react-auth";
import { useWalletAndProvider } from "@/components/layout/menu";
import {
  networks,
  PionerV1,
  NetworkKey,
} from "@pionerfriends/blockchain-client";
import { encodeFunctionData, Address, formatUnits } from "viem";
import { useEffect, useState, useMemo } from "react";
import { config } from "@/config";

// Refactored to a hook
export function useDepositedBalance() {
  const { wallet, provider } = useWalletAndProvider();
  const [depositedBalance, setDepositedBalance] = useState("0");

  const { ready, authenticated, user, logout } = usePrivy();

  useEffect(() => {
    const fetchDepositedBalance = async () => {
      if (wallet && provider) {
        try {
          const dataDeposited = encodeFunctionData({
            abi: PionerV1.abi,
            functionName: "getBalances",
            args: [wallet.address],
          });

          const depositedBalanceResponse = await provider.request({
            method: "eth_call",
            params: [
              {
                to: networks[config.activeChainId as unknown as NetworkKey]
                  .contracts.PionerV1 as Address,
                data: dataDeposited,
              },
              "latest",
            ],
          });

          if (depositedBalanceResponse === "0x") {
            setDepositedBalance("0");
          } else {
            const depositedBalanceInUnits = formatUnits(
              BigInt(depositedBalanceResponse as string),
              18
            );
            setDepositedBalance(depositedBalanceInUnits);
          }
        } catch (error) {
          // Handle error
        }
      }
    };

    fetchDepositedBalance();
    const interval = setInterval(fetchDepositedBalance, 2500);
    return () => clearInterval(interval);
  }, [wallet, provider, logout]);

  return depositedBalance;
}
