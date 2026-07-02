"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";

export default function SearchableSelect({ options, value, onChange, placeholder = "Pilih...", icon: Icon, className = "", name }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  // Handle click outside to close
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Hidden input for form submission if name is provided */}
      {name && <input type="hidden" name={name} value={value} />}

      {/* Trigger Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 group"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {Icon && <Icon className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors shrink-0" />}
          <span className={`text-sm truncate ${!selectedOption ? "text-slate-400" : "text-slate-900 font-medium"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-amber-500" : ""}`} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl shadow-amber-900/5 py-2 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-3 pb-2 border-b border-gray-50 mb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
              />
            </div>
          </div>
          
          <ul className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearch("");
                }}
                className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors ${
                  value === option.value ? "bg-amber-50/50 text-amber-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
              </li>
            ))}
            {filteredOptions.length === 0 && <li className="px-4 py-3 text-sm text-gray-400 text-center">Data tidak ditemukan</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
