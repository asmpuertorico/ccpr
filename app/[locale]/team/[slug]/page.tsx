import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import { salesReps } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import SalesRepQRCode from "@/components/SalesRepQRCode";
import { Mail, Phone, Linkedin, MapPin, UserPlus, Share2 } from "lucide-react";

interface PageProps {
  params: { locale: string; slug: string };
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://prconvention.com";

async function getRep(slug: string) {
  const [rep] = await db.select().from(salesReps).where(eq(salesReps.slug, slug));
  return rep || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const rep = await getRep(params.slug);
  if (!rep || rep.status !== "active") return { title: "Not Found" };

  const fullName = `${rep.firstName} ${rep.lastName}`;
  const description = rep.bio || `${fullName} — ${rep.title} at Puerto Rico Convention Center`;
  const url = `${SITE_URL}/${params.locale}/team/${rep.slug}`;

  return {
    title: `${fullName} | Puerto Rico Convention Center`,
    description,
    openGraph: {
      title: `${fullName} — ${rep.title}`,
      description,
      url,
      images: rep.image ? [{ url: rep.image, width: 600, height: 600, alt: fullName }] : [],
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: fullName,
      description,
      images: rep.image ? [rep.image] : [],
    },
    alternates: { canonical: url },
    appleWebApp: {
      capable: true,
      title: "PRCC Digital Card",
      statusBarStyle: "black-translucent",
    },
    icons: {
      apple: [{ url: "/images/ui/pr-convention-logo.jpg", sizes: "180x180" }],
    },
  };
}

export default async function SalesRepProfilePage({ params }: PageProps) {
  const rep = await getRep(params.slug);

  if (!rep || rep.status !== "active") {
    notFound();
  }

  const fullName = `${rep.firstName} ${rep.lastName}`;
  const profileUrl = `${SITE_URL}/${params.locale}/team/${rep.slug}`;
  const vcardUrl = `/api/sales-reps/${rep.slug}/vcard`;

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col">
      {/* Top bar */}
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 py-3 flex items-center justify-center">
        <a href="/" aria-label="Puerto Rico Convention Center">
          <img
            src="/images/ui/Logo-900-PRCC.png"
            alt="Puerto Rico Convention Center"
            className="h-10 w-auto object-contain"
          />
        </a>
      </header>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl shadow-xl overflow-hidden">
          {/* Hero / photo */}
          <div className="relative h-48 bg-gradient-to-br from-neutral-900 to-neutral-700">
            {/* Background blur overlay */}
            {rep.image && (
              <Image
                src={rep.image}
                alt=""
                fill
                className="object-cover opacity-20 blur-sm"
                aria-hidden
              />
            )}
            {/* Centered circular photo */}
            <div className="absolute inset-0 flex items-end justify-center pb-0">
              <div className="translate-y-1/2">
                <div className="w-28 h-28 rounded-full border-4 border-white dark:border-neutral-900 overflow-hidden bg-neutral-200 dark:bg-neutral-700 shadow-lg">
                  {rep.image ? (
                    <Image src={rep.image} alt={fullName} width={112} height={112} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900">
                      <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                        {rep.firstName[0]}{rep.lastName[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="pt-16 px-6 pb-8 space-y-6">
            {/* Name & title */}
            <div className="text-center">
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">{fullName}</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{rep.title}</p>
              {rep.region && (
                <div className="flex items-center justify-center gap-1 mt-1.5 text-xs text-neutral-400">
                  <MapPin className="w-3 h-3" />
                  <span>{rep.region}</span>
                </div>
              )}
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                Puerto Rico Convention Center
              </p>
            </div>

            {/* Add to Contacts CTA */}
            <a
              href={vcardUrl}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold rounded-2xl hover:bg-neutral-700 dark:hover:bg-neutral-100 transition-colors text-sm"
            >
              <UserPlus className="w-4 h-4" />
              Add to Contacts
            </a>

            {/* Contact info */}
            <div className="space-y-3">
              <a
                href={`mailto:${rep.email}`}
                className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-white dark:bg-neutral-700 flex items-center justify-center border border-neutral-200 dark:border-neutral-600 shadow-sm flex-shrink-0">
                  <Mail className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">Email</p>
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                    {rep.email}
                  </p>
                </div>
              </a>

              {rep.mobile && (
                <a
                  href={`tel:${rep.mobile}`}
                  className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-neutral-700 flex items-center justify-center border border-neutral-200 dark:border-neutral-600 shadow-sm flex-shrink-0">
                    <Phone className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">Mobile</p>
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{rep.mobile}</p>
                  </div>
                </a>
              )}

              {rep.phone && !rep.mobile && (
                <a
                  href={`tel:${rep.phone}`}
                  className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-neutral-700 flex items-center justify-center border border-neutral-200 dark:border-neutral-600 shadow-sm flex-shrink-0">
                    <Phone className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">Phone</p>
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{rep.phone}</p>
                  </div>
                </a>
              )}

              {rep.phone && rep.mobile && (
                <a
                  href={`tel:${rep.phone}`}
                  className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-neutral-700 flex items-center justify-center border border-neutral-200 dark:border-neutral-600 shadow-sm flex-shrink-0">
                    <Phone className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">Office</p>
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{rep.phone}</p>
                  </div>
                </a>
              )}

              {rep.linkedin && (
                <a
                  href={rep.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-neutral-700 flex items-center justify-center border border-neutral-200 dark:border-neutral-600 shadow-sm flex-shrink-0">
                    <Linkedin className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">LinkedIn</p>
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">View Profile</p>
                  </div>
                </a>
              )}
            </div>

            {/* Bio */}
            {rep.bio && (
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{rep.bio}</p>
              </div>
            )}

            {/* QR Code — share this contact */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
                <Share2 className="w-3.5 h-3.5" />
                <span>Share this contact</span>
              </div>
              <SalesRepQRCode url={profileUrl} />
              <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center break-all max-w-[200px]">
                {profileUrl}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-neutral-400 dark:text-neutral-600">
        &copy; {new Date().getFullYear()} Puerto Rico Convention Center
      </footer>
    </main>
  );
}
