import Container from "@/components/Container";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TeamMemberCard from "@/components/TeamMemberCard";
import EmbeddedChat from "@/components/EmbeddedChat";
import { notFound } from "next/navigation";
import { supportedLocales } from "@/lib/i18n/locales";
import type { SupportedLocale } from "@/lib/i18n/locales";
import { en } from "@/lib/i18n/dictionaries/en";
import { es } from "@/lib/i18n/dictionaries/es";
import { Phone, Mail, MapPin } from "lucide-react";
import Image from "next/image";

export default function ContactPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as SupportedLocale;
  if (!supportedLocales.includes(locale)) notFound();
  const dict = locale === "es" ? es : en;

  return (
    <>
      <Navbar locale={locale} dict={dict} alwaysSolid={true} />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/ui/BP_PRCC_09.jpg"
              alt="Puerto Rico Convention Center Team"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>
          
          <Container className="relative z-10 text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              {dict.contact.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              {dict.contact.heroSubtitle}
            </p>
            
            {/* Quick Contact Info */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-lg">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-blue-300" />
                <a href="tel:+17876417722" className="hover:text-blue-300 transition-colors">
                  (787) 641-7722
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-300" />
                <a href="mailto:info@prconvention.com" className="hover:text-blue-300 transition-colors">
                  info@prconvention.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-300" />
                <div>
                  <div>{dict.contact.addressLine1}</div>
                  <div>{dict.contact.addressLine2}</div>
                </div>
              </div>
            </div>
          </Container>
          
        </section>

        {/* Enhanced gradient divider - same as planners page */}
        <div className="relative w-full">
          <div
            className="relative h-1 w-full bg-gradient-to-r animate-pulse"
            style={{ 
              backgroundImage: "linear-gradient(90deg, #f78f1e, #90d8f8, #0e7bbd, #10a0c6)",
              backgroundSize: "400% 100%",
              animation: "gradient-move 8s linear infinite"
            }}
          >
            {/* Enhanced glow effect */}
            <div
              className="absolute inset-0 blur-sm opacity-60"
              style={{ 
                backgroundImage: "linear-gradient(90deg, #f78f1e, #90d8f8, #0e7bbd, #10a0c6)",
                backgroundSize: "400% 100%",
                animation: "gradient-move 8s linear infinite"
              }}
            />
            {/* Additional glow layer */}
            <div
              className="absolute inset-0 blur-md opacity-30"
              style={{ 
                backgroundImage: "linear-gradient(90deg, #f78f1e, #90d8f8, #0e7bbd, #10a0c6)",
                backgroundSize: "400% 100%",
                animation: "gradient-move 8s linear infinite",
                transform: "scale(1.1)"
              }}
            />
          </div>
        </div>
      </main>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">
              {dict.contact.ourTeam}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Margaret Colón */}
            <TeamMemberCard
              name="Margaret Colón"
              title={dict.contact.directorSalesMarketing}
              email="mcolon@prconvention.com"
              phone="(787) 641-7722"
              image="/images/ui/margaret-colon.jpg"
              qrCode="/images/ui/margareth-vcard.png"
              downloadText={dict.contact.downloadVCard}
            />
            
            {/* Jorge Pérez */}
            <TeamMemberCard
              name="Jorge Pérez"
              title={dict.contact.generalManager}
              email="jorgeperez@asm-pr.com"
              phone="(787) 641-7722"
              image="/images/ui/jorge-perez-800x800.jpg"
              qrCode="/images/ui/jorge-vcard.png"
              downloadText={dict.contact.downloadVCard}
            />
          </div>
        </Container>
      </section>

      {/* Chat and Contact Info Section */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Embedded Chat */}
            <div>
              <EmbeddedChat locale={locale} dict={dict} />
            </div>
            
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-black mb-6">
                  {dict.contact.contactInfo}
                </h3>
              </div>
              
              {/* Address */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <h4 className="text-lg font-semibold text-gray-900">
                    {dict.contact.address}
                  </h4>
                </div>
                <div className="text-gray-700">
                  <p>{dict.contact.addressLine1}</p>
                  <p>{dict.contact.addressLine2}</p>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-6 h-6 text-blue-600" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        {dict.contact.phone}
                      </h4>
                      <a href="tel:+17876417722" className="text-gray-700 hover:text-blue-600">
                        (787) 641-7722
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="w-6 h-6 text-blue-600" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        {dict.contact.email}
                      </h4>
                      <a href="mailto:info@prconvention.com" className="text-gray-700 hover:text-blue-600">
                        info@prconvention.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Footer locale={locale} dict={dict} />
    </>
  );
}



