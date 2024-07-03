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
///
export const getOrders = async (
  chainId: number,
  issuerAddress: string | undefined = undefined,
  token: string
): Promise<Order[]> => {
  try {
    const response = await getSignedWrappedOpenQuotes(
      "1.0",
      config.activeChainId,
      token,
      {
        onlyActive: true,
        issuerAddress: issuerAddress,
      }
    );

    if (response && response.data) {
      const orders: Order[] = response.data.map(
        (quote: signedWrappedOpenQuoteResponse) => {
          //console.log("quote", quote);

          const size = (parseFloat(quote.amount) / 1e18).toFixed(4);
          const trigger = (parseFloat(quote.price) / 1e18).toFixed(4);
          const amount = (Number(size) * Number(trigger)).toFixed(4);
          const filled = "0";
          const remainingSize = size;
          const breakEvenPrice = trigger;
          const limitPrice = String(
            (parseFloat(quote.price) / 1e18).toFixed(4)
          );
          const status = "Open Quote";

          const reduceOnly = "No";
          const fillAmount = "No";
          const asset = convertFromBytes32(quote.assetHex);

          const emitTime = new Date(parseInt(quote.emitTime, 10));
          const entryTime = `${emitTime.getFullYear()}/${(
            emitTime.getMonth() + 1
          )
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
            .padStart(2, "0")}`;
          return {
            id: String(quote.nonceOpenQuote),
            size: size,
            market: asset,
            icon: "/$.svg",
            trigger: trigger,
            amount: amount,
            filled: filled,
            remainingSize: remainingSize,
            breakEvenPrice: breakEvenPrice,
            limitPrice: limitPrice,
            status: status,
            reduceOnly: reduceOnly,
            fillAmount: fillAmount,
            entryTime: entryTime,
            targetHash: quote.signatureOpenQuoteHash,
            counterpartyAddress: quote.counterpartyAddress,
            isLong: quote.isLong,
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
