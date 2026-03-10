import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { salesReps } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentSession } from "@/lib/jwt";
import { validateCSRFFromRequest } from "@/lib/csrf-server";

type Params = { params: { slug: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const [rep] = await db
      .select()
      .from(salesReps)
      .where(eq(salesReps.slug, params.slug));

    if (!rep) {
      return NextResponse.json({ message: "Sales rep not found" }, { status: 404 });
    }

    const session = getCurrentSession();
    if (rep.status !== "active" && !session) {
      return NextResponse.json({ message: "Sales rep not found" }, { status: 404 });
    }

    return NextResponse.json({ salesRep: rep });
  } catch (error) {
    console.error("GET /api/sales-reps/[slug] error:", error);
    return NextResponse.json({ message: "Failed to fetch sales rep" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = getCurrentSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!validateCSRFFromRequest(req)) {
      return NextResponse.json({ message: "Invalid CSRF token" }, { status: 403 });
    }

    const [existing] = await db
      .select()
      .from(salesReps)
      .where(eq(salesReps.slug, params.slug));

    if (!existing) {
      return NextResponse.json({ message: "Sales rep not found" }, { status: 404 });
    }

    const body = await req.json();
    const { firstName, lastName, title, email, phone, mobile, image, bio, region, linkedin, status } = body;

    const updates: Partial<typeof salesReps.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (firstName !== undefined) updates.firstName = firstName.trim();
    if (lastName !== undefined) updates.lastName = lastName.trim();
    if (title !== undefined) updates.title = title.trim();
    if (email !== undefined) updates.email = email.trim().toLowerCase();
    if (phone !== undefined) updates.phone = phone?.trim() || null;
    if (mobile !== undefined) updates.mobile = mobile?.trim() || null;
    if (image !== undefined) updates.image = image?.trim() || null;
    if (bio !== undefined) updates.bio = bio?.trim() || null;
    if (region !== undefined) updates.region = region?.trim() || null;
    if (linkedin !== undefined) updates.linkedin = linkedin?.trim() || null;
    if (status !== undefined) updates.status = status;

    const [updated] = await db
      .update(salesReps)
      .set(updates)
      .where(eq(salesReps.slug, params.slug))
      .returning();

    return NextResponse.json({ salesRep: updated });
  } catch (error) {
    console.error("PATCH /api/sales-reps/[slug] error:", error);
    return NextResponse.json({ message: "Failed to update sales rep" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = getCurrentSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!validateCSRFFromRequest(req)) {
      return NextResponse.json({ message: "Invalid CSRF token" }, { status: 403 });
    }

    const [existing] = await db
      .select()
      .from(salesReps)
      .where(eq(salesReps.slug, params.slug));

    if (!existing) {
      return NextResponse.json({ message: "Sales rep not found" }, { status: 404 });
    }

    await db.delete(salesReps).where(eq(salesReps.slug, params.slug));

    return NextResponse.json({ message: "Sales rep deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/sales-reps/[slug] error:", error);
    return NextResponse.json({ message: "Failed to delete sales rep" }, { status: 500 });
  }
}
