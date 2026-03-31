import React from "react";
import { SummonerData } from "../types";
import { getWinRate } from "../utils/helpers";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { RefreshCw } from "lucide-react";

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
    { day: "30 d+", lp: 25 },
    { day: "20 d+", lp: 45 },
    { day: "10 d+", lp: 35 },
    { day: "Hoje", lp: 60 },
  ];

  const LpChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1c1d21]/90 border border-white/10 rounded-lg p-2 shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-black text-[#9e9eb1] mb-1 uppercase tracking-widest">{payload[0].payload.day}</p>
          <p className="text-[12px] font-bold text-[#f0ba65]">{payload[0].value} LP</p>
        </div>
      );
    }
    return null;
  };

  const winRate = soloData ? getWinRate(soloData) : 0;
  const tier = soloData?.tier || "UNRANKED";
  const colorClass = TIER_COLORS[tier] || "text-[#9e9eb1]";

  return (
    <div className="liquid-glass rounded-xl p-5 md:p-6 flex flex-col xl:flex-row items-center justify-between gap-6 mb-4 mt-8 relative overflow-hidden group">
      
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#4c92fc]/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
      
      
      <div className="flex flex-col md:flex-row items-center gap-5 w-full xl:w-auto">
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4c92fc]/20 to-transparent rounded-2xl blur-sm" />
          <img
            src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/profileicon/${summoner.summoner.profileIconId}.png`}
            alt="Icon"
            className="w-[90px] h-[90px] rounded-2xl border-2 border-[#2b2c30] relative z-10"
            referrerPolicy="no-referrer"
          />
          <div className="absolute -bottom-2 translate-x-1/2 right-1/2 bg-[#1c1d21] border-2 border-[#2b2c30] text-[#e1e1e1] text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg z-20">
            {summoner.summoner.summonerLevel}
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-3 mb-2.5">
            <h2 className="text-[28px] md:text-[30px] font-black text-white tracking-tighter leading-none">
              {summoner.account.gameName}
              <span className="text-[#62636c] text-[20px] ml-1 font-bold">#{summoner.account.tagLine}</span>
            </h2>
            <button 
              onClick={onUpdate}
              className="group bg-[#4c92fc] hover:bg-[#5a9cff] text-white text-[11px] font-black px-4 py-1.5 rounded-lg transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(76,146,252,0.3)] hover:shadow-[0_0_25px_rgba(76,146,252,0.5)] hover:-translate-y-0.5 uppercase tracking-widest h-fit flex items-center gap-2 ml-2"
            >
              Atualizar
              <RefreshCw className="w-3 h-3 transition-transform duration-500 group-hover:rotate-180" />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-1.5 justify-center md:justify-start items-center">
            
            {streak && streak.count >= 2 && (
              <span className={`text-[9px] font-black px-2 py-1 rounded border shadow-sm ml-1 ${
                streak.type === "Vitória"
                  ? "bg-[#1e2a44] border-[#4c92fc]/30 text-[#4c92fc]"
                  : "bg-[#3d1c24] border-[#f24254]/30 text-[#f24254]"
              }`}>
                {streak.count} {streak.type === "Vitória" ? "VITÓRIAS" : "DERROTAS"} SEGUIDAS
              </span>
            )}
          </div>
        </div>
      </div>

      
      <div className="hidden xl:block w-[1px] h-[80px] bg-[#2b2c30] shrink-0" />

      
      {soloData ? (
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full xl:w-auto">
          
          <div className="flex items-center gap-4">
            <div className="w-[80px] h-[80px] shrink-0 flex items-center justify-center relative">
              <div className={`absolute inset-0 blur-2xl opacity-10 rounded-full ${colorClass.replace('text-', 'bg-')}`} />
              <img 
                src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${tier.toLowerCase()}.png`} 
                alt="Rank" 
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] scale-[3.5]" 
                onError={(e) => (e.currentTarget.style.display = "none")} 
              />
            </div>
            
            <div className="flex flex-col justify-center text-center sm:text-left min-w-[140px]">
              <span className="text-[10px] font-black text-[#62636c] uppercase tracking-widest mb-0.5">Ranqueada Solo</span>
              <h3 className={`text-[20px] font-black leading-tight capitalize ${colorClass}`}>
                {tier === "UNRANKED" ? "Unranked" : tier.toLowerCase()} {soloData?.rank || ""}
              </h3>
              <span className="text-[14px] font-bold text-[#e1e1e1] leading-none mb-2 block">{soloData?.leaguePoints || 0} LP</span>
              
              <div className="flex items-center justify-center sm:justify-start gap-3 text-[10px]">
                <div className="flex flex-col">
                  <span className="text-[#62636c] font-bold uppercase">{soloData?.wins || 0}W</span>
                  <span className="text-[#62636c] font-bold uppercase">{soloData?.losses || 0}L</span>
                </div>
                <div className="w-[1px] h-6 bg-[#2b2c30]" />
                <div className="flex flex-col items-center">
                  <span className={`${winRate >= 50 ? "text-[#5de8c8]" : "text-[#f24254]"} font-black text-[13px] leading-none`}>{winRate}%</span>
                  <span className="text-[8px] text-[#62636c] font-bold uppercase">Win Rate</span>
                </div>
              </div>
            </div>
          </div>

          
          <div className="flex flex-col w-[160px] h-[75px]">
            <div className="flex justify-between items-center mb-1.5 px-0.5">
              <span className="text-[9px] font-black text-[#62636c] uppercase tracking-wider">Últimos 30 dias</span>
              <span className="text-[9px] font-black text-[#5de8c8] flex items-center gap-0.5">
                <span className="text-[7px]">▲</span> 110 LP
              </span>
            </div>
            <div className="flex-1 w-full bg-[#16171d]/60 border border-[#2b2c30] rounded-xl overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rankDataChart} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLpHeader" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={tier === "UNRANKED" ? "#9e9eb1" : "#f0ba65"} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={tier === "UNRANKED" ? "#9e9eb1" : "#f0ba65"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip content={<LpChartTooltip />} cursor={false} />
                  <Area 
                    type="monotone" 
                    dataKey="lp" 
                    stroke={tier === "UNRANKED" ? "#9e9eb1" : "#f0ba65"} 
                    strokeWidth={2} 
                    fillOpacity={1} 
                    fill="url(#colorLpHeader)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      ) : (
        <div className="text-[#62636c] text-[13px] font-bold italic py-8">
          Nenhuma informação de ranque disponível.
        </div>
      )}
    </div>
  );
};

