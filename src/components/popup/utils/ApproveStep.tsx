// ApproveStep.tsx
import { Button } from "@/components/ui/button";
import {
  FakeUSD,
  PionerV1Compliance,
  networks,
  NetworkKey,
} from "@pionerfriends/blockchain-client";
import { Address, encodeFunctionData, parseUnits } from "viem";
import { toast } from "react-toastify";
import { config } from "@/config";

interface ApproveStepProps {
  amount: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  provider: any;
  wallet: any;
  onApprove: (amount: number) => void;
}

const fakeUSDABI = FakeUSD.abi;

function ApproveStep({
  amount,
  loading,
  setLoading,
  setError,
  provider,
  wallet,
  onApprove,
}: ApproveStepProps) {
  async function handleApprove() {
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

      const dataApprove = encodeFunctionData({
        abi: fakeUSDABI,
        functionName: "approve",
        args: [
          networks[config.activeChainId as unknown as NetworkKey].contracts
            .PionerV1Compliance as Address,
          parseUnits(amount, 18),
        ],
      });

      const toastId = toast.loading("Approving tokens...");

      try {
        const transaction = await provider.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: wallet?.address,
              to: networks[config.activeChainId as unknown as NetworkKey]
                .contracts.FakeUSD as Address,
              data: dataApprove,
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
                params: [transaction],
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
          `Tokens approved successfully. Transaction hash: ${transaction}`
        );
        onApprove(parseFloat(amount));
      } catch (error) {
        console.error("Approval error:", error);
        toast.dismiss(toastId);
        toast.error("Approval failed");
        setError("Approval failed");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Approval failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-end space-x-3">
      <Button onClick={handleApprove} disabled={loading || !amount}>
        {loading ? "Approving..." : "2. Approve"}
      </Button>
    </div>
  );
}

export default ApproveStep;
