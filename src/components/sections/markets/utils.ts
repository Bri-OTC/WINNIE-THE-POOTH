// utils.ts

import { Market } from "./types";
import Fuse from "fuse.js";

export function getDisplayedMarkets(
  activeTab: string,
  markets: Market[],
  favorites: string[],
  searchTerm: string,
  defaultSecondAsset: string,
  fuse: Fuse<Market> | null,
  sortByPrice: boolean
): Market[] {
  let displayedMarkets: Market[] = [];

  if (activeTab === "favorites") {
    displayedMarkets = favorites.map((fav) => {
      const [firstAsset, secondAsset] = fav.split("/");
      return {
        name: fav,
        icon: "/$.svg",
        price: Math.random() * 10000,
      };
    });
  } else {
    const [firstAsset, secondAsset] = searchTerm.trim().split("/");
    const secondAssetToUse = secondAsset
      ? secondAsset.toUpperCase()
      : defaultSecondAsset;

    if (searchTerm.trim() === "") {
      displayedMarkets = markets.slice(0, 20).map((market) => ({
        ...market,
        name: `${market.name}/${secondAssetToUse}`,
      }));
    } else {
      const searchResults =
        fuse?.search(firstAsset).map((result) => result.item) || [];

      if (searchResults.length === 0) {
        displayedMarkets = markets.slice(0, 20).map((market) => ({
          ...market,
          name: `${market.name}/${secondAssetToUse}`,
        }));
      } else if (secondAsset === "") {
        displayedMarkets = searchResults.slice(0, 1).flatMap((market) =>
          markets.slice(0, 20).map((secondMarket) => ({
            ...market,
            name: `${market.name}/${secondMarket.name}`,
          }))
        );
      } else {
        displayedMarkets = searchResults.slice(0, 1).flatMap((market) => {
          const secondMarketSearchResults =
            fuse?.search(secondAssetToUse).map((result) => result.item) || [];
          const secondMarkets =
            secondMarketSearchResults.length > 0
              ? secondMarketSearchResults
              : markets;
          return secondMarkets.slice(0, 20).map((secondMarket) => ({
            ...market,
            name: `${market.name}/${secondMarket.name}`,
          }));
        });
      }
    }
  }

  if (sortByPrice) {
    displayedMarkets.sort((a, b) => b.price - a.price);
  }

  return displayedMarkets.slice(0, 20);
}
