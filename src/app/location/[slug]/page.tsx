import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BusinessCard from "@/components/BusinessCard";
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
      businessPhotos: { take: 3, orderBy: { sortOrder: "asc" } },
      businessHours: true,
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
              {location.children.map((sub: any) => (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {businesses.map((biz: any) => (
              <BusinessCard key={biz.id} business={biz} />
            ))}
          </div>
        )}
      </main>

      <Footer categories={allCategories} locations={allLocations} />
    </div>
  );
}
