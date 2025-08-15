import { en } from "@/lib/i18n/dictionaries/en";
import { es } from "@/lib/i18n/dictionaries/es";
import { supportedLocales, type SupportedLocale } from "@/lib/i18n/locales";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import HeroVideo from "@/components/HeroVideo";
import EventsCarousel from "@/components/EventsCarousel";
import CtaBanner from "@/components/CtaBanner";
import SponsorsMarquee from "@/components/SponsorsMarquee";
import Footer from "@/components/Footer";
import GradientDivider from "@/components/GradientDivider";

export default function Home({ params }: { params: { locale: string } }) {
  const locale = params.locale as SupportedLocale;
  if (!supportedLocales.includes(locale)) notFound();
  const dict = locale === "es" ? es : en;
  return (
    <>
      <Navbar locale={locale} dict={dict} />
      <main>
        <HeroVideo dict={dict} />
        <GradientDivider />
        <section id="events" className="w-full py-14 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 relative mb-6">
            {/* Next Events title image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/ui/NEXT EVENTS LOGO CCPR.png" alt="Next Events" className="h-16 w-auto" />
          </div>
          <EventsCarousel locale={locale} dict={dict} />
          </div>
        </section>
        <CtaBanner locale={locale} dict={dict} />
        <SponsorsMarquee />
      </main>
      <Footer locale={locale} />
    </>
  );
}


