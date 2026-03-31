import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { SummonerData, MatchData } from "./types";
import { calculateUserStats, getStreak, getWinRate, getInitialTargetRank } from "./utils/helpers";
import { Header } from "./components/Header";
import { ProfileCard } from "./components/ProfileCard";
import { RankCard } from "./components/RankCard";
import { StatsSummary } from "./components/StatsSummary";
import { MatchHistory } from "./components/MatchHistory";
import { ImprovementTips } from "./components/ImprovementTips";
import { HomePage } from "./components/HomePage";
import { SidebarTabs } from "./components/SidebarTabs";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { ContactPage } from "./components/ContactPage";
import { Footer } from "./components/Footer";

const REGIONS = [
  { id: "br1", name: "Brasil" },
  { id: "na1", name: "América do Norte" },
  { id: "euw1", name: "Europa Oeste" },
  { id: "eun1", name: "Europa Nórdica" },
  { id: "kr", name: "Coreia" },
  { id: "jp1", name: "Japão" },
];

export default function App() {
  const [searchInput, setSearchInput] = useState("");
  const [region, setRegion] = useState("br1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summoner, setSummoner] = useState<SummonerData | null>(null);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [matchFilter, setMatchFilter] = useState("all");
  const [matchStart, setMatchStart] = useState(0);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [targetRank, setTargetRank] = useState("GOLD");
  const [selectedLane, setSelectedLane] = useState("");
  const [recentSearches, setRecentSearches] = useState<{ name: string; tag: string; region: string; favorite?: boolean }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState<"home" | "privacy" | "contact">("home");

  useEffect(() => {
    const saved = localStorage.getItem("lol_recent_searches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const getQueueData = (queueType: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR") => {
    return Array.isArray(summoner?.league) ? summoner.league.find(l => l.queueType === queueType) : undefined;
  };
  
  const soloData = getQueueData("RANKED_SOLO_5x5");

  useEffect(() => {
    if (summoner) {
      setTargetRank(getInitialTargetRank(soloData?.tier || "UNRANKED"));
    }
  }, [summoner, soloData?.tier]);

  const toggleFavorite = (name: string, tag: string) => {
    const updated = recentSearches.map(s => {
      if (s.name === name && s.tag === tag) {
        return { ...s, favorite: !s.favorite };
      }
      return s;
    });
    const sorted = [...updated].sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
    setRecentSearches(sorted);
    localStorage.setItem("lol_recent_searches", JSON.stringify(sorted));
  };

  const removeSearch = (name: string, tag: string) => {
    const updated = recentSearches.filter(s => !(s.name === name && s.tag === tag));
    setRecentSearches(updated);
    localStorage.setItem("lol_recent_searches", JSON.stringify(updated));
  };

  const saveSearch = (name: string, tag: string, reg: string) => {
    const existing = recentSearches.find(s => s.name === name && s.tag === tag);
    const newSearch = { name, tag, region: reg, favorite: existing?.favorite || false };
    const filtered = recentSearches.filter(s => !(s.name === name && s.tag === tag));
    const updated = [newSearch, ...filtered].slice(0, 10);
    const sorted = [...updated].sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
    setRecentSearches(sorted);
    localStorage.setItem("lol_recent_searches", JSON.stringify(sorted));
  };

  const handleSearch = async (e?: React.FormEvent, overrideName?: string, overrideTag?: string, overrideRegion?: string) => {
    e?.preventDefault();
    
    let finalName = overrideName;
    let finalTag = overrideTag;
    const finalRegion = overrideRegion || region;

    if (!finalName || !finalTag) {
      const parts = searchInput.split("#");
      finalName = parts[0]?.trim();
      finalTag = parts[1]?.trim();
    }

    if (!finalName || !finalTag) {
      setError("Por favor, insira o Riot ID completo (Nome#Tag)");
      return;
    }

    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    

    setMatchFilter("all");
    setMatchStart(0);

    try {
      const summonerRes = await fetch(`/api/summoner?gameName=${encodeURIComponent(finalName)}&tagLine=${encodeURIComponent(finalTag)}&region=${finalRegion}`);
      if (!summonerRes.ok) throw new Error("Invocador não encontrado");
      const summonerData = await summonerRes.json();
      setSummoner(summonerData);
      saveSearch(finalName, finalTag, finalRegion);

      setLoadingMatches(true);
      const matchesRes = await fetch(`/api/matches?puuid=${summonerData.account.puuid}&region=${finalRegion}`);
      if (!matchesRes.ok) throw new Error("Erro ao buscar partidas");
      const matchesData = await matchesRes.json();
      setMatches(matchesData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMatches(false);
    }
  };

  const loadMatches = async (filter: string, start: number, isLoadMore = false) => {
    if (!summoner) return;
    setLoadingMatches(true);
    try {
      const filterParam = filter === "all" ? "" : `&queue=${filter}`;
      const res = await fetch(`/api/matches?puuid=${summoner.account.puuid}&region=${region}&start=${start}&count=10${filterParam}`);
      if (!res.ok) throw new Error("Erro buscar partidas filtradas");
      const data = await res.json();
      if (isLoadMore) {
        setMatches(prev => [...prev, ...data]);
      } else {
        setMatches(data);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleFilterChange = async (filter: string) => {
    if (!summoner) return;
    setMatchFilter(filter);
    setMatchStart(0);
    setMatches([]);
    setLoadingMatches(true);
    try {
      const filterParam = filter === "all" ? "" : `&queue=${filter}`;
      const res = await fetch(`/api/matches?puuid=${summoner.account.puuid}&region=${region}&start=0&count=10${filterParam}`);
      if (!res.ok) throw new Error("Erro ao buscar partidas filtradas");
      const data = await res.json();
      setMatches(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleLoadMore = () => {
    const nextStart = matchStart + 10;
    setMatchStart(nextStart);
    loadMatches(matchFilter, nextStart, true);
  };

  const flexData = getQueueData("RANKED_FLEX_SR");

  const baseUserStats = calculateUserStats(matches, summoner);

  const detectedLane = baseUserStats.lane || "BOTTOM"; // BOTTOM (ADC) as sensible default
  const effectiveLane = selectedLane !== "" ? selectedLane : detectedLane;
  const userStats = { 
    ...baseUserStats, 
    lane: effectiveLane
  };
  


  
  const streak = getStreak(matches, summoner);
  
  const soloWinRate = getWinRate(soloData);


  const filteredWinRate = (() => {
    if (!summoner || matches.length === 0) return soloWinRate;
    const myPuuid = summoner.account.puuid;
    const wins = matches.filter(m => m.info.participants.find(p => p.puuid === myPuuid)?.win).length;
    return Math.round((wins / matches.length) * 100);
  })();

  const filterLabel = matchFilter === "all" ? "Últimas partidas" :
    matchFilter === "420" ? "Ranqueada Solo" :
    matchFilter === "440" ? "Ranqueada Flex" :
    matchFilter === "450" ? "ARAM" : "Partidas";

  const suggestions = recentSearches.filter(s => 
    s.name.toLowerCase().includes(searchInput.toLowerCase()) || 
    `${s.name}#${s.tag}`.toLowerCase().includes(searchInput.toLowerCase())
  );

  const isHome = !summoner && !loading && !error && page === "home";

  return (
    <div className="min-h-screen bg-[#15161e] text-[#e1e1e1] font-sans selection:bg-[#4C92FC]/30 flex flex-col relative overflow-x-hidden">
      
      
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-[#4c92fc]/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-[#8b5bd3]/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '18s' }} />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] bg-[#5de8c8]/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '15s' }} />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        {!isHome && (
          <Header 
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            region={region}
            setRegion={setRegion}
            loading={loading}
            suggestions={suggestions}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            handleSearch={handleSearch}
            REGIONS={REGIONS}
            isHome={isHome}
            toggleFavorite={toggleFavorite}
            removeSearch={removeSearch}
          />
        )}

      
      {page === "privacy" && (
        <div className="flex-1">
          <PrivacyPolicy onBack={() => setPage("home")} />
        </div>
      )}
      {page === "contact" && (
        <div className="flex-1">
          <ContactPage onBack={() => setPage("home")} />
        </div>
      )}
      {page === "home" && isHome ? (
        <HomePage
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          region={region}
          setRegion={setRegion}
          loading={loading}
          suggestions={suggestions}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          handleSearch={handleSearch}
          REGIONS={REGIONS}
          toggleFavorite={toggleFavorite}
          removeSearch={removeSearch}
          onNavigate={(p) => setPage(p as any)}
        />
      ) : (
        <main className="max-w-[1080px] mx-auto px-4 py-8 flex-1 w-full">
          {error && (
            <div className="bg-[#592c36] border border-[#f24254] rounded-lg p-6 flex flex-col items-center text-center gap-2 text-[#f24254] mb-8">
              <h4 className="font-bold text-[18px]">Desculpe!</h4>
              <p className="text-[14px]">{error}. Verifique se o Riot ID e a região estão corretos.</p>
            </div>
          )}

          {summoner && (
            <div className="flex flex-col gap-2">
              <ProfileCard 
                summoner={summoner} 
                streak={streak} 
                onUpdate={() => handleSearch(undefined, summoner.account.gameName, summoner.account.tagLine, region)} 
                soloData={soloData}
              />

              <div className="flex flex-col lg:flex-row gap-2 mt-4">
                
                <div className="lg:w-[320px] shrink-0">
                  <RankCard soloData={soloData} flexData={flexData} />
                  
                  
                  <ImprovementTips 
                    userStats={userStats} 
                    targetRank={targetRank} 
                    setTargetRank={setTargetRank} 
                    currentTier={soloData?.tier || "UNRANKED"} 
                    selectedLane={effectiveLane}
                    setSelectedLane={setSelectedLane}
                  />

                  
                  {matches.length > 0 && (
                    <SidebarTabs 
                      matches={matches} 
                      puuid={summoner.account.puuid}
                      region={region}
                      onPlayerClick={(gameName, tagLine) => handleSearch(undefined, gameName, tagLine, region)}
                    />
                  )}
                </div>

                
                <div className="flex-1 overflow-hidden">
                  <StatsSummary userStats={userStats} targetRank={targetRank} winRate={filteredWinRate} filterLabel={filterLabel} />

                  {matches.length > 0 ? (
                    <MatchHistory 
                      matches={matches} 
                      summoner={summoner} 
                      region={region}
                      onPlayerClick={(gameName, tagLine) => handleSearch(undefined, gameName, tagLine, region)} 
                      matchFilter={matchFilter}
                      onFilterChange={handleFilterChange}
                      onLoadMore={handleLoadMore}
                      isLoading={loadingMatches}
                    />
                  ) : (
                    <div className="bg-[#1c1d21] border border-[#2b2c30] rounded-lg p-12 text-center text-[#9e9eb1]">
                      Nenhuma partida recente encontrada.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      )}
      <Footer onNavigate={(p) => setPage(p as any)} />
      </div>
    </div>
  );
}
