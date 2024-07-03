"use client";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import useBlurEffect from "@/hooks/blur";
function SectionHomeRanking() {
  const token = useAuthStore((state) => state.token);
  const blur = useBlurEffect();
  const [currentTab, setCurrentTab] = useState("Winners");
  const [filteredRanking, setFilteredRanking] = useState<any[]>([]);
  const fetchRankingData = useCallback(
    async (topType: string) => {
      try {
        const headers: HeadersInit | undefined = token
          ? { Authorization: token }
          : undefined;

        const response = await fetch(
          `https://api.pio.finance:2096/api/v1/get_top_assets?topType=${topType}`,
          {
            method: "GET",
            headers,
          }
        );

        if (response.ok) {
          const data = await response.json();
          const top3Assets = data.slice(0, 3);
          setFilteredRanking(top3Assets);
        } else {
          console.error("Error fetching ranking data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching ranking data:", error);
      }
    },
    [token]
  );

  useEffect(() => {
    if (token) {
      fetchRankingData(currentTab === "Winners" ? "gainers" : "losers");
    }
  }, [currentTab, token, fetchRankingData]);

  const toggleTab = (label: string) => {
    setCurrentTab(label);
    fetchRankingData(label === "Winners" ? "gainers" : "losers");
  };

  return (
    <div className={`container ${blur ? "blur" : ""}`}>
      <section className="flex flex-col space-y-5 mt-5">
        <div className="flex items-center space-x-3">
          <div className="w-[7px] h-[24px] bg-primary rounded-full"></div>
          <h1 className="font-medium">Ranking List</h1>
        </div>
        <Card className="p-0">
          <div className="flex flex-col items-center justify-center space-x-3">
            <div className="flex items-center space-x-3 justify-center mt-5">
              {["Winners", "Losers"].map((x, index) => {
                return (
                  <h3
                    onClick={() => toggleTab(x)}
                    key={x}
                    className={`px-4 py-2 border ${
                      currentTab == x
                        ? "text-primary bg-[#2B3139]"
                        : "text-white"
                    } rounded-xl cursor-pointer transition-all`}
                  >
                    {x}
                  </h3>
                );
              })}
            </div>
            <Table className="mt-5">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-full">
                    <h2 className="text-white font-medium">Futures</h2>
                  </TableHead>
                  <TableHead className="text-right">
                    <p>Price</p>
                  </TableHead>
                  <TableHead className="text-right">
                    <p>24h% Change</p>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRanking.map((x, index) => {
                  return (
                    <TableRow key={x.symbol + index}>
                      <TableCell className="text-left">
                        <div className="flex items-center space-x-2">
                          <Image
                            width={29}
                            height={29}
                            src="/home/$.svg"
                            alt={x.symbol}
                          />
                          <h2 className="text-white">{x.symbol}</h2>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <p>{x.price}</p>
                      </TableCell>
                      <TableCell
                        className={`text-right ${
                          x.changesPercentage > 0
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        <p>{x.changesPercentage.toFixed(2)}%</p>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>
    </div>
  );
}

export default SectionHomeRanking;
