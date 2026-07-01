import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { OverallPerformanceData, MatchPerformanceData } from "../types";

interface PerformanceOverviewProps {
  performanceData: OverallPerformanceData;
}

const getScoreColor = (score: number) => {
  if (score < 40) return "#ef4444"; // Vermelho (baixo)
  if (score < 55) return "#f97316"; // Laranja (médio-baixo)
  if (score < 70) return "#eab308"; // Amarelo (médio)
  if (score < 85) return "#22c55e"; // Verde (bom)
  return "#a855f7"; // Roxo/Rosa (excelente)
};

const ProgressRing: React.FC<{
  score: number;
  label: string;
  sublabel: string;
  color: string;
}> = ({ score, label, sublabel, color }) => {
  const radius = 28;
  const stroke = 3.5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, score) / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative shrink-0 p-3 border border-white/5 rounded-2xl bg-black/20 flex-1 min-w-[100px] hover:bg-black/30 transition-all">
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
          <span className="text-[14px] font-black text-white leading-none">{score}</span>
        </div>
      </div>
      <span className="text-[8px] text-[#62636c] font-black uppercase mt-2.5 tracking-wider">{sublabel}</span>
    </div>
  );
};

const StatProgressBar: React.FC<{
  label: string;
  score: number;
  iconPath: string;
}> = ({ label, score, iconPath }) => {
  const color = getScoreColor(score);
  const percentage = (score / 100) * 100;

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between items-center px-0.5">
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

export const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ performanceData }) => {
  const { playerAverage, teamAverage, enemyAverage, history } = performanceData;

  // Recharts line data (newest matches on the right)
  const chartData = [...history].reverse().map((m, idx) => ({
    name: idx + 1, // XAxis value
    "Seu Score": m.scores.total,
    "Média do Time": m.teamAverageScore,
    "Média do Inimigo": m.enemyAverageScore,
  }));

  const handleChartClick = (state: any) => {
    if (state && state.activeTooltipIndex !== undefined) {
      const clickedIndex = state.activeTooltipIndex;
      // In chartData, the index matches history in reverse order.
      const historyIndex = history.length - 1 - clickedIndex;
      const match = history[historyIndex];
      if (match) {
        const element = document.getElementById(`match-container-${match.matchId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          
          // Flash animation trigger
          element.classList.add("ring-2", "ring-[#4c92fc]/50", "scale-[1.01]");
          setTimeout(() => {
            element.classList.remove("ring-2", "ring-[#4c92fc]/50", "scale-[1.01]");
          }, 1500);
        }
      }
    }
  };

  return (
    <div className="liquid-glass rounded-2xl p-6 mb-4 shadow-2xl relative overflow-hidden flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h2 className="text-[18px] font-black uppercase tracking-wider text-white">Análise de Performance</h2>
          <p className="text-[11px] font-bold text-[#62636c] mt-0.5">ESTATÍSTICAS COMPARATIVAS DAS ÚLTIMAS {history.length} PARTIDAS</p>
        </div>
        <div className="relative group/help">
          <button className="text-[#62636c] hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <div className="absolute right-0 top-[120%] bg-[#1c1d21]/95 text-[#9e9eb1] text-[10px] leading-relaxed p-3 rounded-xl border border-white/10 shadow-2xl opacity-0 pointer-events-none group-hover/help:opacity-100 transition-opacity duration-300 w-64 z-[100] backdrop-blur-md">
            Esta seção exibe sua pontuação de performance calculada em cada partida em uma escala de 0 a 100, medindo sua eficácia em relação à média do seu time e da equipe oponente.
          </div>
        </div>
      </div>

      {/* Responsive Flex Layout: Averages Cards & 6 Pillars */}
      <div className="flex flex-col xl:flex-row gap-6 items-stretch">
        
        {/* Averages Circles (Left) */}
        <div className="w-full xl:w-[320px] shrink-0 flex flex-col justify-between gap-3">
          <h3 className="text-[10px] font-black text-[#62636c] uppercase tracking-wider mb-1">Scores Médios</h3>
          <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full">
            <ProgressRing score={playerAverage.total} label="Você" sublabel="Player Avg" color="#5de8c8" />
            <ProgressRing score={teamAverage} label="Seu Time" sublabel="Team Avg" color="#4c92fc" />
            <ProgressRing score={enemyAverage} label="Oponentes" sublabel="Enemy Avg" color="#f24254" />
          </div>
          
          <div className="p-3 border border-white/5 rounded-2xl bg-black/10 text-[11px] leading-relaxed text-[#9e9eb1] mt-1 font-bold">
            {playerAverage.total > teamAverage ? (
              <span className="text-[#5de8c8]">★ Você está jogando ACIMA da média dos seus aliados! Seu impacto individual nas partidas tem sido superior.</span>
            ) : (
              <span>Sua média de score está próxima à do seu time. Foque nos pilares abaixo para impulsionar suas estatísticas individuais.</span>
            )}
          </div>
        </div>

        {/* 6 Pillars Breakdown (Right) */}
        <div className="flex-1 flex flex-col justify-between gap-3 bg-black/10 border border-white/5 rounded-2xl p-4 min-w-0">
          <h3 className="text-[10px] font-black text-[#62636c] uppercase tracking-wider mb-2">Pilares de Desempenho</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">
            <StatProgressBar label="Fase de Rotas (Laning)" score={playerAverage.laning} iconPath="/assets/laning-icon.svg" />
            <StatProgressBar label="Farm (Efficiency)" score={playerAverage.farming} iconPath="/assets/farming-icon.svg" />
            <StatProgressBar label="Objetivos (Dragão/Torres)" score={playerAverage.objectives} iconPath="/assets/objectives-icon.svg" />
            <StatProgressBar label="Combate (Eficácia)" score={playerAverage.combat} iconPath="/assets/combat-icon.svg" />
            <StatProgressBar label="Lutas Equipe (Teamfight)" score={playerAverage.teamfight} iconPath="/assets/teamfight-icon.svg" />
            <StatProgressBar label="Controle de Visão" score={playerAverage.vision} iconPath="/assets/vision-icon.svg" />
          </div>
        </div>

      </div>

      {/* Historical Line Chart */}
      <div className="border-t border-white/5 pt-4">
        <h3 className="text-[10px] font-black text-[#62636c] uppercase tracking-wider mb-4">Gráfico de Performance Histórica</h3>
        <div className="w-full h-44 cursor-pointer relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} onClick={handleChartClick} margin={{ left: -15, right: 5, top: 5, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#62636c" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} stroke="#62636c" fontSize={9} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip history={history} />} cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1.5 }} />
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
