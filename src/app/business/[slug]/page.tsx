import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BusinessProfileClient from "./BusinessProfileClient";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const business = await prisma.business.findFirst({
    where: {
      slug: params.slug,
      status: "approved",
    },
    include: {
      location: true,
      category: true,
      businessPhotos: { take: 1, orderBy: { sortOrder: "asc" } },
    },
  });

  if (!business) {
    return {
      title: "Business Listing Not Found | KochiClassifieds",
      description: "The requested business listing does not exist or has not been approved yet.",
    };
  }

  const title = `${business.name} - ${business.location.name} | KochiClassifieds.in`;
  const description =
    business.description?.slice(0, 160) ||
    `Find details, contact information, services, photo gallery, and directions for ${business.name} in ${business.location.name}, Kochi.`;
  const ogImage = business.businessPhotos[0]?.imageUrl || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage, alt: business.name }] : [],
      type: "website",
      siteName: "KochiClassifieds.in",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function BusinessProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const business = await prisma.business.findFirst({
    where: {
      slug: params.slug,
      status: "approved",
    },
    include: {
      category: true,
      location: true,
      owner: {
        select: { id: true, name: true, email: true, phone: true },
      },
      businessServices: true,
      businessPhotos: {
        orderBy: { sortOrder: "asc" },
      },
      businessHours: true,
      reviews: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      },
    } as any,
  });

  if (!business) {
    notFound();
  }

  // Fetch 4 related approved businesses in the same category
  const relatedBusinesses = await prisma.business.findMany({
    where: {
      categoryId: business.categoryId,
      status: "approved",
      id: { not: business.id },
    },
    take: 4,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      location: { select: { id: true, name: true, slug: true } },
      businessPhotos: { take: 1, orderBy: { sortOrder: "asc" } },
      reviews: { select: { rating: true } },
    } as any,
    orderBy: { createdAt: "desc" },
  });

  // Convert Prisma Decimal object to plain string for client serialization
  const servicesList = (business as any).businessServices || [];
  const formattedServices = servicesList.map((svc: any) => ({
    ...svc,
    price: svc.price ? svc.price.toString() : null,
  }));

  const formattedBusiness = {
    ...business,
    businessServices: formattedServices,
  };

  return (
    <BusinessProfileClient
      business={formattedBusiness as any}
      relatedBusinesses={relatedBusinesses as any}
    />
  );
}
