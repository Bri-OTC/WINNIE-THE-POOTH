import React, { useCallback, useState, useEffect } from "react";
import { DrawerClose, DrawerContent, DrawerTitle } from "../ui/drawer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Card } from "../ui/card";
import { useAuthStore } from "@/store/authStore";
import { useWalletAndProvider } from "@/components/layout/menu";
import { parseUnits } from "viem";
import {
  sendSignedCloseQuote,
  SignedCloseQuoteRequest,
} from "@pionerfriends/api-client";
import { removePrefix } from "@/components/web3/utils";
import { toast } from "react-toastify";
import { config } from "@/config";
import {
  handleCloseQuote,
  CloseQuoteParams,
} from "@/components/sections/trade/utils/closeQuote";
import debounce from "lodash/debounce";

interface SheetPlaceOrderProps {
  position: {
    id: string;
    size: string;
    market: string;
    icon: string;
    mark: string;
    entryPrice: string;
    pnl: string;
    amount: string;
    amountContract: string;
    type: string;
    estLiq: string;
    entryTime: string;
    mtm: string;
    imA: string;
    dfA: string;
    imB: string;
    dfB: string;
    openTime: string;
    isAPayingAPR: boolean;
    interestRate: string;
    bContractId: number;
    pA: string;
    pB: string;
    isLong: boolean;
  };
  onClose: () => void;
}

const SheetPlaceClose: React.FC<SheetPlaceOrderProps> = ({
  position,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [takeProfit, setTakeProfit] = useState("");
  const [takeProfitPercentage, setTakeProfitPercentage] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [stopLossPercentage, setStopLossPercentage] = useState("");
  const [isReduceTP, setIsReduceTP] = useState(false);
  const [isReduceSL, setIsReduceSL] = useState(false);
  const [exitPnL, setExitPnL] = useState(0);
  const [stopPnL, setStopPnL] = useState(0);
  const [riskRewardPnL, setRiskRewardPnL] = useState(0);
  const { bContractId, amountContract, pA, pB, isLong } = position;

  const { token, walletClient } = useAuthStore();
  const { wallet, provider } = useWalletAndProvider();

  const entryPrice = parseFloat(position.entryPrice);
  const markPrice = parseFloat(position.mark);

  const computePnL = useCallback(
    (tp: string, sl: string) => {
      const takeProfitValue = parseFloat(tp);
      const stopLossValue = parseFloat(sl);

      if (isNaN(takeProfitValue) || isNaN(stopLossValue)) {
        setExitPnL(0);
        setStopPnL(0);
        setRiskRewardPnL(0);
        return;
      }

      const exitPnLValue = isLong
        ? ((takeProfitValue - entryPrice) / entryPrice) * 100
        : ((entryPrice - takeProfitValue) / entryPrice) * 100;

      const stopPnLValue = isLong
        ? ((entryPrice - stopLossValue) / entryPrice) * 100
        : ((stopLossValue - entryPrice) / entryPrice) * 100;

      const riskRewardRatio = Math.abs(exitPnLValue / stopPnLValue);

      setExitPnL(exitPnLValue);
      setStopPnL(stopPnLValue);
      setRiskRewardPnL(riskRewardRatio);
    },
    [isLong, entryPrice]
  );

  useEffect(() => {
    computePnL(takeProfit, stopLoss);
  }, [computePnL, stopLoss, takeProfit]);

  const handleTakeProfitChange = useCallback(
    (value: string) => {
      setTakeProfit(value);
      if (!isNaN(parseFloat(value))) {
        const percentage = isLong
          ? ((parseFloat(value) - entryPrice) / entryPrice) * 100
          : ((entryPrice - parseFloat(value)) / entryPrice) * 100;
        setTakeProfitPercentage(percentage.toFixed(2));
      } else {
        setTakeProfitPercentage("");
      }
      computePnL(value, stopLoss);
    },
    [isLong, stopLoss, entryPrice, computePnL]
  );

  const handleStopLossChange = useCallback(
    (value: string) => {
      setStopLoss(value);
      if (!isNaN(parseFloat(value))) {
        const percentage = isLong
          ? ((entryPrice - parseFloat(value)) / entryPrice) * 100
          : ((parseFloat(value) - entryPrice) / entryPrice) * 100;
        setStopLossPercentage(percentage.toFixed(2));
      } else {
        setStopLossPercentage("");
      }
      computePnL(takeProfit, value);
    },
    [isLong, takeProfit, entryPrice, computePnL]
  );

  const handleTakeProfitPercentageChange = useCallback(
    (value: string) => {
      setTakeProfitPercentage(value);
      if (!isNaN(parseFloat(value))) {
        const price = isLong
          ? entryPrice * (1 + parseFloat(value) / 100)
          : entryPrice * (1 - parseFloat(value) / 100);
        setTakeProfit(price.toFixed(2));
        computePnL(price.toString(), stopLoss);
      } else {
        setTakeProfit("");
        computePnL("", stopLoss);
      }
    },
    [isLong, stopLoss, entryPrice, computePnL]
  );

  const handleStopLossPercentageChange = useCallback(
    (value: string) => {
      setStopLossPercentage(value);
      if (!isNaN(parseFloat(value))) {
        const price = isLong
          ? entryPrice * (1 - parseFloat(value) / 100)
          : entryPrice * (1 + parseFloat(value) / 100);
        setStopLoss(price.toFixed(2));
        computePnL(takeProfit, price.toString());
      } else {
        setStopLoss("");
        computePnL(takeProfit, "");
      }
    },
    [isLong, takeProfit, entryPrice, computePnL]
  );

  const handleTPCheckboxChange = useCallback(
    (checked: boolean) => {
      setIsReduceTP(checked);
      if (checked) {
        setTakeProfitPercentage("10");
        handleTakeProfitPercentageChange("10");
      } else {
        setTakeProfitPercentage("");
        setTakeProfit("");
      }
    },
    [handleTakeProfitPercentageChange]
  );

  const handleSLCheckboxChange = useCallback(
    (checked: boolean) => {
      setIsReduceSL(checked);
      if (checked) {
        setStopLossPercentage("10");
        handleStopLossPercentageChange("10");
      } else {
        setStopLossPercentage("");
        setStopLoss("");
      }
    },
    [handleStopLossPercentageChange]
  );

  const handleLastPrice = useCallback(() => {
    setTakeProfit(markPrice.toString());
    setStopLoss(markPrice.toString());
    computePnL(markPrice.toString(), markPrice.toString());
  }, [markPrice, computePnL]);

  const submitCloseQuote = useCallback(
    debounce(
      async ({ price, isTP }: { price: string; isTP: boolean }) => {
        if (loading) return;
        setLoading(true);
        try {
          if (!token || !wallet || !walletClient) {
            console.error("Missing required data");
            return;
          }
          const params: CloseQuoteParams = {
            wallet,
            token,
            walletClient,
            activeChainId: config.activeChainId,
            bContractId,
            amountContract,
            pA,
            pB,
            isLong,
            price,
            isTP,
          };
          console.log("Submitting close quote:", params);
          const success = await handleCloseQuote(params);
          if (success) {
            onClose();
          }
        } catch (error) {
          console.error("Error submitting close quote:", error);
          toast.error(
            `Failed to submit ${isTP ? "Take Profit" : "Stop Loss"} order`
          );
        } finally {
          setLoading(false);
        }
      },
      500,
      { leading: true, trailing: false }
    ),
    [
      token,
      wallet,
      walletClient,
      bContractId,
      amountContract,
      pA,
      pB,
      isLong,
      onClose,
    ]
  );

  const handleBothCloseQuotes = useCallback(
    debounce(
      async () => {
        if (loading) return;
        setLoading(true);
        try {
          await submitCloseQuote({ price: takeProfit, isTP: true });
          await submitCloseQuote({ price: stopLoss, isTP: false });
          onClose();
        } catch (error) {
          console.error("Error submitting close quotes:", error);
          toast.error("Failed to submit Take Profit and Stop Loss orders");
        } finally {
          setLoading(false);
        }
      },
      500,
      { leading: true, trailing: false }
    ),
    [submitCloseQuote, takeProfit, stopLoss, onClose]
  );

  const renderPriceInput = useCallback(
    (
      label: string,
      value: string,
      onChange: (value: string) => void,
      isDisabled: boolean,
      onActivate: () => void
    ) => (
      <div className="flex flex-col space-y-2 w-full">
        <h3 className="text-left text-card-foreground">{label}</h3>
        <div className="flex items-center space-x-5 border-b">
          <Input
            className={`pb-3 outline-none w-full border-b-[0px] bg-transparent hover:shadow-[0_0_0_2px_rgba(256,200,52,1)] ${
              parseFloat(value) <= 0 ? "text-red-500" : ""
            }`}
            placeholder="Input Price"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isDisabled}
            onClick={() => {
              if (isDisabled) onActivate();
            }}
          />
          <p>USD</p>
        </div>
      </div>
    ),
    []
  );

  const renderPercentageInput = useCallback(
    (
      label: string,
      value: string,
      onChange: (value: string) => void,
      isDisabled: boolean
    ) => (
      <div className="flex flex-col space-y-2 w-full">
        <h3 className="text-left text-card-foreground">{label}</h3>
        <div className="flex items-center space-x-5 border-b">
          <Input
            className="pb-3 outline-none w-full border-b-[0px] bg-transparent hover:shadow-[0_0_0_2px_rgba(256,200,52,1)]"
            placeholder="Input Percentage"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isDisabled}
          />
          <p>%</p>
        </div>
      </div>
    ),
    []
  );

  const canCloseQuote = isReduceTP || isReduceSL;

  const formattedMarket = removePrefix(position.market);

  const handleDrawerClose = () => {
    setLoading(false);
    onClose();
  };

  return (
    <DrawerContent>
      <DrawerTitle className="text-center mt-3">{formattedMarket}</DrawerTitle>
      <div className="flex flex-col space-y-3 p-5">
        <div className="flex items-center justify-center mt-5 space-x-5">
          <Card className="py-4">
            <p className="text-white">Entry Price: {position.entryPrice}</p>
          </Card>
          <Card className="py-4">
            <p className="text-white">Mark Price: {position.mark}</p>
          </Card>
        </div>

        <div className="flex space-x-5 justify-between items-end">
          <Button
            onClick={handleLastPrice}
            className="w-full bg-card text-[rgba(256,200,52,1)] hover:bg-card hover:text-white"
          >
            Last Price
          </Button>
        </div>

        <div className="flex space-x-5 justify-between items-end">
          {renderPriceInput(
            "Take profit exit",
            takeProfit,
            handleTakeProfitChange,
            !isReduceTP,
            () => handleTPCheckboxChange(true)
          )}
          {renderPercentageInput(
            "% Gain",
            takeProfitPercentage,
            handleTakeProfitPercentageChange,
            !isReduceTP
          )}
          <div className="flex flex-col items-center space-y-1">
            <p>TP</p>
            <Checkbox
              checked={isReduceTP}
              onCheckedChange={handleTPCheckboxChange}
            />
          </div>
        </div>

        <div className="flex space-x-5 justify-between items-end">
          {renderPriceInput(
            "Stop loss",
            stopLoss,
            handleStopLossChange,
            !isReduceSL,
            () => handleSLCheckboxChange(true)
          )}
          {renderPercentageInput(
            "% Loss",
            stopLossPercentage,
            handleStopLossPercentageChange,
            !isReduceSL
          )}
          <div className="flex flex-col items-center space-y-1">
            <p>SL</p>
            <Checkbox
              checked={isReduceSL}
              onCheckedChange={handleSLCheckboxChange}
            />
          </div>
        </div>

        <h3 className="text-left text-card-foreground">
          Est. Liquidation Price: {position.estLiq}
        </h3>

        <div className="flex items-center justify-between p-5 px-8 bg-card">
          <div className="flex flex-col items-center space-y-2 text-center">
            <h3>Exit PnL</h3>
            <h3>{exitPnL.toFixed(2)} %</h3>
          </div>
          <div className="flex flex-col items-center space-y-2 text-center">
            <h3>Stop PnL</h3>
            <h3>{stopPnL.toFixed(2)} %</h3>
          </div>
          <div className="flex flex-col items-center space-y-2 text-center">
            <h3>Risk Reward</h3>
            <h3>{riskRewardPnL.toFixed(2)}</h3>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <div className="flex space-x-3">
            {isReduceTP && (
              <Button
                className="flex-1"
                onClick={() =>
                  submitCloseQuote({ price: takeProfit, isTP: true })
                }
                disabled={takeProfit === "" || loading}
              >
                {loading ? "Submitting..." : "TP"}
              </Button>
            )}
            {isReduceSL && (
              <Button
                className="flex-1"
                onClick={() =>
                  submitCloseQuote({ price: stopLoss, isTP: false })
                }
                disabled={stopLoss === "" || loading}
              >
                {loading ? "Submitting..." : "SL"}
              </Button>
            )}
          </div>
          <Button
            onClick={handleBothCloseQuotes}
            disabled={
              (!isReduceTP && !isReduceSL) ||
              (isReduceTP && takeProfit === "") ||
              (isReduceSL && stopLoss === "") ||
              loading
            }
          >
            {loading ? "Submitting..." : "Close"}
          </Button>
        </div>
      </div>
    </DrawerContent>
  );
};

export default SheetPlaceClose;
