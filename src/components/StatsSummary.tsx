import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { RankStats } from "../types";
import { getAdjustedTargetStats } from "../utils/helpers";

interface StatsSummaryProps {
  userStats: RankStats;
  targetRank: string;
  winRate: number;
  filterLabel?: string;
  matchCount?: number;
}

const StatBar: React.FC<{ 
  label: string; 
  value: number; 
  target: number; 
  max: number; 
  suffix?: string;
  color?: string;
}> = ({ label, value, target, max, suffix = "", color = "#4c92fc" }) => {
  const userWidth = Math.min(100, (value / max) * 100);
  const targetWidth = Math.min(100, (target / max) * 100);
  const isBeatingTarget = value >= target;

  return (
    <div className="flex flex-col gap-1 w-full group">
      <div className="flex justify-between items-end px-0.5">
        <span className="text-[10px] font-black text-[#56575f] uppercase tracking-wider">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className={`text-[13px] font-black ${isBeatingTarget ? "text-[#5de8c8]" : "text-white"}`}>
            {value}{suffix}
          </span>
          <span className="text-[9px] font-bold text-[#56575f]">/ {target}{suffix}</span>
        </div>
      </div>
      <div className="h-[6px] w-full bg-[#16171d] rounded-full overflow-hidden relative border border-[#2b2c30]/50">
        
        <div 
          className="absolute top-0 bottom-0 w-[2px] bg-[#f0ba65] z-20 shadow-[0_0_8px_#f0ba65]" 
          style={{ left: `${targetWidth}%` }}
        />
        
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out relative z-10"
          style={{ 
            width: `${userWidth}%`, 
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}44`
          }} 
        />
      </div>
    </div>
  );
};

export const StatsSummary: React.FC<StatsSummaryProps> = ({ userStats, targetRank, winRate, filterLabel = "Últimas partidas", matchCount = 20 }) => {
  const targetStats = getAdjustedTargetStats(targetRank, userStats.lane);

  const radarData = [
    { subject: "Farm", A: (userStats.csPerMin / 10) * 100, B: (targetStats.csPerMin / 10) * 100, origA: userStats.csPerMin.toFixed(1), origB: targetStats.csPerMin.toFixed(1) },
    { subject: "KDA", A: (userStats.kda / 5) * 100, B: (targetStats.kda / 5) * 100, origA: userStats.kda.toFixed(2), origB: targetStats.kda.toFixed(2) },
    { subject: "Visão", A: (userStats.visionScore / 60) * 100, B: (targetStats.visionScore / 60) * 100, origA: userStats.visionScore.toFixed(0), origB: targetStats.visionScore.toFixed(0) },
    { subject: "Dano", A: (userStats.damagePerMin / 1000) * 100, B: (targetStats.damagePerMin / 1000) * 100, origA: userStats.damagePerMin.toFixed(0), origB: targetStats.damagePerMin.toFixed(0) },
  ];

  const RadarCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1c1d21]/90 border border-white/10 rounded-lg p-2 shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-black text-white mb-1.5 uppercase">{label}</p>
          <p className="text-[10px] font-bold text-[#4c92fc]">Você: {payload[0]?.payload.origA}</p>
          <p className="text-[10px] font-bold text-[#f0ba65]">Média: {payload[0]?.payload.origB}</p>
        </div>
      );
    }
    return null;
  };

  const winRateColor = winRate >= 60 ? "#5de8c8" : winRate >= 50 ? "#4c92fc" : "#f24254";

  return (
    <div className="liquid-glass rounded-2xl p-6 mb-3 flex flex-col md:flex-row gap-8 items-center shadow-2xl relative overflow-hidden group hover:brightness-110 transition-all duration-300">
      
      
      
      <div className="flex flex-col items-center justify-center shrink-0 w-full md:w-[150px] relative pt-2 group/chart cursor-default">
        <p className="text-[9px] font-black text-[#62636c] mb-4 uppercase tracking-[0.15em] w-full text-center truncate px-2">{filterLabel}</p>
        
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.4)]" />
          <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 36 36">
            <circle
              cx="18" cy="18" r="15.9155"
              fill="none"
              stroke="#212328"
              strokeWidth="3"
            />
            <circle
              cx="18" cy="18" r="15.9155"
              fill="none"
              stroke={winRateColor}
              strokeWidth="3.5"
              strokeDasharray={`${winRate}, 100`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[20px] font-black text-white leading-none tracking-tighter">{winRate}%</span>
            <span className="text-[8px] text-[#62636c] font-black uppercase tracking-tighter mt-1">Win Rate</span>
          </div>

          <div className="absolute top-[105%] left-[50%] -translate-x-1/2 bg-[#1c1d21]/95 text-[#9e9eb1] text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/10 shadow-2xl opacity-0 group-hover/chart:opacity-100 transition-opacity duration-300 pointer-events-none z-[100] whitespace-nowrap backdrop-blur-md">
            Baseado em <span className="text-white font-black">{matchCount}</span> partidas
          </div>
        </div>
      </div>

      
      <div className="flex flex-col justify-between gap-3.5 flex-1 w-full py-1">
        <StatBar 
          label="KDA Médio" 
          value={userStats.kda} 
          target={targetStats.kda} 
          max={6} 
          suffix=":1" 
        />
        <StatBar 
          label="Farm (CS / Min)" 
          value={userStats.csPerMin} 
          target={targetStats.csPerMin} 
          max={10} 
          color="#5de8c8"
        />
        <StatBar 
          label="Dano / Min" 
          value={userStats.damagePerMin} 
          target={targetStats.damagePerMin} 
          max={1200}
        />
        <StatBar 
          label="Visão" 
          value={userStats.visionScore} 
          target={targetStats.visionScore} 
          max={60}
          color="#a855f7"
        />
      </div>

      
      <div className="w-full md:w-[150px] h-[130px] shrink-0 border-l border-[#2b2c30] pl-6 hidden xl:block">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
            <PolarGrid stroke="#2b2c30" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#62636c", fontSize: 9, fontWeight: 900 }} />
            <Tooltip content={<RadarCustomTooltip />} cursor={false} />
            <Radar name="Você" dataKey="A" stroke="#4c92fc" fill="#4c92fc" fillOpacity={0.4} />
            <Radar name={targetStats.displayName} dataKey="B" stroke="#f0ba65" fill="#f0ba65" fillOpacity={0.2} strokeDasharray="3 3" />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

