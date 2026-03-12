import React, { useState, useEffect, useCallback } from "react";
import { MatchData } from "../types";
import { getChampionName } from "../utils/helpers";
import imgLaneTop from "../assets/images/lanes/lane-top.png";
import imgLaneJungle from "../assets/images/lanes/lane-jungle.png";
import imgLaneMid from "../assets/images/lanes/lane-mid.png";
import imgLaneAdc from "../assets/images/lanes/lane-adc.png";
import imgLaneSupport from "../assets/images/lanes/lane-support.png";

interface SidebarTabsProps {
  matches: MatchData[];
  puuid: string;
  region: string;
  onPlayerClick?: (gameName: string, tagLine: string) => void;
}

// ─────────────────────────────────────────────────
// Rank colors + labels
// ─────────────────────────────────────────────────
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

const LANE_LABEL: Record<string, string> = {
  TOP: "Topo", JUNGLE: "Selva", MIDDLE: "Meio", BOTTOM: "Atirador", UTILITY: "Suporte",
};

const LANE_IMG: Record<string, string> = {
  TOP: imgLaneTop,
  JUNGLE: imgLaneJungle,
  MIDDLE: imgLaneMid,
  BOTTOM: imgLaneAdc,
  UTILITY: imgLaneSupport,
};

// Global rank cache shared with MatchHistory tooltip
const rankCache: Record<string, any[]> = (window as any).__rankCache__ ?? ((window as any).__rankCache__ = {});

// ─────────────────────────────────────────────────
// Sidebar Player Tooltip
// ─────────────────────────────────────────────────
interface SidebarTooltipData {
  puuid: string;
  name: string;
  championName: string;
  mainLane: string;
  kda: string;
  games: number;
  wins: number;
  x: number;
  y: number;
  region: string;
}

const SidebarPlayerTooltip: React.FC<{ data: SidebarTooltipData }> = ({ data }) => {
  const { puuid, name, championName, mainLane, kda, games, wins, x, y, region } = data;
  const [rankData, setRankData] = useState<any[] | null>(rankCache[puuid] ?? null);
  const [loading, setLoading] = useState(!rankCache[puuid]);

  useEffect(() => {
    if (rankCache[puuid]) { setRankData(rankCache[puuid]); setLoading(false); return; }
    let cancelled = false;
    fetch(`/api/rank?puuid=${puuid}&region=${region}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => { if (!cancelled) { rankCache[puuid] = d; setRankData(d); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [puuid, region]);

  const soloQ = rankData?.find((e: any) => e.queueType === "RANKED_SOLO_5x5");
  const tier = soloQ?.tier || "UNRANKED";
  const tierStyle = TIER_COLORS[tier] || TIER_COLORS.UNRANKED;
  const wr = games > 0 ? Math.round((wins / games) * 100) : 0;
  const loss = games - wins;

  // Viewport-aware positioning (tooltip on the left of cursor since sidebar is on the left)
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tooltipW = 240;
  const tooltipH = 220;
  const left = x + 16 + tooltipW > vw ? x - tooltipW - 8 : x + 16;
  const top = y + tooltipH > vh ? y - tooltipH - 8 : y + 4;

  return (
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{ left, top }}
    >
      <div
        className="rounded-xl shadow-2xl overflow-hidden"
        style={{ width: tooltipW, background: "#13141a", border: "1px solid #2b2c30" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-3 py-2.5 border-b border-[#2b2c30] bg-[#1a1b20]">
          <div className="relative shrink-0">
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/champion/${getChampionName(championName)}.png`}
              alt={championName}
              className="w-10 h-10 rounded-lg object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black text-white truncate leading-tight">{name}</p>
            <p className="text-[10px] text-[#9e9eb1] mt-0.5 flex items-center gap-1">
              {mainLane && LANE_IMG[mainLane] ? (
                <img
                  src={LANE_IMG[mainLane]}
                  alt={mainLane}
                  className="w-3.5 h-3.5 object-contain opacity-70"
                  style={{ filter: "brightness(0) saturate(100%) invert(70%) sepia(5%) saturate(300%) hue-rotate(200deg)" }}
                />
              ) : null}
              {mainLane ? LANE_LABEL[mainLane] || mainLane : "Lane desconhecida"}
            </p>
          </div>
        </div>

        {/* Rank row */}
        <div
          className="flex items-center gap-3 px-3 py-3 border-b border-[#2b2c30]"
          style={{ background: tierStyle.bg }}
        >
          {loading ? (
            <><div className="w-7 h-7 rounded-full bg-[#2b2c30] animate-pulse shrink-0" /><span className="text-[11px] text-[#9e9eb1] animate-pulse">Buscando elo...</span></>
          ) : soloQ ? (
            <>
              <img
                src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${tier.toLowerCase()}.png`}
                alt={tier}
                className="w-20 h-20 object-contain shrink-0 drop-shadow-xl -my-2"
                onError={e => (e.currentTarget.style.display = "none")}
              />
              <div>
                <p className="text-[12px] font-black leading-tight" style={{ color: tierStyle.color }}>
                  {RANK_LABEL[tier] || tier} {soloQ.rank} · {soloQ.leaguePoints} LP
                </p>
                <p className="text-[10px] text-[#9e9eb1]">
                  {soloQ.wins}V {soloQ.losses}D
                  <span className={`ml-1 font-bold ${
                    Math.round(soloQ.wins / Math.max(1, soloQ.wins + soloQ.losses) * 100) >= 55
                      ? "text-[#5de8c8]" : "text-[#9e9eb1]"
                  }`}>
                    ({Math.round(soloQ.wins / Math.max(1, soloQ.wins + soloQ.losses) * 100)}% WR)
                  </span>
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <div className="w-7 h-7 rounded-full bg-[#2b2c30]/60 flex items-center justify-center text-[#9e9eb1] text-[10px] shrink-0 border border-[#3b3c42]">?</div>
              <div>
                <p className="text-[11px] font-bold text-[#9e9eb1]">Não ranqueado</p>
                <p className="text-[9px] text-[#9e9eb1]/60">Sem partidas ranqueadas</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats: WR together + KDA */}
        <div className="grid grid-cols-3 divide-x divide-[#2b2c30]">
          <div className="flex flex-col items-center py-2.5">
            <span className={`text-[14px] font-black ${wr >= 60 ? "text-[#5de8c8]" : wr >= 50 ? "text-white" : "text-[#f24254]"}`}>{wr}%</span>
            <span className="text-[8px] text-[#9e9eb1] uppercase tracking-wide mt-0.5">Win Rate</span>
          </div>
          <div className="flex flex-col items-center py-2.5">
            <span className="text-[14px] font-black text-[#e1e1e1]">{games}</span>
            <span className="text-[8px] text-[#9e9eb1] uppercase tracking-wide mt-0.5">Jogos</span>
          </div>
          <div className="flex flex-col items-center py-2.5">
            <span className="text-[14px] font-black text-[#e1e1e1]">{kda}</span>
            <span className="text-[8px] text-[#9e9eb1] uppercase tracking-wide mt-0.5">KDA :1</span>
          </div>
        </div>

        {/* W/L mini bar */}
        <div className="px-3 pb-3 pt-1">
          <div className="flex rounded-full overflow-hidden h-[4px]">
            <div className="bg-[#4c92fc] transition-all" style={{ width: `${wr}%` }} />
            <div className="bg-[#e84057] flex-1" />
          </div>
          <div className="flex justify-between text-[9px] text-[#9e9eb1] mt-1">
            <span>{wins}V</span>
            <span>{loss}D</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────
// Main SidebarTabs component
// ─────────────────────────────────────────────────
export const SidebarTabs: React.FC<SidebarTabsProps> = ({ matches, puuid, region, onPlayerClick }) => {
  const [activeTab, setActiveTab] = useState<"Total" | "Solo" | "Flex">("Total");
  const [activePartnerTab, setActivePartnerTab] = useState<"Com" | "Contra">("Com");
  const [tooltip, setTooltip] = useState<SidebarTooltipData | null>(null);

  const showPlayerTooltip = useCallback((playerPuuid: string, name: string, championName: string, mainLane: string, kda: string, games: number, wins: number, e: React.MouseEvent) => {
    setTooltip({ puuid: playerPuuid, name, championName, mainLane, kda, games, wins, x: e.clientX, y: e.clientY, region });
  }, [region]);

  const moveTooltip = useCallback((e: React.MouseEvent) => {
    setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
  }, []);

  const hideTooltip = useCallback(() => setTooltip(null), []);

  // Calculate Most Played Champions
  const getTopChampions = () => {
    const counts: Record<string, { games: number; wins: number; k: number; d: number; a: number }> = {};

    matches.forEach(m => {
      if (activeTab === "Solo" && m.info.queueId !== 420) return;
      if (activeTab === "Flex" && m.info.queueId !== 440) return;

      const p = m.info.participants.find(p => p.puuid === puuid);
      if (!p) return;

      if (!counts[p.championName]) counts[p.championName] = { games: 0, wins: 0, k: 0, d: 0, a: 0 };
      counts[p.championName].games += 1;
      counts[p.championName].wins += p.win ? 1 : 0;
      counts[p.championName].k += p.kills;
      counts[p.championName].d += p.deaths;
      counts[p.championName].a += p.assists;
    });

    return Object.entries(counts)
      .map(([name, stats]) => ({
        name, ...stats,
        winRate: Math.round((stats.wins / stats.games) * 100),
        kda: ((stats.k + stats.a) / Math.max(1, stats.d)).toFixed(2),
      }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 5);
  };

  // Calculate recent players + their KDA + main lane
  const getRecentPlayers = () => {
    const players: Record<string, {
      games: number; wins: number; name: string; tag: string;
      championName: string; puuid: string;
      k: number; d: number; a: number;
      laneCounts: Record<string, number>;
    }> = {};

    matches.forEach(m => {
      const myParticipant = m.info.participants.find(p => p.puuid === puuid);
      const isMyTeam = myParticipant?.teamId;

      m.info.participants.forEach(p => {
        if (p.puuid === puuid) return;

        const isSameTeam = p.teamId === isMyTeam;
        if ((activePartnerTab === "Com" && !isSameTeam) || (activePartnerTab === "Contra" && isSameTeam)) return;

        if (!players[p.puuid]) {
          players[p.puuid] = {
            games: 0, wins: 0,
            name: p.riotIdGameName || p.summonerName,
            tag: p.riotIdTagline || "",
            championName: p.championName,
            puuid: p.puuid,
            k: 0, d: 0, a: 0,
            laneCounts: {},
          };
        }
        players[p.puuid].games += 1;
        players[p.puuid].wins += p.win ? 1 : 0;
        players[p.puuid].k += p.kills;
        players[p.puuid].d += p.deaths;
        players[p.puuid].a += p.assists;

        const lane = p.teamPosition || p.individualPosition || "";
        if (lane) players[p.puuid].laneCounts[lane] = (players[p.puuid].laneCounts[lane] || 0) + 1;
      });
    });

    return Object.values(players)
      .sort((a, b) => b.games - a.games)
      .slice(0, 6)
      .map(pl => ({
        ...pl,
        kda: ((pl.k + pl.a) / Math.max(1, pl.d)).toFixed(2),
        mainLane: Object.entries(pl.laneCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "",
      }));
  };

  const topChamps = getTopChampions();
  const recentPlayers = getRecentPlayers();

  return (
    <div className="flex flex-col gap-2 mt-2">
      {/* Top Champions Card */}
      <div className="bg-[#212328] border border-[#31313c] rounded overflow-hidden">
        <div className="flex border-b border-[#31313c]">
          {(["Total", "Solo", "Flex"] as const).map((tab, i) => (
            <button
              key={tab}
              className={`flex-1 py-3 text-[12px] font-bold ${i > 0 ? "border-l border-[#31313c]" : ""} ${
                activeTab === tab ? "bg-[#31313c]/30 text-[#e1e1e1] border-b-2 border-[#5de8c8]" : "text-[#9e9eb1] hover:text-[#e1e1e1]"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "Solo" ? "Classificado Solo" : tab === "Flex" ? "Ranqueado Flex" : tab}
            </button>
          ))}
        </div>

        <div className="p-0">
          {topChamps.length === 0 ? (
            <div className="p-4 text-center text-[12px] text-[#9e9eb1]">Nenhum dado encontrado para o filtro.</div>
          ) : (
            topChamps.map((champ, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2 hover:bg-[#31313c]/30 border-b border-[#31313c]/50 last:border-0">
                <div className="flex items-center gap-3">
                  <img src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/champion/${getChampionName(champ.name)}.png`} alt={champ.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="text-[13px] font-bold text-[#e1e1e1] truncate max-w-[120px]">{champ.name}</p>
                    <p className="text-[11px] font-medium text-[#2eab7e]">{champ.kda} KDA</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-[13px] font-bold ${champ.winRate >= 50 ? "text-[#e84057]" : "text-[#9e9eb1]"}`}>{champ.winRate}%</p>
                  <p className="text-[11px] text-[#9e9eb1]">{champ.games} jogos</p>
                </div>
              </div>
            ))
          )}
        </div>

        <button className="w-full py-2 bg-[#2a2c33] text-[#e1e1e1] text-[12px] font-bold hover:bg-[#31313c] transition-colors border-t border-[#31313c]">
          Mais
        </button>
      </div>

      {/* Recent Players Card */}
      <div className="bg-[#212328] border border-[#31313c] rounded overflow-hidden">
        <div className="bg-[#31313c]/30 px-3 py-2 border-b border-[#31313c]">
          <h4 className="text-[11px] font-bold text-[#9e9eb1]">Recentemente Jogado Com (Recent 20 Jogos)</h4>
        </div>

        <div className="flex p-2 gap-2">
          {(["Com", "Contra"] as const).map(tab => (
            <button
              key={tab}
              className={`flex-1 py-1.5 text-[11px] font-bold border border-[#31313c] rounded transition-colors ${
                activePartnerTab === tab
                  ? `bg-[#31313c]/50 text-[#e1e1e1] ${tab === "Com" ? "border-[#5de8c8]" : "border-[#e84057]"}`
                  : "text-[#9e9eb1] hover:bg-[#31313c]"
              }`}
              onClick={() => setActivePartnerTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="px-4 py-2 flex justify-between text-[10px] text-[#9e9eb1] border-b border-[#31313c] font-bold">
          <div className="w-[110px]">Invocador</div>
          <div className="w-[30px] text-center">Jogos</div>
          <div className="w-[50px] text-center">V-D</div>
          <div className="w-[34px] text-right">WR</div>
        </div>

        <div className="pb-2">
          {recentPlayers.length === 0 ? (
            <div className="p-4 text-center text-[12px] text-[#9e9eb1]">Nenhum jogador encontrado.</div>
          ) : (
            recentPlayers.map((player, i) => (
              <div
                key={i}
                className="flex justify-between items-center px-4 py-1.5 hover:bg-[#31313c]/30"
              >
                <div className="flex items-center gap-2 w-[110px] min-w-0">
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/champion/${getChampionName(player.championName)}.png`}
                    alt=""
                    className="w-6 h-6 rounded shrink-0"
                  />
                  <p
                    className="text-[11px] font-bold text-[#e1e1e1] truncate cursor-pointer hover:underline hover:text-[#4c92fc] transition-colors"
                    onClick={() => { if (onPlayerClick && player.name) onPlayerClick(player.name, player.tag || "BR1"); }}
                    onMouseEnter={e => showPlayerTooltip(player.puuid, player.name, player.championName, player.mainLane, player.kda, player.games, player.wins, e)}
                    onMouseMove={moveTooltip}
                    onMouseLeave={hideTooltip}
                  >
                    {player.name}
                  </p>
                </div>
                <div className="w-[30px] text-[11px] text-[#9e9eb1] text-center">{player.games}</div>
                <div className="w-[50px] text-[11px] text-[#9e9eb1] text-center">{player.wins}-{player.games - player.wins}</div>
                <div className={`w-[34px] text-[11px] font-bold text-right ${
                  Math.round((player.wins / player.games) * 100) >= 60 ? "text-[#5de8c8]" :
                  Math.round((player.wins / player.games) * 100) >= 50 ? "text-white" : "text-[#e84057]"
                }`}>
                  {Math.round((player.wins / player.games) * 100)}%
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating tooltip */}
      {tooltip && <SidebarPlayerTooltip data={tooltip} />}
    </div>
  );
};
