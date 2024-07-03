"use client";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaRegStar, FaStar } from "react-icons/fa";
import { MdMenu } from "react-icons/md";
import { useTradeStore } from "@/store/tradeStore";
import Link from "next/link";
import useFavorites from "@/components/sections/markets/useFavorites";
import useBlurEffect from "@/hooks/blur";

function SectionTradeHeader() {
  const symbol = useTradeStore((state) => state.symbol);
  const accountLeverage = useTradeStore((state) => state.accountLeverage);
  const bidPrice = useTradeStore((state) => state.bidPrice);
  const askPrice = useTradeStore((state) => state.askPrice);
  const [firstAsset, secondAsset] = symbol.split("/");
  const { favorites, toggleFavorite } = useFavorites(secondAsset);
  const [isFavorite, setIsFavorite] = useState(false);
  const [bidFade, setBidFade] = useState(false);
  const [askFade, setAskFade] = useState(false);
  const blur = useBlurEffect();

  useEffect(() => {
    setIsFavorite(favorites.includes(symbol));
  }, [favorites, symbol]);

  useEffect(() => {
    setBidFade(true);
    const timer = setTimeout(() => {
      setBidFade(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [bidPrice]);

  useEffect(() => {
    setAskFade(true);
    const timer = setTimeout(() => {
      setAskFade(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [askPrice]);

  const handleToggleFavorite = () => {
    toggleFavorite(firstAsset);
  };

  const menuUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/home"
      : "https://testnet.pio.finance/home";

  return (
    <div className={`container ${blur ? "blur" : ""}`}>
      <div className="flex justify-between items-center space-x-5 px-5">
        <div className="flex items-center space-x-3">
          <Link href={menuUrl}>
            <MdMenu className="text-[1.5rem] cursor-pointer" />
          </Link>
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src="/$.svg" />
            </Avatar>
            <div>
              <h2 className="font-medium">{symbol}</h2>
              <p className="text-card-foreground">PIO Perpetual Swap</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div onClick={handleToggleFavorite}>
            {isFavorite ? <FaStar className="text-primary" /> : <FaRegStar />}
          </div>
          <div className="text-right">
            <h2 className={`${bidFade ? bidFade : ""}`}>
              {bidPrice?.toPrecision(5)}
            </h2>
            <h2 className={`text-green-400 ${askFade ? askFade : ""}`}>
              {askPrice?.toPrecision(5)}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SectionTradeHeader;
