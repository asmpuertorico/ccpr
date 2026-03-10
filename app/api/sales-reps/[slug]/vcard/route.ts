import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { salesReps } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type Params = { params: { slug: string } };

function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const [rep] = await db
      .select()
      .from(salesReps)
      .where(eq(salesReps.slug, params.slug));

    if (!rep || rep.status !== "active") {
      return NextResponse.json({ message: "Sales rep not found" }, { status: 404 });
    }

    const fullName = `${rep.firstName} ${rep.lastName}`;
    const lines: string[] = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${escapeVCardValue(fullName)}`,
      `N:${escapeVCardValue(rep.lastName)};${escapeVCardValue(rep.firstName)};;;`,
      `TITLE:${escapeVCardValue(rep.title)}`,
      `ORG:Puerto Rico Convention Center`,
      `EMAIL;TYPE=WORK:${rep.email}`,
    ];

    if (rep.phone) {
      lines.push(`TEL;TYPE=WORK,VOICE:${rep.phone}`);
    }
    if (rep.mobile) {
      lines.push(`TEL;TYPE=CELL:${rep.mobile}`);
    }
    if (rep.linkedin) {
      lines.push(`URL;TYPE=LinkedIn:${rep.linkedin}`);
    }
    if (rep.image) {
      lines.push(`PHOTO;VALUE=URI:${rep.image}`);
    }
    if (rep.bio) {
      lines.push(`NOTE:${escapeVCardValue(rep.bio)}`);
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://prconvention.com";
    lines.push(`URL;TYPE=Profile:${siteUrl}/en/team/${rep.slug}`);
    lines.push("END:VCARD");

    const vcardContent = lines.join("\r\n") + "\r\n";
    const filename = `${rep.firstName}-${rep.lastName}.vcf`.replace(/\s+/g, "-");

    return new NextResponse(vcardContent, {
      headers: {
        "Content-Type": "text/vcard;charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("GET /api/sales-reps/[slug]/vcard error:", error);
    return NextResponse.json({ message: "Failed to generate vCard" }, { status: 500 });
  }
}
