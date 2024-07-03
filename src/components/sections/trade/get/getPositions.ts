import SectionPositions from "../SectionPositions";
import SectionOrders from "../SectionOrders";
import { Order } from "../SectionOrders";
import { Position } from "../SectionPositions";
import {
  signedWrappedOpenQuoteResponse,
  getSignedWrappedOpenQuotes,
  getSignedCloseQuotes,
  signedCloseQuoteResponse,
  getPositions,
  PositionResponse,
} from "@pionerfriends/api-client";
import { convertFromBytes32 } from "@/components/web3/utils";
import { parseUnits, formatUnits } from "viem";

export const getPositionss = async (
  chainId: number,
  token: string,
  issuerAddress: string | undefined = undefined
): Promise<Position[]> => {
  try {
    const response = await getPositions(chainId, token, {
      onlyActive: true,
      address: issuerAddress,
    });

    if (response && response.data) {
      const positions: Position[] = response.data.map(
        (position: PositionResponse) => {
          //console.log("position", position);

          const size = (parseFloat(position.amount) / 1e18).toFixed(4);
          const entryPrice = (parseFloat(position.entryPrice) / 1e18).toFixed(
            4
          );
          const currentPrice = parseFloat(position.mtm);
          const amount = (Number(size) * Number(entryPrice)).toFixed(4);

          const isLong =
            position.pA.toLowerCase() === issuerAddress?.toLowerCase()
              ? true
              : false;

          // Calculate PNL based on current price (mtm) and entry price
          const pnl = isLong
            ? (currentPrice - parseFloat(entryPrice)) * parseFloat(size)
            : (parseFloat(entryPrice) - currentPrice) * parseFloat(size);

          const estLiq = "0";
          const type = isLong ? "Long" : "Short";
          const market = position.symbol;

          const entryTime = new Date(parseInt(position.openTime, 10));
          const formattedEntryTime = `${entryTime.getFullYear()}/${(
            entryTime.getMonth() + 1
          )
            .toString()
            .padStart(2, "0")}/${entryTime
            .getDate()
            .toString()
            .padStart(2, "0")} ${entryTime
            .getHours()
            .toString()
            .padStart(2, "0")}:${entryTime
            .getMinutes()
            .toString()
            .padStart(2, "0")}:${entryTime
            .getSeconds()
            .toString()
            .padStart(2, "0")}`;

          return {
            id: position.id,
            size: size,
            market: market,
            icon: "/$.svg",
            mark: currentPrice.toFixed(4),
            entryPrice: entryPrice,
            pnl: pnl.toFixed(4),
            amount: amount,
            amountContract: position.amount,
            type: type,
            estLiq: estLiq,
            entryTime: formattedEntryTime,
            mtm: position.mtm,
            imA: position.imA,
            dfA: position.dfA,
            imB: position.imB,
            dfB: position.dfB,
            openTime: position.openTime,
            isAPayingAPR: position.isAPayingAPR,
            interestRate: position.interestRate,
            bContractId: position.bContractId,
            pA: position.pA,
            pB: position.pB,
            isLong: isLong,
          };
        }
      );

      return positions;
    }
  } catch (error) {
    console.error("Error fetching positions:", error);
  }

  return [];
};
