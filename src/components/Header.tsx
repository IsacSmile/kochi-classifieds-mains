"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  PlusCircle,
  User,
  LogOut,
  LayoutDashboard,
  Building2,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  FolderTree,
} from "lucide-react";

export default function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;

  const [headerSearch, setHeaderSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(headerSearch.trim())}`);
    } else {
      router.push("/search");
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-brand-navy text-xl tracking-tight shrink-0">
          <div className="w-9 h-9 rounded-xl bg-brand-green text-white flex items-center justify-center font-black text-base shadow-sm">
            KC
          </div>
          <span className="hidden sm:inline font-extrabold text-brand-navy">Kochi<span className="text-brand-green">Classifieds</span></span>
        </Link>

        {/* Compact Quick Search Bar (Hidden on Mobile) */}
        <form
          onSubmit={handleHeaderSearch}
          className="hidden md:flex items-center flex-1 max-w-sm relative"
        >
          <input
            type="text"
            value={headerSearch}
            onChange={(e) => setHeaderSearch(e.target.value)}
            placeholder="Search businesses in Kochi..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <Link
            href="#popular-categories"
            className="hover:text-brand-navy transition-colors flex items-center gap-1.5"
          >
            <FolderTree className="w-4 h-4 text-brand-blue" />
            Browse Categories
          </Link>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {/* Add Your Business CTA Button */}
          <Link
            href="/add-business"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-bold text-xs transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Your Business</span>
          </Link>

          {/* User Auth Menu */}
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
          ) : user ? (
            /* Logged In User Dropdown */
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white transition-all text-xs text-brand-navy font-bold focus:outline-none"
              >
                <div className="w-7 h-7 rounded-lg bg-brand-green-light text-brand-green flex items-center justify-center font-extrabold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="hidden md:inline max-w-[100px] truncate">{user.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-xs font-medium space-y-1">
                    <div className="px-4 py-2 border-b border-slate-100 space-y-0.5">
                      <p className="font-bold text-brand-navy truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-brand-green-light text-brand-green font-bold text-[10px] uppercase border border-brand-green/20">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-brand-navy transition-colors font-semibold"
                    >
                      <LayoutDashboard className="w-4 h-4 text-brand-green" />
                      Dashboard
                    </Link>

                    {(user.role === "business_owner" || user.role === "admin") && (
                      <Link
                        href="/my-businesses"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-brand-navy transition-colors font-semibold"
                      >
                        <Building2 className="w-4 h-4 text-brand-blue" />
                        My Businesses
                      </Link>
                    )}

                    {user.role === "admin" && (
                      <Link
                        href="/admin/businesses/pending"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-brand-navy transition-colors font-semibold"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        Admin Panel
                      </Link>
                    )}

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors font-semibold text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Unauthenticated Login / Register Buttons */
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-xl text-slate-700 hover:text-brand-navy font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-brand-navy focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-4 shadow-lg">
          <form onSubmit={handleHeaderSearch} className="relative">
            <input
              type="text"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              placeholder="Search businesses in Kochi..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </form>

          <div className="space-y-2 text-xs font-bold text-slate-700">
            <Link
              href="#popular-categories"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded-lg hover:bg-slate-50"
            >
              Browse Categories
            </Link>
            <Link
              href="/add-business"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl bg-brand-green text-white text-center font-bold"
            >
              + Add Your Business
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
