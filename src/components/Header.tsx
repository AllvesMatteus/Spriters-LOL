import React from "react";
import { Search, Loader2, Star, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import logo from "../assets/images/logo/logo.png";

interface HeaderProps {
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
  isHome: boolean;
  toggleFavorite?: (name: string, tag: string) => void;
  removeSearch?: (name: string, tag: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
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
  isHome,
  toggleFavorite,
  removeSearch
}) => {
  return (
    <header className="liquid-glass border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-[1080px] mx-auto px-4 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-8">
          {!isHome && (
            <div className="flex items-center gap-1 hover:cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.location.reload()}>
              <img src={logo} alt="Spriters LOL" className="h-[36px] w-auto object-contain" />
            </div>
          )}
        </div>

        
        {!isHome && (
          <div className="flex-1 max-w-[400px] ml-auto mr-8 relative">
            <form onSubmit={(e) => handleSearch(e)} className="flex items-center h-[34px] bg-[#212328] rounded-full overflow-hidden border border-[#35363b]">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="bg-transparent border-none py-1.5 px-3 focus:outline-none text-[11px] font-bold text-[#e1e1e1] cursor-pointer"
              >
                {REGIONS.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#212328]">
                    {r.id.toUpperCase()}
                  </option>
                ))}
              </select>

              <div className="w-[1px] h-4 bg-[#35363b]" />

              <div className="flex-1 px-3">
                <input
                  type="text"
                  placeholder="Invocador #BR1"
                  value={searchInput}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  className="w-full bg-transparent border-none py-1 focus:outline-none text-[12px] text-[#e1e1e1] font-medium placeholder-[#7b7a8e]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-3 h-full flex items-center justify-center text-[#4C92FC] hover:bg-[#2b2c30] transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
              
              
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#1e2029] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 py-2"
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
                        <div className="flex items-center gap-3">
                          {s.profileIconId ? (
                            <img src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/profileicon/${s.profileIconId}.png`} className="w-10 h-10 rounded-full border border-black/50 shadow-md" alt="" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-black/20 border border-black/50 shadow-md flex items-center justify-center">
                               <span className="text-[12px] text-[#9e9eb1]">?</span>
                            </div>
                          )}
                          <div className="flex flex-col items-start leading-tight">
                            <span className="text-[15px] font-bold text-[#e1e1e1]">
                              {s.name} <span className="text-[#9e9eb1] font-medium">#{s.tag}</span>
                            </span>
                            <span className="text-[11px] font-bold text-[#62636c] uppercase tracking-widest">{s.region}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
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
                            className="p-1 hover:bg-[#f24254]/20 hover:text-[#f24254] rounded transition-colors text-[#9e9eb1]"
                            title="Excluir Histórico"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
            {showSuggestions && <div className="fixed inset-0 z-40 -top-full -left-full -right-full h-[500vh] w-[500vw]" onClick={() => setShowSuggestions(false)} />}
          </div>
        )}

        
        <div className="flex items-center gap-6 text-[12px] font-bold text-[#e1e1e1]">
        </div>
      </div>
    </header>
  );
};
