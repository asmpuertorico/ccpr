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
import NextDynamic from "next/dynamic";
const AdminPanelClient = NextDynamic(() => import("@/components/admin/AdminPanel"), { ssr: false });

export const dynamic = "force-dynamic";

export default async function AdminPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as SupportedLocale;
  if (!supportedLocales.includes(locale)) notFound();
  const dict = locale === "es" ? es : en;

  const pcAdmin = cookies().get("pc_admin")?.value === "1";

  if (!pcAdmin) {
    const missingEnv = !process.env.ADMIN_PASSWORD ? dict.admin.missingEnv : undefined;
    return (
      <>
        <Navbar locale={locale} dict={dict} alwaysSolid />
        <main className="pt-24 pb-8 font-sans">
          <Container>
            <h1 className="text-2xl font-semibold mb-4">Calendar Management</h1>
            <PasswordGate missingEnvMessage={missingEnv} />
          </Container>
        </main>
        <Footer />
      </>
    );
  }

  const storage = getStorage();
  const events = await storage.list();

  return (
    <>
      <Navbar locale={locale} dict={dict} alwaysSolid />
      <main className="pt-24 pb-8 font-sans">
        <Container>
          <h1 className="text-2xl font-semibold mb-4">Calendar Management</h1>
          <AdminPanel initialEvents={events} />
        </Container>
      </main>
      <Footer />
    </>
  );
}

function AdminPanel({ initialEvents }: { initialEvents: EventItem[] }) {
  return <AdminPanelClient initialEvents={initialEvents} />;
}

export const metadata = {
  robots: { index: false, follow: false },
};



