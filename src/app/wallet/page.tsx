import SectionWalletHero from "@/components/sections/wallet/hero";
import SectionWalletTable from "@/components/sections/wallet/table";

function Wallet() {
  return (
    <div className="py-5 container">
      <SectionWalletHero />
      <SectionWalletTable />
    </div>
  );
}

export default Wallet;
