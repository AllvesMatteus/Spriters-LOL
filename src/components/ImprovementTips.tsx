import React, { useState, useRef, useEffect } from "react";
import { RankStats, RANK_AVERAGES } from "../types";
import { getAdjustedTargetStats } from "../utils/helpers";
import { ChevronDown } from "lucide-react";
import imgLaneTop     from "../assets/images/lanes/lane-top.png";
import imgLaneJungle  from "../assets/images/lanes/lane-jungle.png";
import imgLaneMid     from "../assets/images/lanes/lane-mid.png";
import imgLaneAdc     from "../assets/images/lanes/lane-adc.png";
import imgLaneSupport from "../assets/images/lanes/lane-support.png";

interface ImprovementTipsProps {
  userStats: RankStats;
  targetRank: string;
  setTargetRank: (rank: string) => void;
  currentTier?: string;
  selectedLane: string;
  setSelectedLane: (lane: string) => void;
}

export const ImprovementTips: React.FC<ImprovementTipsProps> = ({ 
  userStats, 
  targetRank, 
  setTargetRank, 
  currentTier = "UNRANKED",
  selectedLane,
  setSelectedLane
}) => {
  const targetStats = getAdjustedTargetStats(targetRank, selectedLane);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const stats = [
    {
      label: "Farm Médio",
      userVal: Number(userStats.csPerMin.toFixed(1)),
      targetVal: Number(targetStats.csPerMin.toFixed(1)),
      unit: "/min",
      explanation: "Tropas e monstros abatidos divididos pelos minutos de jogo."
    },
    {
      label: "Visão Geral",
      userVal: Number(userStats.visionScore.toFixed(1)),
      targetVal: Number(targetStats.visionScore.toFixed(1)),
      unit: "",
      explanation: "Média do Placar de Visão oficial da Riot nas partidas."
    },
    {
      label: "KDA",
      userVal: Number(userStats.kda.toFixed(2)),
      targetVal: Number(targetStats.kda.toFixed(2)),
      unit: "",
      explanation: "Soma de Abates e Assistências dividida pelas Mortes."
    },
    {
      label: "Dano Médio",
      userVal: Number(userStats.damagePerMin.toFixed(0)),
      targetVal: Number(targetStats.damagePerMin.toFixed(0)),
      unit: "/min",
      explanation: "Dano causado a campeões por minuto de jogo (DPM)."
    }
  ];

  const completedCount = stats.filter(s => s.userVal >= s.targetVal).length;

  const lanes = [
    { id: "TOP",     label: "TOP",  img: imgLaneTop },
    { id: "JUNGLE",  label: "JG",   img: imgLaneJungle },
    { id: "MIDDLE",  label: "MID",  img: imgLaneMid },
    { id: "BOTTOM",  label: "ADC",  img: imgLaneAdc },
    { id: "UTILITY", label: "SUP",  img: imgLaneSupport }
  ];

  return (
    <div className="liquid-glass rounded-2xl p-5 mt-2 shadow-2xl relative z-30 hover:z-60 flex flex-col gap-5 transition-all">
      <div className="flex items-start justify-between w-full">
        <div>
          <h4 className="text-[12px] font-black text-white uppercase tracking-wider">
            Metas de Desempenho
          </h4>
          <p className="text-[10px] font-bold text-[#62636c] leading-relaxed mt-1">
            Compare seus números recentes com a média do elo que deseja alcançar.
          </p>
        </div>
        <div className="relative group/title-info cursor-help normal-case hover:z-50 shrink-0 mt-0.5">
          <button className="text-[#62636c] hover:text-white transition-colors flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <div className="absolute right-0 bottom-[130%] bg-[#1c1d21]/95 text-[#9e9eb1] text-[10px] leading-relaxed p-2.5 rounded-xl border border-white/10 shadow-2xl opacity-0 pointer-events-none group-hover/title-info:opacity-100 transition-opacity duration-200 w-56 z-[100] backdrop-blur-md font-bold">
            Compara seu desempenho médio contra as estatísticas oficiais do elo alvo, ajustadas automaticamente para a rota escolhida.
          </div>
        </div>
      </div>

      <div className="flex bg-black/20 rounded-xl p-1 border border-white/5">
        {lanes.map(lane => {
          const isSelected = selectedLane === lane.id;
          return (
            <button
              key={lane.id}
              onClick={() => setSelectedLane(lane.id)}
              className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                isSelected 
                  ? "bg-white/10 text-white shadow border border-white/10" 
                  : "text-[#62636c] hover:text-[#9e9eb1] border border-transparent"
              }`}
            >
              <img 
                src={lane.img} 
                className="w-3.5 h-3.5 object-contain" 
                style={{ filter: isSelected ? 'brightness(0) invert(1)' : 'brightness(0) invert(0.5)' }} 
                alt=""
              />
              <span>{lane.label}</span>
            </button>
          );
        })}
      </div>

      <div className="relative" ref={dropdownRef}>
        <span className="text-[9px] font-black text-[#62636c] uppercase tracking-wider block mb-1.5 ml-0.5">Comparar Com:</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-black/20 border border-white/5 px-4 py-2 rounded-xl hover:bg-black/30 transition-all text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative overflow-visible shrink-0 flex items-center justify-center">
              <img
                src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${targetRank.toLowerCase()}.png`}
                className="w-full h-full object-contain scale-[3.2] pointer-events-none"
                alt=""
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
            <span className="text-[12px] font-black uppercase text-white tracking-wider">
              {RANK_AVERAGES[targetRank]?.displayName || targetRank}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-[#62636c] transition-transform ${isOpen ? "rotate-180 text-white" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1c1d21]/95 backdrop-blur-md border border-[#2b2c30] rounded-xl overflow-hidden shadow-2xl z-50">
            <div className="px-4 py-2 border-b border-[#2b2c30]">
              <span className="text-[10px] font-bold text-[#9e9eb1] tracking-wider">ELOS DISPONÍVEIS</span>
            </div>
            <div className="max-h-[220px] overflow-y-auto no-scrollbar">
              {Object.entries(RANK_AVERAGES).map(([key, val]) => (
                <div
                  key={key}
                  onClick={() => {
                    setTargetRank(key);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 flex items-center justify-between hover:bg-[#2b2c30]/50 transition-colors border-b border-[#2b2c30]/30 last:border-0 cursor-pointer ${
                    targetRank === key ? "bg-[#2b2c30]/30" : ""
                  }`}
                >
                  <span className={`text-[12px] font-black uppercase ${targetRank === key ? "text-[#5de8c8]" : "text-[#9e9eb1]"}`}>
                    {val.displayName}
                  </span>
                  {targetRank === key && (
                    <span className="text-[9px] font-black bg-[#5de8c8]/10 text-[#5de8c8] px-1.5 py-0.5 rounded border border-[#5de8c8]/20">ATIVO</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3.5 bg-black/10 border border-white/5 rounded-2xl p-4">
        {stats.map(stat => {
          const isGood = stat.userVal >= stat.targetVal;
          const diff = stat.userVal - stat.targetVal;
          const diffText = diff >= 0 ? `+${diff.toFixed(1)}` : `${diff.toFixed(1)}`;
          const progressPercent = Math.min(100, Math.max(5, (stat.userVal / (stat.targetVal || 1)) * 100));

          return (
            <div key={stat.label} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10px] font-black leading-none">
                <span className="text-[#9e9eb1] uppercase tracking-wider">{stat.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className={isGood ? "text-[#5de8c8]" : "text-[#f24254]"}>
                    {stat.userVal} / {stat.targetVal} {stat.unit} ({diffText})
                  </span>
                  <div className="relative group/stat-info cursor-help normal-case hover:z-50 shrink-0">
                    <svg className="w-4 h-4 text-[#62636c] hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute right-0 bottom-[130%] bg-[#1c1d21]/95 text-[#9e9eb1] text-[9px] leading-relaxed p-2.5 rounded-xl border border-white/10 shadow-2xl opacity-0 pointer-events-none group-hover/stat-info:opacity-100 transition-opacity duration-200 w-48 z-[100] backdrop-blur-md font-bold">
                      {stat.explanation}
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isGood ? "bg-[#5de8c8]" : "bg-[#f24254]"}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 bg-black/20 border border-white/5 rounded-2xl p-4">
        <div className="w-16 h-16 relative overflow-visible shrink-0 flex items-center justify-center">
          <img 
            src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${currentTier.toLowerCase()}.png`}
            className="w-full h-full object-contain scale-[3.5] pointer-events-none" 
            alt=""
            onError={(e) => (e.currentTarget.style.display = "none")} 
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col text-[9px] font-black uppercase mb-1.5 text-left">
            <span className="text-white text-[10px] leading-tight tracking-wider">Meta: {RANK_AVERAGES[targetRank]?.displayName || targetRank}</span>
            <span className="mt-0.5 text-[#62636c] tracking-wide">{completedCount} de 4 metas atingidas</span>
          </div>
          <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-[#5de8c8] rounded-full transition-all duration-500" 
              style={{ width: `${(completedCount / 4) * 100}%` }}
            />
          </div>
        </div>
        <div className="w-16 h-16 relative overflow-visible shrink-0 flex items-center justify-center">
          <img 
            src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${targetRank.toLowerCase()}.png`}
            className="w-full h-full object-contain scale-[3.5] pointer-events-none" 
            alt=""
            onError={(e) => (e.currentTarget.style.display = "none")} 
          />
        </div>
      </div>
    </div>
  );
};
