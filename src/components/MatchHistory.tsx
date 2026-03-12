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

// ─────────────────────────────────────────────────
// Floating Player Stats Tooltip
// ─────────────────────────────────────────────────
interface TooltipPlayer {
  part: any;
  match: MatchData;
  region: string;
  x: number;
  y: number;
}

// Rank colors matching the game's official palette
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

// Global in-memory cache for rank lookups (per puuid)
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

  // Keep inside viewport
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
        {/* ─── HEADER: Champion + Name + Rank ─── */}
        <div className={`${headerBg} px-3 py-2.5 flex items-center gap-3`}>
          {/* Champion portrait */}
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

          {/* Name + Position */}
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

          {/* AI Score */}
          <div className="flex flex-col items-center shrink-0">
            <span className="text-[18px] font-black leading-none" style={{ color: aiColor }}>{aiScore}</span>
            <span className="text-[8px] text-[#9e9eb1] mt-0.5 uppercase tracking-wider">AI Score</span>
          </div>
        </div>

        {/* ─── RANK BANNER ─── */}
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
                className="w-20 h-20 object-contain drop-shadow-xl -my-2"
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

        {/* ─── KDA ─── */}
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

        {/* ─── STATS GRID ─── */}
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

        {/* ─── ITEMS ─── */}
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
      <div className="flex bg-[#212328] border border-[#31313c] rounded-lg mb-2 flex-wrap">
         {filters.map((f, i) => (
           <button
             key={f.value}
             onClick={() => onFilterChange?.(f.value)}
             className={`relative flex-1 py-3 px-2 text-[12px] md:text-[13px] font-bold transition-colors whitespace-nowrap ${i > 0 ? "border-l border-[#31313c]" : ""} ${
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
          <div className="flex flex-col items-center justify-center gap-2 py-14 bg-[#1c1d21] border border-[#2b2c30] rounded-xl text-[#9e9eb1]">
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

        // Calculate ranks for MVP
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

        // Multikill
        let multiKillTag = null;
        if (p.pentaKills > 0) multiKillTag = "Penta Kill";
        else if (p.quadraKills > 0) multiKillTag = "Quadra Kill";
        else if (p.tripleKills > 0) multiKillTag = "Triple Kill";
        else if (p.doubleKills > 0) multiKillTag = "Double Kill";

        // DEEPLOL EXACT STYLE COLORS
        const isWin = p.win;
        let bgClass = isWin ? "bg-[#28344e]" : "bg-[#59343b]";
        let borderClass = isWin ? "border-l-[#4c92fc]" : "border-l-[#e84057]";
        let queueColor = isWin ? "text-[#4c92fc]" : "text-[#e84057]";

        if (isMVP) {
          bgClass = "bg-[#3a2c18]";
          borderClass = "border-l-[#f0ba65]";
          queueColor = "text-[#f0ba65]";
        } else if (isACE) {
          bgClass = "bg-[#2b213a]";
          borderClass = "border-l-[#8b5bd3]";
          queueColor = "text-[#a278e6]";
        }

        return (
          <div
            key={match.metadata.matchId}
            className={cn(
              "rounded-xl overflow-hidden mb-2 shadow-md transition-all",
              isMVP ? "ring-1 ring-[#f0ba65]/30" : isACE ? "ring-1 ring-[#8b5bd3]/20" : ""
            )}
          >
            {/* Thin accent bar on top */}
            <div className={cn("h-[3px] w-full", 
              isMVP ? "bg-gradient-to-r from-[#f0ba65] to-[#e8a020]" :
              isACE ? "bg-gradient-to-r from-[#8b5bd3] to-[#6b3db4]" :
              isWin ? "bg-gradient-to-r from-[#4c92fc] to-[#2c72dc]" :
              "bg-gradient-to-r from-[#e84057] to-[#c02040]"
            )} />

            <div className={cn("flex items-stretch p-0 border border-t-0 border-[#2b2c30]/70 rounded-b-xl", bgClass)}>

              {/* ── LEFT: Queue / Result / Time ── */}
              <div className={cn(
                "flex flex-col justify-center px-3 py-4 w-[100px] md:w-[120px] shrink-0 border-r",
                isWin ? "border-[#2c3955]" : "border-[#432C33]"
              )}>
                <p className={cn("text-[11px] font-black leading-tight truncate", queueColor)}>
                  {getQueueType(match.info.queueId, match.info.gameMode)}
                </p>
                <p className="text-[10px] text-[#9e9eb1] mt-0.5">{timeAgo(match.info.gameEndTimestamp)}</p>
                <div className="mt-2 pt-2 border-t border-[#2b2c30]/40">
                  <p className={cn("text-[12px] font-black", isWin ? "text-white" : "text-[#9e9eb1]")}>
                    {isWin ? "Vitória" : "Derrota"}
                  </p>
                  <p className="text-[10px] text-[#9e9eb1]">{durationMin}m {durationSec}s</p>
                </div>
              </div>

              {/* ── CENTER: Champion + Stats + Items ── */}
              <div className="flex flex-col gap-2.5 flex-1 px-3 py-3">

                {/* Row 1: Champ + Spells + Runes + KDA + CS */}
                <div className="flex items-center gap-3">
                  {/* Champion portrait */}
                  <div className="relative shrink-0">
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/champion/${getChampionName(p.championName)}.png`}
                      alt={p.championName}
                      className="w-[52px] h-[52px] rounded-xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-[#111215] text-white text-[9px] font-black w-[18px] h-[18px] flex items-center justify-center rounded-full border border-[#31313c]">
                      {p.champLevel}
                    </div>
                  </div>

                  {/* Spells + Runes (vertical) */}
                  <div className="flex gap-1">
                    <div className="flex flex-col gap-[3px]">
                      <img src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/spell/${SPELL_ICONS[p.summoner1Id] || "SummonerFlash"}.png`} alt="" className="w-[22px] h-[22px] rounded" referrerPolicy="no-referrer" />
                      <img src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/spell/${SPELL_ICONS[p.summoner2Id] || "SummonerSmite"}.png`} alt="" className="w-[22px] h-[22px] rounded" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex flex-col gap-[3px]">
                      <div className="w-[22px] h-[22px] bg-[#111215]/60 rounded-full flex items-center justify-center border border-[#31313c]/50"><Zap className="w-3 h-3 text-yellow-400" /></div>
                      <div className="w-[22px] h-[22px] bg-[#111215]/60 rounded-full flex items-center justify-center border border-[#31313c]/50"><Shield className="w-3 h-3 text-blue-400" /></div>
                    </div>
                  </div>

                  {/* KDA */}
                  <div className="flex flex-col justify-center ml-1">
                    <p className="text-[17px] md:text-[19px] font-black text-white leading-none tracking-tight">
                      <span className="text-[#5de8c8]">{p.kills}</span>
                      <span className="text-[#9e9eb1] text-[14px] font-normal mx-1">/</span>
                      <span className="text-[#e84057]">{p.deaths}</span>
                      <span className="text-[#9e9eb1] text-[14px] font-normal mx-1">/</span>
                      <span>{p.assists}</span>
                    </p>
                    <p className="text-[11px] text-[#9e9eb1] mt-0.5">{kdaRatio}:1 KDA</p>
                  </div>

                  {/* CS & Vision — hidden on small screens */}
                  <div className={cn("hidden lg:flex flex-col ml-auto pl-4 border-l", isWin ? "border-[#2c3955]" : "border-[#432C33]")}>
                    <p className="text-[12px] text-[#9e9eb1]">CS <span className="text-white font-bold">{cs}</span> <span className="text-[#9e9eb1] text-[11px]">({cspm})</span></p>
                    <p className="text-[11px] text-[#9e9eb1]">Visão <span className="text-white font-bold">{p.visionScore}</span></p>
                  </div>
                </div>

                {/* Row 2: Items + Badge */}
                <div className="flex items-center gap-2">
                  {/* Items */}
                  <div className="flex gap-[3px] flex-wrap">
                    {[0, 1, 2, 3, 4, 5].map((i) => {
                      const itemId = (p as any)[`item${i}`];
                      return (
                        <div key={i} className="w-[26px] h-[26px] bg-[#111215]/50 rounded overflow-hidden border border-[#2b2c30]/40">
                          {itemId > 0 && (
                            <img src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/item/${itemId}.png`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          )}
                        </div>
                      );
                    })}
                    {/* Trinket */}
                    <div className="w-[26px] h-[26px] bg-[#111215]/50 rounded-full overflow-hidden border border-[#2b2c30]/40 ml-1">
                      {(p as any)[`item6`] > 0 && (
                        <img src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/item/${(p as any)[`item6`]}.png`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      )}
                    </div>
                  </div>

                  {/* Badges — stacked column, right-aligned */}
                  <div className="flex flex-col items-end gap-1 ml-auto shrink-0">
                    {/* Multi-kill tag */}
                    {multiKillTag && (
                      <span className={cn(
                        "text-[10px] font-black px-2.5 py-0.5 rounded-full border whitespace-nowrap",
                        multiKillTag === "Penta Kill" ? "bg-[#f0ba65]/15 text-[#f0ba65] border-[#f0ba65]/30" :
                        multiKillTag === "Quadra Kill" ? "bg-[#e84057]/15 text-[#e84057] border-[#e84057]/30" :
                        "bg-[#e84057]/10 text-[#e84057] border-[#e84057]/20"
                      )}>
                        {multiKillTag}
                      </span>
                    )}

                    {/* Rank badge + AI score */}
                    <div className="flex flex-col items-center gap-0.5">
                      {isMVP ? (
                        <span className="bg-gradient-to-br from-[#f0ba65] to-[#d4944e] text-[#1a1200] text-[11px] font-black px-3 py-0.5 rounded-full shadow-md">
                          MVP
                        </span>
                      ) : isACE ? (
                        <span className="bg-gradient-to-br from-[#8b5bd3] to-[#6b3db4] text-white text-[11px] font-black px-3 py-0.5 rounded-full shadow-md">
                          ACE
                        </span>
                      ) : (
                        <span className={cn(
                          "text-[13px] font-black px-2.5 py-0.5 rounded-full",
                          myRank <= 3
                            ? "bg-[#4c92fc]/20 text-[#4c92fc] border border-[#4c92fc]/30"
                            : "bg-[#7b7a8e]/20 text-[#9e9eb1] border border-[#7b7a8e]/20"
                        )}>
                          {myRank}º
                        </span>
                      )}
                      <span className={cn("text-[10px] font-black",
                        isMVP ? "text-[#f0ba65]" : isACE ? "text-[#8b5bd3]" : "text-[#9e9eb1]"
                      )}>
                        {(calculateAIScore(p, match).score / 10).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RIGHT: Participants list ── */}
              <div className={cn(
                "hidden xl:flex gap-3 shrink-0 px-3 py-3 border-l",
                isWin ? "border-[#2c3955]" : "border-[#432C33]"
              )}>
                {[match.info.participants.slice(0, 5), match.info.participants.slice(5, 10)].map((team, teamIdx) => (
                  <div key={teamIdx} className="flex flex-col gap-[3px] w-[82px]">
                    {team.map((part, pidx) => (
                      <div key={pidx} className="flex items-center gap-1">
                        <img src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/champion/${getChampionName(part.championName)}.png`} className="w-[14px] h-[14px] rounded shrink-0" alt="" referrerPolicy="no-referrer" />
                        <span
                          className={cn(
                            "text-[10px] truncate cursor-pointer hover:underline transition-colors leading-tight",
                            part.puuid === summoner.account.puuid ? "font-black text-white" : "text-[#9e9eb1] hover:text-[#4c92fc]"
                          )}
                          onClick={() => { if (onPlayerClick && (part.riotIdGameName || part.summonerName)) onPlayerClick(part.riotIdGameName || part.summonerName, part.riotIdTagline || "BR1"); }}
                          onMouseEnter={(e) => showTooltip(part, match, e)}
                          onMouseMove={moveTooltip}
                          onMouseLeave={hideTooltip}
                        >
                          {part.riotIdGameName || part.summonerName}
                        </span>
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
          className="w-full mt-2 py-3 bg-[#212328] border border-[#31313c] hover:bg-[#31313c]/60 transition-colors rounded-lg text-[#e1e1e1] font-bold text-[13px]"
        >
          {isLoading ? "Carregando..." : "Carregar Mais Partidas"}
        </button>
      )}

      {/* Floating Player Tooltip */}
      {tooltip && <PlayerTooltip data={tooltip} />}
    </div>
  );
};
