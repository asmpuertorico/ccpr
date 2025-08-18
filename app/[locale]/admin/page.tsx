import { cookies } from "next/headers";
import { en } from "@/lib/i18n/dictionaries/en";
import { es } from "@/lib/i18n/dictionaries/es";
import { supportedLocales, type SupportedLocale } from "@/lib/i18n/locales";
import { notFound } from "next/navigation";
import PasswordGate from "@/components/PasswordGate";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getStorage } from "@/lib/storage";
import Container from "@/components/Container";
import type { EventItem } from "@/lib/events";
import { getCurrentSession } from "@/lib/jwt";
import NextDynamic from "next/dynamic";
const AdminTabsClient = NextDynamic(() => import("@/components/admin/AdminTabs"), { ssr: false });
const ErrorBoundary = NextDynamic(() => import("@/components/admin/ErrorBoundary"), { ssr: false });
const ToastProvider = NextDynamic(() => import("@/components/admin/Toast").then(mod => ({ default: mod.ToastProvider })), { ssr: false });
const SessionManager = NextDynamic(() => import("@/components/admin/SessionManager"), { ssr: false });

export const dynamic = "force-dynamic";

export default async function AdminPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as SupportedLocale;
  if (!supportedLocales.includes(locale)) notFound();
  const dict = locale === "es" ? es : en;

  const session = getCurrentSession();
  const isAuthenticated = session !== null;

  if (!isAuthenticated) {
    const missingEnv = !process.env.ADMIN_PASSWORD ? dict.admin.missingEnv : undefined;
    return (
      <>
        <main className="font-sans min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <img 
                  src="/images/ui/Logo-900-PRCC.png" 
                  alt="PRCC Logo" 
                  className="h-20 w-auto"
                />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Calendar Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Sign in to manage events, view analytics, and monitor system performance</p>
            </div>
            <PasswordGate missingEnvMessage={missingEnv} />
          </div>
        </main>
      </>
    );
  }

  const storage = getStorage();
  const events = await storage.listFresh(); // Always fetch fresh data for admin page

  return (
    <>
      <Navbar locale={locale} dict={dict} alwaysSolid />
      <main className="pt-32 pb-8 font-sans min-h-screen bg-gray-50">
        <Container>
          <div className="mb-8 pt-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar Management</h1>
            <p className="text-gray-600">Manage events, view analytics, and monitor system performance</p>
          </div>
          <AdminPanel initialEvents={events} />
        </Container>
      </main>
      <Footer />
    </>
  );
}

function AdminPanel({ initialEvents }: { initialEvents: EventItem[] }) {
  return (
    <ToastProvider>
      <SessionManager />
      <ErrorBoundary>
        <AdminTabsClient initialEvents={initialEvents} />
      </ErrorBoundary>
    </ToastProvider>
  );
}

export const metadata = {
  robots: { index: false, follow: false },
};



