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
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/admin/categories" className="flex items-center gap-2 font-bold text-white text-lg">
            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
            <span>Kochi Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Directory Management
          </div>
          
          <Link
            href="/admin/categories"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname?.startsWith("/admin/categories")
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <FolderTree className="w-4 h-4" />
            Categories
          </Link>

          <Link
            href="/admin/locations"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname?.startsWith("/admin/locations")
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Locations
          </Link>
        </nav>

        {/* Role Simulator Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            Current Role Protection
          </div>
          <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-md border border-slate-800">
            <button
              onClick={() => handleRoleChange("admin")}
              className={`text-xs py-1.5 px-2 rounded font-medium transition-all ${
                role === "admin"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Role: Admin
            </button>
            <button
              onClick={() => handleRoleChange("user")}
              className={`text-xs py-1.5 px-2 rounded font-medium transition-all ${
                role === "user"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
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
            <h1 className="text-lg font-bold text-slate-900">
              {pathname?.includes("/categories") ? "Categories CRUD" : "Locations CRUD"}
            </h1>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-500">Local Business Directory Platform</span>
          </div>

          <div className="flex items-center gap-3">
            {role === "admin" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Access Granted: role=admin
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                Access Denied: role=user
              </span>
            )}
          </div>
        </header>

        {/* Body View */}
        <main className="flex-1 overflow-auto p-6 bg-slate-50">
          {role === "admin" ? (
            children
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-xl shadow-sm border border-slate-200 text-center">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">403 Access Denied</h2>
              <p className="text-sm text-slate-600 mb-6">
                These route interfaces (<code className="bg-slate-100 px-1.5 py-0.5 rounded text-rose-600">{pathname}</code>) are protected and restricted exclusively to users with <code className="font-semibold">role = admin</code>.
              </p>
              <button
                onClick={() => handleRoleChange("admin")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm"
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
