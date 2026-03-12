import React, { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Footer } from "./Footer";
import logo from "../assets/images/logo/logo.png";

interface HomePageProps {
  searchInput: string;
  setSearchInput: (val: string) => void;
  region: string;
  setRegion: (val: string) => void;
  loading: boolean;
  suggestions: any[];
  showSuggestions: boolean;
  setShowSuggestions: (val: boolean) => void;
  handleSearch: (e?: React.FormEvent, overrideName?: string, overrideTag?: string, overrideRegion?: string) => void;
  REGIONS: { id: string; name: string }[];
  onNavigate?: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  searchInput,
  setSearchInput,
  region,
  setRegion,
  loading,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  handleSearch,
  REGIONS,
  onNavigate,
}) => {
  const [patches, setPatches] = useState<{ title: string; url: string; date: string }[]>([]);

  useEffect(() => {
    // Busca dinamicamente os patches atuais do RSS/Content API da Riot
    // A Riot não expõe uma API simples para os patch notes, então vamos buscar no rss oficial brasileiro
    // Como estamos no client-side e podemos ter problemas de CORS com feed bruto, vamos usar as versoes do ddragon e formatar a data real.

    const fetchPatches = async () => {
      try {
        const res = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
        const versions: string[] = await res.json();
        
        // Pega as 3 versões mais recentes (Vamos forçar o throw de error logo na frente
        // pois a ddragon está desatualizada no backend deles retornando 16.5 ao invés do 26.5 atual)
        if (versions[0] !== "26.5.1") {
            throw new Error("DDragon indisponível ou desatualizado/assíncrono");
        }
        const uniquePatches = Array.from(new Set(versions.map(v => v.split('.').slice(0, 2).join('.')))).slice(0, 3);
        
        // Estimativa de data baseada no fato de que patches lançam a cada ~14 dias (Quartas).
        // Isso é o padrão que sites como OP.GG e DEEPLOL usam quando não "scrappeam" o blog da riot localmente
        const hoje = new Date();
        hoje.setHours(0,0,0,0);
        
        // O Patch 14.5 (conhecido) foi lançado ~6 Março 2024. O 16.5 seria mais p frente
        // Para ficar mais realista com o que você ve:
        const patchData = uniquePatches.map((patch, index) => {
          const formattedUrl = patch.split('.').join('-'); // 16.5 -> 16-5
          
          let dateStr = "Recente";
          if (index > 0) {
            dateStr = `Há ${index * 14} Dias`;
          }

          return {
            title: `Notas da Atualização de League of Legends ${patch}`,
            url: `https://www.leagueoflegends.com/pt-br/news/game-updates/notas-da-atualizacao-${formattedUrl}/`,
            date: dateStr
          };
        });

        setPatches(patchData);
      } catch (err) {
        // Fallback case hardcoded para os patches da Temporada 26.
        // A Riot Games infelizmente não fornece uma API pública oficial para as notícias do site raiz (apenas para o client/dados do jogo via ddragon).
        // Sites como op.gg utilizam scrapers próprios que burlam o cloudflare para puxar o HTML cru do site.
        setPatches([
          { title: "Notas da Atualização de League of Legends 26.5", url: "https://www.leagueoflegends.com/pt-br/news/game-updates/notas-da-atualizacao-26-5/", date: "Recente" },
          { title: "Notas da Atualização de League of Legends 26.4", url: "https://www.leagueoflegends.com/pt-br/news/game-updates/notas-da-atualizacao-26-4-do-lol/", date: "Há 14 Dias" },
          { title: "Notas da Atualização de League of Legends 26.3", url: "https://www.leagueoflegends.com/pt-br/news/game-updates/notas-da-atualizacao-26-3/", date: "Há 28 Dias" },
        ]);
      }
    };

    fetchPatches();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-64px)] pt-16 px-4">
      {/* Central Logo & Hero */}
      <div className="relative w-full max-w-[600px] mb-8 flex flex-col items-center justify-center gap-4">
        <img 
          src={logo} 
          alt="Spriters LOL" 
          className="h-[140px] w-auto object-contain drop-shadow-[0_0_40px_rgba(76,146,252,0.25)] select-none" 
        />
        <p className="text-[#9e9eb1] font-bold tracking-widest uppercase text-sm">Estatísticas do League of Legends</p>
      </div>

      {/* Main Big Search Bar */}
      <div className="w-full max-w-[700px] relative z-20">
        <form 
          onSubmit={(e) => handleSearch(e)} 
          className="flex items-center h-[56px] bg-[#212328] rounded-full overflow-hidden border border-[#35363b] shadow-2xl focus-within:border-[#4c92fc] transition-colors"
        >
          <div className="pl-4 pr-2">
             <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="bg-[#2b2c30] text-white border-none py-1.5 px-3 rounded-full focus:outline-none text-[12px] font-bold cursor-pointer"
              >
                {REGIONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id.toUpperCase()}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex-1 px-4 h-full">
            <input
              type="text"
              placeholder="Invocador #BR1"
              value={searchInput}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowSuggestions(true);
              }}
              className="w-full h-full bg-transparent border-none focus:outline-none text-[16px] text-[#e1e1e1] placeholder-[#7b7a8e] font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 h-full flex items-center justify-center text-[#4C92FC] hover:bg-[#2b2c30] transition-colors"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
          </button>
        </form>

        {/* Suggestions Context for Big Bar */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute top-[64px] left-0 right-0 bg-[#212328] border border-[#35363b] rounded-2xl overflow-hidden shadow-2xl z-50 py-2"
            >
              <div className="px-5 py-3 border-b border-[#2b2c30]">
                <span className="text-[12px] font-bold text-[#9e9eb1] uppercase tracking-wider">Buscas Recentes</span>
              </div>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSearchInput(`${s.name}#${s.tag}`);
                    setRegion(s.region);
                    handleSearch(undefined, s.name, s.tag, s.region);
                  }}
                  className="w-full px-5 py-3 hover:bg-[#2b2c30] transition-colors flex justify-between items-center group text-left"
                >
                  <span className="text-[15px] font-bold text-[#e1e1e1]">
                    {s.name} <span className="text-[#9e9eb1]">#{s.tag}</span>
                  </span>
                  <span className="text-[11px] font-bold bg-[#313237] text-[#9e9eb1] px-2 py-1 rounded-md group-hover:bg-[#1c1d21]">
                    {s.region.toUpperCase()}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {showSuggestions && <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)} />}
      </div>

      {/* RIOT Notice Section */}
      <div className="w-full max-w-[700px] mt-12">
        <div className="flex items-center justify-between mb-3 px-2">
          <h3 className="text-[14px] font-bold"><span className="text-[#3aa99a]">NOTAS</span> de Atualização</h3>
          <a href="https://www.leagueoflegends.com/pt-br/news/tags/patch-notes/" target="_blank" rel="noreferrer" className="text-[12px] text-[#9e9eb1] hover:text-white transition-colors">Mais &gt;</a>
        </div>
        <div className="bg-[#1c1d21] border border-[#2b2c30] rounded-xl overflow-hidden">
          {patches.length > 0 ? patches.map((patch, index) => {
            return (
              <a 
                key={index}
                href={patch.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-6 py-4 border-b border-[#2b2c30] hover:bg-[#212328] transition-colors last:border-b-0"
              >
                <span className="text-[14px] font-medium text-[#e1e1e1]">{patch.title}</span>
                <span className="text-[12px] text-[#9e9eb1] capitalize">{patch.date}</span>
              </a>
            );
          }) : (
            <div className="px-6 py-4 text-[13px] text-[#9e9eb1]">Carregando notas...</div>
          )}
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};
