import React, { useEffect, useState, useCallback, useMemo } from "react";
import { DrawerClose, DrawerContent, DrawerTitle } from "../ui/drawer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FaEquals } from "react-icons/fa";
import { Card } from "../ui/card";
import { Slider } from "../ui/slider";
import { useTradeStore } from "@/store/tradeStore";
import OpenQuoteButton from "@/components/sections/trade/utils/openQuote";
import { useWalletAndProvider } from "@/components/layout/menu";
import { useOpenQuoteChecks } from "@/hooks/useOpenQuoteChecks";
import Link from "next/link";
import { useColorStore } from "@/store/colorStore";
import { calculateLiquidationPrice } from "@/lib/utils";
import { config } from "@/config";

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number[];
  onValueChange: (value: number[]) => void;
}

const SheetPlace: React.FC = () => {
  const { wallet, provider } = useWalletAndProvider();
  const {
    currentMethod,
    entryPrice,
    amount,
    amountUSD,
    sliderValue,
    bidPrice,
    askPrice,
    symbol,
    currentTabIndex,
    setCurrentMethod,
    setCurrentTabIndex,
    setEntryPrice,
    setAmount,
    setAmountUSD,
    setSliderValue,
    leverage,
    balance,
    maxAmount,
  } = useTradeStore();

  const [prevBidPrice, setPrevBidPrice] = useState<number>(bidPrice);
  const [prevAskPrice, setPrevAskPrice] = useState<number>(askPrice);
  const [userInteracted, setUserInteracted] = useState<boolean>(false);
  const [firstQuoteReceived, setFirstQuoteReceived] = useState<boolean>(false);

  const {
    quotes,
    sufficientBalance,
    maxAmountOpenable,
    isBalanceZero,
    isAmountMinAmount,
    noQuotesReceived,
    minAmount,
    recommendedStep,
    canBuyMinAmount,
    selectedQuoteUserAddress,
    lastValidBalance,
  } = useOpenQuoteChecks(amount, entryPrice);

  const color = useColorStore((state) => state.color);

  useEffect(() => {
    const updateEntryPrice = () => {
      if (currentTabIndex === "Market") {
        if (currentMethod === "Buy") {
          setEntryPrice((askPrice * 1.01).toFixed(5));
        } else if (currentMethod === "Sell") {
          setEntryPrice((bidPrice * 0.99).toFixed(5));
        }
      }
    };

    updateEntryPrice();
  }, [currentTabIndex, currentMethod, askPrice, bidPrice, setEntryPrice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPrevBidPrice(bidPrice);
      setPrevAskPrice(askPrice);
    }, 1000);

    return () => clearTimeout(timer);
  }, [bidPrice, askPrice]);

  useEffect(() => {
    if (!userInteracted && quotes.length > 0 && !firstQuoteReceived) {
      const minQuoteAmount = Math.min(
        ...quotes.map((q) => parseFloat(q.minAmount))
      );
      setAmount(minQuoteAmount.toString());
      setAmountUSD((minQuoteAmount * parseFloat(entryPrice)).toString());
      setFirstQuoteReceived(true);
    }
  }, [
    quotes,
    entryPrice,
    userInteracted,
    setAmount,
    setAmountUSD,
    firstQuoteReceived,
  ]);

  useEffect(() => {
    setFirstQuoteReceived(false);
  }, [currentMethod, symbol]);

  const toggleTabIndex = useCallback(() => {
    setCurrentTabIndex(currentTabIndex === "Market" ? "Limit" : "Market");
  }, [currentTabIndex, setCurrentTabIndex]);

  const handleAmountChange = useCallback(
    (value: string) => {
      setUserInteracted(true);
      setAmount(value);
      setAmountUSD((parseFloat(value) * parseFloat(entryPrice)).toString());
    },
    [setAmount, setAmountUSD, entryPrice]
  );

  const handleAmountUSDChange = useCallback(
    (value: string) => {
      setUserInteracted(true);
      setAmountUSD(value);
      setAmount((parseFloat(value) / parseFloat(entryPrice)).toString());
    },
    [setAmount, setAmountUSD, entryPrice]
  );

  const handleSliderChange = useCallback(
    (value: number) => {
      setUserInteracted(true);
      const newValue = noQuotesReceived
        ? value
        : Math.max(minAmount, Math.min(maxAmountOpenable, value));
      setSliderValue(newValue);
      setAmount(newValue.toString());
      setAmountUSD((newValue * parseFloat(entryPrice)).toString());
    },
    [
      noQuotesReceived,
      minAmount,
      maxAmountOpenable,
      setSliderValue,
      setAmount,
      setAmountUSD,
      entryPrice,
    ]
  );

  const getSliderProps = useCallback((): SliderProps => {
    if (noQuotesReceived) {
      return {
        min: 0,
        max: 100,
        step: 1,
        value: [parseFloat(amount) || 0],
        onValueChange: (value: number[]) => handleSliderChange(value[0]),
      };
    } else {
      return {
        min: minAmount,
        max: maxAmountOpenable,
        step: recommendedStep,
        value: [parseFloat(amount) || minAmount],
        onValueChange: (value: number[]) => handleSliderChange(value[0]),
      };
    }
  }, [
    noQuotesReceived,
    amount,
    minAmount,
    maxAmountOpenable,
    recommendedStep,
    handleSliderChange,
  ]);

  const roundedAmount = useMemo(() => {
    return Math.round(parseFloat(amount) / recommendedStep) * recommendedStep;
  }, [amount, recommendedStep]);

  const openQuoteRequest = useMemo(
    () => ({
      issuerAddress: "0x0000000000000000000000000000000000000000",
      counterpartyAddress: selectedQuoteUserAddress,
      version: "1.0",
      chainId: config.activeChainId,
      verifyingContract: "",
      x: "",
      parity: currentTabIndex,
      maxConfidence: "",
      assetHex: "",
      maxDelay: "600",
      precision: 5,
      imA: "",
      imB: "",
      dfA: "",
      dfB: "",
      expiryA: "",
      expiryB: "",
      timeLock: "",
      nonceBoracle: "0",
      signatureBoracle: "",
      isLong: currentMethod === "Buy",
      price: entryPrice,
      amount: roundedAmount.toString(),
      interestRate: "",
      isAPayingApr: false,
      frontEnd: "",
      affiliate: "",
      authorized: selectedQuoteUserAddress,
      nonceOpenQuote: "0",
      signatureOpenQuote: "",
      emitTime: "0",
      messageState: 0,
    }),
    [
      currentMethod,
      entryPrice,
      roundedAmount,
      selectedQuoteUserAddress,
      currentTabIndex,
    ]
  );

  const liquidationPrice = calculateLiquidationPrice(
    parseFloat(entryPrice),
    leverage,
    currentMethod === "Buy"
  );

  const isError =
    isBalanceZero ||
    !sufficientBalance ||
    isAmountMinAmount ||
    noQuotesReceived ||
    parseFloat(amount) <= 0 ||
    parseFloat(entryPrice) <= 0;

  return (
    <DrawerContent className="transform scale-60 origin-bottom">
      <DrawerTitle className="text-center mt-3">{symbol}</DrawerTitle>
      <div className="flex flex-col space-y-3 p-5">
        <div className="flex border-b">
          {["Buy", "Sell"].map((method) => (
            <h2
              key={`${method}-drawer`}
              onClick={() => setCurrentMethod(method)}
              className={`w-full text-center pb-3 border-b-[3px] ${
                currentMethod === method
                  ? method === "Sell"
                    ? "border-[#F23645] text-[#F23645]"
                    : "border-[#089981] text-[#089981]"
                  : "border-transparent"
              } font-medium transition-all cursor-pointer`}
            >
              {method}
            </h2>
          ))}
        </div>
        <div className="flex items-center justify-center mt-5 space-x-5">
          <Card className="py-4">
            <p
              className={`text-white ${
                bidPrice !== prevBidPrice ? "fade-effect" : ""
              }`}
            >
              Bid price: {bidPrice.toFixed(5)}
            </p>
          </Card>
          <Card className="py-4">
            <p
              className={`text-white ${
                askPrice !== prevAskPrice ? "fade-effect" : ""
              }`}
            >
              Ask price: {askPrice.toFixed(5)}
            </p>
          </Card>
        </div>

        <div className="flex space-x-5 justify-between items-end">
          <div className="flex flex-col space-y-2 w-full">
            <h3 className="text-left text-card-foreground">Entry Price</h3>
            <div className="flex items-center space-x-5 border-b">
              <Input
                className={`pb-3 outline-none w-full border-b-[0px] bg-transparent ${
                  currentTabIndex === "Market"
                    ? "text-gray-400 cursor-not-allowed"
                    : `hover:shadow-[0_0_0_2px] hover:shadow-[${color}]`
                }`}
                placeholder="Input Price"
                value={entryPrice}
                onChange={(e) =>
                  currentTabIndex === "Limit" && setEntryPrice(e.target.value)
                }
                disabled={currentTabIndex === "Market"}
              />
              <p>USD</p>
            </div>
          </div>
          <Button
            onClick={toggleTabIndex}
            className={`w-full ${
              currentTabIndex === "Market"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-card-foreground hover:bg-primary hover:text-primary-foreground"
            }`}
          >
            {currentTabIndex}
          </Button>
        </div>

        <div className="flex space-x-5 justify-between items-center">
          <div className="flex flex-col space-y-2 w-full">
            <h3 className="text-left text-card-foreground">Amount</h3>
            <div className="flex items-center space-x-5 border-b">
              <Input
                className="pb-3 outline-none w-full border-b-[0px] bg-transparent hover:shadow-[0_0_0_2px_rgba(256,200,52,1)]"
                placeholder="Input Amount"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
              />
              <p>Contracts</p>
            </div>
          </div>
          <FaEquals />
          <div className="flex flex-col space-y-2 w-full">
            <h3 className="text-left text-card-foreground">Amount</h3>
            <div className="flex items-center space-x-5 border-b">
              <Input
                className="pb-3 outline-none w-full border-b-[0px] bg-transparent hover:shadow-[0_0_0_2px_rgba(256,200,52,1)]"
                placeholder="Contracts Amount"
                value={amountUSD}
                onChange={(e) => handleAmountUSDChange(e.target.value)}
              />
              <p>USD</p>
            </div>
          </div>
        </div>
        {isBalanceZero ? (
          <p className="text-red-500 text-sm mt-1">
            Your balance is zero. Please{" "}
            <Link href="/wallet" className="text-blue-500 underline">
              deposit funds
            </Link>{" "}
            to continue trading.
          </p>
        ) : !sufficientBalance ? (
          <p className="text-red-500 text-sm mt-1">
            Max amount allowed at this price: {maxAmountOpenable.toFixed(8)}
          </p>
        ) : isAmountMinAmount ? (
          <p className="text-red-500 text-sm mt-1">
            The amount is less than the minimum required.
          </p>
        ) : noQuotesReceived ? (
          <p className="text-card-foreground text-sm mt-1">
            <span className="loader"></span>
            Waiting for quotes
          </p>
        ) : parseFloat(amount) <= 0 || parseFloat(entryPrice) <= 0 ? (
          <p className="text-red-500 text-sm mt-1">
            Amount and Entry Price must be greater than 0
          </p>
        ) : null}
        {isAmountMinAmount && canBuyMinAmount && (
          <p className="text-yellow-500 text-sm mt-1">
            The amount is less than the minimum required, but you have
            sufficient balance to buy the minimum amount of {minAmount}{" "}
            contracts.
          </p>
        )}
        <div className="py-3">
          <Slider {...getSliderProps()} />
        </div>
        <div className="flex items-center space-x-2">
          {[25, 50, 75, 100].map((percentage) => (
            <Button
              key={percentage}
              onClick={() =>
                handleSliderChange(
                  (percentage / 100) *
                    (noQuotesReceived ? 100 : maxAmountOpenable)
                )
              }
              className="w-full bg-card py-2 text-center hover:bg-primary rounded-lg"
            >
              {percentage}%
            </Button>
          ))}
        </div>
        <Link
          href="/user"
          className="text-left text-card-foreground hover:underline"
        >
          <h3>{leverage}x Account Leverage</h3>
        </Link>
        <div className="flex items-center justify-between p-5 px-8 bg-card">
          <div className="flex flex-col items-center space-y-2 text-center">
            <h3>Min Amount Step</h3>
            <h3>
              {quotes.length > 0
                ? Math.min(
                    ...quotes.map((q) => parseFloat(q.minAmount))
                  ).toFixed(5)
                : "N/A"}{" "}
              Contracts
            </h3>
          </div>
          <div className="flex flex-col items-center space-y-2 text-center">
            <h3>Max Amount</h3>
            <h3>{maxAmountOpenable.toFixed(5)} Contracts</h3>
          </div>
          <div className="flex flex-col items-center space-y-2 text-center">
            <h3>Liquidation Price</h3>
            <h3>{liquidationPrice.toFixed(5)} USD</h3>
          </div>
        </div>
        <DrawerClose>
          <OpenQuoteButton request={openQuoteRequest} disabled={isError} />{" "}
        </DrawerClose>
      </div>
    </DrawerContent>
  );
};

export default SheetPlace;
