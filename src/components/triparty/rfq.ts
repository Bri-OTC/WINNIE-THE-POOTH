import { sendRfq } from "@pionerfriends/api-client";
import { useAuthStore } from "@/store/authStore";
import {
  adjustQuantities,
  getPairConfig,
  initializeSymbolList,
  loadPrefixData,
} from "./configReader";
import { useTradeStore } from "@/store/tradeStore";
import { useEffect, useCallback } from "react";
import { useRfqRequestStore } from "@/store/rfqStore";
import { formatSymbols } from "@/components/triparty/priceUpdater";

const setRfqRequest = async (
  entryPrice: string,
  amount: string,
  symbol: string,
  leverage: string,
  updateRfqRequest: (rfqRequest: any) => void
) => {
  const [symbol1, symbol2] = await formatSymbols(symbol);

  try {
    const resolvedSymbol1 = await symbol1;
    const resolvedSymbol2 = await symbol2;
    const adjustedAmount = parseFloat(amount) === 0 ? "1" : amount;

    const adjustedQuantitiesResult = await adjustQuantities(
      parseFloat(entryPrice),
      parseFloat(entryPrice),
      parseFloat(adjustedAmount),
      parseFloat(adjustedAmount),
      resolvedSymbol1,
      resolvedSymbol2,
      Number(leverage)
    );

    const lConfig = await getPairConfig(
      resolvedSymbol1,
      resolvedSymbol2,
      "long",
      Number(leverage),
      parseFloat(amount) === 0
        ? parseFloat(entryPrice) * adjustedQuantitiesResult.lQuantity
        : 0.00000001
    );

    const sConfig = await getPairConfig(
      resolvedSymbol1,
      resolvedSymbol2,
      "short",
      Number(leverage),
      parseFloat(amount) === 0
        ? parseFloat(entryPrice) * adjustedQuantitiesResult.sQuantity
        : 0.00000001
    );

    // Ensure interest rates are positive
    const lInterestRate = Math.abs(
      parseFloat(lConfig?.funding?.toString() || "0")
    );
    const sInterestRate = Math.abs(
      parseFloat(sConfig?.funding?.toString() || "0")
    );

    updateRfqRequest({
      expiration: "10000",
      assetAId: resolvedSymbol1,
      assetBId: resolvedSymbol2,
      sPrice: String(entryPrice),
      sQuantity: adjustedQuantitiesResult.sQuantity.toString(),
      sInterestRate: sInterestRate.toString(),
      sIsPayingApr: sConfig?.isAPayingApr || true,
      sImA: sConfig?.imA?.toString() || "",
      sImB: sConfig?.imB?.toString() || "",
      sDfA: sConfig?.dfA?.toString() || "",
      sDfB: sConfig?.dfB?.toString() || "",
      sExpirationA: sConfig?.expiryA?.toString() || "",
      sExpirationB: sConfig?.expiryB?.toString() || "",
      sTimelockA: sConfig?.timeLockA?.toString() || "",
      sTimelockB: sConfig?.timeLockB?.toString() || "",
      lPrice: String(entryPrice),
      lQuantity: adjustedQuantitiesResult.lQuantity.toString(),
      lInterestRate: lInterestRate.toString(),
      lIsPayingApr: lConfig?.isAPayingApr || true,
      lImA: lConfig?.imA?.toString() || "",
      lImB: lConfig?.imB?.toString() || "",
      lDfA: lConfig?.dfA?.toString() || "",
      lDfB: lConfig?.dfB?.toString() || "",
      lExpirationA: lConfig?.expiryA?.toString() || "",
      lExpirationB: lConfig?.expiryB?.toString() || "",
      lTimelockA: lConfig?.timeLockA?.toString() || "",
      lTimelockB: lConfig?.timeLockB?.toString() || "",
    });
  } catch (error) {
    console.error("Error updating RFQ request:", error);
  }
};

export const useRfqRequest = () => {
  const token = useAuthStore((state) => state.token);
  const rfqRequest = useRfqRequestStore((state) => state.rfqRequest);
  const updateRfqRequest = useRfqRequestStore(
    (state) => state.updateRfqRequest
  );
  const entryPrice = useTradeStore((state) => state.entryPrice);
  const amount = useTradeStore((state) => state.amount);
  const symbol = useTradeStore((state) => state.symbol);
  const leverage = useTradeStore((state) => state.leverage);

  const memoizedSetRfqRequest = useCallback(
    () =>
      setRfqRequest(
        entryPrice,
        amount,
        symbol,
        String(leverage),
        updateRfqRequest
      ),
    [entryPrice, amount, symbol, leverage, updateRfqRequest]
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      initializeSymbolList();
      loadPrefixData();
    }, 500000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (token != null) {
      const sendRfqRequest = async () => {
        try {
          await memoizedSetRfqRequest();
          //console.log("RFQ request updated successfully", rfqRequest);
          rfqRequest.lPrice =
            rfqRequest.lPrice == "0" ? "1" : rfqRequest.lPrice;
          rfqRequest.sPrice =
            rfqRequest.sPrice == "0" ? "1" : rfqRequest.sPrice;
          rfqRequest.lQuantity =
            rfqRequest.lQuantity == "0" ? "1" : rfqRequest.lQuantity;
          rfqRequest.sQuantity =
            rfqRequest.sQuantity == "0" ? "1" : rfqRequest.sQuantity;
          //console.log("RFQ request updated successfully", rfqRequest);
          await sendRfq(rfqRequest, token);
          //console.log("RFQ request sent successfully");
        } catch (error) {
          console.error("Error sending RFQ request:", error);
        }
      };

      const intervalId = setInterval(() => {
        sendRfqRequest();
      }, 1000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [rfqRequest, token, memoizedSetRfqRequest]);

  return { rfqRequest, setRfqRequest: memoizedSetRfqRequest };
};

export const RfqRequestUpdater: React.FC = () => {
  const { rfqRequest } = useRfqRequest();

  return null;
};
