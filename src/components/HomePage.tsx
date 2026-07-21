import React, { useEffect, useState, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { SearchDropdown } from "./SearchDropdown";
import { RegionSelect } from "./RegionSelect";
import logo from "../assets/images/logo/logo.png";

const DEFAULT_TAGS: Record<string, string> = {
  br1: "BR1",
  na1: "NA1",
  euw1: "EUW",
  eun1: "EUN",
  kr: "KR",
  jp1: "JP1",
  la1: "LA1",
  la2: "LA2",
  oc1: "OC1",
  tr1: "TR1",
  ru: "RU",
  ph2: "PH2",
  sg2: "SG2",
  th2: "TH2",
  tw2: "TW2",
  vn2: "VN2",
};

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
  const [isTagFocused, setIsTagFocused] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const defaultTag = DEFAULT_TAGS[region] || "BR1";

  const hashIndex = searchInput.indexOf("#");
  const namePart = hashIndex !== -1 ? searchInput.slice(0, hashIndex) : searchInput;
  const tagPart = hashIndex !== -1 ? searchInput.slice(hashIndex + 1) : "";

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes("#")) {
      const [nameVal, tagVal] = val.split("#");
      setSearchInput(`${nameVal}#${tagVal}`);
      setTimeout(() => {
        tagInputRef.current?.focus();
        tagInputRef.current?.select();
      }, 0);
    } else {
      if (tagPart) {
        setSearchInput(`${val}#${tagPart}`);
      } else {
        setSearchInput(val);
      }
    }
    setShowSuggestions(true);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "#") {
      e.preventDefault();
      setSearchInput(`${namePart}#${tagPart}`);
      setTimeout(() => {
        tagInputRef.current?.focus();
        tagInputRef.current?.select();
      }, 0);
    }
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const cleanVal = e.target.value.replace(/#/g, "");
     setSearchInput(`${namePart}#${cleanVal}`);
     setShowSuggestions(true);
   };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !tagPart) {
      e.preventDefault();
      setSearchInput(namePart);
      nameInputRef.current?.focus();
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = namePart.trim();
    const finalTag = tagPart.trim() || defaultTag;
    handleSearch(e, finalName, finalTag, region);
  };

  useEffect(() => {
    const fetchPatches = async () => {
      try {
        const res = await fetch("/api/patch-notes");
        if (!res.ok) throw new Error("Failed to fetch patch notes");
        const data = await res.json();
        if (data.length > 0) {
          setPatches(data);
        } else {
          throw new Error("Empty patches");
        }
      } catch (err) {
        setPatches([
          { title: "Notas da Atualização de League of Legends", url: "https://www.leagueoflegends.com/pt-br/news/tags/patch-notes/", date: "Recente" },
        ]);
      }
    };

    fetchPatches();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full flex-1 pt-6 px-4 pb-8">

      <div className="relative w-full max-w-[600px] mb-6 flex flex-col items-center justify-center gap-4">
        <img
          src={logo}
          alt="Spriters LOL"
          className="h-[110px] w-auto object-contain drop-shadow-[0_0_40px_rgba(76,146,252,0.25)] select-none"
        />
        <p className="text-[#9e9eb1] font-bold tracking-widest uppercase text-sm">Estatísticas do League of Legends</p>
      </div>

      <div className="w-full max-w-[700px] relative z-20">
        <form
          onSubmit={onSubmit}
          className="liquid-glass flex items-center h-[56px] rounded-2xl border border-white/10 shadow-2xl focus-within:border-[#4c92fc] transition-colors"
        >
          <div className="pl-4 pr-2">
            <RegionSelect value={region} onChange={setRegion} regions={REGIONS} variant="home" />
          </div>

          <div
            onClick={() => nameInputRef.current?.focus()}
            className="flex-1 px-4 h-full flex items-center min-w-0 cursor-text"
          >
            <div className="flex items-center gap-2 max-w-full min-w-0">
              <div className="relative inline-flex items-center min-w-0 max-w-full h-full">
                <span className="invisible whitespace-pre text-[16px] font-medium pointer-events-none select-none">
                  {namePart || "Invocador"}
                </span>
                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder="Invocador"
                  value={namePart}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={handleNameChange}
                  onKeyDown={handleNameKeyDown}
                  className="absolute inset-0 w-full h-full bg-transparent border-none focus:outline-none text-[16px] text-[#e1e1e1] placeholder-[#7b7a8e] font-medium p-0"
                />
              </div>

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  tagInputRef.current?.focus();
                }}
                className="flex items-center bg-black/20 hover:bg-black/35 text-white py-1 px-2.5 rounded-lg text-[12px] font-bold transition-colors select-none cursor-text"
              >
                <span className={`mr-0.5 transition-colors duration-150 ${(tagPart || isTagFocused) ? "text-white" : "text-white/40"}`}>#</span>
                <input
                  ref={tagInputRef}
                  type="text"
                  placeholder="tag"
                  value={tagPart}
                  onChange={handleTagChange}
                  onKeyDown={handleTagKeyDown}
                  onFocus={() => {
                    setShowSuggestions(true);
                    setIsTagFocused(true);
                  }}
                  onBlur={() => setIsTagFocused(false)}
                  className="bg-transparent border-none focus:outline-none text-[12px] font-bold text-white w-10 placeholder:text-white/40 p-0"
                  maxLength={5}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 h-full flex items-center justify-center text-[#4C92FC] hover:bg-white/5 transition-colors rounded-r-2xl"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
          </button>
        </form>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <SearchDropdown
              suggestions={suggestions}
              setSearchInput={setSearchInput}
              setRegion={setRegion}
              handleSearch={handleSearch}
              toggleFavorite={toggleFavorite}
              removeSearch={removeSearch}
              className="absolute top-[64px] left-0 right-0"
            />
          )}
        </AnimatePresence>
        {showSuggestions && <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)} />}
      </div>

      <div className="w-full max-w-[700px] mt-8">
        <div className="flex items-center justify-between mb-2.5 px-2">
          <h3 className="text-[14px] font-bold"><span className="text-[#3aa99a]">NOTAS</span> de Atualização</h3>
        </div>
        <div className="liquid-glass rounded-2xl overflow-hidden shadow-xl">
          {patches.length > 0 ? patches.map((patch, index) => {
            return (
              <a
                key={index}
                href={patch.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-6 py-3 border-b border-white/5 hover:bg-white/5 transition-colors last:border-b-0"
              >
                <span className="text-[13.5px] font-medium text-[#e1e1e1]">{patch.title}</span>
                <span className="text-[11px] text-[#9e9eb1] capitalize">{patch.date}</span>
              </a>
            );
          }) : (
            <div className="px-6 py-3 text-[13px] text-[#9e9eb1]">Carregando notas...</div>
          )}
        </div>
      </div>

    </div>
  );
};
