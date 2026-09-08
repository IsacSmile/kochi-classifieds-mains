import Link from "next/link";
import { FolderTree, MapPin, ShieldCheck, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          Kochi Classifieds Business Directory Platform
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white">
          Admin Management Portal
        </h1>

        <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
          Manage categories, locations, subcategories, sub-localities, drag-and-drop reordering, and role-protected CRUD operations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-left">
          <Link
            href="/admin/categories"
            className="p-5 rounded-xl bg-slate-800 border border-slate-700 hover:border-indigo-500 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <FolderTree className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-white text-base">Categories CRUD</h3>
            <p className="text-slate-400 text-xs mt-1">
              Create, edit, delete, reorder via sort_order, and nest subcategories under categories.
            </p>
          </Link>

          <Link
            href="/admin/locations"
            className="p-5 rounded-xl bg-slate-800 border border-slate-700 hover:border-indigo-500 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-bold text-white text-base">Locations CRUD</h3>
            <p className="text-slate-400 text-xs mt-1">
              Create, edit, delete, reorder via sort_order, and nest sub-localities under primary locations.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
