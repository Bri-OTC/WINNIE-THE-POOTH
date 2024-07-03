"use client";

import React, { useEffect, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { useTradeStore, leverageValues } from "../../../store/tradeStore";
import useBlurEffect from "@/hooks/blur";

function SectionUserMargin() {
  const blur = useBlurEffect();
  const { leverage, setLeverage } = useTradeStore();

  useEffect(() => {
    const storedLeverage = localStorage.getItem("leverage");
    if (storedLeverage) {
      const parsedLeverage = parseInt(storedLeverage, 10);
      setLeverage(parsedLeverage);
    } else {
      setLeverage(500);
      localStorage.setItem("leverage", "500");
    }
  }, [setLeverage]);

  const handleLeverageChange = useCallback(
    (value: number[]) => {
      const newLeverage = leverageValues[value[0] - 1];
      setLeverage(newLeverage);
      localStorage.setItem("leverage", newLeverage.toString());
    },
    [setLeverage]
  );

  return (
    <div className={`container ${blur ? "blur" : ""}`}>
      <section className="flex flex-col space-y-5 mt-5">
        <div className="border-b px-5">
          <div>
            <h2 className="font-medium pb-3">Margin</h2>
            <div className="w-[34px] h-[3.5px] bg-primary"></div>
          </div>
        </div>
        <div className="px-5">
          <div className="flex flex-col space-y-5">
            <h3 className="text-white">Leverage</h3>
            <div>
              <Slider
                value={[leverageValues.indexOf(leverage) + 1]}
                min={1}
                max={leverageValues.length}
                step={1}
                onValueChange={handleLeverageChange}
              />
              <div className="flex items-center justify-between mt-5">
                {leverageValues.map((value, index) => (
                  <h2
                    className={`${
                      index !== 0 || index + 1 !== leverageValues.length
                        ? "ml-2"
                        : ""
                    }`}
                    key={value}
                  >
                    {value}x
                  </h2>
                ))}
              </div>
            </div>
            <h3 className="text-white">Collateral</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud Lorem ipsum dolor sit amet,
              consectetur adipiscing elit
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default SectionUserMargin;
