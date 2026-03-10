import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { salesReps } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Mail, Phone, MapPin, QrCode } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supportedLocales, type SupportedLocale } from "@/lib/i18n/locales";
import { en } from "@/lib/i18n/dictionaries/en";
import { es } from "@/lib/i18n/dictionaries/es";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: { locale: string };
}

export const metadata: Metadata = {
  title: "Sales Team | Puerto Rico Convention Center",
  description:
    "Connect with our sales team at the Puerto Rico Convention Center. Get in touch with a representative for event planning and venue inquiries.",
};

export default async function TeamDirectoryPage({ params }: PageProps) {
  const locale = params.locale as SupportedLocale;
  if (!supportedLocales.includes(locale)) notFound();
  const dict = locale === "es" ? es : en;

  const reps = await db
    .select()
    .from(salesReps)
    .where(eq(salesReps.status, "active"));

  return (
    <>
      <Navbar locale={locale} dict={dict} alwaysSolid />
      <main className="pt-28 pb-16 min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest text-indigo-600 dark:text-indigo-400 uppercase mb-3">
              Our People
            </p>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
              Sales Team
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">
              Our dedicated sales representatives are here to help you create the perfect event
              at the Puerto Rico Convention Center.
            </p>
          </div>

          {reps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center mb-4">
                <QrCode className="w-7 h-7 text-neutral-400" />
              </div>
              <p className="text-neutral-500 dark:text-neutral-400">No team members available right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reps.map((rep) => (
                <Link
                  key={rep.id}
                  href={`/${locale}/team/${rep.slug}`}
                  className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
                >
                  {/* Photo */}
                  <div className="aspect-[4/3] relative bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    {rep.image ? (
                      <Image
                        src={rep.image}
                        alt={`${rep.firstName} ${rep.lastName}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                          <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                            {rep.firstName[0]}{rep.lastName[0]}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h2 className="font-semibold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {rep.firstName} {rep.lastName}
                      </h2>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{rep.title}</p>
                    </div>

                    <div className="space-y-1.5">
                      {rep.email && (
                        <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
                          <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{rep.email}</span>
                        </div>
                      )}
                      {(rep.mobile || rep.phone) && (
                        <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
                          <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{rep.mobile || rep.phone}</span>
                        </div>
                      )}
                      {rep.region && (
                        <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{rep.region}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-1">
                      <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 group-hover:underline">
                        View profile &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer locale={locale} dict={dict} />
    </>
  );
}
