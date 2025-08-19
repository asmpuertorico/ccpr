import { notFound } from "next/navigation";
import { getStorage } from "@/lib/storage";
import { formatEventDate, formatEventTime } from "@/lib/events";
import Link from "next/link";
import Container from "@/components/Container";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SafeEventImage from "@/components/SafeEventImage";
import EventShareButton from "@/components/EventShareButton";
import { en } from "@/lib/i18n/dictionaries/en";
import { es } from "@/lib/i18n/dictionaries/es";
import { supportedLocales, type SupportedLocale } from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";

export default async function EventDetail({ 
  params 
}: { 
  params: { id: string; locale: string } 
}) {
  const locale = (params.locale as SupportedLocale) || 'en';
  if (!supportedLocales.includes(locale)) notFound();
  const dict = locale === "es" ? es : en;

  const item = await getStorage().get(params.id);
  if (!item) notFound();
  
  return (
    <>
      <Navbar locale={locale} dict={dict} alwaysSolid />
      <main className="min-h-screen bg-white font-sans">
        
        {/* Simple Breadcrumb */}
        <div className="border-b border-gray-100">
          <Container>
            <div className="py-4">
              <nav className="flex items-center space-x-2 text-sm text-gray-500">
                <Link href={`/${locale}`} className="hover:text-ocean transition-colors">
                  Home
                </Link>
                <span>·</span>
                <Link href={`/${locale}#events`} className="hover:text-ocean transition-colors">
                  Events
                </Link>
                <span>·</span>
                <span className="text-gray-900 font-medium truncate">
                  {item.name}
                </span>
              </nav>
            </div>
          </Container>
        </div>

        {/* Main Content */}
        <Container>
          <div className="py-12">
            <div className="max-w-4xl mx-auto">
              
              {/* Event Image */}
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-8 bg-gray-50">
                <SafeEventImage 
                  src={item.image} 
                  alt={item.name} 
                  fill 
                  className="object-cover"
                  priority
                />
              </div>

              {/* Event Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  {item.name}
                </h1>
                
                {/* Event Meta */}
                <div className="flex flex-wrap gap-6 text-gray-600 mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-sun flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">{formatEventDate(item)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-teal flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">{formatEventTime(item)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-ocean flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-medium">{item.planner}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  {item.ticketsUrl && (
                    <a 
                      href={item.ticketsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-sun hover:bg-sun/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                      Get Tickets
                    </a>
                  )}
                  
                  <EventShareButton eventName={item.name} />
                </div>
              </div>

              {/* Description */}
              {item.description && (
                <div className="bg-gray-50 rounded-lg p-8 mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About this Event</h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {item.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Event Details Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-white border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-sky rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-ocean" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Date</h3>
                  <p className="text-gray-600 text-sm">{formatEventDate(item)}</p>
                </div>

                <div className="text-center p-6 bg-white border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-sky rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-teal" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Time</h3>
                  <p className="text-gray-600 text-sm">{formatEventTime(item)}</p>
                </div>

                <div className="text-center p-6 bg-white border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-sky rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-ocean" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Organizer</h3>
                  <p className="text-gray-600 text-sm">{item.planner}</p>
                </div>
              </div>

            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}



