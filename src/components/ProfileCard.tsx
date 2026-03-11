import React from "react";
import { SummonerData } from "../types";
import { getWinRate } from "../utils/helpers";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

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

interface ProfileCardProps {
  summoner: SummonerData;
  streak: { type: string; count: number } | null;
  onUpdate: () => void;
  soloData?: any;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ summoner, streak, onUpdate, soloData }) => {
  const rankDataChart = [
    { day: "30 d+", lp: 20 },
    { day: "20 d+", lp: 40 },
    { day: "10 d+", lp: 30 },
    { day: "Hoje", lp: 58 },
  ];

  const winRate = soloData ? getWinRate(soloData) : 0;
  const tier = soloData?.tier || "UNRANKED";
  const colorClass = TIER_COLORS[tier] || "text-[#9e9eb1]";

  return (
    <div className="bg-[#1c1d21] border border-[#2b2c30] rounded-lg p-6 flex flex-col xl:flex-row items-center justify-between gap-6 mb-4 mt-8">
      {/* LEFT: Perfil do Jogador */}
      <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="relative shrink-0">
        <img
          src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/profileicon/${summoner.summoner.profileIconId}.png`}
          alt="Icon"
          className="w-[100px] h-[100px] rounded-lg border border-[#2b2c30]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute -bottom-2 -left-2 bg-[#212328] border border-[#2b2c30] text-[#e1e1e1] text-[11px] font-bold px-2 py-0.5 rounded-full">
          {summoner.summoner.summonerLevel}
        </div>
      </div>

      <div className="flex-1 text-center md:text-left">
        <h2 className="text-[28px] font-bold text-white tracking-tight mb-2 flex items-center justify-center md:justify-start gap-4">
          <span>{summoner.account.gameName} <span className="text-[#9e9eb1] text-[20px] ml-1">#{summoner.account.tagLine}</span></span>
          <button 
            onClick={onUpdate}
            className="bg-[#4c92fc] hover:bg-[#357afb] text-white text-[12px] font-bold px-4 py-2 rounded transition-colors"
          >
            Atualizar
          </button>
        </h2>
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {/* DeepLoL typically shows old seasons ranks here */}
          <span className="text-[11px] font-bold bg-[#28292d] border border-[#2b2c30] text-[#9e9eb1] px-2 py-1 rounded">S2023 Gold 4</span>
          <span className="text-[11px] font-bold bg-[#28292d] border border-[#2b2c30] text-[#9e9eb1] px-2 py-1 rounded">S2022 Silver 1</span>
          
          {streak && streak.count >= 2 && (
            <span className={`text-[11px] font-bold border px-2 py-1 rounded ${
              streak.type === "Vitória"
                ? "bg-[#28344e] border-[#4c92fc] text-[#4c92fc]"
                : "bg-[#592c36] border-[#f24254] text-[#f24254]"
            }`}>
              {streak.count} {streak.type}s Seguidas
            </span>
          )}
        </div>
      </div>
      </div>

      {/* RIGHT: Estatísticas da SoloQ integradas ao cabeçalho */}
      {soloData && (
        <div className="flex flex-col sm:flex-row items-center justify-end gap-6 xl:border-l xl:border-[#2b2c30] xl:pl-8 w-full xl:w-auto mt-4 xl:mt-0">
          
          <div className="flex items-center gap-4">
            <div className="w-[120px] h-[120px] shrink-0 flex items-center justify-center overflow-hidden">
               <img 
                 src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${tier.toLowerCase()}.png`} 
                 alt="Rank" 
                 className="w-full h-full object-contain drop-shadow-md scale-[4.3]" 
                 onError={(e) => (e.currentTarget.style.display = "none")} 
               />
            </div>
            
            <div className="flex flex-col justify-center text-center sm:text-left min-w-[120px]">
               <span className="text-[12px] font-bold text-[#9e9eb1] mb-0.5">Ranqueada Solo</span>
               <div className="flex items-baseline justify-center sm:justify-start gap-2 mb-1">
                 <span className={`text-[20px] font-bold capitalize leading-none ${colorClass}`}>
                   {tier === "UNRANKED" ? "Unranked" : `${tier.toLowerCase()} ${soloData?.rank || ""}`}
                 </span>
               </div>
               <span className="text-[14px] font-bold text-[#e1e1e1] leading-none mb-2 block">{soloData?.leaguePoints || 0} LP</span>
               
               <div className="flex items-center justify-center sm:justify-start gap-3 justify-between text-[11px] text-[#9e9eb1]">
                 <span>{soloData?.wins || 0}W {soloData?.losses || 0}L</span>
                 <span><span className={winRate >= 50 ? "text-[#e84057] font-bold" : "text-[#e1e1e1] font-bold"}>{winRate}%</span> Win Rate</span>
               </div>
            </div>
          </div>

          <div className="flex flex-col w-[160px] h-[75px] mt-2 sm:mt-0">
             <div className="flex justify-between items-center mb-1 px-1">
                 <span className="text-[10px] font-bold text-[#9e9eb1]">Os Últimos 30d</span>
                 <span className="text-[10px] font-bold text-[#2eab7e]">▲ 110 LP</span>
             </div>
             <div className="flex-1 w-full bg-[#111215] border border-[#2b2c30] rounded overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={rankDataChart}>
                    <defs>
                      <linearGradient id="colorLpHeader" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f0ba65" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f0ba65" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="lp" stroke="#f0ba65" strokeWidth={2} fillOpacity={1} fill="url(#colorLpHeader)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

        </div>
      )}
    </div>
  );
};
