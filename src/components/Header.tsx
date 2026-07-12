import React from "react";
import { Search, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { SearchDropdown } from "./SearchDropdown";
import { RegionSelect } from "./RegionSelect";
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
            <form onSubmit={(e) => handleSearch(e)} className="flex items-center h-[34px] bg-[#212328] rounded-xl border border-white/10 shadow-2xl focus-within:border-[#4c92fc] transition-colors pl-1">
              <RegionSelect value={region} onChange={setRegion} regions={REGIONS} variant="header" />

              <div className="w-[1px] h-4 bg-white/10 ml-1" />

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
                className="px-3 h-full flex items-center justify-center text-[#4C92FC] hover:bg-[#2b2c30] transition-colors rounded-r-xl"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
              
              
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <SearchDropdown
                    suggestions={suggestions}
                    setSearchInput={setSearchInput}
                    setRegion={setRegion}
                    handleSearch={handleSearch}
                    toggleFavorite={toggleFavorite}
                    removeSearch={removeSearch}
                    className="absolute top-full left-0 right-0 mt-2"
                  />
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
