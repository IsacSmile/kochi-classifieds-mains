"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ShieldCheck, ChevronDown } from "lucide-react";
import SearchAutocompleteDropdown, { useAutocomplete } from "./SearchAutocompleteDropdown";

export interface LocationOption {
  id: number;
  name: string;
  slug: string;
}

export interface BusinessPhoto {
  imageUrl: string;
}

export interface BusinessProp {
  id: number;
  name: string;
  slug: string;
  category?: { name: string; slug: string } | null;
  location?: { name: string; slug: string } | null;
  businessPhotos?: BusinessPhoto[];
}

interface HeroSearchProps {
  locations: LocationOption[];
  featuredBusinesses?: BusinessProp[];
}

interface CardData {
  id: string | number;
  name: string;
  categoryName: string;
  locationName: string;
  imageUrl: string;
  slug?: string;
  query?: string;
}

const DEFAULT_HERO_CARDS: CardData[] = [
  {
    id: "default-1",
    name: "Studio 9 Salon",
    categoryName: "BEAUTY & WELLNESS",
    locationName: "Kakkanad, Kochi",
    imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80",
    query: "Studio 9 Salon",
  },
  {
    id: "default-2",
    name: "Malabar Kitchen",
    categoryName: "DINING & CAFES",
    locationName: "Fort Kochi, Kochi",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
    query: "Malabar Kitchen",
  },
  {
    id: "default-3",
    name: "Prime Properties",
    categoryName: "REAL ESTATE",
    locationName: "Edappally, Kochi",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80",
    query: "Prime Properties",
  },
  {
    id: "default-4",
    name: "WeatherShield Roofing",
    categoryName: "HOME & SERVICES",
    locationName: "Vyttila, Kochi",
    imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
    query: "WeatherShield Roofing",
  },
];

export default function HeroSearch({ locations, featuredBusinesses = [] }: HeroSearchProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { suggestions, isLoading, isOpen, setIsOpen } = useAutocomplete(keyword);

  // Close autocomplete dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    const params = new URLSearchParams();
    if (keyword.trim()) {
      params.set("q", keyword.trim());
    }
    if (selectedLocation) {
      params.set("location", selectedLocation);
    }
    router.push(`/search?${params.toString()}`);
  };

  const handleQuickFilter = (filterText: string) => {
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(filterText)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Build hero cards directly from DB featured businesses (limit 4)
  const heroCards: CardData[] = featuredBusinesses.map((biz, idx) => ({
    id: biz.id,
    name: biz.name,
    categoryName: biz.category?.name ? biz.category.name.toUpperCase() : "FEATURED",
    locationName: biz.location?.name ? `${biz.location.name}, Kochi` : "Kochi",
    imageUrl:
      biz.businessPhotos && biz.businessPhotos.length > 0 && biz.businessPhotos[0]?.imageUrl
        ? biz.businessPhotos[0].imageUrl
        : DEFAULT_HERO_CARDS[idx % DEFAULT_HERO_CARDS.length].imageUrl,
    slug: biz.slug,
  }));

  // Format locations list for subheading
  const locationListText =
    locations && locations.length > 0
      ? locations.slice(0, 4).map((l) => l.name).join(", ")
      : "Kakkanad, Edappally, Vyttila, Fort Kochi";

  // Quick filters list
  const quickFilters = [
    { label: "Salons Kakkanad", query: "Salons Kakkanad" },
    { label: "Roofing Vyttila", query: "Roofing Vyttila" },
    { label: "Real Estate Edappally", query: "Real Estate Edappally" },
    { label: "Fort Kochi Cafes", query: "Fort Kochi Cafes" },
  ];

  return (
    <section className="bg-white text-slate-800 pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* LEFT COLUMN */}
        <div className={heroCards.length > 0 ? "lg:col-span-7 space-y-6 sm:space-y-7" : "lg:col-span-12 space-y-6 sm:space-y-7 max-w-3xl mx-auto"}>
          {/* 1. Small pill badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF7EC] text-[#1A8A2E] border border-[#1A8A2E]/20 text-[11px] sm:text-xs font-extrabold tracking-wide uppercase shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#1A8A2E] stroke-[2.5]" />
            <span>KOCHI LOCAL BUSINESS DIRECTORY</span>
          </div>

          {/* 2. Large bold heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] lg:leading-[1.12] font-extrabold text-[#000B4D] tracking-tight">
            Find Trusted Businesses <br className="hidden sm:inline" />
            in <span className="text-[#1A8A2E]">Kochi</span>
          </h1>

          {/* 3. Subheading */}
          <p className="text-base sm:text-lg text-[#4B5563] font-normal leading-relaxed max-w-xl">
            Discover local businesses, services and professionals across {locationListText} and more.
          </p>

          {/* 4. Search bar */}
          <div ref={searchContainerRef} className="relative max-w-2xl">
            <form
              onSubmit={handleSearch}
              className="bg-white p-2.5 sm:p-2 rounded-2xl sm:rounded-full shadow-lg shadow-slate-200/60 border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              {/* Input 1: Search keyword */}
              <div className="relative flex-1 flex items-center min-w-0">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none shrink-0" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => {
                    setKeyword(e.target.value);
                    setIsOpen(true);
                  }}
                  onFocus={() => {
                    if (keyword.trim().length >= 2) setIsOpen(true);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search businesses, services or categories..."
                  className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-transparent text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-none"
                />
              </div>

              {/* Input 2: Location Dropdown */}
              <div className="relative flex items-center border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-2 shrink-0 sm:w-44 lg:w-48">
                <MapPin className="w-4 h-4 text-[#1A8A2E] absolute left-3.5 sm:left-5 pointer-events-none shrink-0" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-9 sm:pl-11 pr-8 py-2.5 sm:py-3.5 bg-transparent text-slate-800 text-xs sm:text-sm font-semibold focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.slug}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 sm:py-3.5 bg-[#1A8A2E] hover:bg-[#147024] active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-full transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                <span>Search</span>
              </button>
            </form>

            {/* Live Autocomplete Dropdown */}
            <SearchAutocompleteDropdown
              query={keyword}
              suggestions={suggestions}
              isLoading={isLoading}
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
            />
          </div>

          {/* 5. Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs text-[#4B5563]">
            <span className="font-semibold text-slate-500 text-xs sm:text-sm mr-1">Quick Filters:</span>
            {quickFilters.map((filter, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickFilter(filter.query)}
                className="px-4 py-1.5 rounded-full bg-white border border-slate-200/90 text-slate-700 font-medium text-xs hover:border-[#1A8A2E] hover:text-[#1A8A2E] hover:bg-[#EAF7EC]/50 transition-all cursor-pointer shadow-2xs"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN - FEATURED SHOWCASE GRID */}
        {heroCards.length > 0 && (
          <div className="lg:col-span-5 mt-4 lg:mt-0">
            {heroCards.length === 1 && (
              <div className="max-w-sm mx-auto lg:mx-0">
                <CardItem card={heroCards[0]} router={router} heightClass="h-56 sm:h-64 lg:h-72" />
              </div>
            )}

            {heroCards.length === 2 && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
                <CardItem card={heroCards[0]} router={router} heightClass="h-48 sm:h-56 lg:h-64" />
                <CardItem card={heroCards[1]} router={router} heightClass="h-48 sm:h-56 lg:h-64" />
              </div>
            )}

            {heroCards.length === 3 && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
                <div className="space-y-3 sm:space-y-4 lg:space-y-5">
                  <CardItem card={heroCards[0]} router={router} heightClass="h-44 sm:h-52 lg:h-60" />
                  <CardItem card={heroCards[2]} router={router} heightClass="h-44 sm:h-52 lg:h-60" />
                </div>
                <div className="space-y-3 sm:space-y-4 lg:space-y-5 lg:pt-8">
                  <CardItem card={heroCards[1]} router={router} heightClass="h-44 sm:h-52 lg:h-60" />
                </div>
              </div>
            )}

            {heroCards.length >= 4 && (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
                {/* Column 1 of Grid (Cards 1 & 3) */}
                <div className="space-y-3 sm:space-y-4 lg:space-y-5">
                  {[heroCards[0], heroCards[2]].filter(Boolean).map((card) => (
                    <CardItem key={card.id} card={card} router={router} heightClass="h-44 sm:h-52 lg:h-60" />
                  ))}
                </div>

                {/* Column 2 of Grid (Cards 2 & 4) with vertical offset on desktop */}
                <div className="space-y-3 sm:space-y-4 lg:space-y-5 lg:pt-8">
                  {[heroCards[1], heroCards[3]].filter(Boolean).map((card) => (
                    <CardItem key={card.id} card={card} router={router} heightClass="h-44 sm:h-52 lg:h-60" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function CardItem({
  card,
  router,
  heightClass = "h-44 sm:h-52 lg:h-60",
}: {
  card: CardData;
  router: any;
  heightClass?: string;
}) {
  const handleClick = () => {
    if (card.slug) {
      router.push(`/business/${card.slug}`);
    } else if (card.query) {
      router.push(`/search?q=${encodeURIComponent(card.query)}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${heightClass} border border-slate-100 cursor-pointer`}
    >
      <img
        src={card.imageUrl}
        alt={card.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-3.5 sm:p-4 text-white">
        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#10B981] mb-0.5 sm:mb-1 drop-shadow-xs">
          {card.categoryName}
        </span>
        <h3 className="font-extrabold text-white text-xs sm:text-base leading-tight drop-shadow-xs line-clamp-1 group-hover:text-emerald-200 transition-colors">
          {card.name}
        </h3>
        <p className="text-[10px] sm:text-xs text-slate-200/90 font-medium mt-0.5 drop-shadow-xs line-clamp-1">
          {card.locationName}
        </p>
      </div>
    </div>
  );
}
