import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  MapPin,
  Building2,
  ShieldCheck,
  Star,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export const revalidate = 60;

interface LocationPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: LocationPageProps): Promise<Metadata> {
  const baseUrl = process.env.NEXTAUTH_URL || "https://kochiclassifieds.in";
  const location = await prisma.location.findUnique({
    where: { slug: params.slug, status: "active" },
  });

  if (!location) {
    return {
      title: "Location Not Found | KochiClassifieds",
      description: "The requested location could not be found.",
    };
  }

  const title = `Top Businesses & Services in ${location.name}, Kochi | KochiClassifieds`;
  const description = `Find verified local businesses, shops, services, doctors, and restaurants in ${location.name}, Kochi. Browse ratings, phone numbers, and addresses.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/location/${location.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/location/${location.slug}`,
      siteName: "KochiClassifieds.in",
      type: "website",
    },
  };
}

export default async function LocationLandingPage({ params }: LocationPageProps) {
  const baseUrl = process.env.NEXTAUTH_URL || "https://kochiclassifieds.in";

  const location = await prisma.location.findUnique({
    where: { slug: params.slug, status: "active" },
    include: {
      children: { where: { status: "active" } },
    },
  });

  if (!location) {
    notFound();
  }

  // Fetch approved businesses in location or sub-localities
  const businesses = await prisma.business.findMany({
    where: {
      status: "approved",
      OR: [{ locationId: location.id }, { location: { parentId: location.id } }],
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: {
      category: { select: { id: true, name: true, slug: true } },
      location: { select: { id: true, name: true, slug: true } },
      businessPhotos: { take: 1, orderBy: { sortOrder: "asc" } },
    },
  });

  // Footer data
  const allCategories = await prisma.category.findMany({
    where: { parentId: null, status: "active" },
    take: 8,
  });
  const allLocations = await prisma.location.findMany({
    where: { parentId: null, status: "active" },
    take: 8,
  });

  // Schema.org BreadcrumbList JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Locations",
        item: `${baseUrl}/#locations`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: location.name,
        item: `${baseUrl}/location/${location.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Inject BreadcrumbList JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Header />

      {/* Location Hero Header */}
      <section className="bg-gradient-to-r from-brand-navy via-slate-900 to-brand-navy text-white py-12 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Link href="/" className="hover:text-emerald-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <Link href="/search" className="hover:text-emerald-400 transition-colors">
              Locations
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-emerald-400 font-bold">{location.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-blue/30 text-brand-blue-light text-xs font-bold border border-brand-blue/40">
                <MapPin className="w-3.5 h-3.5 text-brand-blue" />
                <span>Locality & Town in Kochi</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Businesses in {location.name}, Kochi
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Discover verified shops, medical services, restaurants, and professionals located in {location.name}.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-xs text-slate-200">
              <strong className="text-white text-base">{businesses.length}</strong> {businesses.length === 1 ? "Approved Listing" : "Approved Listings"}
            </div>
          </div>

          {/* Sub-localities Pills if any */}
          {location.children && location.children.length > 0 && (
            <div className="pt-4 border-t border-white/10 flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400 font-bold text-[11px] uppercase">Sub-localities:</span>
              {location.children.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/location/${sub.slug}`}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-brand-blue hover:text-white text-slate-200 font-semibold text-xs transition-all border border-white/10"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Content Listings Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full space-y-8">
        {businesses.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-brand-blue-light text-brand-blue rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-brand-navy">No Listings in {location.name} Yet</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Be the first local business to register in <strong>{location.name}</strong>, Kochi!
            </p>
            <Link
              href="/add-business"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
            >
              Add Your Business
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {businesses.map((biz) => {
              const photoUrl = biz.businessPhotos?.[0]?.imageUrl || null;

              return (
                <div
                  key={biz.id}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-brand-blue hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between"
                >
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
      </main>

      <Footer categories={allCategories} locations={allLocations} />
    </div>
  );
}
