import { useEffect, useRef, useState } from "react";
import {
  PionerWebsocketClient,
  QuoteResponse,
  WebSocketType,
} from "@pionerfriends/api-client";
import { useWalletAndProvider } from "@/components/layout/menu";

const useQuoteWss = (
  token: string | null,
  addQuote: (message: QuoteResponse) => void
) => {
  const { wallet } = useWalletAndProvider();
  const quoteClientRef =
    useRef<PionerWebsocketClient<WebSocketType.LiveQuotes> | null>(null);
  const [lastMessageTime, setLastMessageTime] = useState<number>(Date.now());
  const [isRestarting, setIsRestarting] = useState<boolean>(false);

  const startWebSocket = () => {
    if (token && token !== null && wallet && !isRestarting) {
      setIsRestarting(true);
      console.log("Setting up WebSocket connection...");
      if (quoteClientRef.current) {
        quoteClientRef.current.closeWebSocket();
      }
      quoteClientRef.current = new PionerWebsocketClient(
        WebSocketType.LiveQuotes,
        (message: QuoteResponse) => {
          //console.log("Received Quote:", message);
          addQuote(message);
          setLastMessageTime(Date.now());
        },
        () => {
          console.log("WebSocket Open");
          setIsRestarting(false);
        },
        () => console.log("WebSocket Closed"),
        () => console.log("WebSocket Reconnected"),
        (error: Error) => console.error("WebSocket Error:", error)
      );
      quoteClientRef.current.startWebSocket(token);
      console.log("WebSocket Started");
    } else {
      console.log(
        "Token or wallet missing, or restart in progress. WebSocket not started."
      );
    }
  };

  useEffect(() => {
    startWebSocket();

    const checkAndRestartInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastMessageTime > 10000 && !isRestarting) {
        console.log("No messages for 10 seconds, restarting WebSocket...");
        startWebSocket();
      }
    }, 10000); // Check every 10 seconds

    return () => {
      if (quoteClientRef.current) {
        console.log("Closing WebSocket connection...");
        quoteClientRef.current.closeWebSocket();
        console.log("WebSocket Closed");
      }
      clearInterval(checkAndRestartInterval);
    };
  }, [token, addQuote, wallet]);

  return null;
};

export default useQuoteWss;
