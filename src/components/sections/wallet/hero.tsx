"use client";
import { Button } from "@/components/ui/button";
import { TbNotes, TbCoins, TbUpload, TbArrowsExchange } from "react-icons/tb";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdOutlineTrendingUp } from "react-icons/md";
import { useState } from "react";
import Deposit from "../../../components/popup/Deposit";
import Withdraw from "../../../components/popup/Withdraw";
import Faucet from "../../../components/popup/Faucet";
import { BiCoinStack } from "react-icons/bi";
import { GiGiftOfKnowledge } from "react-icons/gi";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { useTradeStore } from "../../../store/tradeStore";
import { DepositedBalance } from "./table";
import useBlurEffect from "@/hooks/blur";

const menu = [
  {
    name: "Deposit",
    icon: <RiMoneyDollarCircleLine />,
    link: "/deposit",
  },
  {
    name: "Withdraw",
    icon: <BiCoinStack />,
    link: "/withdraw",
  },
  {
    name: "Get Gaz",
    icon: <GiGiftOfKnowledge />,
    link: "/get-gaz",
  },
];

function SectionWalletHero() {
  const blur = useBlurEffect();
  const depositedBalance = DepositedBalance();

  const [showBalance, setShowBalance] = useState(true);
  const { balance, setBalance } = useTradeStore();

  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showFaucet, setShowFaucet] = useState(false);

  const handleDepositClick = () => {
    setShowDeposit(true);
  };

  const handleWithdrawClick = () => {
    setShowWithdraw(true);
  };

  const handleFaucetClick = () => {
    setShowFaucet(true);
  };

  const handleClosePopup = () => {
    setShowDeposit(false);
    setShowWithdraw(false);
    setShowFaucet(false);
  };
  return (
    <div className={`container ${blur ? "blur" : ""}`}>
      <section className="flex flex-col space-y-5">
        <div className="flex items-center justify-between">
          <h1>Wallet</h1>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <div
              onClick={() => setShowBalance(!showBalance)}
              className="flex items-center space-x-2 hover:brightness-[0.8] transition-all cursor-pointer"
            >
              <p className="text-card-foreground">Total Net USD Value</p>
              <div className="cursor-pointer">
                {showBalance ? <FaEye /> : <FaEyeSlash />}
              </div>
            </div>
          </div>
          <div
            className={`${
              showBalance ? "max-h-[10rem]" : "max-h-0"
            } overflow-hidden transition-all`}
          >
            <div className="flex items-center justify-between mt-5">
              <div className="flex items-center space-x-1">
                <span className="text-card-foreground">≈</span>
                <h1>USD${depositedBalance}</h1>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-5 mt-5">
            {menu.map((x) => {
              return (
                <Button
                  key={x.name}
                  variant="ghost"
                  className="flex items-center space-x-3 hover:text-primary"
                  onClick={() => {
                    if (x.link === "/deposit") {
                      handleDepositClick();
                    } else if (x.link === "/withdraw") {
                      handleWithdrawClick();
                    } else if (x.link === "/get-gaz") {
                      handleFaucetClick();
                    }
                  }}
                >
                  <div className="text-[1.25rem]">{x.icon}</div>
                  <p>{x.name}</p>
                </Button>
              );
            })}
          </div>

          {showDeposit && (
            <Deposit open={showDeposit} onClose={handleClosePopup} />
          )}
          {showWithdraw && (
            <Withdraw open={showWithdraw} onClose={handleClosePopup} />
          )}
          {showFaucet && (
            <Faucet open={showFaucet} onClose={handleClosePopup} />
          )}
        </div>
      </section>
    </div>
  );
}

export default SectionWalletHero;
