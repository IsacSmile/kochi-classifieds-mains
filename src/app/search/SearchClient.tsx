"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  X,
  Building2,
  MapPin,
  FolderTree,
  ShieldCheck,
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Stethoscope,
  Utensils,
  Wrench,
  CornerDownRight,
} from "lucide-react";
import SearchAutocompleteDropdown, { useAutocomplete } from "@/components/SearchAutocompleteDropdown";

export interface CategoryFilterItem {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface LocationFilterItem {
  id: number;
  parentId?: number | null;
  name: string;
  slug: string;
  count: number;
}

export interface BusinessSearchResult {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  verified: boolean;
  featured: boolean;
  category: { id: number; name: string; slug: string };
  location: { id: number; name: string; slug: string };
  businessPhotos: { imageUrl: string; altText: string | null }[];
}

interface SearchClientProps {
  initialCategories: CategoryFilterItem[];
  initialLocations: LocationFilterItem[];
  suggestedCategories: { id: number; name: string; slug: string; iconName?: string }[];
}

export default function SearchClient({
  initialCategories,
  initialLocations,
  suggestedCategories,
}: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL search params
  const currentQ = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentLocation = searchParams.get("location") || "";
  const currentVerified = searchParams.get("verified") === "true";
  const currentFeatured = searchParams.get("featured") === "true";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Local State
  const [keywordInput, setKeywordInput] = useState(currentQ);
  const [businesses, setBusinesses] = useState<BusinessSearchResult[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const sidebarSearchRef = useRef<HTMLDivElement>(null);
  const { suggestions, isLoading: isAutocompleteLoading, isOpen, setIsOpen } = useAutocomplete(keywordInput);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarSearchRef.current && !sidebarSearchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  // Sync keyword input if searchParams change externally
  useEffect(() => {
    setKeywordInput(currentQ);
  }, [currentQ]);

  // Fetch search results on URL parameter changes
  useEffect(() => {
    fetchSearchResults();
  }, [searchParams]);

  const fetchSearchResults = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams(searchParams.toString());
      if (!query.has("limit")) {
        query.set("limit", "20");
      }
      const res = await fetch(`/api/businesses?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBusinesses(data.businesses || []);
        setTotalResults(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Search fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to update URL params
  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    // Reset to page 1 on filter changes unless explicitly changing page
    if (!("page" in updates)) {
      params.delete("page");
    }
    router.push(`/search?${params.toString()}`);
  };

  const handleKeywordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ q: keywordInput.trim() });
  };

  const handleCategoryToggle = (slug: string) => {
    updateParams({ category: currentCategory === slug ? null : slug });
  };

  const handleLocationToggle = (slug: string) => {
    updateParams({ location: currentLocation === slug ? null : slug });
  };

  const handleVerifiedToggle = () => {
    updateParams({ verified: currentVerified ? null : "true" });
  };

  const handleFeaturedToggle = () => {
    updateParams({ featured: currentFeatured ? null : "true" });
  };

  const handleClearAllFilters = () => {
    setKeywordInput("");
    router.push("/search");
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateParams({ page: newPage.toString() });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const activeFilterCount =
    (currentQ ? 1 : 0) +
    (currentCategory ? 1 : 0) +
    (currentLocation ? 1 : 0) +
    (currentVerified ? 1 : 0) +
    (currentFeatured ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-20 space-y-6">
      {/* Top Header / Breadcrumb / Result Count Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-brand-navy transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-brand-navy font-bold">Search Listings</span>
        </div>

        {/* Results Title & Mobile Filter Trigger */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-brand-navy tracking-tight">
              {currentQ ? (
                <span>
                  Results for <span className="text-brand-green">"{currentQ}"</span>
                </span>
              ) : (
                <span>Explore Local Businesses</span>
              )}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isLoading ? (
                "Searching directory..."
              ) : (
                <span>
                  Showing <strong>{totalResults > 0 ? (currentPage - 1) * 20 + 1 : 0}</strong> -{" "}
                  <strong>{Math.min(currentPage * 20, totalResults)}</strong> of{" "}
                  <strong>{totalResults}</strong> verified business listings in Kochi
                </span>
              )}
            </p>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs shadow-sm"
          >
            <Filter className="w-4 h-4 text-emerald-400" />
            <span>Filter Results</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-brand-green text-white text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active Filter Badges */}
        {activeFilterCount > 0 && (
          <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 font-bold text-[11px] uppercase">Active Filters:</span>

            {currentQ && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-bold border border-slate-200">
                Keyword: "{currentQ}"
                <button onClick={() => updateParams({ q: null })} className="hover:text-rose-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {currentCategory && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-green-light text-brand-green font-bold border border-brand-green/20">
                Category: {initialCategories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                <button onClick={() => updateParams({ category: null })} className="hover:text-rose-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {currentLocation && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-blue-light text-brand-blue font-bold border border-brand-blue/20">
                Location: {initialLocations.find((l) => l.slug === currentLocation)?.name || currentLocation}
                <button onClick={() => updateParams({ location: null })} className="hover:text-rose-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {currentVerified && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                Verified Only
                <button onClick={handleVerifiedToggle} className="hover:text-rose-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {currentFeatured && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                Featured Only
                <button onClick={handleFeaturedToggle} className="hover:text-rose-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            <button
              onClick={handleClearAllFilters}
              className="text-rose-600 hover:underline font-bold text-xs inline-flex items-center gap-1 ml-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Left Filter Sidebar (Desktop) + Right Business Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-6 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-bold text-brand-navy text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-green" />
                Filter Listings
              </h2>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearAllFilters}
                  className="text-xs text-rose-600 font-semibold hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Keyword Search Input */}
            <div ref={sidebarSearchRef} className="relative space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Keyword Search</label>
              <form
                onSubmit={(e) => {
                  setIsOpen(false);
                  handleKeywordSubmit(e);
                }}
                className="relative"
              >
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => {
                    setKeywordInput(e.target.value);
                    setIsOpen(true);
                  }}
                  onFocus={() => {
                    if (keywordInput.trim().length >= 2) setIsOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setIsOpen(false);
                  }}
                  placeholder="Search name or service..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green text-slate-900"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </form>

              <SearchAutocompleteDropdown
                query={keywordInput}
                suggestions={suggestions}
                isLoading={isAutocompleteLoading}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
              />
            </div>

            {/* Checkbox Toggles: Verified & Featured */}
            <div className="space-y-2.5 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-700">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentVerified}
                  onChange={handleVerifiedToggle}
                  className="w-4 h-4 rounded text-brand-green focus:ring-brand-green border-slate-300"
                />
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verified Listings Only
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentFeatured}
                  onChange={handleFeaturedToggle}
                  className="w-4 h-4 rounded text-brand-green focus:ring-brand-green border-slate-300"
                />
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  Featured Businesses
                </span>
              </label>
            </div>

            {/* Category Filter Checkboxes */}
            <div className="space-y-2.5 border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-brand-green" /> Categories
              </h3>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-xs text-slate-600">
                {initialCategories.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <input
                        type="checkbox"
                        checked={currentCategory === cat.slug}
                        onChange={() => handleCategoryToggle(cat.slug)}
                        className="w-4 h-4 rounded text-brand-green focus:ring-brand-green border-slate-300"
                      />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                      {cat.count}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location Filter Checkboxes */}
            <div className="space-y-2.5 border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-blue" /> Locations
              </h3>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-xs text-slate-600">
                {initialLocations.map((loc) => {
                  const isSub = Boolean(loc.parentId);
                  return (
                    <label
                      key={loc.id}
                      className={`flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors ${
                        isSub ? "ml-3 text-slate-600 font-normal" : "font-bold text-brand-navy"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isSub && <CornerDownRight className="w-3 h-3 text-slate-400 shrink-0" />}
                        <input
                          type="checkbox"
                          checked={currentLocation === loc.slug}
                          onChange={() => handleLocationToggle(loc.slug)}
                          className="w-4 h-4 rounded text-brand-blue focus:ring-brand-blue border-slate-300"
                        />
                        <span className="truncate">{loc.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                        {loc.count}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Business Search Results Section */}
        <main className="lg:col-span-3 space-y-6">
          {isLoading ? (
            /* Loading State */
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-brand-green border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Searching directory listings...</p>
            </div>
          ) : businesses.length === 0 ? (
            /* Zero Results State with 3 Suggested Categories */
            <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs text-center space-y-8">
              <div className="max-w-md mx-auto space-y-3">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-brand-navy">No Businesses Match Your Search</h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We couldn't find any approved businesses matching your exact filter criteria. Try adjusting your keyword or clearing category/location filters.
                </p>
                <button
                  onClick={handleClearAllFilters}
                  className="px-4 py-2 bg-brand-green hover:bg-brand-green-hover text-white font-bold text-xs rounded-xl transition-colors shadow-xs inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
                </button>
              </div>

              {/* 3 Suggested Categories */}
              {suggestedCategories && suggestedCategories.length > 0 && (
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Suggested Categories to Explore
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {suggestedCategories.slice(0, 3).map((sug) => (
                      <Link
                        key={sug.id}
                        href={`/search?category=${sug.slug}`}
                        className="p-4 rounded-xl bg-slate-50 hover:bg-brand-green-light border border-slate-200 hover:border-brand-green/40 transition-all flex flex-col items-center text-center space-y-2 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white text-brand-green flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                          <FolderTree className="w-5 h-5 text-brand-green" />
                        </div>
                        <span className="font-bold text-brand-navy text-xs group-hover:text-brand-green transition-colors">
                          {sug.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Business Result Cards Grid (20 per page) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((biz) => {
                const photoUrl = biz.businessPhotos?.[0]?.imageUrl || null;

                return (
                  <div
                    key={biz.id}
                    className="group bg-white rounded-2xl border border-slate-200 hover:border-brand-blue hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
                  >
                    {/* Photo Thumbnail */}
                    <div className="h-44 bg-slate-100 relative overflow-hidden">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={biz.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-brand-green-light text-brand-green flex flex-col items-center justify-center p-4">
                          <Building2 className="w-10 h-10 text-brand-green mb-1" />
                          <span className="text-[10px] font-bold text-slate-400">No Photo</span>
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        {biz.featured ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/90 text-white font-extrabold text-[10px] shadow backdrop-blur-xs flex items-center gap-1">
                            <Star className="w-3 h-3 fill-white" /> Featured
                          </span>
                        ) : <div />}

                        {biz.verified && (
                          <span className="p-1 rounded-full bg-emerald-600 text-white shadow" title="Verified Listing">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between text-xs">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold">
                          <span className="text-brand-green uppercase tracking-wider bg-brand-green-light px-2 py-0.5 rounded">
                            {biz.category?.name}
                          </span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {biz.location?.name}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-brand-navy text-base group-hover:text-brand-blue transition-colors line-clamp-1">
                          {biz.name}
                        </h3>

                        <p className="text-slate-600 line-clamp-2 leading-relaxed text-[11px]">
                          {biz.description || "Top-rated business listing in Kochi."}
                        </p>
                      </div>

                      {/* View Details Button */}
                      <div className="pt-3 border-t border-slate-100">
                        <Link
                          href={`/business/${biz.slug}`}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-50 group-hover:bg-brand-blue group-hover:text-white border border-slate-200 group-hover:border-brand-blue text-brand-navy font-bold rounded-xl transition-all shadow-2xs"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs font-semibold">
              <button
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-8 h-8 rounded-lg font-bold transition-all ${
                      p === currentPage
                        ? "bg-brand-green text-white shadow-xs"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Slide-Over Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-950/70 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-white h-full overflow-y-auto p-5 space-y-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="font-bold text-brand-navy text-sm flex items-center gap-2">
                  <Filter className="w-4 h-4 text-brand-green" />
                  Filter Listings
                </h2>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-brand-navy"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Keyword Search */}
              <form onSubmit={(e) => { handleKeywordSubmit(e); setMobileFilterOpen(false); }} className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Keyword Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="Search name or service..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </form>

              {/* Toggles */}
              <div className="space-y-2.5 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-700">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentVerified}
                    onChange={handleVerifiedToggle}
                    className="w-4 h-4 rounded text-brand-green border-slate-300"
                  />
                  <span>Verified Listings Only</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentFeatured}
                    onChange={handleFeaturedToggle}
                    className="w-4 h-4 rounded text-brand-green border-slate-300"
                  />
                  <span>Featured Businesses</span>
                </label>
              </div>

              {/* Categories */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase">Categories</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto text-xs text-slate-600">
                  {initialCategories.map((cat) => (
                    <label key={cat.id} className="flex items-center justify-between p-1 rounded">
                      <div className="flex items-center gap-2 truncate">
                        <input
                          type="checkbox"
                          checked={currentCategory === cat.slug}
                          onChange={() => handleCategoryToggle(cat.slug)}
                          className="w-4 h-4 rounded border-slate-300 text-brand-green"
                        />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">{cat.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase">Locations</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto text-xs text-slate-600">
                  {initialLocations.map((loc) => {
                    const isSub = Boolean(loc.parentId);
                    return (
                      <label
                        key={loc.id}
                        className={`flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors ${
                          isSub ? "ml-3 text-slate-600 font-normal" : "font-bold text-brand-navy"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {isSub && <CornerDownRight className="w-3 h-3 text-slate-400 shrink-0" />}
                          <input
                            type="checkbox"
                            checked={currentLocation === loc.slug}
                            onChange={() => handleLocationToggle(loc.slug)}
                            className="w-4 h-4 rounded border-slate-300 text-brand-blue"
                          />
                          <span className="truncate">{loc.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold shrink-0">{loc.count}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => { handleClearAllFilters(); setMobileFilterOpen(false); }}
                className="w-1/2 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Clear All
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-1/2 py-2.5 bg-brand-green text-white font-bold text-xs rounded-xl"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
