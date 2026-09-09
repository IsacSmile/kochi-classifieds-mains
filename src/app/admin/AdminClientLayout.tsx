"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  FolderTree,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  User,
  Clock,
  Building2,
} from "lucide-react";

export default function AdminClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const user = session?.user;
  const isAdminUser = user?.role === "admin";

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-xs text-slate-500 font-medium">
        Loading admin session...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden text-brand-navy">
      {/* Clean Sidebar */}
      <aside className="w-64 bg-brand-card text-brand-navy flex flex-col border-r border-slate-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <Link
            href="/admin/categories"
            className="flex items-center shrink-0 py-1"
          >
            <img
              src="/logo.png"
              alt="KochiClassifieds.in"
              className="h-10 w-auto object-contain scale-[1.02] origin-left"
            />
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Directory Management
          </div>

          <Link
            href="/admin/businesses/pending"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              pathname === "/admin/businesses/pending"
                ? "bg-brand-green text-white shadow-sm"
                : "text-slate-600 hover:text-brand-navy hover:bg-white"
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            Pending Approvals
          </Link>

          <Link
            href="/admin/businesses"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
              pathname === "/admin/businesses"
                ? "bg-brand-green text-white shadow-sm"
                : "text-slate-600 hover:text-brand-navy hover:bg-white"
            }`}
          >
            <Building2 className="w-4 h-4" />
            All Businesses
          </Link>

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

        {/* Real User Profile Footer */}
        <div className="p-4 border-t border-slate-200 bg-white space-y-3">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-brand-green-light text-brand-green flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-brand-navy truncate">
                    {user.name || "Admin User"}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-green-light text-brand-green text-[10px] font-bold uppercase tracking-wide border border-brand-green/20">
                  Role: {user.role}
                </span>

                <button
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                  className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-rose-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/admin/login"
              className="flex items-center justify-center gap-2 w-full py-2 bg-brand-green hover:bg-brand-green-hover text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-brand-navy">
              {pathname === "/admin/businesses/pending"
                ? "Pending Business Approvals"
                : pathname === "/admin/businesses"
                ? "All Businesses Management"
                : pathname?.includes("/categories")
                ? "Categories Management"
                : "Locations Management"}
            </h1>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-slate-500">
              KochiClassifieds.in Business Directory Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAdminUser ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-green-light text-brand-green border border-brand-green/20">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
                Access Granted: role=admin
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                Access Denied: role={user?.role || "unauthenticated"}
              </span>
            )}
          </div>
        </header>

        {/* Body View */}
        <main className="flex-1 overflow-auto p-6 bg-white">
          {isAdminUser ? (
            children
          ) : (
            <div className="max-w-md mx-auto my-16 p-8 bg-brand-card rounded-xl shadow-sm border border-slate-200 text-center">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-brand-navy mb-2">403 Access Denied</h2>
              <p className="text-xs text-slate-600 mb-6">
                This administrative section requires an account with{" "}
                <code className="font-semibold text-brand-navy">role = admin</code>. Your
                current role is{" "}
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-rose-600 font-mono">
                  {user?.role || "none"}
                </code>
                .
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/admin/login"
                  className="px-4 py-2 bg-brand-green hover:bg-brand-green-hover text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
                >
                  Sign in as Admin
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
