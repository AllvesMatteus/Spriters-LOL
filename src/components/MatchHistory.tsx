import React from "react";
import { MatchData, SummonerData } from "../types";
import { SPELL_ICONS, calculateAIScore, getChampionName, getQueueType } from "../utils/helpers";
import { Shield, Zap } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MatchHistoryProps {
  matches: MatchData[];
  summoner: SummonerData;
  onPlayerClick?: (gameName: string, tagLine: string) => void;
  matchFilter?: string;
  onFilterChange?: (filter: string) => void;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

export const MatchHistory: React.FC<MatchHistoryProps> = ({ matches, summoner, onPlayerClick, matchFilter = "all", onFilterChange, onLoadMore, isLoading }) => {
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
      <div className="flex bg-[#212328] border border-[#31313c] rounded-lg mb-2 overflow-hidden flex-wrap">
         {filters.map((f, i) => (
           <button
             key={f.value}
             onClick={() => onFilterChange?.(f.value)}
             className={`flex-1 py-3 px-2 text-[12px] md:text-[13px] font-bold transition-colors whitespace-nowrap ${i > 0 ? "border-l border-[#31313c]" : ""} ${
               matchFilter === f.value
                 ? "bg-transparent text-[#e1e1e1] border-b-2 border-[#2eab7e]"
                 : "text-[#9e9eb1] hover:text-[#e1e1e1]"
             }`}
           >
             {f.label}
           </button>
         ))}
       </div>

       {isLoading && matches.length === 0 && (
          <div className="text-center py-6 text-[#9e9eb1] font-bold text-[14px]">Carregando partidas...</div>
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
              "flex items-center p-3 gap-2 md:gap-4 border-l-[6px] rounded mb-1.5 shadow-sm transition-colors",
              bgClass,
              borderClass
            )}
          >
            {/* Leftmost Column: Queue, Time, Result */}
            <div className="flex flex-col justify-center w-[90px] md:w-[120px] shrink-0">
              <p className={cn("text-[11px] md:text-[13px] font-bold leading-tight", queueColor)}>
                {getQueueType(match.info.queueId, match.info.gameMode)}
              </p>
              <p className="text-[10px] md:text-[11px] text-[#9e9eb1] mt-0.5 capitalize">{timeAgo(match.info.gameEndTimestamp)}</p>
              
              <div className={cn("h-px w-8 my-2", isWin ? "bg-[#2c3955]" : "bg-[#432C33]")} />
              
              <p className={cn("text-[11px] md:text-[12px] font-bold", isWin ? "text-white" : "text-[#9e9eb1]")}>{isWin ? "Vitória" : "Derrota"}</p>
              <p className="text-[10px] md:text-[11px] text-[#9e9eb1]">{durationMin}m {durationSec}s</p>
            </div>

            {/* Middle Column */}
            <div className="flex flex-col gap-2 flex-1">
              {/* Top Row: Champ + Spells + Runes + KDA + CS */}
              <div className="flex gap-2 md:gap-4 items-center">
                <div className="flex gap-1 items-start">
                  <div className="relative">
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/champion/${getChampionName(p.championName)}.png`}
                      alt={p.championName}
                      className="w-[48px] h-[48px] md:w-[56px] md:h-[56px] rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1.5 -right-1.5 bg-[#212328] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {p.champLevel}
                    </div>
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <img src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/spell/${SPELL_ICONS[p.summoner1Id] || "SummonerFlash"}.png`} alt="spell" className="w-[24px] h-[24px] md:w-[27px] md:h-[27px] rounded" referrerPolicy="no-referrer" />
                    <img src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/spell/${SPELL_ICONS[p.summoner2Id] || "SummonerSmite"}.png`} alt="spell" className="w-[24px] h-[24px] md:w-[27px] md:h-[27px] rounded" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex flex-col gap-[2px]">
                    <div className="w-[24px] h-[24px] md:w-[27px] md:h-[27px] bg-[#111215]/50 rounded-full flex items-center justify-center border border-[#31313c]/50">
                      <Zap className="w-3.5 h-3.5 text-yellow-500" />
                    </div>
                    <div className="w-[24px] h-[24px] md:w-[27px] md:h-[27px] bg-[#111215]/50 rounded-full flex items-center justify-center border border-[#31313c]/50">
                      <Shield className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <p className="text-[14px] md:text-[16px] font-bold text-white tracking-wide">
                    {p.kills} <span className="text-[#9e9eb1] font-normal mx-0.5">/</span> <span className="text-[#e84057]">{p.deaths}</span> <span className="text-[#9e9eb1] font-normal mx-0.5">/</span> {p.assists}
                  </p>
                </div>

                <div className={cn("hidden lg:flex flex-col justify-center px-4 ml-auto border-l", isWin ? "border-[#2c3955]" : "border-[#6b3e45]")}>
                  <p className="text-[12px] text-[#9e9eb1] whitespace-nowrap">CS {cs} ({cspm})</p>
                  <p className="text-[12px] text-[#9e9eb1] font-medium whitespace-nowrap">
                    {kdaRatio}:1 KDA
                  </p>
                </div>
              </div>

              {/* Bottom Row: Items + Badges */}
              <div className="flex gap-2 items-center flex-wrap">
                <div className="flex gap-[2px]">
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                    const itemId = (p as any)[`item${i}`];
                    const isTrinket = i === 6;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "bg-[#111215]/40 overflow-hidden flex-shrink-0",
                          isTrinket ? "w-[24px] h-[24px] md:w-[24px] md:h-[24px] rounded-full ml-1" : "w-[24px] h-[24px] md:w-[24px] md:h-[24px] rounded"
                        )}
                      >
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

                <div className="flex gap-1 ml-1 md:ml-2">
                  {multiKillTag && (
                    <span className="bg-[#e84057] text-white text-[10px] md:text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {multiKillTag}
                    </span>
                  )}
                  <div className="flex flex-col items-center">
                    {isMVP ? (
                      <span className="bg-[#f0ba65] text-white text-[10px] md:text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                        MVP
                      </span>
                    ) : isACE ? (
                      <span className="bg-[#8b5bd3] text-white text-[10px] md:text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                        ACE
                      </span>
                    ) : (
                      <span className="bg-[#7b7a8e] text-white text-[10px] md:text-[11px] font-bold px-2 py-0.5 rounded-full">
                        {myRank}º
                      </span>
                    )}
                    <span className="text-[9px] font-black text-[#9e9eb1] mt-0.5">
                      {(calculateAIScore(p, match).score / 10).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Far Right Participants Column */}
            <div className="hidden xl:flex gap-4 w-[200px] shrink-0 justify-end ml-auto">
              {/* Team 1 */}
              <div className="flex flex-col gap-[2px] w-[85px]">
                {match.info.participants.slice(0, 5).map((part, pidx) => (
                  <div key={pidx} className="flex items-center gap-1.5">
                    <img src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/champion/${getChampionName(part.championName)}.png`} className="w-4 h-4 rounded" alt="champ" referrerPolicy="no-referrer" />
                    <span 
                      className={cn(
                        "text-[11px] truncate tracking-tight cursor-pointer hover:underline transition-colors", 
                        part.puuid === summoner.account.puuid ? "font-bold text-white" : "text-[#9e9eb1] hover:text-[#4c92fc]"
                      )}
                      onClick={() => {
                        if (onPlayerClick && (part.riotIdGameName || part.summonerName)) {
                          onPlayerClick(part.riotIdGameName || part.summonerName, part.riotIdTagline || "BR1");
                        }
                      }}
                    >
                      {part.riotIdGameName || part.summonerName}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Team 2 */}
              <div className="flex flex-col gap-[2px] w-[85px]">
                {match.info.participants.slice(5, 10).map((part, pidx) => (
                  <div key={pidx} className="flex items-center gap-1.5">
                    <img src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/champion/${getChampionName(part.championName)}.png`} className="w-4 h-4 rounded" alt="champ" referrerPolicy="no-referrer" />
                    <span 
                      className={cn(
                        "text-[11px] truncate tracking-tight cursor-pointer hover:underline transition-colors", 
                        part.puuid === summoner.account.puuid ? "font-bold text-white" : "text-[#9e9eb1] hover:text-[#4c92fc]"
                      )}
                      onClick={() => {
                        if (onPlayerClick && (part.riotIdGameName || part.summonerName)) {
                          onPlayerClick(part.riotIdGameName || part.summonerName, part.riotIdTagline || "BR1");
                        }
                      }}
                    >
                      {part.riotIdGameName || part.summonerName}
                    </span>
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
    </div>
  );
};
