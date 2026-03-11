import React, { useState } from "react";
import { MatchData } from "../types";
import { getChampionName } from "../utils/helpers";

interface SidebarTabsProps {
  matches: MatchData[];
  puuid: string;
  onPlayerClick?: (gameName: string, tagLine: string) => void;
}

export const SidebarTabs: React.FC<SidebarTabsProps> = ({ matches, puuid, onPlayerClick }) => {
  const [activeTab, setActiveTab] = useState<"Total" | "Solo" | "Flex">("Total");
  const [activePartnerTab, setActivePartnerTab] = useState<"Com" | "Contra">("Com");

  // Calculate Most Played Champions
  const getTopChampions = () => {
    const counts: Record<string, { games: number; wins: number; k: number; d: number; a: number }> = {};
    
    matches.forEach(m => {
      // Filter by queue if needed
      if (activeTab === "Solo" && m.info.queueId !== 420) return;
      if (activeTab === "Flex" && m.info.queueId !== 440) return;

      const p = m.info.participants.find(p => p.puuid === puuid);
      if (!p) return;

      if (!counts[p.championName]) {
        counts[p.championName] = { games: 0, wins: 0, k: 0, d: 0, a: 0 };
      }
      counts[p.championName].games += 1;
      counts[p.championName].wins += p.win ? 1 : 0;
      counts[p.championName].k += p.kills;
      counts[p.championName].d += p.deaths;
      counts[p.championName].a += p.assists;
    });

    return Object.entries(counts)
      .map(([name, stats]) => ({
        name,
        ...stats,
        winRate: Math.round((stats.wins / stats.games) * 100),
        kda: ((stats.k + stats.a) / Math.max(1, stats.d)).toFixed(2)
      }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 5); // top 5
  };

  const topChamps = getTopChampions();

  // Calculate recent players
  const getRecentPlayers = () => {
    const players: Record<string, { games: number; wins: number; name: string; tag: string; championName: string }> = {};

    matches.forEach(m => {
      const isMyTeam = m.info.participants.find(p => p.puuid === puuid)?.teamId;
      
      m.info.participants.forEach(p => {
        if (p.puuid === puuid) return;

        const isSameTeam = p.teamId === isMyTeam;
        if ((activePartnerTab === "Com" && !isSameTeam) || (activePartnerTab === "Contra" && isSameTeam)) return;

        if (!players[p.puuid]) {
          players[p.puuid] = { 
            games: 0, 
            wins: 0, 
            name: p.riotIdGameName || p.summonerName, 
            tag: p.riotIdTagline || "",
            championName: p.championName
          };
        }
        players[p.puuid].games += 1;
        players[p.puuid].wins += p.win ? 1 : 0;
      });
    });

    return Object.values(players)
      .sort((a, b) => b.games - a.games)
      .slice(0, 6);
  };

  const recentPlayers = getRecentPlayers();

  return (
    <div className="flex flex-col gap-2 mt-2">
      {/* Top Champions Card */}
      <div className="bg-[#212328] border border-[#31313c] rounded overflow-hidden">
        <div className="flex border-b border-[#31313c]">
          <button 
            className={`flex-1 py-3 text-[12px] font-bold ${activeTab === "Total" ? "bg-[#31313c]/30 text-[#e1e1e1] border-b-2 border-[#5de8c8]" : "text-[#9e9eb1] hover:text-[#e1e1e1]"}`}
            onClick={() => setActiveTab("Total")}
          >
            Total
          </button>
          <button 
            className={`flex-1 py-3 text-[12px] font-bold border-l border-[#31313c] ${activeTab === "Solo" ? "bg-[#31313c]/30 text-[#e1e1e1] border-b-2 border-[#5de8c8]" : "text-[#9e9eb1] hover:text-[#e1e1e1]"}`}
            onClick={() => setActiveTab("Solo")}
          >
            Classificado Solo
          </button>
          <button 
            className={`flex-1 py-3 text-[12px] font-bold border-l border-[#31313c] ${activeTab === "Flex" ? "bg-[#31313c]/30 text-[#e1e1e1] border-b-2 border-[#5de8c8]" : "text-[#9e9eb1] hover:text-[#e1e1e1]"}`}
            onClick={() => setActiveTab("Flex")}
          >
            Ranqueado Flex
          </button>
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
          <button 
            className={`flex-1 py-1.5 text-[11px] font-bold border border-[#31313c] rounded ${activePartnerTab === "Com" ? "bg-[#31313c]/50 text-[#e1e1e1] border-[#5de8c8]" : "text-[#9e9eb1] hover:bg-[#31313c]"}`}
            onClick={() => setActivePartnerTab("Com")}
          >
            Com
          </button>
          <button 
            className={`flex-1 py-1.5 text-[11px] font-bold border border-[#31313c] rounded ${activePartnerTab === "Contra" ? "bg-[#31313c]/50 text-[#e1e1e1] border-[#e84057]" : "text-[#9e9eb1] hover:bg-[#31313c]"}`}
            onClick={() => setActivePartnerTab("Contra")}
          >
            Contra
          </button>
        </div>

        <div className="px-4 py-2 flex justify-between text-[10px] text-[#9e9eb1] border-b border-[#31313c] font-bold">
          <div className="w-[120px]">Invocador</div>
          <div className="w-[30px] text-center">Jogos</div>
          <div className="w-[80px] text-center">V-D</div>
          <div className="w-[40px] text-right">WR</div>
        </div>

        <div className="pb-2">
          {recentPlayers.length === 0 ? (
            <div className="p-4 text-center text-[12px] text-[#9e9eb1]">Nenhum jogador encontrado.</div>
          ) : (
            recentPlayers.map((player, i) => (
              <div key={i} className="flex justify-between items-center px-4 py-1.5 hover:bg-[#31313c]/30">
                <div className="flex items-center gap-2 w-[120px]">
                  <img src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/champion/${getChampionName(player.championName)}.png`} alt="" className="w-6 h-6 rounded" />
                  <p 
                    className="text-[11px] font-bold text-[#e1e1e1] truncate cursor-pointer hover:underline hover:text-[#4c92fc] transition-colors"
                    onClick={() => {
                      if (onPlayerClick && player.name) {
                        onPlayerClick(player.name, player.tag || "BR1");
                      }
                    }}
                  >
                    {player.name}
                  </p>
                </div>
                <div className="w-[30px] text-[11px] text-[#9e9eb1] text-center">
                  {player.games}
                </div>
                <div className="w-[80px] text-[11px] text-[#9e9eb1] text-center">
                  {player.wins}-{player.games - player.wins}
                </div>
                <div className="w-[40px] text-[11px] font-bold text-right text-[#e1e1e1]">
                  {Math.round((player.wins / player.games) * 100)}%
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
