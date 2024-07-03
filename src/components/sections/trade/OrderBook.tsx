import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useTradeStore } from "@/store/tradeStore";
import { useQuoteStore } from "@/store/quotePriceStore";
import { useOpenQuoteChecks } from "@/hooks/useOpenQuoteChecks";

interface Order {
  price: number;
  amount: number;
}

interface OrderBookProps {
  maxRows?: number;
  isOrderBookOn: boolean;
}

const OrderRow: React.FC<Order & { type: "ask" | "bid"; index: number }> =
  React.memo(({ price, amount, type, index }) => {
    const setEntryPrice = useTradeStore((state) => state.setEntryPrice);
    const [displayPrice, setDisplayPrice] = useState(price);
    const [displayAmount, setDisplayAmount] = useState(amount);
    const [flashClass, setFlashClass] = useState("");
    const lastUpdateTime = useRef(Date.now());

    useEffect(() => {
      const now = Date.now();
      if (
        now - lastUpdateTime.current >= 750 &&
        (price !== displayPrice || amount !== displayAmount)
      ) {
        setDisplayPrice(price);
        setDisplayAmount(amount);
        setFlashClass(type === "ask" ? "flash-red" : "flash-green");
        lastUpdateTime.current = now;
      }
    }, [price, amount, type, displayPrice, displayAmount]);

    useEffect(() => {
      if (flashClass) {
        const timer = setTimeout(() => setFlashClass(""), 500);
        return () => clearTimeout(timer);
      }
    }, [flashClass]);

    const handleClick = useCallback(
      () => setEntryPrice(displayPrice.toString()),
      [displayPrice, setEntryPrice]
    );

    return (
      <tr className={flashClass} onClick={handleClick}>
        <td className="amount">{Math.abs(displayAmount).toFixed(6)}</td>
        <td className="price">{displayPrice.toFixed(6)}</td>
      </tr>
    );
  });

OrderRow.displayName = "OrderRow";

const useWebSocket = (url: string, isOn: boolean) => {
  const [data, setData] = useState<{
    bids: number[][];
    asks: number[][];
  } | null>(null);

  useEffect(() => {
    if (!isOn) return;

    let ws: WebSocket | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    let retryCount = 0;

    const connect = () => {
      ws = new WebSocket(url);
      ws.onopen = () => {
        retryCount = 0;
        ws?.send(
          JSON.stringify({
            event: "bts:subscribe",
            data: { channel: `order_book_btcusd` },
          })
        );
      };
      ws.onmessage = (event) => {
        const parsedData = JSON.parse(event.data).data;
        if (parsedData && parsedData.bids && parsedData.asks) {
          setData({
            bids: parsedData.bids.map(([price, amount]: [string, string]) => [
              parseFloat(price),
              parseFloat(amount),
            ]),
            asks: parsedData.asks.map(([price, amount]: [string, string]) => [
              parseFloat(price),
              parseFloat(amount),
            ]),
          });
        }
      };
      ws.onclose = reconnect;
    };

    const reconnect = () => {
      if (ws) {
        ws.close();
        ws = null;
      }
      const delay = Math.min(Math.pow(2, retryCount++) * 1000, 30000);
      timeoutId = setTimeout(connect, delay);
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [url, isOn]);

  return data;
};

const generateAmount = (
  previousAmount: number,
  maxAmount: number,
  minPercentage: number
): number => {
  if (maxAmount <= 0) return 0;

  const minAmount = maxAmount * minPercentage;

  // Generate a random deviation with high tails
  const deviation =
    Math.tan((Math.random() - 0.5) * Math.PI) * (maxAmount * 0.1);

  // Apply the deviation to the previous amount
  let newAmount = previousAmount + deviation;

  // Ensure the new amount is within bounds and not less than the minimum
  newAmount = Math.max(minAmount, Math.min(newAmount, maxAmount));

  return newAmount;
};

const distributeAmounts = (
  totalAmount: number,
  count: number,
  minPercentage: number
): number[] => {
  const minAmount = totalAmount * minPercentage;
  let amounts = Array(count).fill(minAmount);
  let remainingAmount = totalAmount - minAmount * count;

  for (let i = 0; i < count && remainingAmount > 0; i++) {
    const additionalAmount = Math.random() * remainingAmount;
    amounts[i] += additionalAmount;
    remainingAmount -= additionalAmount;
  }

  // If there's still remaining amount, distribute it equally
  if (remainingAmount > 0) {
    const extraPerAmount = remainingAmount / count;
    amounts = amounts.map((amount) => amount + extraPerAmount);
  }

  return amounts;
};

const scalePrice = (
  price: number,
  referenceMin: number,
  referenceMax: number,
  targetMin: number,
  targetMax: number
): number => {
  const referenceRange = referenceMax - referenceMin;
  const targetRange = targetMax - targetMin;
  const scaleFactor = targetRange / referenceRange;
  return targetMin + (price - referenceMin) * scaleFactor;
};

export const OrderBook: React.FC<OrderBookProps> = React.memo(
  ({ maxRows = 5, isOrderBookOn }) => {
    const amount = useTradeStore((state) => state.amount);
    const entryPrice = useTradeStore((state) => state.entryPrice);
    const bidPrice = useTradeStore((state) => state.bidPrice);
    const askPrice = useTradeStore((state) => state.askPrice);
    const { bidQty, askQty } = useQuoteStore();
    const { bestBid, bestAsk, maxAmount } = useOpenQuoteChecks(
      amount,
      entryPrice
    );

    const orders = useWebSocket("wss://ws.bitstamp.net", isOrderBookOn);
    const previousAmounts = useRef<number[]>([]);

    const {
      asksToDisplay,
      bidsToDisplay,
      effectiveBidPrice,
      effectiveAskPrice,
    } = useMemo(() => {
      const effectiveBidPrice =
        bestBid && parseFloat(bestBid) !== 0 ? parseFloat(bestBid) : bidPrice;
      const effectiveAskPrice =
        bestAsk && parseFloat(bestAsk) !== 0 ? parseFloat(bestAsk) : askPrice;

      if (!effectiveBidPrice || !effectiveAskPrice) {
        return {
          asksToDisplay: [],
          bidsToDisplay: [],
          effectiveBidPrice,
          effectiveAskPrice,
        };
      }

      const effectiveMaxAmount =
        maxAmount && maxAmount > 0 ? maxAmount : Math.max(bidQty, askQty);

      let askPrices = [];
      let bidPrices = [];

      if (orders && orders.asks.length && orders.bids.length) {
        const wssBidPrice = orders.bids[0][0];
        const wssAskPrice = orders.asks[0][0];

        askPrices = orders.asks.map(([price]) =>
          scalePrice(
            price,
            wssAskPrice,
            wssAskPrice * 1.01,
            effectiveAskPrice,
            effectiveAskPrice * 1.01
          )
        );
        bidPrices = orders.bids.map(([price]) =>
          scalePrice(
            price,
            wssBidPrice * 0.99,
            wssBidPrice,
            effectiveBidPrice * 0.99,
            effectiveBidPrice
          )
        );
      } else {
        const spread = effectiveAskPrice - effectiveBidPrice;
        const step = spread / (maxRows * 2);
        askPrices = Array.from(
          { length: maxRows },
          (_, i) => effectiveAskPrice + step * i
        );
        bidPrices = Array.from(
          { length: maxRows },
          (_, i) => effectiveBidPrice - step * i
        ).reverse();
      }

      const totalRows = maxRows * 2;
      const minPercentage = 0.01; // 1%

      if (previousAmounts.current.length !== totalRows) {
        previousAmounts.current = distributeAmounts(
          effectiveMaxAmount,
          totalRows,
          minPercentage
        );
      } else {
        previousAmounts.current = previousAmounts.current.map((prevAmount) =>
          generateAmount(prevAmount, effectiveMaxAmount, minPercentage)
        );
      }

      const asksToDisplay = askPrices
        .slice(0, maxRows)
        .map((price, i) => ({
          price,
          amount: -previousAmounts.current[i],
        }))
        .reverse();

      const bidsToDisplay = bidPrices.slice(-maxRows).map((price, i) => ({
        price,
        amount: previousAmounts.current[i + maxRows],
      }));

      return {
        asksToDisplay,
        bidsToDisplay,
        effectiveBidPrice,
        effectiveAskPrice,
      };
    }, [
      orders,
      maxRows,
      bidPrice,
      askPrice,
      bidQty,
      askQty,
      bestBid,
      bestAsk,
      maxAmount,
    ]);

    return (
      <div className="order-container">
        <table className="order-book">
          <thead>
            <tr>
              <th className="amount">Amount</th>
              <th className="price">Price</th>
            </tr>
          </thead>
          <tbody>
            {asksToDisplay.map((order, index) => (
              <OrderRow
                key={`ask-${index}`}
                {...order}
                type="ask"
                index={index}
              />
            ))}
            <tr className="best-prices">
              <td className="bid-price">Bid: {effectiveBidPrice.toFixed(6)}</td>
              <td className="ask-price">Ask: {effectiveAskPrice.toFixed(6)}</td>
            </tr>
            {bidsToDisplay.map((order, index) => (
              <OrderRow
                key={`bid-${index}`}
                {...order}
                type="bid"
                index={index}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

OrderBook.displayName = "OrderBook";
