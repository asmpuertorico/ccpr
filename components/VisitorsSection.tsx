"use client";

import Container from "@/components/Container";
import { Calendar } from "lucide-react";
import { SupportedLocale } from "@/lib/i18n/locales";
import Link from "next/link";

type Dict = {
  visitors: {
    title: string;
    description: string;
    visitTitle: string;
    visitDescription: string;
    clickHere: string;
    commitmentTitle: string;
    commitmentDescription: string;
    safetyGuidelines: string;
    gettingAroundTitle: string;
    gettingAroundSubtitle: string;
    airTravelTitle: string;
    flights588: string;
    flights30: string;
    flights28: string;
    groundTransportTitle: string;
    taxi: string;
    buses: string;
    limousines: string;
    discoverDescription: string;
    discoverButton: string;
    contactTourism: string;
    historicSanJuan: string;
    authenticCuisine: string;
    pristineBeaches: string;
    eventPlannersTitle: string;
    eventPlannersDescription: string;
    plannersResources: string;
    letsChat: string;
    planningEvent: string;
    everythingHere: string;
    startHere: string;
  };
};

export default function VisitorsSection({ locale, dict }: { locale: SupportedLocale; dict: Dict }) {
  return (
    <section id="visitors" className="w-full bg-white">
      {/* Visitor Information Section */}
      <div className="py-20">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/images/ui/BP_PRCC_09.jpg" 
                alt="Puerto Rico Convention Center exterior view" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Content */}
            <div className="space-y-6">
              <h2 className="text-5xl font-bold text-black">{dict.visitors.title}</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {dict.visitors.description}{" "}
                <a href="mailto:info@discoverpuertorico.com" className="text-[#10a0c6] hover:underline font-medium">info@discoverpuertorico.com</a>.
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Visit Us Section */}
      <div className="py-20 bg-gray-50">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content - Order first on mobile, second on desktop */}
            <div className="space-y-6 lg:order-1">
              <h2 className="text-5xl font-bold text-black">{dict.visitors.visitTitle}</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {dict.visitors.visitDescription}{" "}
                <a href="#" className="text-[#10a0c6] hover:underline font-medium">{dict.visitors.clickHere}</a>.
              </p>
              
              <div className="pt-4">
                <h3 className="text-2xl font-bold text-black mb-4">{dict.visitors.commitmentTitle}</h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {dict.visitors.commitmentDescription}{" "}
                  <a href="#" className="text-[#10a0c6] hover:underline font-medium">{dict.visitors.safetyGuidelines}</a>.
                </p>
              </div>
            </div>
            
            {/* Image - Order second on mobile, first on desktop */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden lg:order-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/images/ui/435987109_821359443355206_5240692529146685724_n-scaled.jpg" 
                alt="Puerto Rico Convention Center interior view with people" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </Container>
      </div>

      {/* Getting Around Section */}
      <div className="py-20 bg-white">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">{dict.visitors.gettingAroundTitle}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {dict.visitors.gettingAroundSubtitle}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Air Travel Card */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-[#10a0c6] rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-black mb-4">{dict.visitors.airTravelTitle}</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-[#10a0c6] rounded-full mt-2 flex-shrink-0"></div>
                      <span>{dict.visitors.flights588}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-[#10a0c6] rounded-full mt-2 flex-shrink-0"></div>
                      <span>{dict.visitors.flights30}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-[#10a0c6] rounded-full mt-2 flex-shrink-0"></div>
                      <span>{dict.visitors.flights28}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Ground Transportation Card */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-[#10a0c6] rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-black mb-4">{dict.visitors.groundTransportTitle}</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-[#10a0c6] rounded-full mt-2 flex-shrink-0"></div>
                      <span>{dict.visitors.taxi}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-[#10a0c6] rounded-full mt-2 flex-shrink-0"></div>
                      <span>{dict.visitors.buses}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-[#10a0c6] rounded-full mt-2 flex-shrink-0"></div>
                      <span>{dict.visitors.limousines}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Discover Puerto Rico Section */}
      <div className="py-20 bg-[#0e7bbd] relative overflow-hidden">
        {/* Subtle background texture */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill-opacity='0.6'%3E%3Cpath fill='%23ffffff' d='M20 20c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20zm40 40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z'/%3E%3Cpath fill='%23ffffff' d='M0 40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20zm40 40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z'/%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        {/* Alternative wave pattern - uncomment to use instead */}
        {/* <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-opacity='0.5'%3E%3Cpath fill='%23ffffff' d='M0 20c20-10 40-10 60 0s40 10 60 0v20c-20 10-40 10-60 0s-40-10-60 0V20z'/%3E%3Cpath fill='%23ffffff' d='M0 60c20-10 40-10 60 0s40 10 60 0v20c-20 10-40 10-60 0s-40-10-60 0V60z'/%3E%3C/g%3E%3C/svg%3E")`
          }}
        /> */}
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div>
                <div className="mb-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/images/ui/DISCOVER%20PUERTO%20RICO%20DPR_logo_white.png" 
                    alt="Discover Puerto Rico" 
                    className="h-16 w-auto"
                  />
                </div>
                <p className="text-xl text-blue-100 leading-relaxed">
                  {dict.visitors.discoverDescription}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="https://www.discoverpuertorico.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#0e7bbd] hover:bg-gray-100 font-semibold px-6 py-2 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                  {dict.visitors.discoverButton}
                </a>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-chat-modal'))}
                  className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#0e7bbd] font-semibold px-6 py-2 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {dict.visitors.contactTourism}
                </button>
              </div>
            </div>
            
            {/* Images Grid */}
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-4 lg:space-y-6">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/images/ui/SAN%20JUAN.jpg" 
                    alt="San Juan Puerto Rico" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-semibold text-sm">{dict.visitors.historicSanJuan}</h3>
                  </div>
                </div>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/images/ui/mofongo_hero.webp" 
                    alt="Traditional Puerto Rican Mofongo" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-semibold text-sm">{dict.visitors.authenticCuisine}</h3>
                  </div>
                </div>
              </div>
              <div className="mt-8 lg:mt-12 space-y-4 lg:space-y-6">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src="/images/ui/beach.webp" 
                    alt="Beautiful Puerto Rico Beach" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-semibold text-sm">{dict.visitors.pristineBeaches}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Event Planners Section */}
      <div id="event-planners" className="py-20 bg-white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* CTA Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-black mb-6">
                  {dict.visitors.eventPlannersTitle}
                </h2>
                <p className="text-xl text-gray-700 leading-relaxed mb-8">
                  {dict.visitors.eventPlannersDescription}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={`/${locale}/planners`} className="inline-flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 font-semibold px-6 py-2 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  {dict.visitors.plannersResources}
                </Link>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-chat-modal'))}
                  className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-black text-black hover:bg-black hover:text-white font-semibold px-6 py-2 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  {dict.visitors.letsChat}
                </button>
              </div>
            </div>
            
            {/* Video */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900">
              <video 
                autoPlay 
                muted 
                loop 
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/videos/hero/PRCC-Video-1min-Video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              {/* Optional overlay for better text readability if needed */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </Container>
      </div>

      {/* Final CTA Section */}
      <div className="py-12 bg-[#f78f1e] relative overflow-hidden">
        {/* Orange background texture - same circular pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill-opacity='0.6'%3E%3Cpath fill='%23ffffff' d='M20 20c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20zm40 40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z'/%3E%3Cpath fill='%23ffffff' d='M0 40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20zm40 40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z'/%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        <Container>
          <div className="grid md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {dict.visitors.planningEvent}
                </h2>
                <p className="text-orange-100">
                  {dict.visitors.everythingHere}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
                          <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-chat-modal'))}
              className="inline-flex items-center justify-center gap-2 bg-white text-[#f78f1e] hover:bg-gray-100 font-semibold px-6 py-2 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              {dict.visitors.startHere}
            </button>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
