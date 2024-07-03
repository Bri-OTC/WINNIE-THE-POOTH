// useMethodColor.ts
import { useEffect } from "react";
import { useColorStore } from "@/store/colorStore";
import { useTradeStore } from "@/store/tradeStore";

export const useMethodColor = () => {
  const { currentMethod } = useTradeStore();
  const setColor = useColorStore((state) => state.setColor);

  useEffect(() => {
    setColor(currentMethod);
  }, [currentMethod, setColor]);
};
