import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogClose, DialogContent } from "@/components/ui/dialog";
import { FaArrowUp } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import Image from "next/image";
import { useState } from "react";

interface PopupShareProps {
  asset?: string;
  side?: boolean;
  upnl?: number;
  upnlPercent?: number;
  entryPrice?: number;
  exitPrice?: number;
  openTime?: number;
  closeTime?: number;
  leverage?: number;
}

function PopupShare({
  asset = "BTC-PERP",
  side = true,
  upnl = 0,
  upnlPercent = 0,
  entryPrice = 0,
  exitPrice = 0,
  openTime = Date.now(),
  closeTime = Date.now(),
  leverage = 1,
}: PopupShareProps) {
  const [shareTimes, setShareTimes] = useState(true);
  const [sharePrices, setSharePrices] = useState(true);
  const [shareLeverage, setShareLeverage] = useState(true);

  const handleShareTimesChange = (checked: boolean) => {
    setShareTimes(checked);
  };

  const handleSharePricesChange = (checked: boolean) => {
    setSharePrices(checked);
  };

  const handleShareLeverageChange = (checked: boolean) => {
    setShareLeverage(checked);
  };

  const shareOnTwitter = () => {
    const twitterUrl = "https://twitter.com/intent/tweet";
    let text = `I just made a ${
      side ? "long" : "short"
    } trade on ${asset} with ${leverage}x leverage on PIO!`;

    if (sharePrices) {
      text += `\n\nEntry Price: ${entryPrice}\nExit Price: ${exitPrice}`;
    }

    text += `\nPNL: ${upnl}$\nPNL %: ${upnlPercent}%`;

    if (shareTimes) {
      text += `\n\nOpened at: ${new Date(
        openTime
      ).toLocaleString()}\nClosed at: ${new Date(closeTime).toLocaleString()}`;
    }

    text += "\n\nCheck out PIO for the best trading experience! #PIO #Trading";

    const encodedText = encodeURIComponent(text);
    const url = `${twitterUrl}?text=${encodedText}`;
    window.open(url, "_blank");
  };

  return (
    <DialogContent className="border-none p-6">
      <div className="flex justify-end mb-4">
        <DialogClose>
          <AiOutlineClose className="text-2xl text-gray-500 hover:text-gray-700" />
        </DialogClose>
      </div>
      <div className="flex justify-center mb-6">
        <Image width={150} height={80} src="/logo.svg" alt="PIO" />
      </div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Image width={28} height={28} src="/markets/bitcoin.svg" alt="BTC" />
          <h2 className="text-xl font-semibold">{asset}</h2>
        </div>
        <Button
          className={`flex items-center space-x-2 text-white ${
            side
              ? "bg-green-500 hover:bg-green-600"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          <FaArrowUp className="text-lg" />
          <h2 className="text-lg font-semibold">{side ? "Long" : "Short"}</h2>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-1">{upnl}$</h1>
          <p className="text-gray-500">PNL</p>
        </div>
        <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center">
          <h1
            className={`text-2xl font-bold mb-1 ${
              upnlPercent >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {upnlPercent}%
          </h1>
          <p className="text-gray-500">Marked to Last Trade</p>
        </div>
      </div>
      <div className="flex items-center space-x-3 mb-4">
        <Checkbox
          className="h-5 w-5"
          checked={shareTimes}
          onCheckedChange={handleShareTimesChange}
        />
        <h3 className="text-lg font-medium">Share times</h3>
      </div>
      <Card className="mb-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <h3 className="text-lg">
            <span className="font-semibold">Opened at:</span>{" "}
            {new Date(openTime).toLocaleString()}
          </h3>
          <h3 className="text-lg">
            <span className="font-semibold">Closed at:</span>{" "}
            {new Date(closeTime).toLocaleString()}
          </h3>
        </div>
      </Card>
      <div className="flex items-center space-x-3 mb-4">
        <Checkbox
          className="h-5 w-5"
          checked={sharePrices}
          onCheckedChange={handleSharePricesChange}
        />
        <h3 className="text-lg font-medium">Share prices</h3>
      </div>
      <Card className="mb-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <h3 className="text-lg">
            <span className="font-semibold">Avg entry price:</span> {entryPrice}
          </h3>
          <h3 className="text-lg">
            <span className="font-semibold">Avg exit price:</span> {exitPrice}
          </h3>
        </div>
      </Card>
      <div className="flex items-center space-x-3 mb-4">
        <Checkbox
          className="h-5 w-5"
          checked={shareLeverage}
          onCheckedChange={handleShareLeverageChange}
        />
        <h3 className="text-lg font-medium">Share leverage</h3>
      </div>
      <Card className="mb-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <h3 className="text-lg">
            <span className="font-semibold">Leverage:</span> {leverage}x
          </h3>
        </div>
      </Card>
      <div className="flex justify-end space-x-4">
        <DialogClose>
          <Button
            variant="outline"
            className="text-gray-500 hover:text-gray-700 border-gray-300 hover:border-gray-400"
          >
            Cancel
          </Button>
        </DialogClose>
        <DialogClose>
          <Button
            onClick={shareOnTwitter}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Share on Twitter
          </Button>
        </DialogClose>
      </div>
    </DialogContent>
  );
}

export default PopupShare;
