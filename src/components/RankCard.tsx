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

const RANK_LABELS: Record<string, string> = {
  IRON: "Ferro",
  BRONZE: "Bronze",
  SILVER: "Prata",
  GOLD: "Ouro",
  PLATINUM: "Platina",
  EMERALD: "Esmeralda",
  DIAMOND: "Diamante",
  MASTER: "Mestre",
  GRANDMASTER: "Grão-Mestre",
  CHALLENGER: "Desafiante",
  UNRANKED: "Unranked",
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
    <div className={`liquid-glass rounded-[20px] mb-4 overflow-hidden ${!data && "opacity-60"}`}>
      <div className="flex border-b border-white/10 bg-black/20">
        <button 
          className={`flex-1 py-3 text-[13px] font-bold transition-all relative ${
            activeTab === "Solo" 
              ? "text-white" 
              : "text-[#9e9eb1] hover:text-[#e1e1e1] hover:bg-white/5"
          }`}
          onClick={() => setActiveTab("Solo")}
        >
          Ranqueada Solo
          {activeTab === "Solo" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4c92fc] shadow-[0_0_8px_#4c92fc]" />
          )}
        </button>
        <button 
          className={`flex-1 py-3 text-[13px] font-bold transition-all border-l border-white/10 relative ${
            activeTab === "Flex" 
              ? "text-white" 
              : "text-[#9e9eb1] hover:text-[#e1e1e1] hover:bg-white/5"
          }`}
          onClick={() => setActiveTab("Flex")}
        >
          Ranqueada Flex
          {activeTab === "Flex" && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4c92fc] shadow-[0_0_8px_#4c92fc]" />
          )}
        </button>
      </div>
      
      <div className="p-5">
        <div className="flex items-center gap-5">
          <div className="w-[84px] h-[84px] rounded-full flex items-center justify-center shrink-0 relative">
            <div className={`absolute inset-0 blur-xl opacity-20 rounded-full ${colorClass.replace('text-', 'bg-')}`} />
            {data ? (
              <img
                src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${tier.toLowerCase()}.png`}
                alt="Rank"
                className="w-full h-full object-contain drop-shadow-2xl scale-[3.5] relative z-10"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <div className="w-10 h-10 rounded-full" />
            )}
          </div>
          
          <div className="flex flex-col flex-1 justify-center relative w-full gap-0.5">
            <span className="text-[9px] font-black text-[#62636c] uppercase tracking-widest leading-none mb-0.5">
              Ranqueada {activeTab}
            </span>
            <h3 className={`text-[20px] font-black uppercase tracking-tight ${colorClass} leading-none mb-0.5`}>
              {tier === "UNRANKED" ? "Unranked" : `${RANK_LABELS[tier] || tier} ${data?.rank || ""}`}
            </h3>
            <p className="text-[13px] font-black text-white leading-none mb-3">
              {data?.leaguePoints || 0} <span className="text-[10px] text-[#9e9eb1] font-bold">LP</span>
            </p>
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-[#9e9eb1] leading-tight text-right w-full">
                  {data?.wins || 0}<span className="text-[#5de8c8] ml-0.5 font-black">W</span>
                </span>
                <span className="text-[10px] font-bold text-[#9e9eb1] leading-tight text-right w-full">
                  {data?.losses || 0}<span className="text-[#f24254] ml-1 font-black">L</span>
                </span>
              </div>
              
              <div className="w-[1px] h-6 bg-[#2b2c30]/70" />
              
              <div className="flex flex-col gap-1 items-start">
                <span className={`text-[13px] font-black leading-none tracking-tight ${winRate >= 50 ? "text-[#5de8c8]" : "text-[#f24254]"}`}>
                  {winRate}%
                </span>
                <span className="text-[8px] font-black text-[#62636c] leading-none tracking-widest">
                  WIN RATE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
