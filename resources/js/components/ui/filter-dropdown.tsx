import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpDown } from 'lucide-react';

// Explicit type definitions for your component inputs
interface FilterDropdownProps {
  onFilterChange?: (status: 'pending' | 'approved' | 'on-going') => void;
  onReset?: () => void;
}

export default function FilterDropdown({ onFilterChange, onReset }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking anywhere outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (status: 'pending' | 'approved' | 'on-going'): void => {
    setIsOpen(false);
    if (onFilterChange) onFilterChange(status);
  };

  const handleResetClick = (): void => {
    setIsOpen(false);
    if (onReset) onReset();
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        id="filterDropdown"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 cursor-pointer rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors duration-150"
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <ArrowUpDown className="h-4 w-4" /> Filter
      </button>

      {/* Dropdown Menu Panel */}
      <div
        className={`absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10 transition-all duration-100 ${
          isOpen 
            ? 'transform opacity-100 scale-100 block' 
            : 'transform opacity-0 scale-95 hidden'
        }`}
      >
        <div className="py-1">
            <span className="block px-4 py-1.5 text-[11px] font-bold tracking-wider text-emerald-800/60 uppercase">
                Filter by Status
            </span>
            
            {/* Pending Filter */}
            <button
                type="button"
                onClick={() => handleItemClick('pending')}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50/50 hover:text-gray-900 transition-colors cursor-pointer"
            >
                {/* Pure Tailwind Pulse Dot Indicator */}
                <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gray-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gray-500"></span>
                </span>
                Pending
            </button>
            
            {/* Approved Filter */}
            <button
                type="button"
                onClick={() => handleItemClick('approved')}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-emerald-50/50 hover:text-emerald-900 transition-colors cursor-pointer"
            >
                {/* Pure Tailwind Steady Dot Indicator */}
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                Approved
            </button>

            {/* On-going Filter */}
            <button
                type="button"
                onClick={() => handleItemClick('on-going')}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-amber-50/50 hover:text-amber-900 transition-colors cursor-pointer"
            >
                {/* Pure Tailwind Steady Dot Indicator */}
                <span className="flex h-2 w-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span>
                On-going
            </button>
            
            <hr className="my-1 border-emerald-100/60" />
            
            {/* Reset Filter */}
            <button
                type="button"
                onClick={handleResetClick}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
            >
                <i className="fas fa-undo text-xs text-gray-400"></i> 
                Reset Filters
            </button>
        </div>
      </div>
    </div>
  );
}