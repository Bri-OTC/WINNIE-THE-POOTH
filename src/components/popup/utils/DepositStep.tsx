// DepositStep.tsx
import { Button } from "@/components/ui/button";
import {
  PionerV1Compliance,
  networks,
  NetworkKey,
} from "@pionerfriends/blockchain-client";
import { Address, encodeFunctionData, parseUnits } from "viem";
import { toast } from "react-toastify";
import { config } from "@/config";

interface DepositStepProps {
  amount: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  provider: any;
  wallet: any;
  onDeposit: (amount: number) => void;
  onClose: () => void;
}

const pionerV1ComplianceABI = PionerV1Compliance.abi;

function DepositStep({
  amount,
  loading,
  setLoading,
  setError,
  provider,
  wallet,
  onDeposit,
  onClose,
}: DepositStepProps) {
  async function handleDeposit() {
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

      const dataDeposit = encodeFunctionData({
        abi: pionerV1ComplianceABI,
        functionName: "deposit",
        args: [parseUnits(amount, 18), 1, wallet?.address],
      });

      const toastId = toast.loading("Depositing tokens...");

      try {
        const txDeposit = await provider.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: wallet?.address,
              to: networks[config.activeChainId as unknown as NetworkKey]
                .contracts.PionerV1Compliance as Address,
              data: dataDeposit,
            },
          ],
        });

        // Subscribe to new block headers
        await window.ethereum.request({
          method: "eth_subscribe",
          params: ["newHeads", null],
        });

        // Wait for the transaction to be confirmed
        const receipt = await new Promise<any>((resolve, reject) => {
          const checkConfirmation = async () => {
            try {
              const txReceipt = await provider.request({
                method: "eth_getTransactionReceipt",
                params: [txDeposit],
              });

              if (txReceipt) {
                if (txReceipt.status === "0x1") {
                  resolve(txReceipt);
                } else {
                  reject(new Error("Transaction failed"));
                }
              } else {
                setTimeout(checkConfirmation, 1000); // Check again after 1 second
              }
            } catch (error) {
              reject(error);
            }
          };

          checkConfirmation();
        });

        toast.dismiss(toastId);
        toast.success(
          `Tokens deposited successfully. Transaction hash: ${txDeposit}`
        );
        onDeposit(parseFloat(amount));
        onClose();
      } catch (error) {
        toast.dismiss(toastId);
        toast.error("Deposit failed");
        setError("Deposit failed");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Deposit failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-end space-x-3">
      <Button
        onClick={handleDeposit}
        disabled={loading || !amount || parseFloat(amount) > 100}
        className="w-full"
      >
        {loading ? "Depositing..." : "3. Deposit"}
      </Button>
    </div>
  );
}

export default DepositStep;
