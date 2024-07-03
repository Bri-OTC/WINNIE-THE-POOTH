"use client";

import PopupSettingUser from "@/components/popup/setting_user";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { HiOutlineCog6Tooth } from "react-icons/hi2";
import { useWallets } from "@privy-io/react-auth";
import useBlurEffect from "@/hooks/blur";

function SectionUserHeader() {
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const blur = useBlurEffect();
  return (
    <div className={`container ${blur ? "blur" : ""}`}>
      <section className="px-5">
        <div className="flex items-center justify-between">
          <h1>User</h1>
          <div className="flex items-center space-x-2"></div>
        </div>
        <h3 className="text-accent-foreground mt-5">{wallet?.address}</h3>
      </section>
    </div>
  );
}

export default SectionUserHeader;
