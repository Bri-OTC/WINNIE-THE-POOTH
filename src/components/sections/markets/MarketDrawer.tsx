// components/sections/markets/MarketDrawer.tsx
import React, { useState, ReactNode, ChangeEvent } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableHeader } from "@/components/ui/table";
import { FaSearch } from "react-icons/fa";
import ResearchComponent from "./ResearchComponentold";

interface MarketDrawerProps {
  children: ReactNode;
}

interface Market {
  name: string;
  price: number;
  icon: string;
}

export function MarketDrawer({ children }: MarketDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);

  const searchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);
  };

  const handleMarketClick = (market: Market) => {
    setSelectedMarket(market);
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <div>{children}</div>
      </DrawerTrigger>
      <DrawerContent className="h-[75vh] max-h-[75vh] overflow-hidden w-[70%]">
        <div className="h-full flex flex-col px-4">
          <h1 className="font-medium mb-4">Markets</h1>
          <div className="flex items-center space-x-1 w-full bg-card rounded-lg px-5 mb-4">
            <FaSearch className="text-card-foreground" />
            <Input
              onChange={searchHandler}
              placeholder="Search"
              className="bg-card border-none"
            />
          </div>
          <div className="flex-grow overflow-y-auto">
            <Table>
              <TableHeader></TableHeader>
              <TableBody>
                <ResearchComponent
                  searchTerm={searchTerm}
                  onMarketClick={handleMarketClick}
                  selectedMarket={selectedMarket}
                  activeTab="all"
                  sortByPrice={false}
                  handleTabClick={() => {}}
                  toggleSortByPrice={() => {}}
                />
              </TableBody>
            </Table>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default MarketDrawer;
