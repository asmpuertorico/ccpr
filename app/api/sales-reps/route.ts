import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { salesReps, type NewSalesRep } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentSession } from "@/lib/jwt";
import { validateCSRFFromRequest } from "@/lib/csrf-server";

function generateSlug(firstName: string, lastName: string): string {
  return `${firstName}-${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function getUniqueSlug(baseSlug: string): Promise<string> {
  const existing = await db
    .select({ slug: salesReps.slug })
    .from(salesReps)
    .where(eq(salesReps.slug, baseSlug));

  if (existing.length === 0) return baseSlug;

  let counter = 2;
  while (true) {
    const candidate = `${baseSlug}-${counter}`;
    const found = await db
      .select({ slug: salesReps.slug })
      .from(salesReps)
      .where(eq(salesReps.slug, candidate));
    if (found.length === 0) return candidate;
    counter++;
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = getCurrentSession();
    const isAdmin = session !== null;

    const reps = await db.select().from(salesReps);
    const filtered = isAdmin ? reps : reps.filter((r) => r.status === "active");

    return NextResponse.json({ salesReps: filtered });
  } catch (error) {
    console.error("GET /api/sales-reps error:", error);
    return NextResponse.json({ message: "Failed to fetch sales reps" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getCurrentSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!validateCSRFFromRequest(req)) {
      return NextResponse.json({ message: "Invalid CSRF token" }, { status: 403 });
    }

    const body = await req.json();
    const { firstName, lastName, title, email, phone, mobile, image, bio, region, linkedin, status } = body;

    if (!firstName || !lastName || !title || !email) {
      return NextResponse.json(
        { message: "firstName, lastName, title, and email are required" },
        { status: 400 }
      );
    }

    const baseSlug = generateSlug(firstName, lastName);
    const slug = await getUniqueSlug(baseSlug);

    const newRep: NewSalesRep = {
      slug,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      title: title.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      mobile: mobile?.trim() || null,
      image: image?.trim() || null,
      bio: bio?.trim() || null,
      region: region?.trim() || null,
      linkedin: linkedin?.trim() || null,
      status: status || "active",
    };

    const [created] = await db.insert(salesReps).values(newRep).returning();

    return NextResponse.json({ salesRep: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/sales-reps error:", error);
    return NextResponse.json({ message: "Failed to create sales rep" }, { status: 500 });
  }
}
