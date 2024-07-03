"use client";
import { useState, useRef, useEffect, ChangeEvent } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/lib/utils";
import { HiOutlineCog6Tooth } from "react-icons/hi2";
import { PiChartPieSlice } from "react-icons/pi";
import { FaSearch, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import Image from "next/image";
import { useWalletAndProvider } from "@/components/layout/menu";
import {
  networks,
  FakeUSD,
  PionerV1Compliance,
  PionerV1,
  NetworkKey,
} from "@pionerfriends/blockchain-client";
import { encodeFunctionData, Address, formatUnits } from "viem";
import useBlurEffect from "@/hooks/blur";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { usePrivy, useLogin } from "@privy-io/react-auth";
import { config } from "@/config";

function GasBalance() {
  const { wallet, provider } = useWalletAndProvider();
  const [gasBalance, setGasBalance] = useState("0");

  useEffect(() => {
    const fetchGasBalance = async () => {
      if (wallet && provider) {
        try {
          const gasBalanceResponse = await provider.request({
            method: "eth_getBalance",
            params: [wallet.address as Address, "latest" as const],
          });
          const gasBalanceInEther = formatUnits(
            BigInt(gasBalanceResponse as string),
            18
          );
          setGasBalance(gasBalanceInEther);
        } catch (error) {
          console.error("Error fetching gas balance:", error);
        }
      }
    };

    fetchGasBalance();
    const interval = setInterval(fetchGasBalance, 2500);

    return () => {
      clearInterval(interval);
    };
  }, [wallet, provider]);

  return gasBalance;
}

export function DepositedBalance() {
  const { wallet, provider } = useWalletAndProvider();
  const [depositedBalance, setDepositedBalance] = useState("0");

  const { ready, authenticated, user, logout } = usePrivy();

  useEffect(() => {
    const fetchDepositedBalance = async () => {
      if (wallet && provider) {
        try {
          const dataDeposited = encodeFunctionData({
            abi: PionerV1.abi,
            functionName: "getBalances",
            args: [wallet.address],
          });

          const depositedBalanceResponse = await provider.request({
            method: "eth_call",
            params: [
              {
                to: networks[config.activeChainId as unknown as NetworkKey]
                  .contracts.PionerV1 as Address,
                data: dataDeposited,
              },
              "latest" as const,
            ],
          });
          if (depositedBalanceResponse === "0x") {
            setDepositedBalance("0");
          } else {
            const depositedBalanceInUnits = formatUnits(
              BigInt(depositedBalanceResponse as string),
              18
            );
            setDepositedBalance(depositedBalanceInUnits);
          }
        } catch (error) {
          //console.error(error);
          // Check for the specific error message
        }
      }
    };

    fetchDepositedBalance();
    const interval = setInterval(fetchDepositedBalance, 2500);

    return () => {
      clearInterval(interval);
    };
  }, [wallet, provider, logout]);

  return depositedBalance;
}

export function ClaimableBalance() {
  const { wallet, provider } = useWalletAndProvider();
  const [depositedBalance, setDepositedBalance] = useState("0");

  useEffect(() => {
    const fetchDepositedBalance = async () => {
      if (wallet && provider) {
        try {
          const dataDeposited = encodeFunctionData({
            abi: PionerV1.abi,
            functionName: "getGracePeriodLockedWithdrawBalance",
            args: [wallet.address],
          });

          const depositedBalanceResponse = await provider.request({
            method: "eth_call",
            params: [
              {
                to: networks[config.activeChainId as unknown as NetworkKey]
                  .contracts.PionerV1 as Address,
                data: dataDeposited,
              },
              "latest",
            ],
          });
          if (depositedBalanceResponse === "0x") {
            setDepositedBalance("0");
          } else {
            const depositedBalanceInUnits = formatUnits(
              BigInt(depositedBalanceResponse as string),
              18
            );
            setDepositedBalance(depositedBalanceInUnits);
          }
        } catch (error) {
          console.error("Error fetching deposited balance:", error);
        }
      }
    };

    fetchDepositedBalance();
    const interval = setInterval(fetchDepositedBalance, 2500);

    return () => {
      clearInterval(interval);
    };
  }, [wallet, provider]);

  return depositedBalance;
}

export function TimeToClaim() {
  const { wallet, provider } = useWalletAndProvider();
  const [depositedBalance, setDepositedBalance] = useState("0");

  useEffect(() => {
    const fetchDepositedBalance = async () => {
      if (wallet && provider) {
        try {
          const dataDeposited = encodeFunctionData({
            abi: PionerV1.abi,
            functionName: "getGracePeriodLockedTime",
            args: [wallet.address],
          });

          const depositedBalanceResponse = await provider.request({
            method: "eth_call",
            params: [
              {
                to: networks[config.activeChainId as unknown as NetworkKey]
                  .contracts.PionerV1 as Address,
                data: dataDeposited,
              },
              "latest",
            ],
          });
          if (depositedBalanceResponse === "0x") {
            setDepositedBalance("0");
          } else {
            const depositedBalanceInUnits = formatUnits(
              BigInt(depositedBalanceResponse as string),
              18
            );
            setDepositedBalance(depositedBalanceInUnits);
          }
        } catch (error) {
          console.error("Error fetching deposited balance:", error);
        }
      }
    };

    fetchDepositedBalance();
    const interval = setInterval(fetchDepositedBalance, 2500);

    return () => {
      clearInterval(interval);
    };
  }, [wallet, provider]);

  return depositedBalance;
}

export function USDCBalance() {
  const { wallet, provider } = useWalletAndProvider();
  const [usdcBalance, setUsdcBalance] = useState("0");

  useEffect(() => {
    const fetchUSDCBalance = async () => {
      if (wallet && provider) {
        try {
          const dataUSDC = encodeFunctionData({
            abi: FakeUSD.abi,
            functionName: "balanceOf",
            args: [wallet.address],
          });
          const usdcBalanceResponse = await provider.request({
            method: "eth_call",
            params: [
              {
                to: networks[config.activeChainId as unknown as NetworkKey]
                  .contracts.FakeUSD as Address,
                data: dataUSDC,
              },
              "latest",
            ],
          });
          if (usdcBalanceResponse === "0x") {
            setUsdcBalance("0");
          } else {
            const usdcBalanceInUnits = formatUnits(
              BigInt(usdcBalanceResponse as string),
              18
            );
            setUsdcBalance(usdcBalanceInUnits);
          }
        } catch (error) {
          console.error("Error fetching USDC balance:", error);
        }
      }
    };

    fetchUSDCBalance();
    const interval = setInterval(fetchUSDCBalance, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [wallet, provider]);

  return usdcBalance;
}

export function USDCAllowance() {
  const { wallet, provider } = useWalletAndProvider();
  const [usdcBalance, setUsdcBalance] = useState("0");

  useEffect(() => {
    const fetchUSDCBalance = async () => {
      if (wallet && provider) {
        try {
          const dataUSDC = encodeFunctionData({
            abi: FakeUSD.abi,
            functionName: "allowance",
            args: [
              wallet.address,
              networks[config.activeChainId as unknown as NetworkKey].contracts
                .PionerV1Compliance,
            ],
          });
          const usdcBalanceResponse = await provider.request({
            method: "eth_call",
            params: [
              {
                to: networks[config.activeChainId as unknown as NetworkKey]
                  .contracts.FakeUSD as Address,
                data: dataUSDC,
              },
              "latest",
            ],
          });
          if (usdcBalanceResponse === "0x") {
            setUsdcBalance("0");
          } else {
            const usdcBalanceInUnits = formatUnits(
              BigInt(usdcBalanceResponse as string),
              18
            );
            setUsdcBalance(usdcBalanceInUnits);
          }
        } catch (error) {
          console.error("Error fetching USDC balance:", error);
        }
      }
    };

    fetchUSDCBalance();
    const interval = setInterval(fetchUSDCBalance, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [wallet, provider]);

  return usdcBalance;
}
function SectionWalletTable() {
  const blur = useBlurEffect();
  const gasBalance = GasBalance();
  const depositedBalance = DepositedBalance();
  const usdcBalance = USDCBalance();
  const withdrawBalance = ClaimableBalance();
  const [sortColumn, setSortColumn] = useState<"balance" | "usdValue" | null>(
    null
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const ftmPrice = 1.2;

  const data = [
    {
      icon: "/wallet/ftm.svg",
      market: "FTM (Gas)",
      balance: gasBalance,
      usdValue: Number(gasBalance) * ftmPrice,
    },
    {
      icon: "/wallet/usdc.svg",
      market: "USDC (Wallet)",
      balance: usdcBalance,
      usdValue: Number(usdcBalance),
    },
    {
      icon: "/wallet/usdc.svg",
      market: "USDC (Deposited)",
      balance: depositedBalance,
      usdValue: Number(depositedBalance),
    },
    {
      icon: "/wallet/usdc.svg",
      market: "USDC (Claimable)",
      balance: withdrawBalance,
      usdValue: Number(withdrawBalance),
    },
  ];

  const sortedData = [...data].sort((a, b) => {
    if (sortColumn === "balance") {
      return sortOrder === "asc"
        ? a.balance.localeCompare(b.balance)
        : b.balance.localeCompare(a.balance);
    } else if (sortColumn === "usdValue") {
      return sortOrder === "asc"
        ? a.usdValue - b.usdValue
        : b.usdValue - a.usdValue;
    }
    return 0;
  });

  const handleSort = (column: "balance" | "usdValue") => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  return (
    <div className={`container ${blur ? "blur" : ""}`}>
      <div className="mt-5 flex flex-col space-y-5">
        <Link href="/trade">
          <div className="flex items-center space-x-1 w-full bg-card rounded-lg px-5 py-3 transition-colors duration-200 ease-in-out ">
            <FaSearch className="text-card-foreground" />
            <span className="text-card-foreground">Search Something...</span>
          </div>
        </Link>

        <Table>
          <TableHeader>
            <TableRow className="border-none">
              <TableHead className="w-[40px]"></TableHead>
              <TableHead>
                <p>Market</p>
              </TableHead>
              <TableHead
                onClick={() => handleSort("balance")}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  <p>Balance</p>
                  {sortColumn === "balance" &&
                    (sortOrder === "asc" ? (
                      <FaSortUp className="ml-1" />
                    ) : (
                      <FaSortDown className="ml-1" />
                    ))}
                  {sortColumn !== "balance" && <FaSort className="ml-1" />}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("usdValue")}
                className="text-right cursor-pointer"
              >
                <div className="flex items-center justify-end">
                  <p>USD Value</p>
                  {sortColumn === "usdValue" &&
                    (sortOrder === "asc" ? (
                      <FaSortUp className="ml-1" />
                    ) : (
                      <FaSortDown className="ml-1" />
                    ))}
                  {sortColumn !== "usdValue" && <FaSort className="ml-1" />}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow key={item.market} className="border-none">
                <TableCell className="w-[50px] pr-0">
                  <div className="w-[30px]">
                    <Image
                      src={item.icon}
                      alt={item.market}
                      width={30}
                      height={30}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <h2>{item.market}</h2>
                </TableCell>
                <TableCell>
                  <h2>{item.balance}</h2>
                </TableCell>
                <TableCell className="text-right">
                  <h2>{formatNumber(item.usdValue)}</h2>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default SectionWalletTable;
