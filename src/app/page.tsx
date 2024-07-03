"use client"; // app/page.tsx

import { useState } from "react";
import { GoHomeFill } from "react-icons/go";
import { MdOutlineInsertChart } from "react-icons/md";
import { RiExchangeBoxLine } from "react-icons/ri";
import { IoPersonSharp } from "react-icons/io5";
import { BiSolidWallet } from "react-icons/bi";
import { usePrivy } from "@privy-io/react-auth";

// Import your tab content components
import Landing from "./landing/page";
import Trade from "./trade/page";
import Wallet from "./wallet/page";
import User from "./user/page";

import { useAuthStore } from "@/store/authStore";

function Global() {
  const [selectedTab, setSelectedTab] = useState("Landing");
  const { ready, authenticated } = usePrivy();
  const token = useAuthStore((state) => state.token);
  const disableLogin = ready && authenticated && token;

  const renderContent = () => {
    switch (selectedTab) {
      case "Landing":
        return <Landing />;
      case "Trade":
        return <Trade />;
      case "Wallet":
        return <Wallet />;
      case "User":
        return <User />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className={`container ${disableLogin ? "" : "blur"}`}>
        {renderContent()}
      </div>
    </div>
  );
}

function Pages() {
  return (
    <div>
      {/* Your existing page content */}
      <Global />
    </div>
  );
}

export default Pages;
