import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
  }

  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid business ID" }, { status: 400 });
    }

    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        category: true,
        location: true,
        owner: {
          select: { id: true, name: true, email: true, phone: true, role: true },
        },
        businessServices: true,
        businessPhotos: {
          orderBy: { sortOrder: "asc" },
        },
        businessHours: true,
      },
    });

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    return NextResponse.json(business);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch business" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
  }

  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid business ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status, rejectionReason, featured, verified, name, categoryId, locationId, description, address, phone, email, website } = body;

    const dataToUpdate: any = {};

    if (status !== undefined) {
      dataToUpdate.status = status;
      if (status === "rejected") {
        dataToUpdate.rejectionReason = rejectionReason || null;
      } else if (status === "approved") {
        dataToUpdate.rejectionReason = null;
      }
    }

    if (rejectionReason !== undefined && status === "rejected") {
      dataToUpdate.rejectionReason = rejectionReason;
    }

    if (featured !== undefined) {
      dataToUpdate.featured = Boolean(featured);
    }

    if (verified !== undefined) {
      dataToUpdate.verified = Boolean(verified);
    }

    if (name !== undefined && name.trim()) {
      dataToUpdate.name = name.trim();
    }
    if (categoryId !== undefined) {
      dataToUpdate.categoryId = Number(categoryId);
    }
    if (locationId !== undefined) {
      dataToUpdate.locationId = Number(locationId);
    }
    if (description !== undefined) {
      dataToUpdate.description = description ? description.trim() : null;
    }
    if (address !== undefined) {
      dataToUpdate.address = address ? address.trim() : null;
    }
    if (phone !== undefined) {
      dataToUpdate.phone = phone ? phone.trim() : null;
    }
    if (email !== undefined) {
      dataToUpdate.email = email ? email.trim() : null;
    }
    if (website !== undefined) {
      dataToUpdate.website = website ? website.trim() : null;
    }

    const updated = await prisma.business.update({
      where: { id },
      data: dataToUpdate,
      include: {
        category: true,
        location: true,
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Failed to update business:", error);
    return NextResponse.json({ error: error.message || "Failed to update business" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  return PUT(request, { params });
}
