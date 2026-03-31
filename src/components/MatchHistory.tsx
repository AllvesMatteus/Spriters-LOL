import React, { useState, useCallback, useEffect } from "react";
import { MatchData, SummonerData } from "../types";
import { SPELL_ICONS, calculateAIScore, getChampionName, getQueueType } from "../utils/helpers";
import { Shield, Zap } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import imgLaneTop from "../assets/images/lanes/lane-top.png";
import imgLaneJungle from "../assets/images/lanes/lane-jungle.png";
import imgLaneMid from "../assets/images/lanes/lane-mid.png";
import imgLaneAdc from "../assets/images/lanes/lane-adc.png";
import imgLaneSupport from "../assets/images/lanes/lane-support.png";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LANE_IMG: Record<string, string> = {
  TOP: imgLaneTop,
  JUNGLE: imgLaneJungle,
  MIDDLE: imgLaneMid,
  BOTTOM: imgLaneAdc,
  UTILITY: imgLaneSupport,
};




interface TooltipPlayer {
  part: any;
  match: MatchData;
  region: string;
  x: number;
  y: number;
}


const TIER_COLORS: Record<string, { color: string; bg: string }> = {
  IRON:        { color: "#7a7c82", bg: "#2a2b2e" },
  BRONZE:      { color: "#a06b3c", bg: "#2e2119" },
  SILVER:      { color: "#7fa8b4", bg: "#1a2529" },
  GOLD:        { color: "#C8AA6E", bg: "#2a2415" },
  PLATINUM:    { color: "#3cbfb4", bg: "#102825" },
  EMERALD:     { color: "#3bde7e", bg: "#0e2820" },
  DIAMOND:     { color: "#7ba6de", bg: "#141c2f" },
  MASTER:      { color: "#9b4dde", bg: "#1f1030" },
  GRANDMASTER: { color: "#de4040", bg: "#2e1010" },
  CHALLENGER:  { color: "#f5d76e", bg: "#2e2a00" },
  UNRANKED:    { color: "#9e9eb1", bg: "#1c1d21" },
};

const RANK_LABEL: Record<string, string> = {
  IRON: "Ferro", BRONZE: "Bronze", SILVER: "Prata", GOLD: "Ouro",
  PLATINUM: "Platina", EMERALD: "Esmeralda", DIAMOND: "Diamante",
  MASTER: "Mestre", GRANDMASTER: "Grão-Mestre", CHALLENGER: "Desafiante",
};


const rankCache: Record<string, any[]> = {};

const PlayerTooltip: React.FC<{ data: TooltipPlayer }> = ({ data }) => {
  const { part, match, region, x, y } = data;
  const [rankData, setRankData] = useState<any[] | null>(rankCache[part.puuid] ?? null);
  const [loadingRank, setLoadingRank] = useState(!rankCache[part.puuid]);

  useEffect(() => {
    if (rankCache[part.puuid]) {
      setRankData(rankCache[part.puuid]);
      setLoadingRank(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/rank?puuid=${part.puuid}&region=${region}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (!cancelled) {
          rankCache[part.puuid] = data;
          setRankData(data);
          setLoadingRank(false);
        }
      })
      .catch(() => { if (!cancelled) setLoadingRank(false); });
    return () => { cancelled = true; };
  }, [part.puuid, region]);

  const soloQ = rankData?.find((e: any) => e.queueType === "RANKED_SOLO_5x5");
  const tier = soloQ?.tier || "UNRANKED";
  const tierStyle = TIER_COLORS[tier] || TIER_COLORS.UNRANKED;
  const winRate = soloQ ? Math.round((soloQ.wins / Math.max(1, soloQ.wins + soloQ.losses)) * 100) : null;

  const durationMin = Math.max(1, match.info.gameDuration / 60);
  const cs = part.totalMinionsKilled + part.neutralMinionsKilled;
  const cspm = (cs / durationMin).toFixed(1);
  const kdaRatio = ((part.kills + part.assists) / Math.max(1, part.deaths)).toFixed(2);
  const dmgpm = Math.round(part.totalDamageDealtToChampions / durationMin);
  const vision = part.visionScore;
  const { score } = calculateAIScore(part, match);
  const aiScore = (score / 10).toFixed(1);
  const aiScoreNum = parseFloat(aiScore);

  const teamKills = Math.max(1, match.info.participants
    .filter(p => p.teamId === part.teamId)
    .reduce((a, c) => a + c.kills, 0));
  const kp = Math.round(((part.kills + part.assists) / teamKills) * 100);

  const position = part.teamPosition || part.individualPosition || "";
  const posLabel: Record<string, string> = {
    TOP: "Topo", JUNGLE: "Selva", MIDDLE: "Meio", BOTTOM: "Atirador", UTILITY: "Suporte"
  };


  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tooltipW = 288;
  const tooltipH = 340;
  const left = x + 20 + tooltipW > vw ? x - tooltipW - 8 : x + 20;
  const top  = y + tooltipH > vh ? y - tooltipH - 8 : y + 8;

  const aiColor = aiScoreNum >= 8 ? "#f0ba65" : aiScoreNum >= 6 ? "#5de8c8" : aiScoreNum >= 4 ? "#9e9eb1" : "#f24254";
  const headerBg = part.win ? "bg-[#1e2d45] border-b border-[#2c4163]" : "bg-[#3d2028] border-b border-[#5a2b35]";
  const winTag = part.win
    ? "text-[#4c92fc] bg-[#1a2d4a] border border-[#2c4163]"
    : "text-[#f24254] bg-[#3d1c23] border border-[#5a2b35]";

  return (
    <div
      className="fixed z-[9999] pointer-events-none animate-in fade-in slide-in-from-top-1 duration-150"
      style={{ left, top }}
    >
      <div
        className="rounded-xl shadow-2xl overflow-hidden"
        style={{ width: tooltipW, background: "#13141a", border: "1px solid #2b2c30" }}
      >
        
        <div className={`${headerBg} px-3 py-2.5 flex items-center gap-3`}>
          
          <div className="relative shrink-0">
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/champion/${getChampionName(part.championName)}.png`}
              alt={part.championName}
              className="w-11 h-11 rounded-lg object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-1.5 -right-1.5 bg-[#13141a] text-[9px] font-black text-white w-[18px] h-[18px] flex items-center justify-center rounded-full border border-[#2b2c30]">
              {part.champLevel}
            </span>
          </div>

          
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black text-white truncate leading-tight">
              {part.riotIdGameName || part.summonerName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {position && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-[#9e9eb1] uppercase tracking-wide">
                  {LANE_IMG[position] && (
                    <img
                      src={LANE_IMG[position]}
                      alt={position}
                      className="w-3 h-3 object-contain"
                      style={{ filter: "brightness(0) saturate(100%) invert(65%) sepia(5%) saturate(300%) hue-rotate(200deg)" }}
                    />
                  )}
                  {posLabel[position] || position}
                </span>
              )}
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${winTag}`}>
                {part.win ? "VITÓRIA" : "DERROTA"}
              </span>
            </div>
          </div>

          
          <div className="flex flex-col items-center shrink-0">
            <span className="text-[18px] font-black leading-none" style={{ color: aiColor }}>{aiScore}</span>
            <span className="text-[8px] text-[#9e9eb1] mt-0.5 uppercase tracking-wider">AI Score</span>
          </div>
        </div>

        
        <div
          className="flex items-center gap-3 px-3 py-3 border-b border-[#2b2c30]"
          style={{ background: tierStyle.bg }}
        >
          {loadingRank ? (
            <div className="flex items-center gap-2 w-full">
              <div className="w-8 h-8 rounded-full bg-[#2b2c30] animate-pulse" />
              <span className="text-[11px] text-[#9e9eb1] animate-pulse">Buscando elo...</span>
            </div>
          ) : soloQ ? (
            <>
              <img
                src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${tier.toLowerCase()}.png`}
                alt={tier}
                className="w-16 h-16 object-contain drop-shadow-xl scale-[3.5] relative z-10 shrink-0"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div className="flex-1">
                <p className="text-[12px] font-black leading-tight" style={{ color: tierStyle.color }}>
                  {RANK_LABEL[tier] || tier} {soloQ.rank} · {soloQ.leaguePoints} LP
                </p>
                <p className="text-[10px] text-[#9e9eb1]">
                  {soloQ.wins}V {soloQ.losses}D
                  {winRate !== null && (
                    <span className={`ml-1 font-bold ${winRate >= 55 ? "text-[#5de8c8]" : winRate >= 50 ? "text-[#e1e1e1]" : "text-[#f24254]"}`}>
                      ({winRate}% WR)
                    </span>
                  )}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#2b2c30] flex items-center justify-center text-[#9e9eb1] text-[10px]">?</div>
              <span className="text-[11px] text-[#9e9eb1]">Sem ranque</span>
            </div>
          )}
        </div>

        
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#2b2c30]">
          <span className="text-[18px] font-black tracking-tight">
            <span className="text-[#5de8c8]">{part.kills}</span>
            <span className="text-[#9e9eb1] text-[14px] mx-0.5">/</span>
            <span className="text-[#f24254]">{part.deaths}</span>
            <span className="text-[#9e9eb1] text-[14px] mx-0.5">/</span>
            <span className="text-white">{part.assists}</span>
          </span>
          <div className="text-right">
            <p className="text-[12px] font-black text-[#e1e1e1]">{kdaRatio}:1 KDA</p>
            <p className="text-[10px] text-[#9e9eb1]">Participação: <span className="font-bold text-white">{kp}%</span></p>
          </div>
        </div>

        
        <div className="grid grid-cols-3 border-b border-[#2b2c30]">
          {[
            { val: cspm, label: "CS/min" },
            { val: vision, label: "Visão" },
            { val: dmgpm, label: "Dano/min" },
          ].map(({ val, label }, i) => (
            <div key={i} className={`flex flex-col items-center py-2 ${i > 0 ? "border-l border-[#2b2c30]" : ""}`}>
              <span className="text-[13px] font-black text-[#e1e1e1]">{val}</span>
              <span className="text-[8px] text-[#9e9eb1] uppercase tracking-wide mt-0.5">{label}</span>
            </div>
          ))}
        </div>

        
        <div className="flex items-center gap-1 px-3 py-2">
          {[0,1,2,3,4,5,6].map(i => {
            const itemId = part[`item${i}`];
            const isTrinket = i === 6;
            return (
              <div key={i} className={`overflow-hidden shrink-0 bg-[#1c1d21] border border-[#2b2c30] ${
                isTrinket ? "w-[22px] h-[22px] rounded-full ml-auto" : "w-[28px] h-[28px] rounded"
              }`}>
                {itemId > 0 && (
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/item/${itemId}.png`}
                    alt="item"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


interface MatchHistoryProps {
  matches: MatchData[];
  summoner: SummonerData;
  region: string;
  onPlayerClick?: (gameName: string, tagLine: string) => void;
  matchFilter?: string;
  onFilterChange?: (filter: string) => void;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({ matches, summoner, region, onPlayerClick, matchFilter = "all", onFilterChange, onLoadMore, isLoading }) => {
  const [tooltip, setTooltip] = useState<TooltipPlayer | null>(null);

  const showTooltip = useCallback((part: any, match: MatchData, e: React.MouseEvent) => {
    setTooltip({ part, match, region, x: e.clientX, y: e.clientY });
  }, [region]);

  const moveTooltip = useCallback((e: React.MouseEvent) => {
    setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
  }, []);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  const timeAgo = (timestamp?: number) => {
    if (!timestamp) return "Hoje";
    const ms = Date.now() - timestamp;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    if (days > 0) return `há ${days} dia${days > 1 ? "s" : ""}`;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours > 0) return `há ${hours} hora${hours > 1 ? "s" : ""}`;
    const mins = Math.floor(ms / (1000 * 60));
    if (mins > 0) return `há ${mins} min`;
    return "há pouco tempo";
  };

  const filters = [
    { label: "Total", value: "all" },
    { label: "Ranqueada Solo", value: "420" },
    { label: "Ranqueada Flex", value: "440" },
    { label: "ARAM", value: "450" },
  ];

  return (
    <div className="space-y-1.5 flex flex-col">
      <div className="flex liquid-glass rounded-2xl mb-2 flex-wrap shadow-xl overflow-hidden border-white/5">
         {filters.map((f, i) => (
           <button
             key={f.value}
             onClick={() => onFilterChange?.(f.value)}
             className={`relative flex-1 py-3 px-2 text-[12px] md:text-[13px] font-bold transition-colors whitespace-nowrap ${i > 0 ? "border-l border-white/5" : ""} ${
               matchFilter === f.value
                 ? "text-white"
                 : "text-[#9e9eb1] hover:text-[#e1e1e1]"
             }`}
           >
             {f.label}
             {matchFilter === f.value && (
               <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2eab7e] rounded-full" />
             )}
           </button>
         ))}
       </div>

       {isLoading && matches.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-[#9e9eb1]">
            <div className="w-8 h-8 border-2 border-[#4c92fc]/30 border-t-[#4c92fc] rounded-full animate-spin" />
            <span className="text-[13px] font-bold">Buscando partidas...</span>
          </div>
       )}
       {!isLoading && matches.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-14 liquid-glass rounded-[20px] text-[#9e9eb1] shadow-2xl">
            <span className="text-[28px]">🔍</span>
            <p className="text-[14px] font-bold text-white">Nenhuma partida encontrada</p>
            <p className="text-[12px]">Não há partidas registradas neste modo para este invocador.</p>
          </div>
       )}
      {matches.map((match, idx) => {
        const p = match.info.participants.find((p) => p.puuid === summoner.account.puuid);
        if (!p) return null;

        const durationMin = Math.floor(match.info.gameDuration / 60);
        const durationSec = match.info.gameDuration % 60;
        const cs = p.totalMinionsKilled + p.neutralMinionsKilled;
        const cspm = (cs / durationMin).toFixed(1);
        const kdaRatio = ((p.kills + p.assists) / Math.max(1, p.deaths)).toFixed(2);


        const allScores = match.info.participants.map(part => {
          return { puuid: part.puuid, teamId: part.teamId, win: part.win, score: calculateAIScore(part, match).score };
        }).sort((a, b) => b.score - a.score);
        
        const myRankIndex = allScores.findIndex(s => s.puuid === p.puuid);
        const myRank = myRankIndex + 1;
        
        const winningTeamId = match.info.participants.find(part => part.win)?.teamId;
        const losingTeamId = match.info.participants.find(part => !part.win)?.teamId;

        const mvpPuuid = allScores.find(s => s.teamId === winningTeamId)?.puuid;
        const acePuuid = allScores.find(s => s.teamId === losingTeamId)?.puuid;

        const isMVP = p.puuid === mvpPuuid;
        const isACE = p.puuid === acePuuid;


        let multiKillTag = null;
        if (p.pentaKills > 0) multiKillTag = "Penta Kill";
        else if (p.quadraKills > 0) multiKillTag = "Quadra Kill";
        else if (p.tripleKills > 0) multiKillTag = "Triple Kill";
        else if (p.doubleKills > 0) multiKillTag = "Double Kill";


        const isWin = p.win;
        
        let cardBg = isWin ? "bg-[#4c92fc]/[0.08]" : "bg-[#f24254]/[0.05]";
        let borderColor = isWin ? "border-white/10" : "border-white/10";
        let hoverGlow = isWin ? "group-hover:bg-[#4c92fc]/[0.12]" : "group-hover:bg-[#f24254]/[0.08]";
        let textColor = isWin ? "text-[#4c92fc]" : "text-[#f24254]";
        let statusBadge = "";

        if (isMVP) {
          cardBg = "bg-[#f0ba65]/[0.1]";
          hoverGlow = "group-hover:bg-[#f0ba65]/[0.15]";
          textColor = "text-[#f0ba65]";
          statusBadge = "MVP";
        } else if (isACE) {
          cardBg = "bg-[#8b5bd3]/[0.1]";
          hoverGlow = "group-hover:bg-[#8b5bd3]/[0.15]";
          textColor = "text-[#8b5bd3]";
          statusBadge = "ACE";
        }

        return (
          <div
            key={match.metadata.matchId}
            className={cn(
               "group relative rounded-[20px] mb-3 transition-all duration-500 overflow-hidden",
               "backdrop-blur-[24px] saturate-[120%] border",
               borderColor,
               cardBg,
               "hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            )}
            style={{
               boxShadow: "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 0 0 1px rgba(255,255,255,0.02)"
            }}
          >
            
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            
            <div className={cn("absolute inset-0 transition-colors duration-500", hoverGlow)} />

            <div className="relative flex items-stretch p-0 z-10 w-full h-full">

              
              <div className="flex flex-col justify-center px-3 py-4 w-[90px] md:w-[104px] shrink-0 border-r border-white/5 relative z-10">
                <p className={cn("text-[9px] md:text-[10px] font-black uppercase tracking-wider mb-1.5 opacity-80 leading-[1.1] break-words line-clamp-2", textColor)}>
                  {getQueueType(match.info.queueId, match.info.gameMode)}
                </p>
                
                <div className="flex flex-col gap-0.5 w-full">
                  <h3 className={cn("text-[16px] font-black leading-tight tracking-tight uppercase", 
                    isWin ? "text-white" : "text-[#e1e1e1]"
                  )}>
                    {isWin ? "Vitória" : "Derrota"}
                  </h3>
                  <p className="text-[10px] text-[#9e9eb1] font-bold">{timeAgo(match.info.gameEndTimestamp)}</p>
                </div>

                <div className="mt-3 flex items-center justify-center w-full opacity-40">
                   <div className="h-[1px] flex-1 bg-white/20" />
                   <p className="text-[8px] font-black text-white uppercase tracking-wider mx-1.5 whitespace-nowrap">{durationMin}M {durationSec}S</p>
                   <div className="h-[1px] flex-1 bg-white/20" />
                </div>

                
                <div className="flex w-full items-end justify-between mt-3 gap-1">
                  <div className="flex flex-col items-start shrink-0">
                    <span className="text-[7.5px] font-black text-[#9e9eb1] uppercase tracking-[0.05em] mb-0.5 opacity-60">Score</span>
                    <div className={cn(
                      "px-1.5 py-1 rounded border flex flex-col items-center justify-center min-w-[32px] shadow-lg",
                      (calculateAIScore(p, match).score / 10) >= 8 ? "bg-[#5de8c8]/20 border-[#5de8c8]/40 text-[#5de8c8]" :
                      (calculateAIScore(p, match).score / 10) >= 6 ? "bg-[#f0ba65]/20 border-[#f0ba65]/40 text-[#f0ba65]" :
                      "bg-white/5 border-white/10 text-white"
                    )}>
                      <span className="text-[12px] md:text-[13px] font-black leading-none tracking-tighter">{(calculateAIScore(p, match).score / 10).toFixed(1)}</span>
                    </div>
                    {myRank > 0 && <span className="text-[7px] font-black text-[#9e9eb1] uppercase mt-1 opacity-70 whitespace-nowrap">#{myRank} Rank</span>}
                  </div>

                  {statusBadge ? (
                    <div className={cn(
                      "w-[26px] h-[22px] mb-2.5 rounded flex items-center justify-center border shadow-xl relative overflow-hidden shrink-0",
                      isMVP ? "bg-[#f0ba65] border-[#c8aa6e]" : "bg-[#8b5bd3] border-[#62468f]"
                    )}>
                      <div className="absolute inset-x-0 top-0 h-[35%] bg-white/20" />
                      <span className={cn("text-[7.5px] font-black tracking-tighter", isMVP ? "text-[#1a1200]" : "text-white")}>
                        {statusBadge}
                      </span>
                    </div>
                  ) : (
                    <div className="flex-1" />
                  )}
                </div>
              </div>

              
              <div className="flex-1 flex items-center justify-start px-6 py-3 gap-6 md:gap-10 relative z-10 w-full overflow-x-auto no-scrollbar">
                
                
                <div className="flex flex-col items-center gap-2 md:gap-3 shrink-0">
                  <div className="flex items-center gap-2 md:gap-3">
                  <div className="relative">
                    <div className={cn("absolute -inset-1 rounded-xl blur-md opacity-20", 
                      isWin ? "bg-[#4c92fc]" : "bg-[#f24254]"
                    )} />
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/champion/${getChampionName(p.championName)}.png`}
                      alt={p.championName}
                      className="w-[48px] h-[48px] md:w-[56px] md:h-[56px] rounded-xl object-cover relative z-10 border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-[#16171d] text-white text-[8px] font-black w-[18px] h-[18px] flex items-center justify-center rounded-full border border-white/20 z-20">
                      {p.champLevel}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-1 shrink-0">
                    <img src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/spell/${SPELL_ICONS[p.summoner1Id] || "SummonerFlash"}.png`} alt="" className="w-[20px] h-[20px] md:w-[22px] md:h-[22px] rounded border border-white/5" />
                    <div className="w-[20px] h-[20px] md:w-[22px] md:h-[22px] bg-[#16171d]/80 rounded flex items-center justify-center border border-white/5"><Zap className="w-3 h-3 text-yellow-500" /></div>
                    <img src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/spell/${SPELL_ICONS[p.summoner2Id] || "SummonerSmite"}.png`} alt="" className="w-[20px] h-[20px] md:w-[22px] md:h-[22px] rounded border border-white/5" />
                    <div className="w-[20px] h-[20px] md:w-[22px] md:h-[22px] bg-[#16171d]/80 rounded flex items-center justify-center border border-white/5"><Shield className="w-3 h-3 text-blue-500" /></div>
                  </div>

                  </div>

                  
                  <div className="flex flex-col items-center w-full">
                    <div className="text-[18px] md:text-[22px] font-black leading-none tracking-tighter flex items-center gap-1.5">
                      <span className="text-[#5de8c8]">{p.kills}</span>
                      <span className="text-white/20 font-normal">/</span>
                      <span className="text-[#f24254]">{p.deaths}</span>
                      <span className="text-white/20 font-normal">/</span>
                      <span className="text-white">{p.assists}</span>
                    </div>
                    <span className="text-[11px] md:text-[12px] font-black text-white/50 uppercase tracking-widest mt-1.5 md:mt-2">{kdaRatio} KDA</span>
                  </div>
                </div>

                
                <div className="flex flex-col gap-2 shrink-0">
                  {multiKillTag && (
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-[#f24254]/20 text-[#f24254] border border-[#f24254]/30 uppercase self-start whitespace-nowrap mb-0.5">
                      {multiKillTag}
                    </span>
                  )}
                  
                  <div className="flex gap-[2px] md:gap-[3px]">
                    {[0, 1, 2, 3, 4, 5].map((i) => {
                      const itemId = (p as any)[`item${i}`];
                      return (
                        <div key={i} className="w-[20px] h-[20px] md:w-[24px] md:h-[24px] bg-[#16171d]/80 rounded-md overflow-hidden border border-white/10 shadow-inner shrink-0">
                          {itemId > 0 && <img src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/item/${itemId}.png`} alt="" className="w-full h-full object-cover" />}
                        </div>
                      );
                    })}
                    <div className="w-[20px] h-[20px] md:w-[24px] md:h-[24px] bg-[#16171d]/80 rounded-full overflow-hidden border border-[#f0ba65]/30 ml-1 shrink-0">
                      {(p as any)[`item6`] > 0 && <img src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/item/${(p as any)[`item6`]}.png`} alt="" className="w-full h-full object-cover" />}
                    </div>
                  </div>
                </div>

                
                <div className="hidden lg:flex flex-col justify-center gap-1.5 pl-6 shrink-0 border-l border-white/5 min-w-[70px] ml-auto">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[10px] md:text-[11px] font-bold text-[#9e9eb1] uppercase">CS</span>
                    <span className="text-[12px] md:text-[14px] font-bold text-white leading-none whitespace-nowrap">{cs} <span className="text-[10px] text-[#9e9eb1]/60 font-medium">({cspm})</span></span>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[10px] md:text-[11px] font-bold text-[#9e9eb1] uppercase">Visão</span>
                    <span className="text-[12px] md:text-[14px] font-bold text-white leading-none">{p.visionScore}</span>
                  </div>
                </div>



              </div>

              
              <div className="hidden xl:flex gap-3 lg:gap-4 shrink-0 px-2 lg:px-4 py-4 border-l border-white/5 bg-black/5 relative z-10 w-[240px] xl:w-[280px] justify-between">
                {[match.info.participants.slice(0, 5), match.info.participants.slice(5, 10)].map((team, teamIdx) => (
                  <div key={teamIdx} className="flex flex-col justify-center gap-1.5 w-[110px] xl:w-[124px] shrink-0 h-full my-auto">
                    {team.map((part, pidx) => (
                      <div key={pidx} className="flex items-center gap-2 group/player min-w-0">
                        <img 
                          src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/champion/${getChampionName(part.championName)}.png`} 
                          className="w-[18px] h-[18px] rounded-sm shrink-0 grayscale group-hover/player:grayscale-0 transition-all border border-white/10" 
                          alt="" 
                        />
                        <span
                          className={cn(
                            "text-[11px] xl:text-[12px] truncate cursor-pointer transition-colors leading-tight font-bold flex-1",
                            part.puuid === summoner.account.puuid 
                              ? "text-white" 
                              : "text-[#9e9eb1] hover:text-[#4c92fc]"
                          )}
                          onClick={() => { if (onPlayerClick && (part.riotIdGameName || part.summonerName)) onPlayerClick(part.riotIdGameName || part.summonerName, part.riotIdTagline || "BR1"); }}
                          onMouseEnter={(e) => showTooltip(part, match, e)}
                          onMouseMove={moveTooltip}
                          onMouseLeave={hideTooltip}
                        >
                          {part.riotIdGameName || part.summonerName}
                        </span>
                        {part.puuid === summoner.account.puuid && (
                          <div className="w-[3px] h-[3px] rounded-full bg-[#4c92fc] shadow-[0_0_5px_#4c92fc] shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

            </div>
          </div>
        );
      })}
      
      {matches.length >= 10 && matches.length % 10 === 0 && (
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          className="w-full mt-2 py-4 liquid-glass hover:bg-white/10 transition-colors rounded-[20px] text-[#e1e1e1] font-bold text-[13px] shadow-2xl"
        >
          {isLoading ? "Carregando..." : "Carregar Mais Partidas"}
        </button>
      )}

      
      {tooltip && <PlayerTooltip data={tooltip} />}
    </div>
  );
};
