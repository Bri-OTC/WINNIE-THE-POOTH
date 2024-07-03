// DepositSteps.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import {
  FakeUSD,
  PionerV1Compliance,
  networks,
} from "@pionerfriends/blockchain-client";
import { Address, parseUnits, encodeFunctionData } from "viem";
import { toast } from "react-toastify";
import { useWalletAndProvider } from "@/components/layout/menu";
import MintStep from "./MintStep";
import ApproveStep from "./ApproveStep";
import DepositStep from "./DepositStep";
import {
  USDCBalance,
  USDCAllowance,
  DepositedBalance,
} from "@/components/sections/wallet/table";

interface DepositStepsProps {
  amount: string;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  onClose: () => void;
}

const fakeUSDABI = FakeUSD.abi;
const pionerV1ComplianceABI = PionerV1Compliance.abi;

function DepositSteps({
  amount,
  loading,
  setLoading,
  setError,
  onClose,
}: DepositStepsProps) {
  const { wallet, provider } = useWalletAndProvider();
  const mintedAmount = USDCBalance();
  const depositedAmount = DepositedBalance();
  const allowedAmount = USDCAllowance();

  function handleDepositSuccess(amount: number) {}
  function handleApproveSuccess(amount: number) {}
  function handleMintSuccess(amount: number) {}

  useEffect(() => {
    if (parseFloat(amount) > 100) {
      setError("Deposit amount cannot exceed 100 USD");
    } else {
      setError(null);
    }
  }, [amount, setError]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span>{mintedAmount} USD</span>
        <MintStep
          amount={amount}
          loading={loading}
          setLoading={setLoading}
          setError={setError}
          provider={provider}
          wallet={wallet}
          onMint={handleMintSuccess}
        />
      </div>
      <div className="flex justify-between items-center">
        <span>{allowedAmount} USD</span>
        <ApproveStep
          amount={amount}
          loading={loading}
          setLoading={setLoading}
          setError={setError}
          provider={provider}
          wallet={wallet}
          onApprove={handleApproveSuccess}
        />
      </div>
      <div className="flex justify-between items-center">
        <span>{depositedAmount} USD</span>
        <DepositStep
          amount={amount}
          loading={loading}
          setLoading={setLoading}
          setError={setError}
          provider={provider}
          wallet={wallet}
          onDeposit={handleDepositSuccess}
          onClose={onClose}
        />
      </div>
      <DialogClose>
        <Button variant="secondary" className="w-full">
          Cancel
        </Button>
      </DialogClose>
    </div>
  );
}

export default DepositSteps;
