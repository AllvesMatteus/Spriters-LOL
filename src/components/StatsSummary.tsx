import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { RankStats } from "../types";
import { getBenchmark } from "../utils/benchmarks";

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
  expectedRange?: [number, number];
  max: number;
  suffix?: string;
  color?: string;
}> = ({ label, value, target, expectedRange, max, suffix = "", color = "#4c92fc" }) => {
  const userWidth = Math.min(100, (value / max) * 100);
  const targetWidth = Math.min(100, (target / max) * 100);

  const isWithinOrAbove = expectedRange ? value >= expectedRange[0] : value >= target;

  let rangeLeft = 0;
  let rangeWidth = 0;
  if (expectedRange) {
    rangeLeft = Math.min(100, (expectedRange[0] / max) * 100);
    const rangeRight = Math.min(100, (expectedRange[1] / max) * 100);
    rangeWidth = Math.max(0, rangeRight - rangeLeft);
  }

  return (
    <div className="flex flex-col gap-1 w-full group/bar relative">
      <div className="flex justify-between items-end px-0.5">
        <span className="text-[10px] font-black text-[#56575f] uppercase tracking-wider">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className={`text-[13px] font-black ${isWithinOrAbove ? "text-[#5de8c8]" : "text-white"}`}>
            {value}{suffix}
          </span>
          <span className="text-[9px] font-bold text-[#56575f]">/ {target}{suffix}</span>
        </div>
      </div>
      <div className="h-[6px] w-full bg-[#16171d] rounded-full overflow-hidden relative border border-[#2b2c30]/50">

        {/* Shaded Expected Range IQR background */}
        {expectedRange && rangeWidth > 0 && (
          <div
            className="absolute top-0 bottom-0 bg-[#f0ba65]/10 border-l border-r border-[#f0ba65]/25 z-0"
            style={{ left: `${rangeLeft}%`, width: `${rangeWidth}%` }}
          />
        )}

        {/* Target median line */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-[#f0ba65] z-20 shadow-[0_0_8px_#f0ba65]"
          style={{ left: `${targetWidth}%` }}
        />

        {/* User performance filling */}
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out relative z-10"
          style={{
            width: `${userWidth}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}44`
          }}
        />
      </div>

      {/* Shaded area explanation popup */}
      {expectedRange && (
        <div className="absolute right-0 bottom-[120%] mb-1 hidden group-hover/bar:flex flex-col gap-1 p-2 bg-[#1c1d21]/95 border border-white/10 rounded-lg shadow-2xl text-[9px] text-[#9e9eb1] font-bold z-[9999] pointer-events-none select-none">
          <div>Faixa Esperada (IQR): {expectedRange[0].toFixed(1)} – {expectedRange[1].toFixed(1)}</div>
          <div>Sua posição: {value >= expectedRange[0] && value <= expectedRange[1] ? "Dentro do esperado" : value > expectedRange[1] ? "Acima do esperado (Ótimo)" : "Abaixo do esperado"}</div>
        </div>
      )}
    </div>
  );
};

export const StatsSummary: React.FC<StatsSummaryProps> = ({ userStats, targetRank, winRate, filterLabel = "Últimas partidas", matchCount = 20 }) => {
  const role = userStats.lane || "MIDDLE";
  const benchmark = getBenchmark(targetRank, role);

  const targetCS = benchmark.csPerMin.median;
  const targetKDA = benchmark.kda.median;
  const targetVision = benchmark.visionPerMin.median * 30;
  const targetDamage = benchmark.damagePerMin.median;

  const radarData = [
    { subject: "Farm", A: (userStats.csPerMin / 10) * 100, B: (targetCS / 10) * 100, origA: userStats.csPerMin.toFixed(1), origB: targetCS.toFixed(1) },
    { subject: "KDA", A: (userStats.kda / 5) * 100, B: (targetKDA / 5) * 100, origA: userStats.kda.toFixed(2), origB: targetKDA.toFixed(2) },
    { subject: "Visão", A: (userStats.visionPerMin / 2.0) * 100, B: (benchmark.visionPerMin.median / 2.0) * 100, origA: userStats.visionPerMin.toFixed(2), origB: benchmark.visionPerMin.median.toFixed(2) },
    { subject: "Dano", A: (userStats.damagePerMin / 1200) * 100, B: (targetDamage / 1200) * 100, origA: userStats.damagePerMin.toFixed(0), origB: targetDamage.toFixed(0) },
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
    <div className="liquid-glass rounded-2xl p-6 mb-3 flex flex-col md:flex-row gap-8 items-center shadow-2xl relative group hover:brightness-110 transition-all duration-300">

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
          target={targetKDA}
          expectedRange={[benchmark.kda.q1, benchmark.kda.q3]}
          max={6}
          suffix=":1"
        />
        <StatBar
          label="Farm (CS / Min)"
          value={userStats.csPerMin}
          target={targetCS}
          expectedRange={[benchmark.csPerMin.q1, benchmark.csPerMin.q3]}
          max={10}
          color="#5de8c8"
        />
        <StatBar
          label="Dano / Min"
          value={userStats.damagePerMin}
          target={targetDamage}
          expectedRange={[benchmark.damagePerMin.q1, benchmark.damagePerMin.q3]}
          max={1200}
        />
        <StatBar
          label="Placar Visão / min"
          value={userStats.visionPerMin}
          target={benchmark.visionPerMin.median}
          expectedRange={[benchmark.visionPerMin.q1, benchmark.visionPerMin.q3]}
          max={2.0}
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
            <Radar name={targetRank} dataKey="B" stroke="#f0ba65" fill="#f0ba65" fillOpacity={0.2} strokeDasharray="3 3" />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
