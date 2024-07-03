//SectionOrders.tsx
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
import { FaChartLine } from "react-icons/fa";
import { toast } from "react-toastify";
import Link from "next/link";
import { useTradeStore } from "@/store/tradeStore";
import { useAuthStore } from "@/store/authStore";
import { useWalletAndProvider } from "@/components/layout/menu";
import { cancelOrder as cancelOpenOrder } from "@/components/sections/trade/utils/cancelOpenQuote";
import { cancelCloseQuote } from "@/components/sections/trade/utils/cancelCloseQuote";
import { removePrefix } from "@/components/web3/utils";

export interface Order {
  id: string;
  size: string;
  market: string;
  icon: string;
  trigger: string;
  amount: string;
  filled: string;
  remainingSize: string;
  breakEvenPrice: string;
  limitPrice: string;
  status: string;
  reduceOnly: string;
  fillAmount: string;
  entryTime: string;
  targetHash: string;
  counterpartyAddress: string;
}
interface SectionOrdersProps {
  orders: Order[];
  currentActiveRowOrders: { [key: string]: boolean };
  toggleActiveRow: (label: string) => void;
  hideRow: (label: string) => void;
}

function SectionOrders({
  orders,
  currentActiveRowOrders,
  toggleActiveRow,
  hideRow,
}: SectionOrdersProps) {
  const { wallet, provider } = useWalletAndProvider();
  const token = useAuthStore.getState().token;

  const handleCancelOrder = async (order: Order) => {
    try {
      if (!wallet || !wallet.address || !token) {
        console.error("Missing wallet, wallet address, or token");
        toast.error("Failed to cancel order: Invalid wallet or token");
        return;
      }

      let success;
      if (order.status === "Close Quote") {
        success = await cancelCloseQuote(order, wallet, token, provider);
      } else if (order.status === "Open Quote") {
        success = await cancelOpenOrder(order, wallet, token, provider);
      } else {
        console.error("Unknown order status:", order.status);
        toast.error("Failed to cancel order: Unknown order status");
        return;
      }

      if (success) {
        hideRow(order.targetHash);
      } else {
        toast.error("Failed to cancel order");
      }
    } catch (error) {
      console.error("Error canceling order:", error);
      toast.error("An error occurred while canceling the order");
    }
  };

  const handleCancelAllOrders = async () => {
    for (const order of orders) {
      try {
        if (!wallet || !wallet.address || !token) {
          console.error("Missing wallet, wallet address, or token");
          toast.error("Failed to cancel order: Invalid wallet or token");
          continue;
        }

        let success;
        if (order.status === "Close Quote") {
          success = await cancelCloseQuote(order, wallet, token, provider);
        } else if (order.status === "Open Quote") {
          success = await cancelOpenOrder(order, wallet, token, provider);
        } else {
          console.error("Unknown order status:", order.status);
          toast.error(
            `Failed to cancel order ${order.id}: Unknown order status`
          );
          continue;
        }

        if (success) {
          toast.success(`Order ${order.id} canceled successfully`);
          hideRow(order.targetHash);
        } else {
          toast.error(`Failed to cancel order ${order.id}`);
        }
      } catch (error) {
        console.error(`Error canceling order ${order.id}:`, error);
        toast.error(`An error occurred while canceling order ${order.id}`);
      }
    }
  };

  const setSelectedMarket = useTradeStore((state) => state.setSymbol);

  const handleMarketClick = (marketName: string) => {
    setSelectedMarket(marketName);
  };

  const handleToggleActiveRow = (label: string) => {
    const isActive = currentActiveRowOrders[label];

    Object.keys(currentActiveRowOrders).forEach((key) => {
      if (currentActiveRowOrders[key]) {
        toggleActiveRow(key);
      }
    });

    if (!isActive) {
      toggleActiveRow(label);
    }
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
            <p className="text-card-foreground">Trigger / Amount</p>
          </TableHead>
          <TableHead className="text-right">
            <p className="text-card-foreground">Filled / Remaining Size</p>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((x, index) => {
          const formattedMarket = removePrefix(x.market);

          return (
            <Fragment key={x.targetHash}>
              {index !== 0 && (
                <TableRow
                  key={`separator-${x.targetHash}`}
                  className="border-none"
                >
                  <TableCell className="py-2"></TableCell>
                </TableRow>
              )}
              <TableRow
                onClick={() => handleToggleActiveRow(x.targetHash)}
                key={`row-${x.targetHash}`}
                className="bg-card hover:bg-card border-none cursor-pointer"
              >
                <TableCell className="pl-3 pr-0 w-[45px]">
                  <div>
                    <Image src={x.icon} alt={x.market} width={30} height={30} />
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <h3
                      className={`${
                        Number(x.size) > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {x.size}
                    </h3>
                    <h3 className="text-card-foreground">{formattedMarket}</h3>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <h3>{x.trigger}</h3>
                    <h3 className="text-card-foreground">{x.amount}</h3>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div>
                    <h3>{x.filled}</h3>
                    <h3 className="text-card-foreground">{x.remainingSize}</h3>
                  </div>
                </TableCell>
              </TableRow>
              {currentActiveRowOrders[x.targetHash] && (
                <>
                  <TableRow
                    key={`details-1-${x.targetHash}`}
                    className="bg-card hover:bg-card border-none"
                  >
                    <TableCell colSpan={4} className="py-1">
                      <div className="w-full flex justify-between">
                        <div className="w-full text-center">
                          <p className="text-card-foreground">
                            Break Even Price
                          </p>
                          <p className="font-medium">{x.breakEvenPrice}</p>
                        </div>
                        <div className="text-center w-full">
                          <p className="text-card-foreground">Limit Price</p>
                          <p className="font-medium">{x.limitPrice}</p>
                        </div>
                        <div className="text-right w-full">
                          <p className="text-card-foreground">Status</p>
                          <p className="font-medium">{x.status}</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow
                    key={`details-2-${x.targetHash}`}
                    className="bg-card hover:bg-card border-none"
                  >
                    <TableCell colSpan={4} className="py-1">
                      <div className="w-full flex justify-around">
                        <div className="text-center">
                          <p className="text-card-foreground">Reduce Only</p>
                          <p className="font-medium">{x.reduceOnly}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-card-foreground">Fill Amount</p>
                          <p className="font-medium">{x.fillAmount}</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow
                    key={`actions-${x.targetHash}`}
                    className="bg-card hover:bg-card border-none"
                  >
                    <TableCell colSpan={4}>
                      <div className="w-full flex justify-center space-x-3">
                        <Button
                          onClick={() => handleCancelOrder(x)}
                          variant="destructive"
                        >
                          <p>Cancel</p>
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
        <TableRow>
          <TableCell colSpan={4} className="p-0">
            <Button
              variant="ghost"
              className="text-primary w-full mt-5 text-lg hover:bg-muted"
              onClick={handleCancelAllOrders}
            >
              <p>Cancel All</p>
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

export default SectionOrders;
