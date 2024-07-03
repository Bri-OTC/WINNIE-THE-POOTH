import { TableCell, TableRow } from "@/components/ui/table";
import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import Fuse from "fuse.js";
import { useTradeStore } from "@/store/tradeStore";
import { FaStar } from "react-icons/fa";
import useFavorites from "./useFavorites";
import Link from "next/link";
import { calculatePairPrices } from "@/components/triparty/pairPrice";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";

interface Market {
  name: string;
  icon: string;
  price: number;
}

interface ResearchComponentProps {
  searchTerm: string;
  onMarketClick: (market: Market) => void;
  selectedMarket: Market | null;
  activeTab: string;
  sortByPrice: boolean;
  handleTabClick: (tab: string) => void;
  toggleSortByPrice: () => void;
}
function ResearchComponent({
  searchTerm,
  onMarketClick,
  selectedMarket,
}: ResearchComponentProps) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [displayedMarkets, setDisplayedMarkets] = useState<Market[]>([]);
  const [nasdaqData, setNasdaqData] = useState<any>({});
  const [nyseData, setNyseData] = useState<any>({});
  const [forexData, setForexData] = useState<any>({});
  const [fuse, setFuse] = useState<Fuse<Market> | null>(null);
  const [defaultSecondAsset, setDefaultSecondAsset] = useState("EURUSD");
  const [activeTab, setActiveTab] = useState("all");
  const [sortByPrice, setSortByPrice] = useState(false);
  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(0);

  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthStore((state) => state.token);
  const tableRef = useRef<HTMLTableElement>(null);

  const setSelectedMarket = useTradeStore((state) => state.setSymbol);
  const { favorites, toggleFavorite } = useFavorites(defaultSecondAsset);
  const menuUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/markets"
      : "https://testnet.pio.finance/markets";

  useEffect(() => {
    const fetchMarkets = async () => {
      if (activeTab !== "favorites") {
        const response = await fetch(`/${activeTab}.json`);
        const data = await response.json();
        const fetchedMarkets = Object.keys(data).map((pair) => ({
          name: pair,
          icon: "/$.svg",
          price: 0,
        }));
        setMarkets(fetchedMarkets);

        const fuseInstance = new Fuse(fetchedMarkets, {
          keys: ["name"],
          threshold: 0.4,
          isCaseSensitive: false,
        });
        setFuse(fuseInstance);
      } else {
        setMarkets([]);
      }
    };

    fetchMarkets();
  }, [activeTab]);

  useEffect(() => {
    const fetchData = async () => {
      const nasdaqResponse = await fetch("/nasdaq.json");
      const nasdaqJsonData = await nasdaqResponse.json();
      setNasdaqData(nasdaqJsonData);

      const nyseResponse = await fetch("/nyse.json");
      const nyseJsonData = await nyseResponse.json();
      setNyseData(nyseJsonData);

      const forexResponse = await fetch("/forex.json");
      const forexJsonData = await forexResponse.json();
      setForexData(forexJsonData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const updatePrices = async () => {
      const pairs = displayedMarkets.map((market) => {
        const [firstAsset, secondAsset] = market.name.split("/");
        let prefixedFirstAsset = firstAsset;
        let prefixedSecondAsset = secondAsset;

        if (nasdaqData.hasOwnProperty(firstAsset)) {
          prefixedFirstAsset = `stock.nasdaq.${firstAsset}`;
        } else if (nyseData.hasOwnProperty(firstAsset)) {
          prefixedFirstAsset = `stock.nyse.${firstAsset}`;
        } else if (forexData.hasOwnProperty(firstAsset)) {
          prefixedFirstAsset = `forex.${firstAsset}`;
        }

        if (nasdaqData.hasOwnProperty(secondAsset)) {
          prefixedSecondAsset = `stock.nasdaq.${secondAsset}`;
        } else if (nyseData.hasOwnProperty(secondAsset)) {
          prefixedSecondAsset = `stock.nyse.${secondAsset}`;
        } else if (forexData.hasOwnProperty(secondAsset)) {
          prefixedSecondAsset = `forex.${secondAsset}`;
        }

        const pair = `${prefixedFirstAsset}/${prefixedSecondAsset}`;
        return { originalPair: market.name, prefixedPair: pair };
      });

      const prefixedPairs = pairs.map((pair) => pair.prefixedPair);
      const pairPrices = await calculatePairPrices(prefixedPairs, token);

      const updatedMarkets: Market[] = displayedMarkets.map((market) => {
        const pair = pairs.find((pair) => pair.originalPair === market.name);
        if (pair) {
          const { bid, ask } = pairPrices?.[pair.prefixedPair] || {
            bid: 0,
            ask: 0,
          };
          const averagePrice = (bid + ask) / 2;
          return { ...market, price: averagePrice };
        }
        return market;
      });

      setDisplayedMarkets(updatedMarkets);
    };

    const interval = setInterval(updatePrices, 2000);
    return () => {
      clearInterval(interval);
    };
  }, [displayedMarkets, token, nasdaqData, nyseData, forexData]);

  const getDisplayedMarkets = useCallback((): Market[] => {
    let displayedMarkets: Market[] = [];

    if (activeTab === "favorites") {
      displayedMarkets = favorites.map((fav) => {
        const [firstAsset, secondAsset] = fav.split("/");
        return {
          name: fav,
          icon: "/$.svg",
          price: 0,
        };
      });
    } else {
      const [firstAsset, secondAsset] = searchTerm.trim().split("/");
      const secondAssetToUse = secondAsset
        ? secondAsset.toUpperCase()
        : defaultSecondAsset;

      if (searchTerm.trim() === "") {
        displayedMarkets = markets.map((market) => ({
          ...market,
          name: `${market.name}/${secondAssetToUse}`,
        }));
      } else {
        const searchResults =
          fuse?.search(firstAsset).map((result) => result.item) || [];

        if (searchResults.length === 0) {
          displayedMarkets = markets.map((market) => ({
            ...market,
            name: `${market.name}/${secondAssetToUse}`,
          }));
        } else if (secondAsset === "") {
          displayedMarkets = searchResults.flatMap((market) =>
            markets.map((secondMarket) => ({
              ...market,
              name: `${market.name}/${secondMarket.name}`,
            }))
          );
        } else {
          displayedMarkets = searchResults.flatMap((market) => {
            const secondMarketSearchResults =
              fuse?.search(secondAssetToUse).map((result) => result.item) || [];
            const secondMarkets =
              secondMarketSearchResults.length > 0
                ? secondMarketSearchResults
                : markets;
            return secondMarkets.map((secondMarket) => ({
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

    return displayedMarkets;
  }, [
    activeTab,
    favorites,
    searchTerm,
    defaultSecondAsset,
    markets,
    fuse,
    sortByPrice,
  ]);

  useEffect(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    const displayedMarkets = getDisplayedMarkets().slice(startIndex, endIndex);
    setDisplayedMarkets(displayedMarkets);

    if (tableRef.current) {
      tableRef.current.scrollTop = 0;
    }
  }, [currentPage, pageSize, getDisplayedMarkets]);

  const fetchMoreData = () => {
    if (isLoading) return;

    setIsLoading(true);

    setTimeout(() => {
      const startIndex = (currentPage + 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const newMarkets = getDisplayedMarkets().slice(startIndex, endIndex);

      setDisplayedMarkets((prevMarkets) => [...prevMarkets, ...newMarkets]);
      setCurrentPage((prevPage) => prevPage + 1);
      setHasMore(endIndex < getDisplayedMarkets().length);
      setIsLoading(false);
    }, 1000);
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(0);
  };

  const handleMarketClick = (market: Market) => {
    setSelectedMarket(market.name);
  };

  const toggleSortByPrice = () => {
    setSortByPrice(!sortByPrice);
    setCurrentPage(0);
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const goToNextPage = () => {
    const totalPages = Math.ceil(getDisplayedMarkets().length / pageSize);
    if (currentPage < totalPages - 1) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };
  const totalPages = Math.ceil(getDisplayedMarkets().length / pageSize);

  return (
    <div className="w-full">
      <div className="border-b mt-2 sticky top-0 bg-background z-[99]">
        <div className="px-5 flex space-x-4">
          <div>
            <button
              className={`tab ${activeTab === "nasdaq" ? "active" : ""}`}
              onClick={() => handleTabClick("nasdaq")}
            >
              <h2 className="font-medium">Nasdaq</h2>
            </button>
            <div className="w-[36px] mt-3 h-[3px] bg-white"></div>
          </div>
          <div>
            <button
              className={`tab ${activeTab === "nyse" ? "active" : ""}`}
              onClick={() => handleTabClick("nyse")}
            >
              <h2 className="font-medium">NYSE</h2>
            </button>
            <div className="w-[36px] mt-3 h-[3px] bg-white"></div>
          </div>
          <div>
            <button
              className={`tab ${activeTab === "forex" ? "active" : ""}`}
              onClick={() => handleTabClick("forex")}
            >
              <h2 className="font-medium">Forex</h2>
            </button>
            <div className="w-[36px] mt-3 h-[3px] bg-white"></div>
          </div>
        </div>
      </div>
      <div className="flex space-x-4 mb-4 px-5 border-b pb-3 mt-3">
        <Button
          className={`p-2 px-4 rounded-lg text-white border border-card bg-card transition-all hover:bg-card ${
            activeTab === "all" ? "active" : ""
          }`}
          onClick={() => handleTabClick("all")}
        >
          <h3>All</h3>
        </Button>
        <Button
          className={`p-2 px-4 rounded-lg text-white border border-card bg-card transition-all hover:bg-card ${
            activeTab === "favorites" ? "active" : ""
          }`}
          onClick={() => handleTabClick("favorites")}
        >
          <h3>Favorites</h3>
        </Button>
        <Button
          className={`p-2 px-4 rounded-lg text-white border border-card bg-card transition-all hover:bg-card ${
            sortByPrice ? "active" : ""
          }`}
          onClick={toggleSortByPrice}
        >
          <h3>By Price</h3>
        </Button>
      </div>
      <div ref={tableRef} style={{ maxHeight: "600px", overflowY: "auto" }}>
        <table className="w-full">
          <thead className="sticky">
            <tr>
              <th className="px-4 py-2 text-left sticky">Pair</th>
              <th className="px-4 py-2 text-right sticky">Price</th>
            </tr>
          </thead>
          <tbody>
            {displayedMarkets.map((market, index) => (
              <tr key={`${market.name}-${index}`} className="border-none">
                <td className="px-4 py-2">
                  <div className="flex items-center space-x-3">
                    <FaStar
                      className={`cursor-pointer ${
                        favorites.includes(market.name)
                          ? "text-yellow-500"
                          : "text-gray-400"
                      }`}
                      onClick={() => toggleFavorite(market.name)}
                    />
                    <Image
                      width={30}
                      height={30}
                      src={market.icon}
                      alt={market.name}
                    />
                    <Link
                      href="/trade"
                      onClick={() => handleMarketClick(market)}
                    >
                      <span className="cursor-pointer">{market.name}</span>
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-2 text-right">
                  <span className="fade-effect">{market.price.toFixed(4)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between mt-4">
        <Button
          className="p-2 px-4 rounded-lg text-white border border-card bg-card transition-all hover:bg-card"
          onClick={goToPreviousPage}
          disabled={currentPage === 0}
        >
          Previous
        </Button>
        <span>
          Page {currentPage + 1} of {totalPages}
        </span>
        <Button
          className="p-2 px-4 rounded-lg text-white border border-card bg-card transition-all hover:bg-card"
          onClick={goToNextPage}
          disabled={currentPage === totalPages - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default ResearchComponent;
