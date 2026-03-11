import React, { useState, useRef, useEffect } from "react";
import { RankStats, RANK_AVERAGES } from "../types";
import { getAdjustedTargetStats } from "../utils/helpers";
import { ArrowRight, ChevronDown } from "lucide-react";

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
  const targetStats = getAdjustedTargetStats(targetRank, userStats.lane);
  
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

  const renderStatTip = (label: string, userVal: number, targetVal: number, unit: string = "") => {
    const diff = userVal - targetVal;
    const isGood = diff >= 0;
    const percent = Math.min(100, Math.max(10, (userVal / (targetVal || 1)) * 50));

    return (
      <div className="bg-[#111215] border border-[#2b2c30] p-3 rounded-lg flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className={`font-bold text-[12px] uppercase ${isGood ? "text-[#5de8c8]" : "text-[#f24254]"}`}>{label}</span>
          <span className="text-[10px] text-[#9e9eb1] font-bold">{isGood ? "EXCELENTE" : "MELHORAR"}</span>
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-[11px] text-[#9e9eb1]">
            <span>Você: <strong>{userVal}{unit}</strong></span>
            <span>Meta: <strong>{targetVal}{unit}</strong></span>
          </div>
          <div className="h-1.5 w-full bg-[#1c1d21] rounded-full overflow-hidden border border-[#2b2c30]">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${isGood ? "bg-[#5de8c8]" : "bg-[#f24254]"}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  const getTips = () => {
    return (
      <div className="flex flex-col gap-2">
        {renderStatTip("Farm", Number(userStats.csPerMin.toFixed(1)), Number(targetStats.csPerMin.toFixed(1)), " /min")}
        {renderStatTip("Visão", Number(userStats.visionScore.toFixed(1)), Number(targetStats.visionScore.toFixed(1)))}
        {renderStatTip("KDA", Number(userStats.kda.toFixed(2)), Number(targetStats.kda.toFixed(2)))}
        {renderStatTip("Dano", Number(userStats.damagePerMin.toFixed(0)), Number(targetStats.damagePerMin.toFixed(0)), " /min")}
      </div>
    );
  };

  return (
    <div className="bg-[#1c1d21] border border-[#2b2c30] rounded-lg p-5 mt-2">
      <div className="flex flex-col gap-3 mb-4">
        <h4 className="text-[14px] font-black text-[#e1e1e1] uppercase tracking-wide flex items-center gap-2">
          🚀 O que falta para eu subir?
        </h4>
        <p className="text-[12px] text-[#9e9eb1] leading-relaxed">
          O sistema compara o seu modo de jogo atual com a média oficial de jogadores do Elo que você quer alcançar.
        </p>

        <div className="flex flex-col gap-2 bg-[#111215] border border-[#2b2c30] p-3 rounded-lg">
          <span className="text-[11px] font-bold text-[#9e9eb1] uppercase tracking-wider">Rota para Comparação:</span>
          <div className="flex gap-1">
            {[
              { id: "AUTO", label: "Auto", icon: "🔍" },
              { id: "TOP", label: "Top", icon: "🛡️" },
              { id: "JUNGLE", label: "Jg", icon: "🌿" },
              { id: "MIDDLE", label: "Mid", icon: "🔥" },
              { id: "BOTTOM", label: "Adc", icon: "🏹" },
              { id: "UTILITY", label: "Sup", icon: "✨" }
            ].map(lane => (
              <button
                key={lane.id}
                onClick={() => setSelectedLane(lane.id)}
                className={`flex-1 py-1.5 px-1 rounded text-[10px] font-bold transition-all border ${
                  selectedLane === lane.id
                    ? "bg-[#5de8c8]/20 border-[#5de8c8] text-[#5de8c8]"
                    : "bg-[#1c1d21] border-[#2b2c30] text-[#9e9eb1] hover:border-[#9e9eb1]/50"
                }`}
                title={lane.label}
              >
                <div className="text-[14px] mb-0.5">{lane.icon}</div>
                {lane.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[#9e9eb1] italic mt-1">
            * Estatísticas de {targetRank} ajustadas para {
              userStats.lane === "UTILITY" ? "Suporte" :
              userStats.lane === "BOTTOM" ? "Atirador" :
              userStats.lane === "JUNGLE" ? "Selva" :
              userStats.lane === "MIDDLE" ? "Meio" : "Topo"
            }
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-[#111215] border border-[#2b2c30] p-2 rounded-lg mt-1 relative" ref={dropdownRef}>
          <span className="text-[12px] font-bold text-[#9e9eb1] whitespace-nowrap">Comparar com:</span>
          
          <div 
            className="flex items-center justify-between flex-1 border-l border-[#2b2c30] pl-3 py-1 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center overflow-hidden shrink-0">
                 <img 
                   src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${targetRank.toLowerCase()}.png`} 
                   alt={targetStats.displayName} 
                   className="w-full h-full object-contain scale-[4.0]"
                   onError={(e) => (e.currentTarget.style.display = "none")} 
                 />
              </div>
              <span className="text-[14px] font-black text-[#e1e1e1] uppercase">
                {targetStats.displayName}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-[#9e9eb1] transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </div>

          {/* Custom Dropdown Menu */}
          {isOpen && (
            <div className="absolute top-full right-0 mt-2 w-[220px] bg-[#1c1d21] border border-[#2b2c30] rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto no-scrollbar py-2">
                {Object.entries(RANK_AVERAGES).map(([key, val]) => (
                  <div
                    key={key}
                    onClick={() => {
                      setTargetRank(key);
                      setIsOpen(false);
                    }}
                    className={`px-4 py-2.5 cursor-pointer text-[13px] font-bold transition-colors uppercase ${
                      targetRank === key 
                        ? "bg-[#2b2c30] text-[#e1e1e1] border-l-2 border-[#5de8c8]" 
                        : "text-[#e1e1e1] hover:bg-[#2b2c30]/50 border-l-2 border-transparent"
                    }`}
                  >
                    {val.displayName}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-[#2b2c30] pt-4 mt-2">
        {getTips()}
      </div>

      <div className="flex items-center justify-around mt-6 pt-5 border-t border-[#2b2c30]">
        <div className="flex flex-col items-center justify-center gap-2 w-[110px]">
          <div className="w-[90px] h-[90px] flex items-center justify-center overflow-hidden">
            <img 
              src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${currentTier.toLowerCase()}.png`} 
              alt="Current Rank" 
              className="w-full h-full object-contain drop-shadow-md scale-[2.5]" 
              onError={(e) => (e.currentTarget.style.display = "none")} 
            />
          </div>
          <span className="text-[11px] font-bold text-[#9e9eb1] uppercase mt-[-10px]">Atual</span>
        </div>

        <ArrowRight className="w-8 h-8 text-[#4c92fc] animate-pulse mb-[20px]" />

        <div className="flex flex-col items-center justify-center gap-2 w-[110px]">
          <div className="w-[90px] h-[90px] flex items-center justify-center overflow-hidden">
            <img 
              src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${targetRank.toLowerCase()}.png`} 
              alt="Target Rank" 
              className="w-full h-full object-contain drop-shadow-md scale-[2.5]" 
              onError={(e) => (e.currentTarget.style.display = "none")} 
            />
          </div>
          <span className="text-[11px] font-bold text-[#f0ba65] uppercase mt-[-10px]">Meta</span>
        </div>
      </div>
    </div>
  );
};
