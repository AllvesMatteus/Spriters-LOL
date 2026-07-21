import React, { useState, useRef, useEffect } from "react";
import { RankStats, RANK_AVERAGES, EnhancedPerformanceData, ImprovementPriority, PillarScore } from "../types";
import { getAdjustedTargetStats } from "../utils/helpers";
import { ChevronDown, AlertCircle, ArrowUpRight, TrendingUp } from "lucide-react";
import imgLaneTop from "../assets/images/lanes/lane-top.png";
import imgLaneJungle from "../assets/images/lanes/lane-jungle.png";
import imgLaneMid from "../assets/images/lanes/lane-mid.png";
import imgLaneAdc from "../assets/images/lanes/lane-adc.png";
import imgLaneSupport from "../assets/images/lanes/lane-support.png";

interface ImprovementTipsProps {
  userStats: RankStats;
  targetRank: string;
  setTargetRank: (rank: string) => void;
  currentTier?: string;
  selectedLane: string;
  setSelectedLane: (lane: string) => void;
  performanceData?: EnhancedPerformanceData | null;
}

export const ImprovementTips: React.FC<ImprovementTipsProps> = ({
  userStats,
  targetRank,
  setTargetRank,
  currentTier = "UNRANKED",
  selectedLane,
  setSelectedLane,
  performanceData
}) => {
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

  const lanes = [
    { id: "TOP", label: "TOP", img: imgLaneTop },
    { id: "JUNGLE", label: "JG", img: imgLaneJungle },
    { id: "MIDDLE", label: "MID", img: imgLaneMid },
    { id: "BOTTOM", label: "ADC", img: imgLaneAdc },
    { id: "UTILITY", label: "SUP", img: imgLaneSupport }
  ];

  const metricDisplayInfo: Record<string, { label: string; unit: string; explanation: string }> = {
    csPerMin: {
      label: "Farm Médio",
      unit: " CS/min",
      explanation: "Tropas e monstros abatidos por minuto de jogo."
    },
    kda: {
      label: "KDA Geral",
      unit: "",
      explanation: "Soma de Abates e Assistências dividida pelas Mortes."
    },
    visionPerMin: {
      label: "Visão por Minuto",
      unit: " /min",
      explanation: "Placar de visão ganho a cada minuto de jogo."
    },
    damagePerMin: {
      label: "Dano por Minuto",
      unit: " DPM",
      explanation: "Dano total causado a campeões inimigos por minuto."
    },
    goldPerMin: {
      label: "Ouro por Minuto",
      unit: " GPM",
      explanation: "Média de ouro total acumulado por minuto de jogo."
    },
    kp: {
      label: "Participação em Abates",
      unit: "%",
      explanation: "Porcentagem de abates do time em que você participou."
    },
    objectiveDmgPerMin: {
      label: "Dano Objetivos / min",
      unit: "",
      explanation: "Dano causado a torres, dragões e barão por minuto."
    }
  };

  const hasEnhancedData = !!performanceData && !!performanceData.pillars;
  const targetStats = getAdjustedTargetStats(targetRank, selectedLane);

  const statsList = hasEnhancedData ? (() => {
    const list: Array<{
      key: string;
      label: string;
      currentVal: number;
      targetVal: number;
      unit: string;
      explanation: string;
      distribution: any;
    }> = [];
    const seen = new Set<string>();

    Object.entries(performanceData!.pillars).forEach(([key, pillar]) => {
      const pScore = pillar as PillarScore;
      const metricKey = key === "objectives" ? "objectiveDmgPerMin"
        : key === "combat" ? "kda"
          : key === "teamfight" ? "damagePerMin"
            : key === "vision" ? "visionPerMin"
              : key === "kp" ? "kp"
                : "csPerMin";

      if (seen.has(metricKey)) return;
      seen.add(metricKey);

      const info = metricDisplayInfo[metricKey] || {
        label: key,
        unit: "",
        explanation: "Métrica de performance."
      };

      list.push({
        key,
        label: info.label,
        currentVal: pScore.distribution.current,
        targetVal: pScore.distribution.target,
        unit: info.unit,
        explanation: info.explanation,
        distribution: pScore.distribution
      });
    });
    return list;
  })() : [
    {
      key: "csPerMin",
      label: "Farm Médio",
      currentVal: Number(userStats.csPerMin.toFixed(1)),
      targetVal: Number(targetStats.csPerMin.toFixed(1)),
      unit: "/min",
      explanation: "Tropas e monstros abatidos divididos pelos minutos de jogo.",
      distribution: null
    },
    {
      key: "visionPerMin",
      label: "Visão Geral",
      currentVal: Number(userStats.visionScore.toFixed(1)),
      targetVal: Number(targetStats.visionScore.toFixed(1)),
      unit: "",
      explanation: "Média do Placar de Visão oficial da Riot nas partidas.",
      distribution: null
    },
    {
      key: "kda",
      label: "KDA",
      currentVal: Number(userStats.kda.toFixed(2)),
      targetVal: Number(targetStats.kda.toFixed(2)),
      unit: "",
      explanation: "Soma de Abates e Assistências dividida pelas Mortes.",
      distribution: null
    },
    {
      key: "damagePerMin",
      label: "Dano Médio",
      currentVal: Number(userStats.damagePerMin.toFixed(0)),
      targetVal: Number(targetStats.damagePerMin.toFixed(0)),
      unit: "/min",
      explanation: "Dano causado a campeões por minuto de jogo (DPM).",
      distribution: null
    }
  ];

  const overallScore = hasEnhancedData ? performanceData!.overallIndex : 50;

  const priorities: ImprovementPriority[] = hasEnhancedData
    ? performanceData!.improvementPriorities.slice(0, 1)
    : [];

  const getDifficultyColor = (diff: string) => {
    if (diff === "LOW") return "text-[#5de8c8] bg-[#5de8c8]/10";
    if (diff === "MEDIUM") return "text-[#f97316] bg-[#f97316]/10";
    return "text-[#f24254] bg-[#f24254]/10";
  };

  const getDifficultyLabel = (diff: string) => {
    if (diff === "LOW") return "Fácil";
    if (diff === "MEDIUM") return "Média";
    return "Difícil";
  };

  const formatStatValue = (key: string, val: number): string => {
    if (key === "combat" || key === "kda") return val.toFixed(1);
    if (key === "vision" || key === "visionPerMin") return val.toFixed(2);
    if (key === "laning" || key === "farming" || key === "csPerMin") return val.toFixed(1);
    return Math.round(val).toString();
  };

  const SEMANTIC_STATES: Record<string, { label: string; color: string; bgColor: string; barColor: string }> = {
    WELL_BELOW: {
      label: "Muito Abaixo",
      color: "text-[#f24254]",
      bgColor: "bg-[#f24254]/10",
      barColor: "bg-[#f24254]"
    },
    BELOW: {
      label: "Abaixo do Esperado",
      color: "text-[#f97316]",
      bgColor: "bg-[#f97316]/10",
      barColor: "bg-[#f97316]"
    },
    WITHIN_EXPECTED: {
      label: "Dentro da Faixa",
      color: "text-[#5de8c8]",
      bgColor: "bg-[#5de8c8]/10",
      barColor: "bg-[#5de8c8]"
    },
    ABOVE: {
      label: "Acima do Esperado",
      color: "text-[#f0ba65]",
      bgColor: "bg-[#f0ba65]/10",
      barColor: "bg-[#f0ba65]"
    },
    EXCEPTIONAL: {
      label: "Excepcional",
      color: "text-[#d184f4]",
      bgColor: "bg-[#d184f4]/10",
      barColor: "bg-[#d184f4]"
    }
  };

  const getSemanticState = (dist: any, currentVal: number, targetVal: number): string => {
    if (dist && dist.semanticState) return dist.semanticState;
    const ratio = currentVal / (targetVal || 1);
    if (ratio < 0.7) return "WELL_BELOW";
    if (ratio < 0.9) return "BELOW";
    if (ratio <= 1.1) return "WITHIN_EXPECTED";
    if (ratio <= 1.3) return "ABOVE";
    return "EXCEPTIONAL";
  };

  return (
    <div className="liquid-glass rounded-2xl p-5 mt-2 shadow-2xl relative z-30 hover:z-60 flex flex-col gap-5 transition-all">
      <div className="flex items-start justify-between w-full">
        <div>
          <h4 className="text-[12px] font-black text-white uppercase tracking-wider">
            Metas de Desempenho
          </h4>
          <p className="text-[10px] font-bold text-[#62636c] leading-relaxed mt-1">
            Compare seus números robustos com a distribuição do elo alvo por rota.
          </p>
        </div>
        <div className="relative group/title-info cursor-help normal-case hover:z-50 shrink-0 mt-0.5">
          <button className="text-[#62636c] hover:text-white transition-colors flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <div className="absolute right-0 bottom-[130%] bg-[#1c1d21]/95 text-[#9e9eb1] text-[10px] leading-relaxed p-2.5 rounded-xl border border-white/10 shadow-2xl opacity-0 pointer-events-none group-hover/title-info:opacity-100 transition-opacity duration-200 w-56 z-[100] backdrop-blur-md font-bold">
            Usa a tendência central robusta (trimmed mean) do seu histórico recente, ponderada por recência de partidas, comparando com a distribuição do elo alvo.
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
              className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${isSelected
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
                  className={`w-full px-4 py-2.5 flex items-center justify-between hover:bg-[#2b2c30]/50 transition-colors border-b border-[#2b2c30]/30 last:border-0 cursor-pointer ${targetRank === key ? "bg-[#2b2c30]/30" : ""
                    }`}
                >
                  <span className={`text-[12px] font-black uppercase ${targetRank === key ? "text-[#5de8c8]" : "text-[#9e9eb1]"}`}>
                    {val.displayName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Target Metrics List */}
      <div className="flex flex-col gap-3.5 bg-black/10 border border-white/5 rounded-2xl p-4">
        {statsList.map(stat => {
          const dist = stat.distribution;
          const completionPercent = dist ? dist.completion : Math.min(100, Math.max(5, (stat.currentVal / (stat.targetVal || 1)) * 100));
          const semanticState = getSemanticState(dist, stat.currentVal, stat.targetVal);
          const stateColors = SEMANTIC_STATES[semanticState] || SEMANTIC_STATES.WITHIN_EXPECTED;

          return (
            <div key={stat.key} className="flex flex-col gap-1.5 relative">
              <div className="flex justify-between items-center text-[10px] font-black leading-none">
                <span className="text-[#9e9eb1] font-bold text-[10.5px] tracking-wide">{stat.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black text-white">
                    {formatStatValue(stat.key, stat.currentVal)}
                    <span className="text-[#62636c] font-bold"> / {formatStatValue(stat.key, stat.targetVal)}{stat.unit}</span>
                  </span>

                  <div className="relative group/info-icon cursor-help shrink-0">
                    <svg className="w-3.5 h-3.5 text-[#62636c] group-hover/info-icon:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>

                    {/* Tooltip detail per target metric */}
                    <div className="absolute right-0 bottom-[130%] mb-1 hidden group-hover/info-icon:flex flex-col gap-1.5 p-3 bg-[#1c1d21]/98 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md text-[10px] w-60 z-[9999] text-left font-bold text-[#9e9eb1] pointer-events-none select-none">
                      <div className="text-white text-[11px] font-black border-b border-white/5 pb-1 uppercase tracking-wide">
                        {stat.label}
                      </div>
                      {dist ? (
                        <>
                          <div className="flex justify-between">
                            <span>Seu Percentil:</span>
                            <span className="text-white font-black">{dist.percentile.toFixed(0)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Faixa Esperada:</span>
                            <span className="text-white font-black">{dist.expectedRange[0]} – {dist.expectedRange[1]}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span className={`${stateColors.color} font-black`}>
                              {stateColors.label}
                            </span>
                          </div>

                          {/* Mathematical Memory Breakdown */}
                          <div className="border-t border-white/5 mt-1.5 pt-1.5 flex flex-col gap-0.5 text-[8.5px] text-[#62636c] italic">
                            <div className="font-black text-[#9e9eb1] uppercase mb-0.5 text-[7.5px] tracking-wider">Memória de Cálculo:</div>
                            <div>Desvio (σ) = 15% × {dist.target} = {Number((dist.target * 0.15).toFixed(2))}</div>
                            <div>Z = ({dist.current} - {dist.target}) / {Number((dist.target * 0.15).toFixed(2))} = {((dist.current - dist.target) / Math.max(0.05, dist.target * 0.15)).toFixed(2)}</div>
                            <div className="text-white font-bold">Percentil = CDF(Z) = {dist.percentile.toFixed(0)}%</div>
                          </div>
                        </>
                      ) : (
                        <div>{stat.explanation}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                {/* Expected Range Shaded Track from 30% to 70% */}
                <div className="absolute top-0 bottom-0 left-[30%] w-[40%] bg-white/5 border-l border-r border-white/10" />

                {/* Player's actual position filled bar */}
                <div
                  className={`h-full rounded-full transition-all duration-500 ${stateColors.barColor}`}
                  style={{ width: `${completionPercent}%`, opacity: 0.85 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Recommendation Panel */}
      {hasEnhancedData && (
        priorities.length > 0 ? (
          <div className="flex flex-col gap-2.5 bg-black/20 border border-[#f0ba65]/20 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-[#f0ba65] text-[10px] font-black uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Foco recomendado pelo Coach Virtual</span>
            </div>

            <div className="flex flex-col gap-3">
              {priorities.map((p) => (
                <div key={p.metric} className="flex flex-col gap-1.5 text-[11px] font-bold border-b border-white/5 last:border-0 pb-2.5 last:pb-0">
                  <span className="text-white font-black text-[12px]">Foco Recomendado: {p.label}</span>
                  <p className="text-[10px] text-[#9e9eb1] font-semibold leading-relaxed">
                    {p.explanation}
                  </p>
                  <div className="flex justify-between text-[9px] text-[#62636c] font-black uppercase mt-1">
                    <span>Atual: <strong className="text-white">{p.currentValue}</strong> (meta: {p.targetValue})</span>
                    <span className="text-[#f0ba65] font-black">Ganho: +{p.estimatedGain}% no Overall</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 bg-black/20 border border-[#5de8c8]/20 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 text-[#5de8c8] text-[10px] font-black uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Desempenho Saudável</span>
            </div>
            <p className="text-[10.5px] text-[#9e9eb1] font-semibold leading-relaxed">
              Parabéns! Suas estatísticas estão todas dentro ou acima da faixa esperada para o elo selecionado. Continue jogando com essa consistência para subir de rank rapidamente!
            </p>
          </div>
        )
      )}

      {/* Target Overall Index Ring comparison */}
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
            <span className="mt-0.5 text-[#62636c] tracking-wide">Progresso de Performance: {overallScore}%</span>
          </div>
          <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-[#5de8c8] rounded-full transition-all duration-500"
              style={{ width: `${overallScore}%` }}
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
