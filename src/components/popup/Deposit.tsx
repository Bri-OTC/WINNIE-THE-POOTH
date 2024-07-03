// Deposit.tsx
import { useState } from "react";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AiOutlineClose } from "react-icons/ai";
import { Toaster } from "sonner";
import DepositSteps from "./utils/DepositSteps";

interface DepositProps {
  open: boolean;
  onClose: () => void;
}

function Deposit({ open, onClose }: DepositProps) {
  const [amount, setAmount] = useState("100");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-none p-2 md:p-4">
        <div className="p-5 rounded-lg flex flex-col space-y-5">
          <div className="flex items-center justify-between">
            <h1>Deposit</h1>
            <DialogClose>
              <AiOutlineClose />
            </DialogClose>
          </div>
          <div>
            <h3 className="text-card-foreground">Amount</h3>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          <DepositSteps
            amount={amount}
            loading={loading}
            setLoading={setLoading}
            setError={setError}
            onClose={onClose}
          />
        </div>
      </DialogContent>
      <Toaster />
    </Dialog>
  );
}

export default Deposit;
