import { Suspense } from "react";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchClient from "./SearchClient";

export const metadata: Metadata = {
  title: "Search Business Listings | KochiClassifieds",
  description:
    "Filter and search verified local business listings, shops, services, and locations across Kochi, Ernakulam, Kakkanad, and Aluva.",
};

export const revalidate = 60; // Revalidate static data every 60 seconds

export default async function SearchPage() {
  // Fetch top-level categories with business count
  const categories = await prisma.category.findMany({
    where: { parentId: null, status: "active" },
    orderBy: { sortOrder: "asc" },
  });

  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat: any) => {
      const count = await prisma.business.count({
        where: {
          status: "approved",
          OR: [{ categoryId: cat.id }, { category: { parentId: cat.id } }],
        },
      });
      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        count,
      };
    })
  );

  // Fetch all active locations with business count and parent structure
  const locations = await prisma.location.findMany({
    where: { status: "active" },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  const locationsWithCounts = await Promise.all(
    locations.map(async (loc: any) => {
      const count = await prisma.business.count({
        where: {
          status: "approved",
          OR: [{ locationId: loc.id }, { location: { parentId: loc.id } }],
        },
      });
      return {
        id: loc.id,
        parentId: loc.parentId,
        name: loc.name,
        slug: loc.slug,
        count,
      };
    })
  );

  // Structure locations hierarchically (Parent first, then children)
  const structuredLocations: Array<{
    id: number;
    parentId?: number | null;
    name: string;
    slug: string;
    count: number;
  }> = [];

  const parentLocations = locationsWithCounts.filter((l: any) => !l.parentId);
  parentLocations.forEach((parent: any) => {
    structuredLocations.push(parent);
    const children = locationsWithCounts.filter((l: any) => l.parentId === parent.id);
    children.forEach((child: any) => {
      structuredLocations.push(child);
    });
  });

  const addedIds = new Set(structuredLocations.map((l: any) => l.id));
  locationsWithCounts.forEach((l: any) => {
    if (!addedIds.has(l.id)) {
      structuredLocations.push(l);
    }
  });

  // Select 3 suggested categories for empty state
  const suggestedCategories = categories.slice(0, 3).map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
  }));

  // Categories & Locations for Footer component
  const footerCategories = categories.map((c: any) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  const footerLocations = locations.map((l: any) => ({
    id: l.id,
    name: l.name,
    slug: l.slug,
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      <Header />

      <div className="flex-1">
        <Suspense
          fallback={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center text-xs font-semibold text-slate-500">
              Loading search directory...
            </div>
          }
        >
          <SearchClient
            initialCategories={categoriesWithCounts}
            initialLocations={structuredLocations}
            suggestedCategories={suggestedCategories}
          />
        </Suspense>
      </div>

      <Footer categories={footerCategories} locations={footerLocations} />
    </div>
  );
}
