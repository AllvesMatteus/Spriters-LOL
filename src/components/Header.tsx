import React from "react";
import { Search, Loader2 } from "lucide-react";
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
}) => {
  return (
    <header className="bg-[#1c1d21] border-b border-[#2b2c30] sticky top-0 z-50">
      <div className="max-w-[1080px] mx-auto px-4 h-16 flex items-center justify-between">
        {/* LOGO AREA */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-1 hover:cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.location.reload()}>
            <img src={logo} alt="Spriters LOL" className="h-[36px] w-auto object-contain" />
          </div>
        </div>

        {/* SEARCH BAR (Hidden on Home Page) */}
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
              
              {/* SUGGESTIONS MODAL */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#1c1d21] border border-[#2b2c30] rounded-xl overflow-hidden shadow-2xl z-50 pb-2"
                  >
                    <div className="px-4 py-2 border-b border-[#2b2c30]">
                      <span className="text-[11px] font-bold text-[#9e9eb1]">Buscas Recentes</span>
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
                        className="w-full px-4 py-2 hover:bg-[#2b2c30] transition-colors flex justify-between items-center group text-left"
                      >
                        <span className="text-[13px] font-bold text-[#e1e1e1]">
                          {s.name} <span className="text-[#9e9eb1]">#{s.tag}</span>
                        </span>
                        <span className="text-[11px] font-bold bg-[#313237] text-[#9e9eb1] px-2 py-0.5 rounded-md group-hover:bg-[#1c1d21]">
                          {s.region.toUpperCase()}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
            {showSuggestions && <div className="fixed inset-0 z-40 -top-full -left-full -right-full h-[500vh] w-[500vw]" onClick={() => setShowSuggestions(false)} />}
          </div>
        )}

        {/* RIGHT AREA Navigation (Removed per user request) */}
        <div className="flex items-center gap-6 text-[12px] font-bold text-[#e1e1e1]">
        </div>
      </div>
    </header>
  );
};
