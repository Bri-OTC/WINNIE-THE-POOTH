"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRef } from "react";
import { toast } from "react-toastify";
import useBlurEffect from "@/hooks/blur";

function SectionUserReferrals() {
  const blur = useBlurEffect();
  const inputRef = useRef<HTMLInputElement>(null);

  const copyHandler = () => {
    navigator.clipboard.writeText(inputRef.current!.value);
    toast("Copied to clipboard");
  };

  return (
    <div className={`container ${blur ? "blur" : ""}`}>
      <div className="flex flex-col space-y-5 mt-5">
        <div className="border-b px-5">
          <div>
            <h2 className="font-medium pb-3">
              Referrals ( Coming on Mainnet )
            </h2>
            <div className="w-[34px] h-[3.5px] bg-primary"></div>
          </div>
        </div>
        <div className="px-5">
          <Card>
            <div className="flex flex-col">
              <h3 className="text-white leading-none">
                Enjoy discounted fees and get paid referral rebates. For more
                info, visit Referrals page
              </h3>
              <p className="mt-3">
                Share 50% trading fees of traders using your link{" "}
              </p>
              <div className="flex items-center space-x-4 mt-5">
                <Input
                  value={"https://app.pio.finance/"}
                  ref={inputRef}
                  className="outline-none"
                  placeholder="Input referrals code"
                />
                <Button onClick={copyHandler}>Copy</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SectionUserReferrals;
