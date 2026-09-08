"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LayoutDashboard, Building2, FolderTree, MapPin, LogOut, ShieldCheck, User } from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const user = session?.user;

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 text-xs text-slate-500 font-medium">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-brand-navy flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-brand-navy text-lg tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-brand-green text-white flex items-center justify-center font-black text-sm">
            KC
          </div>
          <span>KochiClassifieds</span>
        </Link>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-brand-navy">{user?.name}</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-green-light text-brand-green font-bold text-[10px] uppercase border border-brand-green/20">
              {user?.role}
            </span>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1 font-medium text-slate-500 hover:text-rose-600 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
        <div className="bg-brand-card p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-navy flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-brand-green" />
              Welcome back, {user?.name || "Partner"}!
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Business Owner & Admin Management Portal for Kochi Classifieds Local Directory.
            </p>
          </div>

          {user?.role === "admin" && (
            <Link
              href="/admin/categories"
              className="px-4 py-2 bg-brand-green hover:bg-brand-green-hover text-white font-semibold rounded-lg text-xs transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              Go to Admin Control Panel
            </Link>
          )}
        </div>

        {/* Dashboard Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-green-light text-brand-green flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-brand-navy text-base">My Business Listings</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Create, edit, and manage your local business listings, upload photos, set opening hours, and respond to local customer inquiries in Kochi.
            </p>
            <button className="px-3.5 py-2 bg-brand-blue-light hover:bg-brand-blue hover:text-white text-brand-blue font-semibold rounded-lg text-xs transition-colors">
              + Register New Business
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-blue-light text-brand-blue flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-brand-navy text-base">Account Settings</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Update your account details, phone number, and password credentials.
            </p>
            <div className="text-xs text-slate-500 font-mono pt-1">
              Registered Email: <strong>{user?.email}</strong>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
