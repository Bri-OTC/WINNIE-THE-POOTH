import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTradeStore } from "@/store/tradeStore";
import { useRfqRequestStore } from "@/store/rfqStore";
import { useQuoteStore, QuoteResponse } from "@/store/quoteStore";
import { useDepositedBalance } from "@/hooks/useDepositedBalance";
import { debounce } from "lodash";

interface OpenQuoteCheckResults {
  quotes: QuoteResponse[];
  sufficientBalance: boolean;
  maxAmountOpenable: number;
  isBalanceZero: boolean;
  isAmountMinAmount: boolean;
  noQuotesReceived: boolean;
  minAmount: number;
  recommendedStep: number;
  canBuyMinAmount: boolean;
  selectedQuoteUserAddress: string;
  lastValidBalance: string;
  recommendedAmount: number;
  bestBid: string;
  bestAsk: string;
  maxAmount: number;
}

export const useOpenQuoteChecks = (amount: string, entryPrice: string) => {
  const depositedBalance = useDepositedBalance();
  const currentMethod = useTradeStore((state) => state.currentMethod);
  const rfqRequest = useRfqRequestStore((state) => state.rfqRequest);
  const { quotes, cleanExpiredQuotes } = useQuoteStore();
  const leverage = useTradeStore((state) => state.leverage);

  const [selectedQuote, setSelectedQuote] = useState<QuoteResponse | null>(
    null
  );
  const [lastValidBalance, setLastValidBalance] = useState("0");

  const [cachedResults, setCachedResults] = useState<OpenQuoteCheckResults>({
    quotes: [],
    sufficientBalance: false,
    maxAmountOpenable: 0,
    isBalanceZero: true,
    isAmountMinAmount: true,
    noQuotesReceived: true,
    minAmount: 0,
    recommendedStep: 0,
    canBuyMinAmount: false,
    selectedQuoteUserAddress: "0xd0dDF915693f13Cf9B3b69dFF44eE77C901882f8",
    lastValidBalance: "0",
    recommendedAmount: 0,
    bestBid: "0",
    bestAsk: "0",
    maxAmount: 0,
  });

  const previousInputsRef = useRef({
    amount,
    entryPrice,
    currentMethod,
    rfqRequest,
    balanceToUse: depositedBalance,
    quotes,
    leverage,
  });

  const updateResults = useCallback((newResults: OpenQuoteCheckResults) => {
    setCachedResults((prevResults) => {
      if (JSON.stringify(prevResults) === JSON.stringify(newResults)) {
        return prevResults;
      }
      return newResults;
    });
  }, []);

  const debouncedUpdateResults = useMemo(
    () => debounce(updateResults, 500),
    [updateResults]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      cleanExpiredQuotes();
    }, 1000);
    return () => clearInterval(interval);
  }, [cleanExpiredQuotes]);

  useEffect(() => {
    if (depositedBalance !== "0") {
      setLastValidBalance(depositedBalance);
    }
  }, [depositedBalance]);

  const balanceToUse = useMemo(() => {
    return depositedBalance === "0" ? lastValidBalance : depositedBalance;
  }, [depositedBalance, lastValidBalance]);

  useEffect(() => {
    const selectBestQuote = () => {
      if (quotes.length > 0) {
        const currentAmount = parseFloat(amount) || 0;
        const sortedQuotes = [...quotes].sort((a, b) => {
          const priceA =
            currentMethod === "Buy"
              ? parseFloat(a.sPrice) || 0
              : parseFloat(a.lPrice) || 0;
          const priceB =
            currentMethod === "Buy"
              ? parseFloat(b.sPrice) || 0
              : parseFloat(b.lPrice) || 0;
          return currentMethod === "Buy" ? priceA - priceB : priceB - priceA;
        });

        const bestPriceQuote = sortedQuotes[0];
        const bestPriceMaxAmount = parseFloat(bestPriceQuote.maxAmount) || 0;

        if (currentAmount <= bestPriceMaxAmount) {
          setSelectedQuote(bestPriceQuote);
        } else {
          const sufficientQuote = sortedQuotes.find(
            (q) => (parseFloat(q.maxAmount) || 0) >= currentAmount
          );
          setSelectedQuote(sufficientQuote || bestPriceQuote);
        }
      } else {
        setSelectedQuote(null);
      }
    };

    const interval = setInterval(selectBestQuote, 1000);
    return () => clearInterval(interval);
  }, [quotes, amount, currentMethod]);

  useEffect(() => {
    const currentInputs = {
      amount,
      entryPrice,
      currentMethod,
      rfqRequest,
      balanceToUse,
      quotes,
      leverage,
    };

    if (
      JSON.stringify(currentInputs) ===
      JSON.stringify(previousInputsRef.current)
    ) {
      return;
    }

    previousInputsRef.current = currentInputs;

    const safeParseFloat = (value: string | undefined): number => {
      if (value === undefined || value === null) return 0;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    try {
      const collateralRequirement =
        currentMethod === "Buy"
          ? safeParseFloat(rfqRequest?.lImA) + safeParseFloat(rfqRequest?.lDfA)
          : safeParseFloat(rfqRequest?.sImB) + safeParseFloat(rfqRequest?.sDfB);

      const minAmount =
        quotes.length > 0
          ? Math.min(...quotes.map((q) => safeParseFloat(q.minAmount)))
          : 0;

      const recommendedStep = minAmount > 0 ? minAmount : 0;

      const calculateMaxAmountOpenable = (
        balance: number,
        entryPrice: number,
        collateralRequirement: number,
        step: number
      ): number => {
        if (entryPrice === 0 || collateralRequirement === 0 || step === 0)
          return 0;
        const rawMaxAmount = balance / (collateralRequirement * entryPrice);
        const stepsCount = Math.floor(rawMaxAmount / step);
        return stepsCount * step;
      };

      const maxAmountOpenable = calculateMaxAmountOpenable(
        safeParseFloat(balanceToUse),
        safeParseFloat(entryPrice),
        collateralRequirement,
        recommendedStep
      );

      const currentAmount = safeParseFloat(amount);
      const isAmountMinAmount = currentAmount < minAmount;
      const canBuyMinAmount =
        isAmountMinAmount &&
        minAmount * safeParseFloat(entryPrice) * collateralRequirement <=
          safeParseFloat(balanceToUse);

      const calculateRecommendedAmount = (
        currentAmount: number,
        minAmount: number,
        maxAmount: number,
        step: number
      ): number => {
        if (currentAmount <= minAmount) return minAmount;
        if (currentAmount >= maxAmount) return maxAmount;
        if (step === 0) return minAmount;

        const stepsAboveMin = Math.floor((currentAmount - minAmount) / step);
        return Math.min(minAmount + stepsAboveMin * step, maxAmount);
      };

      const recommendedAmount = calculateRecommendedAmount(
        currentAmount,
        minAmount,
        maxAmountOpenable,
        recommendedStep
      );

      const sortedQuotes = [...quotes].sort(
        (a, b) =>
          (safeParseFloat(b.sPrice) || 0) - (safeParseFloat(a.sPrice) || 0)
      );
      const bestBid = sortedQuotes.length > 0 ? sortedQuotes[0].sPrice : "0";
      const bestAsk = sortedQuotes.length > 0 ? sortedQuotes[0].lPrice : "0";
      const maxAmount =
        quotes.length > 0
          ? Math.max(...quotes.map((q) => safeParseFloat(q.maxAmount)))
          : 0;

      const newResults: OpenQuoteCheckResults = {
        quotes,
        sufficientBalance: currentAmount <= maxAmountOpenable,
        maxAmountOpenable,
        isBalanceZero: safeParseFloat(balanceToUse) === 0,
        isAmountMinAmount,
        noQuotesReceived: quotes.length === 0,
        minAmount,
        recommendedStep,
        canBuyMinAmount,
        selectedQuoteUserAddress:
          selectedQuote?.userAddress ||
          "0xd0dDF915693f13Cf9B3b69dFF44eE77C901882f8",
        lastValidBalance,
        recommendedAmount,
        bestBid,
        bestAsk,
        maxAmount,
      };

      debouncedUpdateResults(newResults);
    } catch (error) {
      console.error("Error in useOpenQuoteChecks:", error);
      debouncedUpdateResults({
        ...cachedResults,
        maxAmountOpenable: 0,
        recommendedAmount: 0,
        bestBid: "0",
        bestAsk: "0",
        maxAmount: 0,
      });
    }
  }, [
    amount,
    entryPrice,
    currentMethod,
    rfqRequest,
    balanceToUse,
    quotes,
    leverage,
    selectedQuote,
    lastValidBalance,
    debouncedUpdateResults,
    cachedResults,
  ]);

  return cachedResults;
};
