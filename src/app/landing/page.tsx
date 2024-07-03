import SectionHomeHero from "@/components/sections/home/hero";
import SectionHomeRanking from "@/components/sections/home/ranking";

export default function Home() {
  return (
    <div className="py-5 container">
      <SectionHomeHero />
      <SectionHomeRanking />
    </div>
  );
}
