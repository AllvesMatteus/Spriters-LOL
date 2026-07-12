import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface RegionSelectProps {
  value: string;
  onChange: (val: string) => void;
  regions: { id: string; name: string }[];
  variant?: "header" | "home";
}

export const RegionSelect: React.FC<RegionSelectProps> = ({
  value,
  onChange,
  regions,
  variant = "home"
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={
          variant === "home"
            ? "flex items-center gap-1.5 bg-black/20 hover:bg-black/35 text-white py-1.5 px-3 rounded-lg text-[12px] font-bold cursor-pointer transition-colors focus:outline-none select-none"
            : "flex items-center gap-1 bg-transparent hover:bg-white/5 text-[#e1e1e1] py-1.5 px-2.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors focus:outline-none select-none"
        }
      >
        <span>{value.toUpperCase()}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-45" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 min-w-[150px] bg-[#1e2029] border border-white/10 rounded-xl shadow-2xl py-1 z-50 overflow-hidden"
            >
              {regions.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    onChange(r.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-[12px] font-bold transition-colors cursor-pointer block ${
                    value === r.id ? "text-[#4c92fc] bg-white/5" : "text-[#e1e1e1] hover:bg-[#2b2c30]"
                  }`}
                >
                  {r.id.toUpperCase()}{" "}
                  <span className="text-[10px] font-medium text-[#9e9eb1] ml-1">
                    {r.name}
                  </span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
