"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderTree, MapPin, ShieldAlert, ShieldCheck, UserCheck, LayoutDashboard } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [role, setRole] = useState<"admin" | "user">("admin");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedRole = localStorage.getItem("demo_user_role");
    if (savedRole === "user" || savedRole === "admin") {
      setRole(savedRole as "admin" | "user");
    }
  }, []);

  const handleRoleChange = (newRole: "admin" | "user") => {
    setRole(newRole);
    localStorage.setItem("demo_user_role", newRole);
    document.cookie = `user_role=${newRole}; path=/; max-age=86400`;
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-white overflow-hidden text-brand-navy">
      {/* Clean White/Light Sidebar */}
      <aside className="w-64 bg-brand-card text-brand-navy flex flex-col border-r border-slate-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <Link href="/admin/categories" className="flex items-center gap-2.5 font-bold text-brand-navy text-lg tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-brand-green text-white flex items-center justify-center font-black text-sm">
              KC
            </div>
            <span>KochiClassifieds</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Directory Management
          </div>
          
          <Link
            href="/admin/categories"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              pathname?.startsWith("/admin/categories")
                ? "bg-brand-green text-white shadow-sm"
                : "text-slate-600 hover:text-brand-navy hover:bg-white"
            }`}
          >
            <FolderTree className="w-4 h-4" />
            Categories
          </Link>

          <Link
            href="/admin/locations"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              pathname?.startsWith("/admin/locations")
                ? "bg-brand-green text-white shadow-sm"
                : "text-slate-600 hover:text-brand-navy hover:bg-white"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Locations
          </Link>
        </nav>

        {/* Role Simulator Footer */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-brand-green" />
            Current Role Protection
          </div>
          <div className="grid grid-cols-2 gap-1.5 bg-brand-card p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => handleRoleChange("admin")}
              className={`text-[11px] py-1.5 px-2 rounded font-bold transition-all ${
                role === "admin"
                  ? "bg-brand-green text-white shadow-sm"
                  : "text-slate-600 hover:text-brand-navy"
              }`}
            >
              Role: Admin
            </button>
            <button
              onClick={() => handleRoleChange("user")}
              className={`text-[11px] py-1.5 px-2 rounded font-bold transition-all ${
                role === "user"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-brand-navy"
              }`}
            >
              Role: User
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-brand-navy">
              {pathname?.includes("/categories") ? "Categories CRUD" : "Locations CRUD"}
            </h1>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-slate-500">KochiClassifieds.in Business Directory Admin</span>
          </div>

          <div className="flex items-center gap-3">
            {role === "admin" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-green-light text-brand-green border border-brand-green/20">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
                Access Granted: role=admin
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                Access Denied: role=user
              </span>
            )}
          </div>
        </header>

        {/* Body View */}
        <main className="flex-1 overflow-auto p-6 bg-white">
          {role === "admin" ? (
            children
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 bg-brand-card rounded-xl shadow-sm border border-slate-200 text-center">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-brand-navy mb-2">403 Access Denied</h2>
              <p className="text-xs text-slate-600 mb-6">
                These route interfaces (<code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-rose-600 font-mono">{pathname}</code>) are protected and restricted exclusively to users with <code className="font-semibold">role = admin</code>.
              </p>
              <button
                onClick={() => handleRoleChange("admin")}
                className="px-4 py-2 bg-brand-green hover:bg-brand-green-hover text-white font-medium rounded-lg text-xs transition-colors shadow-sm"
              >
                Switch to Admin Role
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
