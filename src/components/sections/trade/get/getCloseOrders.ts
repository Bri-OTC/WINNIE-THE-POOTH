import SectionPositions from "../SectionPositions";
import SectionOrders from "../SectionOrders";
import { Order } from "../SectionOrders";
import { Position } from "../SectionPositions";
import {
  signedWrappedOpenQuoteResponse,
  getSignedWrappedOpenQuotes,
  getSignedCloseQuotes,
  signedCloseQuoteResponse,
} from "@pionerfriends/api-client";
import { convertFromBytes32 } from "@/components/web3/utils";
import { config } from "@/config";

export const getCloseOrders = async (
  chainId: number,
  issuerAddress: string | undefined = undefined,
  token: string
): Promise<Order[]> => {
  try {
    const response = await getSignedCloseQuotes(
      "1.0",
      config.activeChainId,
      token,
      {
        onlyActive: true,
        issuerAddress: issuerAddress,
      }
    );

    if (response && response.data && Array.isArray(response.data)) {
      const orders: Order[] = response.data.map(
        (quote: signedCloseQuoteResponse) => {
          //console.log("close quote", quote);

          const size = (parseFloat(quote.amount || "0") / 1e18).toFixed(4);
          const trigger = (parseFloat(quote.price || "0") / 1e18).toFixed(4);
          const amount = (Number(size) * Number(trigger)).toFixed(4);
          const limitPrice = (parseFloat(quote.price || "0") / 1e18).toFixed(4);

          let asset = "";
          if (quote.assetHex && quote.assetHex !== "") {
            try {
              asset = convertFromBytes32(quote.assetHex);
            } catch (error) {
              console.warn("Error converting assetHex:", error);
            }
          }

          const emitTime = new Date(parseInt(quote.emitTime || "0", 10));
          const entryTime = !isNaN(emitTime.getTime())
            ? `${emitTime.getFullYear()}/${(emitTime.getMonth() + 1)
                .toString()
                .padStart(2, "0")}/${emitTime
                .getDate()
                .toString()
                .padStart(2, "0")} ${emitTime
                .getHours()
                .toString()
                .padStart(2, "0")}:${emitTime
                .getMinutes()
                .toString()
                .padStart(2, "0")}:${emitTime
                .getSeconds()
                .toString()
                .padStart(2, "0")}`
            : "";

          return {
            id: String(quote.bcontractId || ""),
            size: size,
            market: asset,
            icon: "/$.svg",
            trigger,
            amount,
            filled: "0",
            remainingSize: size,
            breakEvenPrice: trigger,
            limitPrice,
            status: "Close Quote",
            reduceOnly: "Yes",
            fillAmount: "0",
            entryTime,
            targetHash: quote.signatureCloseHash || "",
            counterpartyAddress: quote.counterpartyAddress || "",
            isLong: Boolean(quote.isLong),
          };
        }
      );

      return orders;
    }
  } catch (error) {
    console.error("Error fetching orders:", error);
  }

  return [];
};
