import React, { useState, useRef, useEffect } from "react";
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
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && containerRef.current && focusedIndex >= 0) {
      const container = containerRef.current;
      const activeItem = container.children[focusedIndex] as HTMLElement;
      if (activeItem) {
        const containerTop = container.scrollTop;
        const containerBottom = containerTop + container.clientHeight;
        const itemTop = activeItem.offsetTop;
        const itemBottom = itemTop + activeItem.clientHeight;

        if (itemTop < containerTop) {
          container.scrollTop = itemTop;
        } else if (itemBottom > containerBottom) {
          container.scrollTop = itemBottom - container.clientHeight;
        }
      }
    }
  }, [focusedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
        const currentIdx = regions.findIndex((r) => r.id === value);
        setFocusedIndex(currentIdx !== -1 ? currentIdx : 0);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % regions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + regions.length) % regions.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < regions.length) {
        onChange(regions[focusedIndex].id);
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    } else if (e.key === "Tab") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
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
              ref={containerRef}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 min-w-[180px] bg-[#1e2029] border border-white/10 rounded-xl shadow-2xl py-1 z-50 max-h-[190px] overflow-y-auto overflow-x-hidden"
            >
              {regions.map((r, index) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    onChange(r.id);
                    setIsOpen(false);
                    buttonRef.current?.focus();
                  }}
                  className={`w-full text-left px-4 py-2 text-[12px] font-bold transition-colors cursor-pointer block ${
                    value === r.id
                      ? "text-[#5de8c8] bg-white/5"
                      : focusedIndex === index
                      ? "text-[#e1e1e1] bg-[#2b2c30]"
                      : "text-[#e1e1e1] hover:bg-[#2b2c30]"
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
