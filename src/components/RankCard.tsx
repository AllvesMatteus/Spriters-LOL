import React, { useState } from "react";
import { getWinRate } from "../utils/helpers";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";

const TIER_COLORS: Record<string, string> = {
  IRON: "text-[#a19d94]",
  BRONZE: "text-[#cd7e5c]",
  SILVER: "text-[#87929d]",
  GOLD: "text-[#f0ba65]",
  PLATINUM: "text-[#3aa99a]",
  EMERALD: "text-[#2eab7e]",
  DIAMOND: "text-[#7b8ef3]",
  MASTER: "text-[#d184f4]",
  GRANDMASTER: "text-[#ef7f7a]",
  CHALLENGER: "text-[#81ddf5]",
};

interface RankCardProps {
  soloData: any;
  flexData: any;
}

export const RankCard: React.FC<RankCardProps> = ({ soloData, flexData }) => {
  const [activeTab, setActiveTab] = useState<"Solo" | "Flex">("Solo");
  
  const data = activeTab === "Solo" ? soloData : flexData;
  const winRate = getWinRate(data);
  const tier = data?.tier || "UNRANKED";
  const colorClass = TIER_COLORS[tier] || "text-[#9e9eb1]";

  return (
    <div className={`bg-[#212328] border border-[#31313c] rounded-lg mb-2 overflow-hidden ${!data && "opacity-60"}`}>
      <div className="bg-[#212328] flex border-b border-[#31313c]">
        <button 
          className={`flex-1 py-3 text-[13px] font-bold transition-colors ${
            activeTab === "Solo" 
              ? "bg-transparent text-[#e1e1e1] border-b-2 border-[#2eab7e]" 
              : "text-[#9e9eb1] hover:text-[#e1e1e1]"
          }`}
          onClick={() => setActiveTab("Solo")}
        >
          Ranqueada Solo
        </button>
        <button 
          className={`flex-1 py-3 text-[13px] font-bold transition-colors border-l border-[#31313c] ${
            activeTab === "Flex" 
              ? "bg-transparent text-[#e1e1e1] border-b-2 border-[#2eab7e]" 
              : "text-[#9e9eb1] hover:text-[#e1e1e1]"
          }`}
          onClick={() => setActiveTab("Flex")}
        >
          Ranqueada Flex
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-[84px] h-[84px] bg-[#111215] rounded-full flex items-center justify-center shrink-0">
            {data ? (
              <img
                src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${tier.toLowerCase()}.png`}
                alt="Rank"
                className="w-10 h-10 object-contain drop-shadow-lg scale-[8]"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <div className="w-10 h-10 rounded-full" />
            )}
          </div>
          
          <div className="flex flex-col flex-1 justify-center gap-1">
            <div className="flex justify-between items-center">
              <p className={`text-[16px] font-bold ${colorClass} uppercase`}>
                {tier === "UNRANKED" ? "Unranked" : `${tier.toLowerCase()} ${data?.rank || ""}`}
              </p>
              <p className="text-[12px] font-bold text-[#9e9eb1]">
                {data ? `${data.wins}W ${data.losses}L` : "0W 0L"}
              </p>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-[12px] font-medium text-[#e1e1e1]">
                {data?.leaguePoints || 0} LP
              </p>
              <p className="text-[12px] font-medium text-[#9e9eb1]">
                A taxa de vitória {winRate}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
