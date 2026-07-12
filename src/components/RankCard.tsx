import React, { useState } from "react";
import { getWinRate } from "../utils/helpers";

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
  performanceRank?: {
    tier: string;
    rank: string;
    points: number;
  } | null;
}

export const RankCard: React.FC<RankCardProps> = ({ soloData, flexData, performanceRank }) => {
  const [activeTab, setActiveTab] = useState<"Solo" | "Flex">("Solo");
  
  const data = activeTab === "Solo" ? soloData : flexData;
  const winRate = getWinRate(data);
  const tier = data?.tier || "UNRANKED";
  const colorClass = TIER_COLORS[tier] || "text-[#9e9eb1]";

  const perfTier = performanceRank?.tier || "UNRANKED";
  const perfColorClass = TIER_COLORS[perfTier] || "text-[#9e9eb1]";

  return (
    <div className={`relative z-50 liquid-glass rounded-2xl mb-4 transition-all duration-300 ${!data ? "opacity-60" : ""}`}>
      <div className="flex border-b border-white/10 bg-black/20 rounded-t-2xl overflow-hidden">
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
      
      <div className="p-5 flex flex-col md:flex-row lg:flex-col gap-6 md:gap-4 lg:gap-6 divide-y md:divide-y-0 lg:divide-y md:divide-x lg:divide-x-0 divide-white/10">
        
        <div className="flex items-center gap-4 flex-1 pb-4 md:pb-0 lg:pb-4 lg:pr-0 md:pr-4">
          <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center shrink-0 relative">
            <div className={`absolute inset-0 blur-xl opacity-20 rounded-full ${colorClass.replace('text-', 'bg-')}`} />
            {data ? (
              <img
                src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${tier.toLowerCase()}.png`}
                alt="Rank Atual"
                className="w-full h-full object-contain drop-shadow-2xl scale-[3.2] relative z-10 pointer-events-none"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-[#62636c] font-black">?</div>
            )}
          </div>
          
          <div className="flex flex-col flex-1 justify-center relative w-full gap-0.5 min-w-0">
            <span className="text-[9px] font-black text-[#62636c] uppercase tracking-widest leading-none mb-0.5 truncate">
              Elo Atual
            </span>
            <h3 className={`text-[17px] font-black uppercase tracking-tight ${colorClass} leading-none mb-0.5 truncate`}>
              {tier === "UNRANKED" ? "Unranked" : `${RANK_LABELS[tier] || tier} ${data?.rank || ""}`}
            </h3>
            <p className="text-[12px] font-black text-white leading-none mb-2">
              {data?.leaguePoints || 0} <span className="text-[9px] text-[#9e9eb1] font-bold">LP</span>
            </p>
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-[#9e9eb1] leading-tight">
                  {data?.wins || 0}<span className="text-[#5de8c8] ml-0.5 font-black">W</span>
                </span>
                <span className="text-[10px] font-bold text-[#9e9eb1] leading-tight">
                  {data?.losses || 0}<span className="text-[#f24254] ml-0.5 font-black">L</span>
                </span>
              </div>
              
              <div className="w-[1px] h-5 bg-white/10" />
              
              <div className="flex flex-col gap-0.5 items-start">
                <span className={`text-[12px] font-black leading-none tracking-tight ${winRate >= 50 ? "text-[#5de8c8]" : "text-[#f24254]"}`}>
                  {winRate}%
                </span>
                <span className="text-[7px] font-black text-[#62636c] leading-none tracking-widest uppercase">
                  Win Rate
                </span>
              </div>
            </div>
          </div>
        </div>

        {performanceRank && (
          <div className="flex items-center gap-4 flex-1 pt-4 md:pt-0 lg:pt-4 md:pl-4 lg:pl-0">
            <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center shrink-0 relative">
              <div className={`absolute inset-0 blur-xl opacity-20 rounded-full ${perfColorClass.replace('text-', 'bg-')}`} />
              {perfTier !== "UNRANKED" ? (
                <img
                  src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${perfTier.toLowerCase()}.png`}
                  alt="Rank Performance"
                  className="w-full h-full object-contain drop-shadow-2xl scale-[3.2] relative z-10 pointer-events-none"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-[#62636c] font-black">?</div>
              )}
            </div>
            
            <div className="flex flex-col flex-1 justify-center relative w-full gap-0.5 group/perf min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-black text-[#62636c] uppercase tracking-widest leading-none mb-0.5 truncate">
                  Elo de Performance
                </span>
                <div className="relative inline-block cursor-help shrink-0 hover:z-50">
                  <svg className="w-4 h-4 text-[#62636c] hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-[130%] bg-[#1c1d21]/95 text-[#9e9eb1] text-[10px] leading-relaxed p-2.5 rounded-xl border border-white/10 shadow-2xl opacity-0 pointer-events-none group-hover/perf:opacity-100 transition-opacity duration-300 w-56 z-[100] backdrop-blur-md">
                    Este elo é calculado de forma não oficial com base no seu desempenho (KDA, dano, farm, visão, objetivos e lutas) comparado aos seus companheiros de equipe e oponentes nas últimas partidas.
                  </div>
                </div>
              </div>
              <h3 className={`text-[17px] font-black uppercase tracking-tight ${perfColorClass} leading-none mb-2 truncate`}>
                {perfTier === "UNRANKED" ? "Unranked" : `${RANK_LABELS[perfTier] || perfTier} ${performanceRank.rank || ""}`}
              </h3>
              <div className="text-[9px] font-bold text-[#62636c] uppercase tracking-wider">
                Desempenho Real
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};
