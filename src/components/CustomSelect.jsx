"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function CustomSelect({ options, value, onChange, placeholder = "Pilih...", icon: Icon, className = "", name }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Handle click outside to close
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Hidden input for form submission if name is provided */}
      {name && <input type="hidden" name={name} value={value} />}

      {/* Trigger Button */}
      <div onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full cursor-pointer bg-transparent py-1.5 px-2 group outline-none">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-amber-500" />}
          <span className={`text-sm font-black truncate ${!selectedOption ? "text-gray-400" : "text-gray-700 group-hover:text-amber-600 transition-colors"}`}>{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-amber-500" : ""}`} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-64 mt-2 -right-2 bg-white border border-gray-100 rounded-xl shadow-xl shadow-amber-900/5 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
          <ul className="max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors ${
                  value === option.value ? "bg-amber-50/50 text-amber-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span>{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 text-amber-600" />}
              </li>
            ))}
            {options.length === 0 && <li className="px-4 py-3 text-sm text-gray-400 text-center">Tidak ada pilihan</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
