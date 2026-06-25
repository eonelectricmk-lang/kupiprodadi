'use client';

import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Што бараш?',
}: SearchBarProps) {
  return (
    <div className="flex w-full max-w-2xl overflow-hidden rounded-xl border border-[#2b3f5f] bg-[#0c1726]">
      <div className="flex items-center pl-4 text-gray-400">
        <Search className="h-4 w-4" />
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent px-3 py-3 text-sm text-white placeholder-gray-500 focus:outline-none"
      />
      <button
        onClick={onSearch}
        className="bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        Пребарај
      </button>
    </div>
  );
}
