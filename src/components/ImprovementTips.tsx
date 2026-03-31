import React, { useState, useRef, useEffect } from "react";
import { RankStats, RANK_AVERAGES } from "../types";
import { getAdjustedTargetStats } from "../utils/helpers";
import { ChevronRight, ChevronDown } from "lucide-react";
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

  const getTooltipText = (label: string) => {
    switch (label) {
      case "Farm Médio": return "Média de tropas abatidas por minuto. Calculado pelo total de minions e monstros abatidos dividido pelos minutos de duração da partida. Ex: 200 minions / 20 min = 10 CS/min.";
      case "Visão": return "Placar de Visão que a Riot usa. Avalia sentinelas colocadas, alas de controle, sentinelas destruídas e o tempo útil que a visão ficou disponível para o time durante toda a partida.";
      case "KDA": return "Abates (Kills) e Assistências (Assists) somados, então divididos pelas suas Mortes (Deaths). Exemplo: (5 Abates + 10 Assistências) / 2 Mortes = KDA 7.5.";
      case "Dano Médio": return "Dano Total Causado aos Campeões Inimigos dividido pela duração da partida em minutos. Indica sua constância em trocas e lutas durante o jogo (DPM).";
      default: return "";
    }
  };

  const renderStatTip = (label: string, userVal: number, targetVal: number, unit: string = "") => {
    const diff = userVal - targetVal;
    const isGood = diff >= 0;
    const percent = Math.min(100, Math.max(5, (userVal / (targetVal || 1)) * 100));
    const tooltipText = getTooltipText(label);

    return (
      <div className="bg-black/20 border-white/5 backdrop-blur-md p-4 rounded-2xl flex flex-col gap-3 shadow-inner relative group border cursor-help hover:z-50 transition-all">
        
        
        <div className="absolute opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 bg-[#15161e] border border-white/10 rounded-xl p-3 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 translate-y-2 group-hover:translate-y-0">
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#15161e] border-b border-r border-white/10 rotate-45" />
          <h5 className="text-[11px] font-black text-white mb-1 uppercase tracking-wider">{label}</h5>
          <p className="text-[10px] text-[#9e9eb1] font-medium leading-relaxed">{tooltipText}</p>
        </div>

        <div className="flex justify-between items-center relative z-10">
          <span className="font-black text-[11px] uppercase tracking-widest text-white leading-none">{label}</span>
          <span className={`text-[9px] font-black px-2 py-1 rounded-md tracking-tighter shadow-sm ${
            isGood 
              ? "text-[#5de8c8] border border-[#5de8c8]/20 bg-[#5de8c8]/5 uppercase" 
              : "text-[#f24254] border border-[#f24254]/20 bg-[#f24254]/5 uppercase"
          }`}>
            {isGood ? "Desempenho Ideal" : "Precisa Melhorar"}
          </span>
        </div>
        
        <div className="flex flex-col gap-1.5 relative z-10">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-[#62636c]">Você: <strong className="text-white ml-1">{userVal}{unit}</strong></span>
            <span className="text-[#62636c]">Média do Elo: <strong className="text-[#e1e1e1] ml-1">{targetVal}{unit}</strong></span>
          </div>
          <div className="h-[5px] w-full bg-[#1c1d21] rounded-full overflow-hidden border border-[#2b2c30]/50">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${isGood ? "bg-[#5de8c8] shadow-[0_0_8px_#5de8c866]" : "bg-[#f24254] shadow-[0_0_8px_#f2425466]"}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  const getLaneDisplay = (laneId: string) => {
    switch(laneId) {
      case "UTILITY": return "Suporte";
      case "BOTTOM": return "Atirador";
      case "JUNGLE": return "Selva";
      case "MIDDLE": return "Meio";
      case "TOP": return "Topo";
      default: return "Auto";
    }
  };

  return (
    <div className="liquid-glass rounded-2xl p-6 mt-2 shadow-2xl relative z-30">
      
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4c92fc]/5 blur-[60px] pointer-events-none" />
      </div>
      
      <div className="relative z-10 flex flex-col gap-4 mb-5">
        <h4 className="text-[13px] font-black text-white uppercase tracking-[0.15em] flex items-center gap-2.5">
          O que falta para eu subir?
        </h4>
        <p className="text-[11px] font-bold text-[#62636c] leading-relaxed">
          O sistema compara o seu modo de jogo atual com a média oficial de jogadores do Elo que você quer alcançar.
        </p>

        
        <div className="flex flex-col gap-3 bg-black/20 border border-white/10 p-4 rounded-2xl shadow-inner backdrop-blur-md">
          <span className="text-[10px] font-black text-[#62636c] uppercase tracking-[0.1em]">Rota para Comparação:</span>
          <div className="flex gap-2.5">
            {[
              { id: "TOP",     label: "TOP",  img: imgLaneTop },
              { id: "JUNGLE",  label: "JG",    img: imgLaneJungle },
              { id: "MIDDLE",  label: "MID",  img: imgLaneMid },
              { id: "BOTTOM",  label: "ADC",  img: imgLaneAdc },
              { id: "UTILITY", label: "SUP",  img: imgLaneSupport }
            ].map(lane => {
              const isSelected = selectedLane === lane.id;
              return (
                <button
                  key={lane.id}
                  onClick={() => setSelectedLane(lane.id)}
                  title={lane.label}
                  className={`
                    flex-1 flex flex-col items-center justify-center gap-1.5
                    py-2 px-1 rounded-xl border transition-all duration-300 relative
                    ${isSelected
                      ? "bg-[#C8AA6E]/20 border-[#C8AA6E]/80 shadow-[0_0_20px_rgba(200,170,110,0.15)] scale-[1.05] z-10 backdrop-blur-md"
                      : "bg-black/40 border-white/5 hover:border-white/20 hover:bg-black/60 opacity-60 hover:opacity-100"
                    }
                  `}
                >
                  <img
                    src={lane.img}
                    alt={lane.label}
                    className="w-[22px] h-[22px] object-contain transition-all duration-300"
                    style={{
                      filter: isSelected
                        ? "brightness(0) saturate(100%) invert(79%) sepia(30%) saturate(700%) hue-rotate(2deg) brightness(105%)"
                        : "brightness(0) invert(60%)"
                    }}
                  />
                  <span className={`text-[9px] font-black uppercase transition-colors ${isSelected ? "text-[#C8AA6E]" : "text-[#62636c]"}`}>
                    {lane.label}
                  </span>
                  {isSelected && (
                    <div className="absolute inset-0 border border-[#C8AA6E]/30 rounded-xl animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[9px] font-bold text-[#62636c] italic mt-0.5 tracking-tight">
            * Estatísticas de {targetRank} ajustadas para {getLaneDisplay(selectedLane)}
          </p>
        </div>
        
        
        <div className="flex flex-col gap-1.5 w-full relative" ref={dropdownRef}>
          <span className="text-[10px] font-black text-[#62636c] uppercase tracking-[0.1em] ml-1">Comparando Com:</span>
          
          <div 
            className="flex items-center justify-between bg-black/20 border border-white/10 p-3 rounded-2xl cursor-pointer hover:bg-black/30 transition-all backdrop-blur-md shadow-inner w-full"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center relative transition-transform duration-300 group-hover:scale-110 shrink-0">
                 <div className="absolute inset-0 bg-[#4c92fc]/5 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                 <img 
                   src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${targetRank.toLowerCase()}.png`} 
                   alt={targetRank} 
                   className="w-full h-full object-contain scale-[3.5] relative z-10 drop-shadow-[0_0_8px_rgba(0,0,0,0.4)]"
                   onError={(e) => (e.currentTarget.style.display = "none")} 
                 />
              </div>
              <span className="text-[14px] md:text-[15px] font-black text-white uppercase tracking-tighter truncate leading-none">
                {RANK_AVERAGES[targetRank]?.displayName || targetRank}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-[#62636c] shrink-0 transition-all duration-300 ${isOpen ? "rotate-180 text-white" : ""}`} />
          </div>

          
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1c1d21] border border-[#2b2c30] rounded-xl overflow-hidden shadow-2xl z-50">
              <div className="px-4 py-2 border-b border-[#2b2c30] bg-[#1c1d21]">
                 <span className="text-[11px] font-bold text-[#9e9eb1] tracking-wider">ELOS DISPONÍVEIS</span>
              </div>
              <div className="max-h-[260px] overflow-y-auto no-scrollbar">
                {Object.entries(RANK_AVERAGES).map(([key, val]) => (
                  <div
                    key={key}
                    onClick={() => {
                      setTargetRank(key);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-[#2b2c30]/50 transition-colors border-b border-[#2b2c30]/30 last:border-0 cursor-pointer ${
                      targetRank === key ? "bg-[#2b2c30]/30" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-[13px] font-black uppercase ${targetRank === key ? "text-white" : "text-[#9e9eb1]"}`}>
                         {val.displayName}
                      </span>
                    </div>
                    {targetRank === key && (
                      <span className="text-[10px] font-black bg-white/5 text-[#5de8c8] px-2 py-1 rounded-md">ATUAL</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      
      <div className="flex flex-col gap-2.5 mt-2">
        {renderStatTip("Farm Médio", Number(userStats.csPerMin.toFixed(1)), Number(targetStats.csPerMin.toFixed(1)), " /min")}
        {renderStatTip("Visão", Number(userStats.visionScore.toFixed(1)), Number(targetStats.visionScore.toFixed(1)))}
        {renderStatTip("KDA", Number(userStats.kda.toFixed(2)), Number(targetStats.kda.toFixed(2)))}
        {renderStatTip("Dano Médio", Number(userStats.damagePerMin.toFixed(0)), Number(targetStats.damagePerMin.toFixed(0)), " /min")}
      </div>

      
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#2b2c30]/50">
        <div className="flex flex-col items-center gap-3 w-1/3">
          <div className="w-16 h-16 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[#4c92fc]/5 rounded-full blur-xl" />
            <img 
              src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${currentTier.toLowerCase()}.png`} 
              alt="Current Rank" 
              className="w-full h-full object-contain scale-[3.5] relative z-10 drop-shadow-lg" 
              onError={(e) => (e.currentTarget.style.display = "none")} 
            />
          </div>
          <span className="text-[10px] font-black text-[#62636c] uppercase tracking-widest">Atual</span>
        </div>

        <div className="flex flex-col items-center">
            <ChevronRight className="w-6 h-6 text-[#2b2c30]" />
            <ChevronRight className="w-6 h-6 text-[#4c92fc] -mt-4 animate-pulse" />
        </div>

        <div className="flex flex-col items-center gap-3 w-1/3 text-center">
          <div className="w-16 h-16 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[#f0ba65]/5 rounded-full blur-xl" />
            <img 
              src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${targetRank.toLowerCase()}.png`} 
              alt="Target Rank" 
              className="w-full h-full object-contain scale-[3.5] relative z-10 drop-shadow-lg" 
              onError={(e) => (e.currentTarget.style.display = "none")} 
            />
          </div>
          <span className="text-[10px] font-black text-[#C8AA6E] uppercase tracking-widest">Meta</span>
        </div>
      </div>
    </div>
  );
};

