import React from "react";
import { Star, X } from "lucide-react";
import { motion } from "framer-motion";

export interface Suggestion {
  name: string;
  tag: string;
  region: string;
  profileIconId?: number;
  favorite?: boolean;
}

interface SearchDropdownProps {
  suggestions: Suggestion[];
  setSearchInput: (val: string) => void;
  setRegion: (val: string) => void;
  handleSearch: (e?: React.FormEvent, overrideName?: string, overrideTag?: string, overrideRegion?: string) => void;
  toggleFavorite?: (name: string, tag: string) => void;
  removeSearch?: (name: string, tag: string) => void;
  className?: string;
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  suggestions,
  setSearchInput,
  setRegion,
  handleSearch,
  toggleFavorite,
  removeSearch,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className={`bg-[#1e2029] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50 py-2 ${className}`}
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
              <img
                src={`https://ddragon.leagueoflegends.com/cdn/16.5.1/img/profileicon/${s.profileIconId}.png`}
                className="w-10 h-10 rounded-full border border-black/50 shadow-md"
                alt=""
              />
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
              className="p-1.5 hover:bg-[#f24254]/20 hover:text-[#f24254] rounded transition-colors text-[#9e9eb1]"
              title="Excluir Histórico"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </motion.div>
  );
};
