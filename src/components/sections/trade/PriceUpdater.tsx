// components/PriceUpdater.tsx
import { useEffect } from "react";
import { useTradeStore } from "@/store/tradeStore";
import { useAuthStore } from "@/store/authStore";
import { formatSymbols } from "@/components/triparty/priceUpdater";

export default function PriceUpdater() {
  const currentTabIndex = useTradeStore((state) => state.currentTabIndex);
  const currentMethod = useTradeStore((state) => state.currentMethod);
  const token = useAuthStore().token;
  const symbol = useTradeStore((state) => state.symbol);
  const setBidPrice = useTradeStore((state) => state.setBidPrice);
  const setAskPrice = useTradeStore((state) => state.setAskPrice);
  const entryPriceModified = useTradeStore((state) => state.entryPriceModified);
  const setEntryPriceModified = useTradeStore(
    (state) => state.setEntryPriceModified
  );
  const setEntryPrice = useTradeStore((state) => state.setEntryPrice);

  useEffect(() => {
    const fetchPrices = async () => {
      const [symbol1, symbol2] = await formatSymbols(symbol);
      if (!token) return;

      const response = await fetch(
        `/api/prices?symbol1=${symbol1}&symbol2=${symbol2}&token=${token}&currentTabIndex=${currentTabIndex}&currentMethod=${currentMethod}`
      );

      if (response.ok) {
        try {
          const data = await response.json();
          setBidPrice(data.bidPrice);
          setAskPrice(data.askPrice);

          if (currentTabIndex === "Market" && !entryPriceModified) {
            if (currentMethod === "Buy") {
              setEntryPrice(data.askPrice);
            } else if (currentMethod === "Sell") {
              setEntryPrice(data.bidPrice);
            }
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      } else {
        console.error("Error fetching prices:", response.status);
      }
    };

    const interval = setInterval(fetchPrices, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [
    token,
    symbol,
    currentTabIndex,
    currentMethod,
    setBidPrice,
    setAskPrice,
    entryPriceModified,
    setEntryPriceModified,
    setEntryPrice,
  ]);

  return null;
}
