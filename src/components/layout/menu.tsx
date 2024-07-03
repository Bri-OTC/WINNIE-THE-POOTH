// components/layout/menu.tsx

"use client";

import Link from "next/link";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";
import { GoHomeFill } from "react-icons/go";
import { MdOutlineInsertChart } from "react-icons/md";
import { RiExchangeBoxLine } from "react-icons/ri";
import { IoPersonSharp } from "react-icons/io5";
import { BiSolidWallet } from "react-icons/bi";
import { useWallets } from "@privy-io/react-auth";
import { usePrivy, useLogin } from "@privy-io/react-auth";
import { FaTimes } from "react-icons/fa";
import { getPayload, login as apiLogin } from "@pionerfriends/api-client";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState, useCallback } from "react";
import { MarketDrawer } from "@/components/sections/markets/MarketDrawer";
import { createWalletClient, custom, verifyMessage } from "viem";
import { useQuoteStore } from "@/store/quoteStore";
import useUpdateMarketStatus from "@/hooks/marketStatusUpdater";
import useQuoteWss from "@/hooks/useQuoteWss";
import useFillOpenQuote from "@/hooks/useFillOpenQuote";
import useFillCloseQuote from "@/hooks/useFillCloseQuote";
import { useTradeStore } from "@/store/tradeStore";
import { useColorStore } from "@/store/colorStore";
import { useMethodColor } from "@/hooks/useMethodColor";
import { config } from "@/config";

export function Menu() {
  const setWalletClient = useAuthStore((state) => state.setWalletClient);
  const { ready, authenticated, user, logout } = usePrivy();
  const pathname = usePathname();
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const setProvider = useAuthStore((state) => state.setProvider);
  const setToken = useAuthStore((state) => state.setToken);
  const token = useAuthStore((state) => state.token);
  const symbol = useTradeStore((state) => state.symbol);
  const color = useColorStore((state) => state.color);
  const { wallet: wallet2, provider } = useWalletAndProvider();

  const [payload, setPayload] = useState<{
    uuid: string;
    message: string;
  } | null>(null);
  const [payloadError, setPayloadError] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const setIsMarketOpen = useAuthStore((state) => state.setIsMarketOpen);
  const { addQuote } = useQuoteStore();

  const disableLogin = !!(authenticated && token);
  const [isFantomSonicTestnet, setIsFantomSonicTestnet] = useState(false);

  useEffect(() => {
    const checkChain = async () => {
      if (wallet && provider) {
        try {
          const currentChainId = await provider.request({
            method: "eth_chainId",
          });
          if (currentChainId === config.activeChainHex) {
            setIsFantomSonicTestnet(true);
          } else {
            setIsFantomSonicTestnet(false);
          }
        } catch (error) {
          console.error("Error checking chain:", error);
        }
      }
    };
    checkChain();
  }, [wallet, provider]);

  const addChain = async () => {
    if (wallet && provider) {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: config.activeChainHex, ////0xfaa5
              chainName: config.viemChain.name,
              nativeCurrency: config.viemChain.nativeCurrency,
              rpcUrls: config.viemChain.rpcUrls.default.http,
            },
          ],
        });
        setIsFantomSonicTestnet(true);
      } catch (error) {
        console.error("Error adding chain:", error);
      }
    }
  };
  /** Global workers*/
  useUpdateMarketStatus(token, symbol, setIsMarketOpen);
  useQuoteWss(token, addQuote);
  useFillOpenQuote(token);
  useFillCloseQuote(token);
  useMethodColor();
  /** */

  const { login } = useLogin({
    onComplete: async (
      user,
      isNewUser: boolean,
      wasAlreadyAuthenticated: boolean
    ) => {
      await fetchPayload();
      localStorage.setItem("authenticated", "true");
    },
    onError: (error) => {
      console.error(error);
    },
  });

  useEffect(() => {
    const tokenFromCookie = Cookies.get("token") ?? null;
    const authenticatedFromStorage = localStorage.getItem("authenticated");
    const privyUser = localStorage.getItem("privy:user");

    if (
      ((tokenFromCookie && !token) || authenticatedFromStorage) &&
      ready &&
      authenticated &&
      privyUser
    ) {
      setToken(tokenFromCookie);
    }
  }, [authenticated, ready, token, setToken]);

  useEffect(() => {
    const fetchData = async () => {
      if (ready && authenticated && wallet) {
        const provider = await wallet.getEthereumProvider();
        setProvider(provider);
        const walletClient = createWalletClient({
          transport: custom(provider),
          account: wallet.address as `0x${string}`,
        });
        setWalletClient(walletClient);
      }
    };

    fetchData();
  }, [wallet, ready, authenticated, setProvider, setWalletClient]);

  const fetchPayload = async () => {
    if (wallet && !token) {
      const address = wallet.address;

      try {
        const payloadResponse = await getPayload(address);
        if (
          payloadResponse &&
          payloadResponse.status === 200 &&
          payloadResponse.data.uuid &&
          payloadResponse.data.message
        ) {
          setPayload(payloadResponse.data);
          setPayloadError(false);
        } else {
          setPayload(null);
          setPayloadError(true);
        }
      } catch (error) {
        console.error("Error fetching payload:", error);
        setPayloadError(true);
      }
    }
  };

  const signMessage = useCallback(async () => {
    if (payload && !token) {
      const { uuid, message } = payload;

      try {
        const provider = await wallet.getEthereumProvider();
        const walletClient = createWalletClient({
          transport: custom(provider),
          account: wallet.address as `0x${string}`,
        });

        //console.log("menu walletClient", walletClient);

        const signature = await walletClient.signMessage({
          account: wallet.address as `0x${string}`,
          message: message,
        });

        const valid = await verifyMessage({
          address: wallet.address as `0x${string}`,
          message: message,
          signature: signature,
        });

        //console.log("signature", signature, message, valid);

        return { uuid, signature };
      } catch (error) {
        console.error("Error signing message:", error);
        setLoginError(true);
      }
    }
  }, [payload, token, wallet]);

  const attemptLogin = useCallback(
    async (uuid: string, signature: string) => {
      try {
        const loginResponse = await apiLogin(uuid, signature);

        if (
          loginResponse &&
          loginResponse.status === 200 &&
          loginResponse.data.token
        ) {
          const token = loginResponse.data.token;
          //console.log(`Token: ${token} `);
          const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(wallet.address);
          if (isValidAddress) {
            setToken(token);
            setLoginError(false);
          } else {
            console.error("Invalid wallet address detected:", wallet.address);
            setPayload(null);
            setLoginError(true);
          }
        } else {
          setPayload(null);
          setLoginError(true);
        }
      } catch (error) {
        console.error("Error logging in:", error);
        setLoginError(true);
      }
    },
    [wallet, setToken]
  );

  useEffect(() => {
    if (payload) {
      signMessage().then((signedData) => {
        if (signedData) {
          const { uuid, signature } = signedData;
          attemptLogin(uuid, signature);
        }
      });
    }
  }, [payload, signMessage, attemptLogin]);

  const clearPrivyData = () => {
    // Clear Privy data from localStorage
    localStorage.removeItem("privy:authenticated");
    localStorage.removeItem("privy:user");

    // Clear Privy data from cookies
    Cookies.remove("privy:authenticated");
    Cookies.remove("privy:user");

    localStorage.removeItem("authenticated");

    // Clear token and other relevant data
    setToken(null);
    setPayload(null);
    setPayloadError(false);
    setLoginError(false);
  };
  useEffect(() => {
    if (loginError) {
      logout();
      setPayload(null);
      setToken(null);
      setPayloadError(false);
      setLoginError(false);
    }
  }, [loginError, logout, setPayload, setToken]);

  const checkWalletAddress = useCallback(() => {
    if (wallet && token) {
      const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(wallet.address);
      if (!isValidAddress) {
        console.error("Invalid wallet address detected:", wallet.address);
        logout();
        setPayload(null);
        setToken(null);
        setPayloadError(false);
        setLoginError(false);
      }
    }
  }, [wallet, token, logout, setToken]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkWalletAddress();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [wallet, token, checkWalletAddress]);

  useEffect(() => {
    if (authenticated && token && (!wallet || !wallet.address)) {
      logout();
      setPayload(null);
      setToken(null);
      setPayloadError(false);
      setLoginError(false);
    }
  }, [authenticated, token, wallet, logout, setToken]);

  return (
    <div className="w-full sticky bottom-0 h-[110px] md:h-[130px]">
      <div className="w-full h-[1px] bg-border"></div>
      <div className="container bg-background flex items-center justify-center">
        {ready ? (
          ready && authenticated && token ? (
            <div className="text-center text-white p-3 flex items-center">
              <div className="mr-2">
                {!isFantomSonicTestnet && (
                  <button
                    onClick={addChain}
                    className="text-white hover:text-gray-200 mr-2"
                  >
                    Click to add Testnet to your wallet
                  </button>
                )}
              </div>
              <h3 className="mr-2">Account: {wallet?.address}</h3>
              <button
                onClick={() => {
                  logout();
                  setPayload(null);
                  setToken(null);
                  setPayloadError(false);
                  setLoginError(false);
                }}
                className="text-white hover:text-gray-200"
              >
                <FaTimes size={10} />
              </button>
            </div>
          ) : payload ? (
            <div className="text-center text-white p-3 flex items-center">
              <span className="mr-2">Sign Message...</span>
              <button
                onClick={() => {
                  logout();
                  setPayload(null);
                  setToken(null);
                  setPayloadError(false);
                  setLoginError(false);
                }}
                className="text-white hover:text-gray-200"
              >
                <FaTimes size={10} />
              </button>
            </div>
          ) : (
            <button
              disabled={disableLogin}
              onClick={() => {
                clearPrivyData();
                if (ready && !authenticated) {
                  login();
                } else if (ready && authenticated) {
                  logout();
                }
              }}
              className="text-center text-white p-3"
            >
              Connect Wallet
            </button>
          )
        ) : (
          <div className="text-center text-white p-3">Loading...</div>
        )}
      </div>
      <div className="bg-accent text-card-foreground">
        <div className="grid grid-cols-5 w-full container py-3">
          {menus.map((x) => {
            if (x.name === "Markets") {
              return (
                <MarketDrawer key={x.name}>
                  <div
                    className={`group flex flex-col items-center text-center space-y-1 hover:text-primary cursor-pointer transition-all ${
                      pathname === x.link
                        ? "text-primary"
                        : "text-card-foreground"
                    }`}
                  >
                    <div className="text-[1.5rem] md:text-[2rem]">{x.icon}</div>
                    <p>{x.name}</p>
                  </div>
                </MarketDrawer>
              );
            }
            return (
              <Link
                href={x.link}
                key={x.name}
                className={`${
                  pathname === x.link ? "text-primary" : "text-card-foreground"
                } group flex flex-col items-center text-center space-y-1 hover:text-primary cursor-pointer transition-all`}
              >
                <div className="text-[1.5rem] md:text-[2rem]">{x.icon}</div>
                <p>{x.name}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const useWalletAndProvider = () => {
  const { wallets } = useWallets();
  const provider = useAuthStore((state) => state.provider);

  return { wallet: wallets[0], provider };
};

const menus = [
  { name: "Home", icon: <GoHomeFill />, link: "/" },
  { name: "Markets", icon: <MdOutlineInsertChart />, link: "/markets" },
  { name: "Trade", icon: <RiExchangeBoxLine />, link: "/trade" },
  { name: "Wallet", icon: <BiSolidWallet />, link: "/wallet" },
  { name: "User", icon: <IoPersonSharp />, link: "/user" },
];

export default Menu;
