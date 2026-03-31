import React, { useEffect, useState } from "react";
import { Search, Loader2, Star, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
  toggleFavorite?: (name: string, tag: string) => void;
  removeSearch?: (name: string, tag: string) => void;
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
  toggleFavorite,
  removeSearch,
}) => {
  const [patches, setPatches] = useState<{ title: string; url: string; date: string }[]>([]);

  useEffect(() => {




    const fetchPatches = async () => {
      try {
        const res = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
        const versions: string[] = await res.json();
        

        const uniquePatches = Array.from(new Set(versions.map(v => v.split('.').slice(0, 2).join('.')))).slice(0, 3);
        

        const patchData = uniquePatches.map((patch, index) => {
          const formattedUrl = patch.split('.').join('-'); // e.g. 14.6 -> 14-6
          
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

        setPatches([
          { title: "Notas da Atualização de League of Legends Terbaru", url: "https://www.leagueoflegends.com/pt-br/", date: "Recente" },
        ]);
      }
    };

    fetchPatches();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-64px)] pt-16 px-4">
      
      <div className="relative w-full max-w-[600px] mb-8 flex flex-col items-center justify-center gap-4">
        <img 
          src={logo} 
          alt="Spriters LOL" 
          className="h-[140px] w-auto object-contain drop-shadow-[0_0_40px_rgba(76,146,252,0.25)] select-none" 
        />
        <p className="text-[#9e9eb1] font-bold tracking-widest uppercase text-sm">Estatísticas do League of Legends</p>
      </div>

      
      <div className="w-full max-w-[700px] relative z-20">
        <form 
          onSubmit={(e) => handleSearch(e)} 
          className="liquid-glass flex items-center h-[56px] rounded-full overflow-hidden border border-white/10 shadow-2xl focus-within:border-[#4c92fc] transition-colors"
        >
          <div className="pl-4 pr-2">
             <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="bg-black/20 text-white border-none py-1.5 px-3 rounded-full focus:outline-none text-[12px] font-bold cursor-pointer"
              >
                {REGIONS.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#212328]">
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
            className="px-6 h-full flex items-center justify-center text-[#4C92FC] hover:bg-white/5 transition-colors"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
          </button>
        </form>

        
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute top-[64px] left-0 right-0 bg-[#1e2029] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 py-2"
            >
              <div className="px-5 py-3 border-b border-[#2b2c30]">
                <span className="text-[12px] font-bold text-[#9e9eb1] uppercase tracking-wider">Buscas Recentes</span>
              </div>
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className="w-full px-5 py-3 hover:bg-[#2b2c30] transition-colors flex justify-between items-center group cursor-pointer"
                  onClick={() => {
                    setSearchInput(`${s.name}#${s.tag}`);
                    setRegion(s.region);
                    handleSearch(undefined, s.name, s.tag, s.region);
                  }}
                >
                  <span className="text-[15px] font-bold text-[#e1e1e1]">
                    {s.name} <span className="text-[#9e9eb1]">#{s.tag}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold bg-[#313237] text-[#9e9eb1] px-2 py-1 rounded-md group-hover:bg-[#1c1d21]">
                      {s.region.toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite && toggleFavorite(s.name, s.tag);
                      }}
                      className="p-1.5 hover:bg-white/10 rounded transition-colors text-[#9e9eb1] hover:text-[#f0ba65]"
                      title={s.favorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
                    >
                      <Star className={`w-4 h-4 ${s.favorite ? "fill-[#f0ba65] text-[#f0ba65]" : ""}`} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSearch && removeSearch(s.name, s.tag);
                      }}
                      className="p-1.5 hover:bg-[#f24254]/20 hover:text-[#f24254] rounded transition-colors text-[#9e9eb1]"
                      title="Excluir Histórico"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {showSuggestions && <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)} />}
      </div>

      
      <div className="w-full max-w-[700px] mt-12">
        <div className="flex items-center justify-between mb-3 px-2">
          <h3 className="text-[14px] font-bold"><span className="text-[#3aa99a]">NOTAS</span> de Atualização</h3>
          <a href="https://www.leagueoflegends.com/pt-br/news/tags/patch-notes/" target="_blank" rel="noreferrer" className="text-[12px] text-[#9e9eb1] hover:text-white transition-colors">Mais &gt;</a>
        </div>
        <div className="liquid-glass rounded-xl overflow-hidden shadow-xl">
          {patches.length > 0 ? patches.map((patch, index) => {
            return (
              <a 
                key={index}
                href={patch.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-colors last:border-b-0"
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

    </div>
  );
};
