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
import VisitorsSection from "@/components/VisitorsSection";
import PartnersSection from "@/components/PartnersSection";
import Container from "@/components/Container";
import ContactForm from "@/components/ContactForm";

export default function Home({ params }: { params: { locale: string } }) {
  const locale = params.locale as SupportedLocale;
  if (!supportedLocales.includes(locale)) notFound();
  const dict = locale === "es" ? es : en;
  return (
    <>
      <Navbar locale={locale} dict={dict} />
      <main>
        <HeroVideo locale={locale} dict={dict} />
        <GradientDivider />
        <section id="events" className="w-full py-14 bg-[#10a0c6] relative overflow-hidden">
          {/* Teal background texture - same circular pattern as Discover PR */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill-opacity='0.6'%3E%3Cpath fill='%23ffffff' d='M20 20c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20zm40 40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z'/%3E%3Cpath fill='%23ffffff' d='M0 40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20zm40 40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z'/%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="h-16 relative mb-6">
            {/* Next Events title image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/ui/NEXT EVENTS LOGO CCPR.png" alt={dict.events.nextEvents} className="h-16 w-auto" />
          </div>
          <EventsCarousel locale={locale} dict={dict} />
                  </div>
      </section>
      <PartnersSection locale={locale} dict={dict} />
      <VisitorsSection locale={locale} dict={dict} />
        <SponsorsMarquee />
        
        {/* Contact Form Section for Event Planners */}
        <section id="planner-form" className="py-20 bg-white">
          <Container>
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-black mb-4">
                  {dict.contact.formTitle}
                </h2>
                <p className="text-lg text-gray-700">
                  {dict.contact.formSubtitle}
                </p>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-xl shadow-sm border border-gray-100">
                <ContactForm
                  dict={{
                    name: dict.contact.formName,
                    email: dict.contact.formEmail,
                    phone: dict.contact.formPhone,
                    subject: dict.contact.formSubject,
                    message: dict.contact.formMessage,
                    submit: dict.contact.formSubmit,
                    submitting: dict.contact.formSubmitting,
                    success: dict.contact.formSuccess,
                    error: dict.contact.formError,
                    nameRequired: dict.contact.formNameRequired,
                    emailRequired: dict.contact.formEmailRequired,
                    emailInvalid: dict.contact.formEmailInvalid,
                    subjectRequired: dict.contact.formSubjectRequired,
                    messageRequired: dict.contact.formMessageRequired,
                  }}
                />
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer locale={locale} dict={dict} />
    </>
  );
}


