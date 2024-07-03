import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { FaEdit, FaChartLine } from "react-icons/fa";
import SheetPlaceClose from "@/components/sheet/place_close";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { toast } from "react-toastify";
import Link from "next/link";
import { useTradeStore } from "@/store/tradeStore";
import { removePrefix } from "@/components/web3/utils";
import { walletActions } from "viem";
import {
  handleCloseQuote,
  CloseQuoteParams,
} from "@/components/sections/trade/utils/closeQuote";
import { useWalletAndProvider } from "@/components/layout/menu";
import { useAuthStore } from "@/store/authStore";
import { config } from "@/config";

export interface Position {
  id: string;
  size: string;
  market: string;
  icon: string;
  mark: string;
  entryPrice: string;
  pnl: string;
  amount: string;
  amountContract: string;
  type: string;
  estLiq: string;
  entryTime: string;
  mtm: string;
  imA: string;
  dfA: string;
  imB: string;
  dfB: string;
  openTime: string;
  isAPayingAPR: boolean;
  interestRate: string;
  bContractId: number;
  pA: string;
  pB: string;
  isLong: boolean;
}

interface SectionPositionsProps {
  positions?: Position[];
  currentActiveRowPositions: { [key: string]: boolean };
  toggleActiveRow: (label: string) => void;
  hideRow: (label: string) => void;
}

function SectionPositions({
  positions,
  currentActiveRowPositions,
  toggleActiveRow,
  hideRow,
}: SectionPositionsProps) {
  const setSelectedMarket = useTradeStore((state) => state.setSymbol);
  const { token, walletClient } = useAuthStore();
  const { wallet, provider } = useWalletAndProvider();
  const {
    currentMethod,
    entryPrice,
    amount,
    amountUSD,
    sliderValue,
    bidPrice,
    askPrice,
    symbol,
    currentTabIndex,
    setCurrentMethod,
    setCurrentTabIndex,
    setEntryPrice,
    setAmount,
    setAmountUSD,
    setSliderValue,
    leverage,
    balance,
    maxAmount,
  } = useTradeStore();

  if (!positions || !Array.isArray(positions)) {
    return null;
  }

  const handleSheetClose = (positionId: string) => {
    toggleActiveRow(positionId);
  };

  const handleToggleActiveRow = (positionId: string) => {
    const isActive = currentActiveRowPositions[positionId];

    Object.keys(currentActiveRowPositions).forEach((key) => {
      if (currentActiveRowPositions[key]) {
        toggleActiveRow(key);
      }
    });

    if (!isActive) {
      toggleActiveRow(positionId);
    }
  };

  const handleMarketClose = async (position: Position) => {
    if (!wallet || !wallet.address || !token || !walletClient) {
      console.error(
        "Wallet, wallet address, token, or walletClient is missing"
      );
      return;
    }

    try {
      const closePrice = position.isLong
        ? askPrice * (1 + 0.01)
        : bidPrice * (1 - 0.01);

      const closeQuoteParams: CloseQuoteParams = {
        price: closePrice.toString(),
        isTP: true,
        wallet,
        token,
        walletClient,
        activeChainId: config.activeChainId,
        bContractId: position.bContractId,
        amountContract: position.amountContract,
        pA: position.pA,
        pB: position.pB,
        isLong: position.isLong,
      };

      await handleCloseQuote(closeQuoteParams);

      hideRow(position.id);
    } catch (error) {
      console.error("Error closing position:", error);
      toast.error("Failed to close position");
    }
  };
  const handleMarketClick = (marketName: string) => {
    setSelectedMarket(marketName);
  };

  return (
    <Table className="whitespace-nowrap">
      <TableHeader>
        <TableRow className="hover:bg-background border-none">
          <TableHead className="pr-0"></TableHead>
          <TableHead>
            <p className="text-card-foreground">Size / Market</p>
          </TableHead>
          <TableHead>
            <p className="text-card-foreground">Mark / Entry Price</p>
          </TableHead>
          <TableHead className="text-right">
            <p className="text-card-foreground">Pnl. Amount</p>
            <p>(USD)</p>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {positions.map((position, index) => {
          const formattedMarket = removePrefix(position.market);

          return (
            <Fragment key={position.id}>
              {index !== 0 && (
                <TableRow
                  key={`separator-${position.id}`}
                  className="border-none"
                >
                  <TableCell className="py-2"></TableCell>
                </TableRow>
              )}
              <TableRow
                onClick={() => handleToggleActiveRow(position.id)}
                key={`row-${position.id}`}
                className="bg-card hover:bg-card border-none cursor-pointer"
              >
                <TableCell className="pl-3 pr-0 w-[45px]">
                  <div>
                    <Image
                      src={position.icon}
                      alt={position.market}
                      width={30}
                      height={30}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p
                      className={`${
                        position.type.toLowerCase() === "long"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {position.size}
                    </p>
                    <p className="text-card-foreground">{formattedMarket}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p>{position.mark}</p>
                    <p className="text-card-foreground">
                      {position.entryPrice} USD
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div>
                    <p
                      className={`${
                        Number(position.pnl) >= 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {position.pnl}
                    </p>
                    <p className="text-card-foreground">{position.amount}</p>
                  </div>
                </TableCell>
              </TableRow>
              {currentActiveRowPositions[position.id] && (
                <>
                  <TableRow
                    key={`details-${position.id}`}
                    className="bg-card hover:bg-card border-none"
                  >
                    <TableCell colSpan={4} className="py-1">
                      <div className="w-full flex justify-between">
                        <div className="w-full">
                          <p className="text-card-foreground">Type</p>
                          <p className="font-medium">{position.type}</p>
                        </div>
                        <div className="text-right w-full">
                          <p className="text-card-foreground">Est. Liq</p>
                          <p className="font-medium">{position.estLiq}</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow
                    key={`actions-${position.id}`}
                    className="bg-card hover:bg-card border-none"
                  >
                    <TableCell colSpan={4}>
                      <div className="w-full flex justify-center space-x-3">
                        <Drawer>
                          <DrawerTrigger>
                            <Button
                              variant="secondary"
                              className="flex space-x-2"
                            >
                              <FaEdit />
                              <span>TP/SL</span>
                            </Button>
                          </DrawerTrigger>
                          <SheetPlaceClose
                            position={position}
                            onClose={() => handleSheetClose(position.id)}
                          />
                        </Drawer>
                        <Button
                          onClick={() => handleMarketClose(position)}
                          variant="destructive"
                        >
                          <span>Market</span>
                        </Button>
                        <Link
                          href="/trade"
                          onClick={() => handleMarketClick(formattedMarket)}
                        >
                          <Button variant="outline">
                            <div className="flex items-center space-x-2">
                              <FaChartLine />
                              <p>Chart</p>
                            </div>
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                </>
              )}
            </Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default SectionPositions;
