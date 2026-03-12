import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { RankStats, RANK_AVERAGES } from "../types";
import { getAdjustedTargetStats } from "../utils/helpers";

interface StatsSummaryProps {
  userStats: RankStats;
  targetRank: string;
  winRate: number;
  filterLabel?: string;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ userStats, targetRank, winRate, filterLabel = "Últimas partidas" }) => {
  const targetStats = getAdjustedTargetStats(targetRank, userStats.lane);

  const radarData = [
    { subject: "Farm", A: (userStats.csPerMin / 10) * 100, B: (targetStats.csPerMin / 10) * 100 },
    { subject: "KDA", A: (userStats.kda / 5) * 100, B: (targetStats.kda / 5) * 100 },
    { subject: "Visão", A: (userStats.visionScore / 60) * 100, B: (targetStats.visionScore / 60) * 100 },
    { subject: "Dano", A: (userStats.damagePerMin / 1000) * 100, B: (targetStats.damagePerMin / 1000) * 100 },
  ];

  const winRateColor = winRate >= 60 ? "#4c92fc" : winRate >= 50 ? "#e1e1e1" : "#f24254";

  return (
    <div className="bg-[#212328] border border-[#31313c] rounded-lg p-4 mb-2 grid grid-cols-1 md:grid-cols-3 gap-4 items-center md:h-[161px]">
      {/* 20 Games Avg Box */}
      <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-[#31313c] h-full pb-4 md:pb-0 relative pt-2 overflow-hidden">
        <div className="absolute top-2 left-2 bg-[#1c1d21]/80 px-1.5 py-0.5 rounded text-[9px] font-black text-[#5de8c8] border border-[#5de8c8]/30 flex items-center gap-1 uppercase tracking-tighter">
          {userStats.lane === "UTILITY" ? "Sup" :
           userStats.lane === "BOTTOM" ? "Adc" :
           userStats.lane === "JUNGLE" ? "Jg" :
           userStats.lane === "MIDDLE" ? "Mid" :
           userStats.lane === "TOP" ? "Top" : "N/A"
          }
        </div>
        <p className="text-[12px] font-bold text-[#9e9eb1] mb-4 uppercase tracking-wide">{filterLabel}</p>
        <div className="relative w-24 h-24 mb-2">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#31313c]"
              strokeDasharray="100, 100"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              style={{ color: winRateColor }}
              strokeDasharray={`${winRate}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[18px] font-bold text-white">{winRate}%</span>
            <span className="text-[9px] text-[#9e9eb1] font-bold uppercase">Win Rate</span>
          </div>
        </div>
      </div>

      {/* Stats Numbers */}
      <div className="flex flex-col justify-center gap-2 px-6 border-b md:border-b-0 md:border-r border-[#31313c] h-full pb-4 md:pb-0">
        <div className="flex justify-between items-center">
          <span className="text-[13px] text-[#9e9eb1]">KDA Médio</span>
          <span className="text-[16px] font-bold text-[#e1e1e1]">{userStats.kda}:1</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[13px] text-[#9e9eb1]">CS / Min</span>
          <span className="text-[16px] font-bold text-[#e1e1e1]">{userStats.csPerMin}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[13px] text-[#9e9eb1]">Dano / Min</span>
          <span className="text-[16px] font-bold text-[#e1e1e1]">{userStats.damagePerMin}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[13px] text-[#9e9eb1]">Placar de Visão</span>
          <span className="text-[16px] font-bold text-[#e1e1e1]">{userStats.visionScore}</span>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="w-full h-[120px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#31313c" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#9e9eb1", fontSize: 10, fontWeight: 700 }} />
            <Radar name="Você" dataKey="A" stroke="#4c92fc" fill="#4c92fc" fillOpacity={0.5} />
            <Radar name={targetStats.displayName} dataKey="B" stroke="#f0ba65" fill="#f0ba65" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
