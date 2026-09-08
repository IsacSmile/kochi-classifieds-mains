import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const locationId = searchParams.get("locationId");
    const search = searchParams.get("search");

    const where: any = {};

    if (status && status !== "all") {
      where.status = status;
    }
    if (categoryId && categoryId !== "all") {
      where.categoryId = Number(categoryId);
    }
    if (locationId && locationId !== "all") {
      where.locationId = Number(locationId);
    }
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { email: { contains: search.trim(), mode: "insensitive" } },
        { phone: { contains: search.trim(), mode: "insensitive" } },
        { owner: { email: { contains: search.trim(), mode: "insensitive" } } },
      ];
    }

    const businesses = await prisma.business.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        location: {
          select: { id: true, name: true, slug: true },
        },
        owner: {
          select: { id: true, name: true, email: true, phone: true },
        },
        businessServices: true,
        businessPhotos: true,
        businessHours: true,
      },
    });

    return NextResponse.json(businesses);
  } catch (error: any) {
    console.error("Failed to fetch businesses:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch businesses" },
      { status: 500 }
    );
  }
}
