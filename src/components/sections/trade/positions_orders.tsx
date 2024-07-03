"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionPositions from "./SectionPositions";
import SectionOrders from "./SectionOrders";
import { Button } from "@/components/ui/button";
import { Order } from "./SectionOrders";
import { Position } from "./SectionPositions";
import {
  signedWrappedOpenQuoteResponse,
  getSignedWrappedOpenQuotes,
  getSignedCloseQuotes,
  signedCloseQuoteResponse,
} from "@pionerfriends/api-client";
import { convertFromBytes32 } from "@/components/web3/utils";
import { useWalletAndProvider } from "@/components/layout/menu";
import { getOrders } from "./get/getOrders";
import { getPositionss } from "./get/getPositions";
import { getCloseOrders } from "./get/getCloseOrders";
import { useAuthStore } from "@/store/authStore";
import useBlurEffect from "@/hooks/blur";
import { config } from "@/config";

const menu = ["Positions", "Orders"];

interface activeMenu {
  [key: string]: boolean;
}

function SectionTradePositionsOrders() {
  const { wallet, provider } = useWalletAndProvider();
  const token = useAuthStore((state) => state.token);

  const [currentTab, setCurrentTab] = useState(menu[0]);
  const blur = useBlurEffect();

  const [currentActiveRowPositions, setCurrentActiveRowPositions] =
    useState<activeMenu>({});
  const [currentActiveRowOrders, setCurrentActiveRowOrders] =
    useState<activeMenu>({});

  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!wallet || !token) {
        return;
      }

      try {
        //console.log("fetching data");
        const [openOrders, closeOrders, positionsData] = await Promise.all([
          getOrders(config.activeChainId, wallet.address, token),
          getCloseOrders(config.activeChainId, wallet.address, token),
          getPositionss(Number(config.activeChainId), token, wallet.address),
        ]);
        setOrders([...openOrders, ...closeOrders]);
        setPositions(positionsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData(); // Initial fetch

    const intervalId = setInterval(() => {
      fetchData();
    }, config.apiRefreshRate);

    return () => {
      clearInterval(intervalId);
    };
  }, [wallet, token]);

  const toggleActiveRow = (label: string) => {
    if (currentTab === "Positions") {
      setCurrentActiveRowPositions((prevState) => {
        return {
          ...prevState,
          [label]: !prevState[label],
        };
      });
    } else {
      setCurrentActiveRowOrders((prevState) => {
        return {
          ...prevState,
          [label]: !prevState[label],
        };
      });
    }
  };

  const hideRow = (label: string) => {
    if (currentTab === "Positions") {
      setCurrentActiveRowPositions((prevState) => {
        return {
          ...prevState,
          [label]: false,
        };
      });
    } else {
      setCurrentActiveRowOrders((prevState) => {
        return {
          ...prevState,
          [label]: false,
        };
      });
    }
  };

  return (
    <div className={`container ${blur ? "blur" : ""}`}>
      <div className="mt-5 flex flex-col">
        <div className="border-b flex space-x-5 px-5">
          {menu.map((x, index) => {
            return (
              <div key={x + index} onClick={() => setCurrentTab(x)}>
                <h2
                  className={`${
                    currentTab === x ? "text-primary" : "text-card-foreground"
                  } transition-all font-medium cursor-pointer`}
                >
                  {x} ({x === "Positions" ? positions.length : orders.length})
                </h2>
                <div
                  className={`w-[18px] h-[4px] ${
                    currentTab === x ? "bg-primary" : "bg-transparent"
                  } mt-3 transition-all`}
                />
              </div>
            );
          })}
        </div>
        <div className="px-5">
          <AnimatePresence>
            {/* Positions Tab */}
            {currentTab === "Positions" && (
              <motion.div
                key="Positions"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <SectionPositions
                  positions={positions}
                  currentActiveRowPositions={currentActiveRowPositions}
                  toggleActiveRow={toggleActiveRow}
                  hideRow={hideRow}
                />
              </motion.div>
            )}
            {/* Positions Tab End */}

            {/* Orders Tab */}
            {currentTab === "Orders" && (
              <motion.div
                key="Orders"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <SectionOrders
                  orders={orders}
                  currentActiveRowOrders={currentActiveRowOrders}
                  toggleActiveRow={toggleActiveRow}
                  hideRow={hideRow}
                />
              </motion.div>
            )}
            {/* Orders Tab End */}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default SectionTradePositionsOrders;
