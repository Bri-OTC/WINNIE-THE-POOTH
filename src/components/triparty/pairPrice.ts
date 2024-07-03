import { getPrices } from "@pionerfriends/api-client";
import { getProxyTicker } from "./configReader";
export async function calculatePairPrices(
  pairs: string[],
  token: string | null
): Promise<{ [pair: string]: { bid: number; ask: number } } | undefined> {
  const assetIds = new Set<string>();
  const pairPrices: { [pair: string]: { bid: number; ask: number } } = {};
  try {
    // Collect unique asset IDs from the pairs
    for (const pair of pairs) {
      const [assetAId, assetBId] = pair.split("/");
      assetIds.add(assetAId);
      assetIds.add(assetBId);
    }

    // Check if token is null
    if (token === null) {
      throw new Error("Token is null");
    }

    // Retrieve prices for all unique asset IDs
    const prices = await getPrices(Array.from(assetIds), token);
    console.log(prices);

    // Check if prices is defined
    if (prices && prices.data) {
      // Create a map of asset IDs to their prices
      const priceMap: {
        [assetId: string]: { bidPrice: string; askPrice: string };
      } = {};
      for (const assetId in prices.data) {
        priceMap[assetId] = {
          bidPrice: prices.data[assetId].bidPrice,
          askPrice: prices.data[assetId].askPrice,
        };
      }

      // Calculate bid and ask prices for each pair
      for (const pair of pairs) {
        const [assetAId, assetBId] = pair.split("/");
        if (priceMap[assetAId] && priceMap[assetBId]) {
          const bidA = Number(priceMap[assetAId].bidPrice || 0);
          const bidB = Number(priceMap[assetBId].bidPrice || 0);
          const askA = Number(priceMap[assetAId].askPrice || 0);
          const askB = Number(priceMap[assetBId].askPrice || 0);
          const bid = bidB !== 0 ? bidA / bidB : 0;
          const ask = askB !== 0 ? askA / askB : 0;
          pairPrices[pair] = { bid, ask };
        } else {
          pairPrices[pair] = { bid: 0, ask: 0 };
        }
      }
    } else {
      throw new Error("Unable to retrieve prices");
    }
  } catch (error) {
    console.error(error);
    return undefined;
  }
  return pairPrices;
}
