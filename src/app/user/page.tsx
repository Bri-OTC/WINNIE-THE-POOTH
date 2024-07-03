import SectionUserFees from "@/components/sections/user/fees";
import SectionUserHeader from "@/components/sections/user/header";
import SectionUserMargin from "@/components/sections/user/margin";
import SectionUserReferrals from "@/components/sections/user/referrals";

function User() {
  return (
    <div className="py-5">
      <SectionUserHeader />
      <SectionUserMargin />
      <SectionUserReferrals />
      <SectionUserFees />
    </div>
  );
}

export default User;
