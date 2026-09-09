import Link from "next/link";
import { Building2, ShieldCheck, MapPin, FolderTree, ArrowRight } from "lucide-react";

export interface FooterCategory {
  id: number;
  name: string;
  slug: string;
}

export interface FooterLocation {
  id: number;
  name: string;
  slug: string;
}

interface FooterProps {
  categories?: FooterCategory[];
  locations?: FooterLocation[];
}

export default function Footer({ categories = [], locations = [] }: FooterProps) {
  return (
    <footer className="bg-brand-navy text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block p-2 bg-white rounded-xl shadow-sm">
              <img
                src="/logo.png"
                alt="KochiClassifieds.in"
                className="h-10 sm:h-12 w-auto object-contain scale-[1.02] origin-left"
              />
            </Link>

            <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
              Kochi's dedicated local business directory platform. Connecting customers with trusted local shops, healthcare providers, restaurants, and professionals across Kochi, Ernakulam, Kakkanad, and Aluva.
            </p>

            <div className="pt-2">
              <Link
                href="/add-business"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-green hover:bg-brand-green-hover text-white font-bold text-xs transition-colors shadow-sm"
              >
                <span>Add Your Business Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <FolderTree className="w-4 h-4 text-emerald-400" />
              Categories
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {categories.slice(0, 7).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/search?category=${cat.slug}`}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Locations */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <MapPin className="w-4 h-4 text-brand-blue" />
              Top Locations
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {locations.slice(0, 7).map((loc) => (
                <li key={loc.id}>
                  <Link
                    href={`/search?location=${loc.slug}`}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {loc.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              Directory
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link href="/add-business" className="hover:text-emerald-400 transition-colors">
                  Add Your Business
                </Link>
              </li>
              <li>
                <Link href="/my-businesses" className="hover:text-emerald-400 transition-colors">
                  My Businesses
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-400 transition-colors">
                  Partner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Placeholder Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} KochiClassifieds.in. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Contact Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
