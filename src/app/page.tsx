import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import HeroSearch from "@/components/HeroSearch";
import Footer from "@/components/Footer";
import {
  FolderTree,
  MapPin,
  Building2,
  ShieldCheck,
  Star,
  ArrowRight,
  Sparkles,
  PlusCircle,
  Stethoscope,
  Utensils,
  Wrench,
  GraduationCap,
  ShoppingBag,
  Car,
  Home,
  Laptop,
} from "lucide-react";

export const metadata: Metadata = {
  title: "KochiClassifieds - Local Business Directory in Kochi, Kerala",
  description:
    "Find top-rated businesses, shops, services, doctors, and restaurants in Kochi, Ernakulam, Kakkanad, and Aluva. List your business free.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "KochiClassifieds - Local Business Directory in Kochi, Kerala",
    description:
      "Find top-rated businesses, shops, services, doctors, and restaurants in Kochi, Ernakulam, Kakkanad, and Aluva. List your business free.",
    url: "/",
    siteName: "KochiClassifieds.in",
  },
};

export const revalidate = 60; // Revalidate page every 60 seconds

// Helper to select an icon based on category name/slug
function getCategoryIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("health") || lower.includes("doctor") || lower.includes("hospital")) return Stethoscope;
  if (lower.includes("food") || lower.includes("restaurant") || lower.includes("cafe")) return Utensils;
  if (lower.includes("service") || lower.includes("repair") || lower.includes("plumb")) return Wrench;
  if (lower.includes("education") || lower.includes("school") || lower.includes("college")) return GraduationCap;
  if (lower.includes("shop") || lower.includes("retail") || lower.includes("fashion")) return ShoppingBag;
  if (lower.includes("auto") || lower.includes("car") || lower.includes("vehicle")) return Car;
  if (lower.includes("real estate") || lower.includes("property") || lower.includes("home")) return Home;
  if (lower.includes("tech") || lower.includes("computer") || lower.includes("it")) return Laptop;
  return FolderTree;
}

export default async function HomePage() {
  // Fetch top-level categories
  const categories = await prisma.category.findMany({
    where: { parentId: null, status: "active" },
    orderBy: { sortOrder: "asc" },
    take: 12,
  });

  // Count approved businesses per category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const count = await prisma.business.count({
        where: {
          status: "approved",
          OR: [{ categoryId: cat.id }, { category: { parentId: cat.id } }],
        },
      });
      return { ...cat, businessCount: count };
    })
  );

  // Fetch top-level locations
  const locations = await prisma.location.findMany({
    where: { parentId: null, status: "active" },
    orderBy: { sortOrder: "asc" },
    take: 12,
  });

  // Count approved businesses per location
  const locationsWithCounts = await Promise.all(
    locations.map(async (loc) => {
      const count = await prisma.business.count({
        where: {
          status: "approved",
          OR: [{ locationId: loc.id }, { location: { parentId: loc.id } }],
        },
      });
      return { ...loc, businessCount: count };
    })
  );

  // Fetch Hero Showcase Featured Businesses (limit 4, ordered by showcaseOrder ASC nulls last, then createdAt DESC)
  const heroFeaturedBusinesses = await prisma.business.findMany({
    where: {
      featured: true,
      status: "approved",
    },
    take: 4,
    orderBy: [
      { showcaseOrder: { sort: "asc", nulls: "last" } },
      { createdAt: "desc" },
    ],
    include: {
      category: { select: { id: true, name: true, slug: true } },
      location: { select: { id: true, name: true, slug: true } },
      businessPhotos: { take: 1, orderBy: { sortOrder: "asc" } },
    },
  });

  // Fetch Featured Approved Businesses for homepage Featured section (limit 8)
  const featuredBusinesses = await prisma.business.findMany({
    where: {
      featured: true,
      status: "approved",
    },
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      location: { select: { id: true, name: true, slug: true } },
      businessPhotos: { take: 1, orderBy: { sortOrder: "asc" } },
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* 1. Header Section */}
      <Header />

      {/* 2. Hero Section */}
      <HeroSearch locations={locations} featuredBusinesses={heroFeaturedBusinesses} />

      {/* Main Content Area */}
      <main className="flex-1 space-y-16 pb-20">
        {/* 3. Popular Categories Grid */}
        <section id="popular-categories" className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 border-b border-slate-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-green-light text-brand-green font-bold text-xs mb-2">
                <FolderTree className="w-3.5 h-3.5" />
                <span>Explore Directory</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
                Popular Categories in Kochi
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Find top-rated services and products across major business categories
              </p>
            </div>

            <Link
              href="/search"
              className="text-xs font-bold text-brand-blue hover:text-brand-navy flex items-center gap-1 group transition-colors"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categoriesWithCounts.map((cat) => {
              const IconComp = getCategoryIcon(cat.name);
              return (
                <Link
                  key={cat.id}
                  href={`/search?category=${cat.slug}`}
                  className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-brand-green hover:shadow-lg transition-all flex flex-col items-center text-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-green-light text-brand-green flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                    <IconComp className="w-6 h-6 text-brand-green" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-navy text-xs sm:text-sm group-hover:text-brand-green transition-colors line-clamp-1">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                      {cat.businessCount} {cat.businessCount === 1 ? "Listing" : "Listings"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 4. Featured Businesses Row */}
        {featuredBusinesses && featuredBusinesses.length > 0 && (
          <section className="bg-white py-12 border-y border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs mb-2">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Handpicked Listings</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
                    Featured Businesses in Kochi
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Top-rated, verified local companies and services recommended in Kochi
                  </p>
                </div>

                <Link
                  href="/search?featured=true"
                  className="text-xs font-bold text-brand-blue hover:text-brand-navy flex items-center gap-1 group transition-colors"
                >
                  <span>See More Featured</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredBusinesses.map((biz) => {
                  const photoUrl = biz.businessPhotos?.[0]?.imageUrl || null;

                  return (
                    <div
                      key={biz.id}
                      className="group bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 hover:border-brand-blue hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
                    >
                      {/* Image Thumbnail */}
                      <div className="h-44 bg-slate-200 relative overflow-hidden">
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
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/90 text-white font-extrabold text-[10px] shadow backdrop-blur-xs flex items-center gap-1">
                            <Star className="w-3 h-3 fill-white" /> Featured
                          </span>
                          {biz.verified && (
                            <span className="p-1 rounded-full bg-emerald-600 text-white shadow" title="Verified">
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
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

                        {/* Button */}
                        <div className="pt-3 border-t border-slate-200">
                          <Link
                            href={`/business/${biz.slug}`}
                            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white group-hover:bg-brand-blue group-hover:text-white border border-slate-200 group-hover:border-brand-blue text-brand-navy font-bold rounded-xl transition-all shadow-2xs"
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
            </div>
          </section>
        )}

        {/* 5. Explore by Location Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 border-b border-slate-200 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue-light text-brand-blue font-bold text-xs mb-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>Localities & Towns</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
                Explore Businesses by Location
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Browse businesses near your neighborhood in Kochi metro area
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {locationsWithCounts.map((loc) => (
              <Link
                key={loc.id}
                href={`/search?location=${loc.slug}`}
                className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-brand-blue hover:shadow-md transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-blue-light text-brand-blue flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-brand-navy text-xs truncate group-hover:text-brand-blue transition-colors">
                    {loc.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold truncate">
                    {loc.businessCount} {loc.businessCount === 1 ? "Listing" : "Listings"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 6. Business CTA Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-brand-navy via-slate-900 to-brand-navy text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10">
            {/* Background Accent Lines */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-green/20 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 max-w-xl text-center md:text-left relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Grow Your Local Customer Base</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Own a Business in Kochi? Get Discovered Today!
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                List your business on KochiClassifieds to gain visibility, get direct customer calls & WhatsApp leads, and manage your online business profile.
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <Link
                href="/add-business"
                className="px-6 py-4 bg-brand-green hover:bg-brand-green-hover text-white font-extrabold rounded-2xl text-xs sm:text-sm transition-all shadow-xl hover:scale-105 inline-flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Add Your Business for Free</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Footer Section */}
      <Footer categories={categories} locations={locations} />
    </div>
  );
}
