// SectionTradeChart.tsx
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { CgMaximizeAlt } from "react-icons/cg";
import { FaRegClock, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { HiOutlineCog6Tooth } from "react-icons/hi2";
import TradingViewPopup from "@/components/popup/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TradingViewAdvancedChart from "../../tradingview/TradingViewAdvancedChart";
import { useTradeStore } from "@/store/tradeStore";
import { useActivePrice } from "@/components/triparty/priceUpdater";
import { RfqRequestUpdater } from "@/components/triparty/rfq";
import { useAuthStore } from "@/store/authStore";
import useBlurEffect from "@/hooks/blur";

function SectionTradeChart() {
  const [showChart, setShowChart] = useState(true);
  const [interval, setInterval] = useState("60");
  const activePrice = useActivePrice();
  const blur = useBlurEffect();
  const symbol = useTradeStore((state) => state.symbol);

  useEffect(() => {
    activePrice();
  }, [activePrice]);

  const handleIntervalChange = (value: string) => {
    setInterval(value);
  };

  return (
    <div className={`container ${blur ? "blur" : ""}`}>
      <div className="flex flex-col space-y-3 mt-2 px-5">
        <RfqRequestUpdater />

        <div className="flex items-center justify-between">
          <Select onValueChange={handleIntervalChange}>
            <SelectTrigger className="w-fit flex items-center space-x-2">
              <FaRegClock />
              <SelectValue placeholder="1D" className="outline-none" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="D">1d</SelectItem>
              <SelectItem value="W">1w</SelectItem>
              <SelectItem value="M">1m</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowChart(!showChart)}
              size="icon"
              variant="ghost"
            >
              {showChart ? <FaRegEye /> : <FaRegEyeSlash />}
            </Button>
          </div>
        </div>
        <div
          className={`${
            showChart ? "h-50" : "max-h-0"
          } overflow-hidden transition-all bg-card text-white`}
        >
          <div className="w-full h-50 flex items-center justify-center">
            <TradingViewAdvancedChart symbol={symbol} interval={interval} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SectionTradeChart;
