// chart.tsx
"use client";
import { useEffect, useRef } from "react";

interface TradingViewPopupProps {
  symbol: string;
  interval: string;
}

function TradingViewPopup({ symbol, interval }: TradingViewPopupProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      console.log("TradingView library loaded");
      setTimeout(() => {
        if (containerRef.current) {
          console.log("Container element:", containerRef.current);
          containerRef.current.innerHTML = "";
          const widget = (window as any).TradingView.widget({
            autosize: true,
            symbol: symbol,
            interval: interval,
            timezone: "Etc/UTC",
            theme: "dark",
            style: "1",
            locale: "en",
            enable_publishing: false,
            hide_side_toolbar: true,
            hide_top_toolbar: true,
            calendar: false,
            hide_volume: true,
            allow_symbol_change: false,
            container: containerRef.current,
          });
          console.log("TradingView widget created", widget);

          return () => {
            if (widget) {
              widget.remove();
            }
          };
        }
      }, 0);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [symbol, interval]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ width: "800px", height: "600px" }}
    />
  );
}

export default TradingViewPopup;
