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
import ClaimWithdraw from "./claimWithdrawStep";
import InitWithdraw from "./initWithdrawStep";
import {
  ClaimableBalance,
  TimeToClaim,
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

function WithdrawSteps({
  amount,
  loading,
  setLoading,
  setError,
  onClose,
}: DepositStepsProps) {
  const { wallet, provider } = useWalletAndProvider();
  const timeToClaim = TimeToClaim();
  const depositedBalance = DepositedBalance();
  const claimableBalance = ClaimableBalance();

  function handleWithdrawSuccess(amount: number) {}
  function handleClaimSuccess(amount: number) {}

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
        <span>{depositedBalance} USD</span>
        <InitWithdraw
          amount={amount}
          loading={loading}
          setLoading={setLoading}
          setError={setError}
          provider={provider}
          wallet={wallet}
          onEvent={handleWithdrawSuccess}
        />
      </div>
      <div className="flex justify-between items-center">
        <div>
          <span>5min lock</span>
          <span className="ml-4">{claimableBalance} USD</span>
        </div>
        <ClaimWithdraw
          amount={amount}
          loading={loading}
          setLoading={setLoading}
          setError={setError}
          provider={provider}
          wallet={wallet}
          onEvent={handleClaimSuccess}
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

export default WithdrawSteps;
