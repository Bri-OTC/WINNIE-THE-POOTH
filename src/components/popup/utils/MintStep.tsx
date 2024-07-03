// MintStep.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  FakeUSD,
  networks,
  NetworkKey,
} from "@pionerfriends/blockchain-client";
import {
  Address,
  encodeFunctionData,
  parseUnits,
  decodeFunctionResult,
} from "viem";
import { toast } from "react-toastify";
import { config } from "@/config";

interface MintStepProps {
  amount: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  provider: any;
  wallet: any;
  onMint: (amount: number) => void;
}

const fakeUSDABI = FakeUSD.abi;

function MintStep({
  amount,
  loading,
  setLoading,
  setError,
  provider,
  wallet,
  onMint,
}: MintStepProps) {
  const [mintedAmount, setMintedAmount] = useState(0);

  useEffect(() => {
    const fetchMintedAmount = async () => {
      try {
        if (!provider || !wallet?.address) {
          return;
        }

        const data = encodeFunctionData({
          abi: fakeUSDABI,
          functionName: "balanceOf",
          args: [wallet.address],
        });

        const result = await provider.request({
          method: "eth_call",
          params: [
            {
              to: networks[config.activeChainId as unknown as NetworkKey]
                .contracts.FakeUSD as Address,
              data,
            },
            "latest",
          ],
        });

        const decodedResult = decodeFunctionResult({
          abi: fakeUSDABI,
          functionName: "balanceOf",
          data: result,
        });

        if (Array.isArray(decodedResult) && decodedResult.length > 0) {
          setMintedAmount(parseFloat(decodedResult[0]));
        }
      } catch (error) {
        console.error("Error fetching minted amount:", error);
      }
    };

    fetchMintedAmount();
  }, [provider, wallet]);

  async function handleMint() {
    setLoading(true);
    setError(null);

    try {
      if (!provider) {
        setError("No wallet provider");
        return;
      }

      //const targetChainId = `0x${networks[config.activeChainId as unknown as NetworkKey].chainHex}`;
      const targetChainId = config.activeChainHex;
      const currentChainId = await provider.request({ method: "eth_chainId" });

      if (currentChainId !== config.activeChainId) {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: targetChainId }],
        });
      }

      const dataMint = encodeFunctionData({
        abi: fakeUSDABI,
        functionName: "mint",
        args: [parseUnits(amount, 18)],
      });

      const toastId = toast.loading("Minting tokens...");

      try {
        const nonce = await provider.request({
          method: "eth_getTransactionCount",
          params: [wallet?.address, "latest"],
        });

        const transaction = await provider.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: wallet?.address,
              to: networks[config.activeChainId as unknown as NetworkKey]
                .contracts.FakeUSD as Address,
              data: dataMint,
              nonce: nonce,
            },
          ],
        });

        // Subscribe to new block headers
        await window.ethereum.request({
          method: "eth_subscribe",
          params: ["newHeads", null],
        });

        // Wait for the transaction to be confirmed
        await new Promise<void>((resolve) => {
          const checkConfirmation = async () => {
            const receipt = await provider.request({
              method: "eth_getTransactionReceipt",
              params: [transaction],
            });

            if (receipt) {
              toast.dismiss(toastId);
              toast.success(
                `Tokens minted successfully. Transaction hash: ${transaction}`
              );
              setMintedAmount((prevAmount) => prevAmount + parseFloat(amount));
              onMint(parseFloat(amount));
              resolve();
            } else {
              setTimeout(checkConfirmation, 1000); // Check again after 1 second
            }
          };

          checkConfirmation();
        });
      } catch (error) {
        console.error("Minting error:", error);
        toast.dismiss(toastId);
        toast.error("Minting failed");
        setError("Minting failed");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Minting failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-end space-x-3">
      <Button onClick={handleMint} disabled={loading || !amount}>
        {loading ? "Minting..." : "1. Mint"}
      </Button>
    </div>
  );
}

export default MintStep;
