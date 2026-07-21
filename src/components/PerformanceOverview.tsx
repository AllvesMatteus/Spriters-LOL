import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer } from "recharts";
import { EnhancedPerformanceData, MatchPerformanceData, PillarScore, AnalysisContext } from "../types";

interface PerformanceOverviewProps {
  performanceData: EnhancedPerformanceData;
  region: string;
  role: string;
}

const getScoreColor = (score: number) => {
  if (score < 40) return "#f24254";
  if (score < 55) return "#f97316";
  if (score < 75) return "#5de8c8";
  if (score < 90) return "#f0ba65";
  return "#d184f4";
};

const getQueueLabel = (queueId: number): string => {
  if (queueId === 420) return "Ranqueada Solo";
  if (queueId === 440) return "Ranqueada Flex";
  if (queueId === 450) return "ARAM";
  return "Fila Normal / Clash";
};

const ProgressRing: React.FC<{
  score: number;
  label: string;
  sublabel: string;
  color: string;
  tooltipText?: string;
}> = ({ score, label, sublabel, color, tooltipText }) => {
  const radius = 28;
  const stroke = 3.5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, score) / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative shrink-0 p-3 border border-white/5 rounded-2xl bg-black/20 flex-1 min-w-[110px] hover:bg-black/30 transition-all group/ring cursor-default">
      <p className="text-[9px] font-black text-[#62636c] mb-2.5 uppercase tracking-[0.12em] text-center w-full truncate">{label}</p>
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
          <circle
            className="text-white/5"
            strokeWidth={stroke}
            stroke="currentColor"
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[14px] font-black text-white leading-none">{Math.round(score)}</span>
        </div>
      </div>
      <span className="text-[8px] text-[#62636c] font-black uppercase mt-2.5 tracking-wider">{sublabel}</span>

      {tooltipText && (
        <div className="absolute bottom-[115%] left-1/2 -translate-x-1/2 w-48 bg-[#1c1d21]/95 border border-white/10 rounded-xl p-2.5 shadow-2xl opacity-0 pointer-events-none group-hover/ring:opacity-100 transition-opacity duration-200 z-[9999] text-[9.5px] leading-relaxed text-[#9e9eb1] font-bold text-center">
          {tooltipText}
        </div>
      )}
    </div>
  );
};

const StatProgressBar: React.FC<{
  label: string;
  pillarKey: string;
  pillarScore: PillarScore;
  iconPath: string;
  context: AnalysisContext;
}> = ({ label, pillarKey, pillarScore, iconPath, context }) => {
  const { score, distribution } = pillarScore;
  const color = getScoreColor(score);
  const percentage = score;

  const roleNameMap: Record<string, string> = {
    TOP: "Top Laner",
    JUNGLE: "Jungle",
    MIDDLE: "Mid Laner",
    BOTTOM: "Atirador (ADC)",
    UTILITY: "Suporte (SUP)"
  };

  const metricDetailLabels: Record<string, string> = {
    csPerMin: "Farm por Minuto",
    kda: "KDA Geral",
    visionPerMin: "Placar de Visão / min",
    damagePerMin: "Dano Campeões / min",
    goldPerMin: "Ouro Obtido / min",
    kp: "Participação em Abates %",
    objectiveDmgPerMin: "Dano em Objetivos / min"
  };

  const metricName = metricDetailLabels[distribution.sampleSize > 0 ? (pillarKey === "objectives" ? "objectiveDmgPerMin" : pillarKey === "combat" ? "kda" : pillarKey === "teamfight" ? "damagePerMin" : pillarKey === "vision" ? "visionPerMin" : "csPerMin") : "csPerMin"] || "Métrica";

  return (
    <div className="flex flex-col gap-1 w-full relative group/bar">
      <div className="flex justify-between items-center px-0.5 cursor-help">
        <span className="text-[10px] font-black text-[#9e9eb1] uppercase tracking-wider flex items-center gap-1.5">
          <img src={iconPath} alt={label} className="w-3 h-3 opacity-60" onError={(e) => (e.currentTarget.style.display = "none")} />
          {label}
        </span>
        <span className="text-[12px] font-black text-white">{score} <span className="text-[8px] text-[#62636c]">/ 100</span></span>
      </div>
      <div className="h-[6px] w-full bg-[#16171d] rounded-full overflow-hidden border border-white/5 relative">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}55`
          }}
        />
      </div>

      {/* Advanced Statistical Hover Tooltip */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[125%] mb-2 hidden group-hover/bar:flex flex-col gap-2 p-3 bg-[#1c1d21]/98 border border-white/10 rounded-xl shadow-2xl backdrop-blur-md text-[11.5px] w-64 z-[9999] pointer-events-none select-none text-left font-bold text-[#9e9eb1]">
        <div className="flex justify-between border-b border-white/5 pb-1.5 mb-1.5 items-center">
          <span className="font-black text-white text-[12.5px]">{label}</span>
          <span className="text-[#5de8c8] font-black text-[10px] bg-[#5de8c8]/10 px-1.5 py-0.5 rounded-md">
            {distribution.percentile.toFixed(0)}º Percentil
          </span>
        </div>

        <div className="flex flex-col gap-1 text-[11px]">
          <div className="text-[9px] text-[#62636c] uppercase tracking-wider mb-0.5 font-black">
            Métrica: {metricName}
          </div>
          <div className="flex justify-between">
            <span>Seu Trimmed Mean:</span>
            <span className="text-white font-black">{distribution.current}</span>
          </div>
          <div className="flex justify-between">
            <span>Mediana Populacional:</span>
            <span className="text-white font-black">{distribution.target}</span>
          </div>
          <div className="flex justify-between">
            <span>Faixa Esperada (IQR):</span>
            <span className="text-white font-black">{distribution.expectedRange[0]} – {distribution.expectedRange[1]}</span>
          </div>
          <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/5">
            <span>Progresso da Meta (CDF):</span>
            <span className="text-[#5de8c8] font-black">{distribution.percentile.toFixed(0)}%</span>
          </div>
        </div>

        <div className="w-full h-[1px] bg-white/5 my-1" />

        <div className="flex flex-col gap-1 text-[9px] text-[#62636c] font-black uppercase">
          <div className="flex justify-between">
            <span>Amostras: N={distribution.sampleSize} (conf: {(distribution.confidence * 100).toFixed(0)}%)</span>
            <span>{context.region.toUpperCase()} • P.{context.patch}</span>
          </div>
          <div className="flex justify-between">
            <span>Campeão: {context.championName || "Nenhum"}</span>
            <span>{roleNameMap[context.role] || context.role}</span>
          </div>
          <div className="text-center mt-1 text-[8.5px] border-t border-white/5 pt-1 text-[#f0ba65]/90">
            Fila: {getQueueLabel(context.queueId)}
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label, history }: any) => {
  if (active && payload && payload.length) {
    const index = history.length - label;
    const m = history[index];
    if (!m) return null;

    const isWin = m.win;
    const winColor = isWin ? "text-[#5de8c8]" : "text-[#f24254]";
    const winText = isWin ? "Vitória" : "Derrota";
    const kdaStr = `${m.kda.k}/${m.kda.d}/${m.kda.a}`;

    return (
      <div className="bg-[#1c1d21]/95 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs flex flex-col gap-2 w-52 z-[100]">
        <div className="flex items-center gap-2">
          <img
            src={`https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/${m.championName === "FiddleSticks" ? "Fiddlesticks" : m.championName}.png`}
            alt={m.championName}
            className="w-9 h-9 rounded-lg border border-white/10"
            onError={(e) => {
              e.currentTarget.src = "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/-1.png";
            }}
          />
          <div className="flex flex-col gap-0.5">
            <span className="font-black text-[#e1e1e1] leading-none">Partida #{label}</span>
            <span className={`text-[10px] font-black leading-none ${winColor}`}>{winText}</span>
            <span className="text-[9px] text-[#9e9eb1] font-bold mt-0.5 leading-none truncate max-w-[120px]">{m.championName} • {kdaStr}</span>
          </div>
        </div>
        <div className="w-full h-[1px] bg-white/5 my-0.5" />
        <div className="flex flex-col gap-1 text-[10px] font-bold">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#5de8c8]" />
              <span className="text-[#9e9eb1]">Seu Score:</span>
            </div>
            <span className="text-[#e1e1e1] font-black">{Number(m.scores.total).toFixed(0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#4c92fc]" />
              <span className="text-[#9e9eb1]">Média do Time:</span>
            </div>
            <span className="text-[#e1e1e1] font-black">{Number(m.teamAverageScore).toFixed(0)}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#f24254]" />
              <span className="text-[#9e9eb1]">Média do Inimigo:</span>
            </div>
            <span className="text-[#e1e1e1] font-black">{Number(m.enemyAverageScore).toFixed(0)}</span>
          </div>
        </div>
        <div className="text-[9px] text-[#62636c] font-black uppercase text-center mt-1">
          Clique para ir à partida
        </div>
      </div>
    );
  }
  return null;
};

export const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ performanceData, region, role }) => {
  const { playerAverage, teamAverage, enemyAverage, history, overallIndex, consistencyScore, pillars } = performanceData;

  const chartData = [...history].reverse().map((m, idx) => ({
    name: idx + 1,
    "Seu Score": m.scores.total,
    "Média do Time": m.teamAverageScore,
    "Média do Inimigo": m.enemyAverageScore,
  }));

  const handleChartClick = (state: any) => {
    if (state && state.activeTooltipIndex !== undefined) {
      const clickedIndex = state.activeTooltipIndex;
      const historyIndex = history.length - 1 - clickedIndex;
      const match = history[historyIndex];
      if (match) {
        const element = document.getElementById(`match-container-${match.matchId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });

          element.classList.add("ring-2", "ring-[#4c92fc]/50", "scale-[1.01]");
          setTimeout(() => {
            element.classList.remove("ring-2", "ring-[#4c92fc]/50", "scale-[1.01]");
          }, 1500);
        }
      }
    }
  };

  return (
    <div className="liquid-glass rounded-2xl p-6 mb-4 shadow-2xl relative overflow-visible z-20 hover:z-50 flex flex-col gap-6 transition-all duration-300">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-[18px] font-black uppercase tracking-wider text-white">Análise de Performance</h2>
          <p className="text-[11px] font-bold text-[#62636c] mt-0.5">ESTATÍSTICAS COMPARATIVAS DAS ÚLTIMAS {history.length} PARTIDAS</p>
        </div>
        <div className="relative group/help hover:z-50">
          <button className="text-[#62636c] hover:text-white transition-colors flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <div className="absolute right-0 top-[120%] bg-[#1c1d21]/95 text-[#9e9eb1] text-[10px] leading-relaxed p-3 rounded-xl border border-white/10 shadow-2xl opacity-0 pointer-events-none group-hover/help:opacity-100 transition-opacity duration-300 w-64 z-[100] backdrop-blur-md">
            Esta seção exibe pontuações robustas calculadas por partida em uma escala de 0 a 100. Passar o cursor sobre as barras de pilares revela detalhes estatísticos robustos baseados na faixa esperada de elo e rota.
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-stretch">

        <div className="w-full xl:w-[320px] shrink-0 flex flex-col justify-start gap-4">
          <h3 className="text-[10px] font-black text-[#62636c] uppercase tracking-wider">Métricas Gerais</h3>
          <div className="grid grid-cols-2 gap-2 w-full">
            <ProgressRing
              score={overallIndex}
              label="Você (Pilar)"
              sublabel="Overall Index"
              color={getScoreColor(overallIndex)}
              tooltipText="Seu índice de desempenho geral, ponderado de acordo com a sua rota."
            />
            <ProgressRing
              score={consistencyScore}
              label="Consistência"
              sublabel="Consistency"
              color={getScoreColor(consistencyScore)}
              tooltipText="Mede a estabilidade do seu nível de jogo. Valores mais altos indicam menor variação entre partidas."
            />
            <ProgressRing
              score={teamAverage}
              label="Seu Time"
              sublabel="Team Avg"
              color={getScoreColor(teamAverage)}
              tooltipText="Média de desempenho das suas equipes de aliados."
            />
            <ProgressRing
              score={enemyAverage}
              label="Oponentes"
              sublabel="Enemy Avg"
              color={getScoreColor(enemyAverage)}
              tooltipText="Média de desempenho das equipes adversárias."
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-start gap-4 bg-black/10 border border-white/5 rounded-2xl p-4 min-w-0">
          <h3 className="text-[10px] font-black text-[#62636c] uppercase tracking-wider mb-2">Pilares de Desempenho</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
            <StatProgressBar label="Fase de Rotas (Laning)" pillarKey="laning" pillarScore={pillars.laning} iconPath="/assets/laning-icon.svg" context={performanceData.context} />
            <StatProgressBar label="Farm (Efficiency)" pillarKey="farming" pillarScore={pillars.farming} iconPath="/assets/farming-icon.svg" context={performanceData.context} />
            <StatProgressBar label="Objetivos (Dragão/Torres)" pillarKey="objectives" pillarScore={pillars.objectives} iconPath="/assets/objectives-icon.svg" context={performanceData.context} />
            <StatProgressBar label="Combate (Eficácia)" pillarKey="combat" pillarScore={pillars.combat} iconPath="/assets/combat-icon.svg" context={performanceData.context} />
            <StatProgressBar label="Lutas Equipe (Teamfight)" pillarKey="teamfight" pillarScore={pillars.teamfight} iconPath="/assets/teamfight-icon.svg" context={performanceData.context} />
            <StatProgressBar label="Controle de Visão" pillarKey="vision" pillarScore={pillars.vision} iconPath="/assets/vision-icon.svg" context={performanceData.context} />
          </div>
        </div>

      </div>

      <div className="border-t border-white/5 pt-4">
        <h3 className="text-[10px] font-black text-[#62636c] uppercase tracking-wider mb-4">Gráfico de Performance Histórica</h3>
        <div className="w-full h-44 cursor-pointer relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} onClick={handleChartClick} margin={{ left: -15, right: 5, top: 5, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#62636c" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} stroke="#62636c" fontSize={9} tickLine={false} axisLine={false} />
              <ChartTooltip content={<CustomTooltip history={history} />} cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1.5 }} />
              <Line type="monotone" dataKey="Média do Inimigo" stroke="#f24254" strokeWidth={1} dot={{ r: 2 }} activeDot={{ r: 4 }} opacity={0.6} />
              <Line type="monotone" dataKey="Média do Time" stroke="#4c92fc" strokeWidth={1} dot={{ r: 2 }} activeDot={{ r: 4 }} opacity={0.6} />
              <Line type="monotone" dataKey="Seu Score" stroke="#5de8c8" strokeWidth={2} dot={{ r: 3.5 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
