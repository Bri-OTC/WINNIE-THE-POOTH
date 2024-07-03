// components/WalletLoader.tsx
import { useEffect, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import {
  createWalletClient,
  defineChain,
  createPublicClient,
  custom,
} from "viem";
import { config } from "@/config";

export function WalletLoader() {
  const { wallets } = useWallets();
  const [walletClient, setWalletClient] = useState<ReturnType<
    typeof createWalletClient
  > | null>(null);

  useEffect(() => {
    async function loadWallet() {
      if (wallets.length > 0) {
        const wallet = wallets[0];
        const provider = await wallet.getEthereumProvider();
        const client = createWalletClient({
          chain: config.viemChain,
          transport: custom(provider),
        });
        setWalletClient(client);
      }
    }

    loadWallet();
  }, [wallets]); //

  return walletClient;
}

const walletClient =
  typeof window !== "undefined"
    ? createWalletClient({
        chain: config.viemChain,
        transport: custom(window.ethereum),
      })
    : null;

export { walletClient };
