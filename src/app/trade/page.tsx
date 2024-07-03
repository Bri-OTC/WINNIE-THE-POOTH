import SectionTradeChart from "@/components/sections/trade/chart";
import SectionTradeHeader from "@/components/sections/trade/header";
import SectionTradeOrderTrades from "@/components/sections/trade/order_trades";
import SectionTradePositionsOrders from "@/components/sections/trade/positions_orders";

function Trade() {
  return (
    <div className="py-5">
      <SectionTradeHeader />
      <SectionTradeChart />
      <SectionTradeOrderTrades />
      <SectionTradePositionsOrders />
    </div>
  );
}

export default Trade;
