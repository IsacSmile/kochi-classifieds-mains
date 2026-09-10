import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const businessId = Number(params.id);
    if (isNaN(businessId)) {
      return NextResponse.json({ error: "Invalid business ID." }, { status: 400 });
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        category: true,
        location: true,
        businessPhotos: {
          orderBy: { sortOrder: "asc" },
        },
        businessServices: true,
        businessHours: true,
        owner: {
          select: { id: true, name: true, email: true, phone: true, role: true },
        },
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }

    const userId = Number(session.user.id);
    const isAdminUser = session.user.role === "admin";
    const isOwner = business.ownerId === userId;

    if (!isOwner && !isAdminUser) {
      return NextResponse.json(
        { error: "Forbidden. You do not have permission to view or edit this business." },
        { status: 403 }
      );
    }

    return NextResponse.json(business);
  } catch (error: any) {
    console.error("Error fetching business details:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch business details." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const businessId = Number(params.id);
    if (isNaN(businessId)) {
      return NextResponse.json({ error: "Invalid business ID." }, { status: 400 });
    }

    const existingBusiness = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!existingBusiness) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }

    const userId = Number(session.user.id);
    const isAdminUser = session.user.role === "admin";
    const isOwner = existingBusiness.ownerId === userId;

    if (!isOwner && !isAdminUser) {
      return NextResponse.json(
        { error: "Forbidden. You do not have permission to edit this business." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      categoryId,
      locationId,
      description,
      street,
      area,
      pincode,
      address,
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

    // Construct full address string
    let fullAddress = address ? String(address).trim() : "";
    if (!fullAddress) {
      fullAddress = [street, area, pincode].filter(Boolean).map((s: string) => String(s).trim()).join(", ");
    }

    // Status behavior:
    // 1. If currently "rejected", reset to "pending" and clear rejectionReason (re-enters review queue)
    // 2. If currently "approved" or "pending", preserve status
    let statusToSet = existingBusiness.status;
    let rejectionReasonToSet = existingBusiness.rejectionReason;
    if (existingBusiness.status === "rejected") {
      statusToSet = "pending";
      rejectionReasonToSet = null;
    }

    // Transaction to update business record & relations
    const updatedBusiness = await prisma.$transaction(async (tx) => {
      // 1. Update business fields
      const biz = await tx.business.update({
        where: { id: businessId },
        data: {
          name: name.trim(),
          categoryId: Number(categoryId),
          locationId: Number(locationId),
          description: description?.trim() || null,
          address: fullAddress || null,
          latitude:
            latitude !== null && latitude !== undefined && !isNaN(parseFloat(String(latitude)))
              ? parseFloat(String(latitude))
              : null,
          longitude:
            longitude !== null && longitude !== undefined && !isNaN(parseFloat(String(longitude)))
              ? parseFloat(String(longitude))
              : null,
          phone: phone?.trim() || null,
          whatsapp: whatsapp?.trim() || null,
          email: email?.trim() || null,
          website: website?.trim() || null,
          status: statusToSet,
          rejectionReason: rejectionReasonToSet,
        },
      });

      // 2. Delete and recreate Services
      await tx.businessService.deleteMany({
        where: { businessId },
      });

      if (Array.isArray(services) && services.length > 0) {
        const validServices = services
          .filter((s: any) => s && s.serviceName && s.serviceName.trim())
          .map((s: any) => ({
            businessId,
            serviceName: s.serviceName.trim(),
            description: s.description?.trim() || null,
            price:
              s.price !== null && s.price !== undefined && s.price !== "" && !isNaN(parseFloat(String(s.price)))
                ? parseFloat(String(s.price))
                : null,
          }));

        if (validServices.length > 0) {
          await tx.businessService.createMany({
            data: validServices,
          });
        }
      }

      // 3. Delete and recreate Business Hours
      await tx.businessHour.deleteMany({
        where: { businessId },
      });

      if (Array.isArray(businessHours) && businessHours.length > 0) {
        const hoursData = businessHours.map((h: any) => ({
          businessId,
          day: h.day,
          openingTime: h.closed ? null : h.openingTime || null,
          closingTime: h.closed ? null : h.closingTime || null,
          closed: Boolean(h.closed),
        }));

        await tx.businessHour.createMany({
          data: hoursData,
        });
      }

      // 4. Delete and recreate Business Photos
      await tx.businessPhoto.deleteMany({
        where: { businessId },
      });

      const photoRecords: Array<{ businessId: number; imageUrl: string; altText: string; sortOrder: number }> = [];

      // Logo (sortOrder: 0)
      if (logoUrl && typeof logoUrl === "string" && logoUrl.trim()) {
        photoRecords.push({
          businessId,
          imageUrl: logoUrl.trim(),
          altText: `${biz.name} Logo`,
          sortOrder: 0,
        });
      }

      // Gallery Photos (sortOrder: 1..8)
      if (Array.isArray(photoUrls) && photoUrls.length > 0) {
        photoUrls
          .filter((url: any) => typeof url === "string" && url.trim())
          .slice(0, 8)
          .forEach((url: string, idx: number) => {
            photoRecords.push({
              businessId,
              imageUrl: url.trim(),
              altText: `${biz.name} Photo ${idx + 1}`,
              sortOrder: idx + 1,
            });
          });
      }

      if (photoRecords.length > 0) {
        await tx.businessPhoto.createMany({
          data: photoRecords,
        });
      }

      return biz;
    });

    return NextResponse.json({
      success: true,
      businessId: updatedBusiness.id,
      name: updatedBusiness.name,
      slug: updatedBusiness.slug,
      status: updatedBusiness.status,
    });
  } catch (error: any) {
    console.error("Error updating business:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update business." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  return PUT(request, { params });
}
