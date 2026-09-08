import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const categorySlug = searchParams.get("category")?.trim() || "";
    const locationSlug = searchParams.get("location")?.trim() || "";
    const verified = searchParams.get("verified");
    const featured = searchParams.get("featured");

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: any = {
      status: "approved",
    };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
      ];
    }

    if (verified === "true") {
      where.verified = true;
    }

    if (featured === "true") {
      where.featured = true;
    }

    // Filter by category slug if provided
    if (categorySlug) {
      const categoryObj = await prisma.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true },
      });

      if (categoryObj) {
        where.OR = where.OR
          ? [
              {
                AND: [
                  { OR: where.OR },
                  {
                    OR: [
                      { categoryId: categoryObj.id },
                      { category: { parentId: categoryObj.id } },
                    ],
                  },
                ],
              },
            ]
          : [
              { categoryId: categoryObj.id },
              { category: { parentId: categoryObj.id } },
            ];
      } else {
        // Category slug doesn't match any existing category -> empty results
        return NextResponse.json({
          businesses: [],
          total: 0,
          page,
          totalPages: 0,
          limit,
        });
      }
    }

    // Filter by location slug if provided
    if (locationSlug) {
      const locationObj = await prisma.location.findUnique({
        where: { slug: locationSlug },
        select: { id: true },
      });

      if (locationObj) {
        if (where.OR) {
          const previousOR = where.OR;
          delete where.OR;
          where.AND = [
            { OR: previousOR },
            {
              OR: [
                { locationId: locationObj.id },
                { location: { parentId: locationObj.id } },
              ],
            },
          ];
        } else {
          where.OR = [
            { locationId: locationObj.id },
            { location: { parentId: locationObj.id } },
          ];
        }
      } else {
        // Location slug doesn't match any existing location -> empty results
        return NextResponse.json({
          businesses: [],
          total: 0,
          page,
          totalPages: 0,
          limit,
        });
      }
    }

    const [total, businesses] = await Promise.all([
      prisma.business.count({ where }),
      prisma.business.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        include: {
          category: { select: { id: true, name: true, slug: true } },
          location: { select: { id: true, name: true, slug: true } },
          businessPhotos: { orderBy: { sortOrder: "asc" } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      businesses,
      total,
      page,
      totalPages,
      limit,
    });
  } catch (error: any) {
    console.error("Failed to fetch search businesses:", error);
    return NextResponse.json(
      { error: error.message || "Failed to search businesses" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to list your business." },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);
    const body = await req.json();

    const {
      name,
      categoryId,
      locationId,
      description,
      street,
      area,
      pincode,
      latitude,
      longitude,
      phone,
      whatsapp,
      email,
      website,
      services,
      businessHours,
      logoUrl,
      photoUrls,
    } = body;

    // Basic Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Business name is required." }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ error: "Category selection is required." }, { status: 400 });
    }
    if (!locationId) {
      return NextResponse.json({ error: "Location selection is required." }, { status: 400 });
    }

    // Generate unique slug
    let baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!baseSlug) baseSlug = "business";

    let slug = baseSlug;
    let slugExists = await prisma.business.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${baseSlug}-${counter}`;
      slugExists = await prisma.business.findUnique({ where: { slug } });
      counter++;
    }

    // Construct address string
    const fullAddress = [street, area, pincode].filter(Boolean).map((s) => s.trim()).join(", ");

    // Execute Prisma transaction
    const newBusiness = await prisma.$transaction(async (tx) => {
      // 1. Create Business row
      const business = await tx.business.create({
        data: {
          ownerId: userId,
          name: name.trim(),
          slug,
          categoryId: Number(categoryId),
          locationId: Number(locationId),
          description: description?.trim() || null,
          address: fullAddress || null,
          latitude: latitude ? parseFloat(String(latitude)) : null,
          longitude: longitude ? parseFloat(String(longitude)) : null,
          phone: phone?.trim() || null,
          whatsapp: whatsapp?.trim() || null,
          email: email?.trim() || null,
          website: website?.trim() || null,
          status: "pending",
          verified: false,
          featured: false,
        },
      });

      // 2. Add Services if present
      if (Array.isArray(services) && services.length > 0) {
        const validServices = services
          .filter((s: any) => s && s.serviceName && s.serviceName.trim())
          .map((s: any) => ({
            businessId: business.id,
            serviceName: s.serviceName.trim(),
            description: s.description?.trim() || null,
            price: s.price ? parseFloat(String(s.price)) : null,
          }));

        if (validServices.length > 0) {
          await tx.businessService.createMany({
            data: validServices,
          });
        }
      }

      // 3. Add Business Hours if present
      if (Array.isArray(businessHours) && businessHours.length > 0) {
        const hoursData = businessHours.map((h: any) => ({
          businessId: business.id,
          day: h.day,
          openingTime: h.closed ? null : h.openingTime || null,
          closingTime: h.closed ? null : h.closingTime || null,
          closed: Boolean(h.closed),
        }));

        await tx.businessHour.createMany({
          data: hoursData,
        });
      }

      // 4. Add Photos (Logo + Gallery Photos)
      const photoRecords: Array<{ businessId: number; imageUrl: string; altText: string; sortOrder: number }> = [];
      
      if (logoUrl && typeof logoUrl === "string" && logoUrl.trim()) {
        photoRecords.push({
          businessId: business.id,
          imageUrl: logoUrl.trim(),
          altText: `${business.name} Logo`,
          sortOrder: 0,
        });
      }

      if (Array.isArray(photoUrls) && photoUrls.length > 0) {
        photoUrls
          .filter((url: any) => typeof url === "string" && url.trim())
          .slice(0, 8)
          .forEach((url: string, idx: number) => {
            photoRecords.push({
              businessId: business.id,
              imageUrl: url.trim(),
              altText: `${business.name} Photo ${idx + 1}`,
              sortOrder: idx + 1,
            });
          });
      }

      if (photoRecords.length > 0) {
        await tx.businessPhoto.createMany({
          data: photoRecords,
        });
      }

      // 5. Upgrade User role to business_owner if currently user
      const currentUser = await tx.user.findUnique({
        where: { id: userId },
      });

      if (currentUser && currentUser.role === "user") {
        await tx.user.update({
          where: { id: userId },
          data: { role: "business_owner" },
        });
      }

      return business;
    });

    return NextResponse.json(
      {
        success: true,
        businessId: newBusiness.id,
        name: newBusiness.name,
        slug: newBusiness.slug,
        status: newBusiness.status,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating business:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create business." },
      { status: 500 }
    );
  }
}
