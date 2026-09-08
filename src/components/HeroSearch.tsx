"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Sparkles, Building2 } from "lucide-react";

export interface LocationOption {
  id: number;
  name: string;
  slug: string;
}

interface HeroSearchProps {
  locations: LocationOption[];
}

export default function HeroSearch({ locations }: HeroSearchProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) {
      params.set("q", keyword.trim());
    }
    if (selectedLocation) {
      params.set("location", selectedLocation);
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative bg-gradient-to-br from-brand-navy via-[#001366] to-slate-900 text-white pt-14 pb-20 px-4 sm:px-6 overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-blue/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300 text-xs font-bold shadow-lg">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Kochi's Premier Local Business Directory</span>
        </div>

        {/* Hero Heading */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
          Find Top Local Businesses & Services in <span className="text-emerald-400">Kochi</span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
          Discover verified local shops, doctors, restaurants, home services, and professionals across Kochi, Ernakulam, and Kakkanad.
        </p>

        {/* Search Box Card */}
        <form
          onSubmit={handleSearch}
          className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 text-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-3 max-w-3xl mx-auto mt-8"
        >
          {/* Keyword Search Input */}
          <div className="sm:col-span-6 relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="What are you looking for? (e.g. Dentists, Cafes, Plumbers)"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition-all text-slate-900"
            />
          </div>

          {/* Location Dropdown */}
          <div className="sm:col-span-4 relative flex items-center">
            <MapPin className="w-5 h-5 text-brand-green absolute left-3.5 pointer-events-none" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full pl-11 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition-all appearance-none text-slate-900 cursor-pointer"
            >
              <option value="">All Locations in Kochi</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.slug}>
                  {loc.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 pointer-events-none text-slate-400 text-xs">▼</div>
          </div>

          {/* Search Button */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full h-full py-3 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Quick Location Pills */}
        <div className="pt-2 flex items-center justify-center gap-2 flex-wrap text-xs text-slate-300">
          <span className="font-semibold text-slate-400">Popular Areas:</span>
          {locations.slice(0, 5).map((loc) => (
            <button
              key={loc.id}
              onClick={() => router.push(`/search?location=${loc.slug}`)}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-[11px] transition-colors border border-white/10"
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
