"use client";

import { notFound } from "next/navigation";
import { supportedLocales } from "@/lib/i18n/locales";
import type { SupportedLocale } from "@/lib/i18n/locales";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { useState } from "react";
import { ChevronDown, ChevronUp, Download, Play, Building2, Users, Wifi, Car, Shield, Coffee, Clock, Phone, MapPin, Video, Eye } from "lucide-react";
import Image from "next/image";
import GradientDivider from "@/components/GradientDivider";

// Enhanced gradient divider component with more glow for this page only
function EnhancedGradientDivider() {
  return (
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
            animation: "gradient-move 8s linear infinite",
            height: "8px",
            top: "-3.5px"
          }}
        />
        <div
          className="absolute inset-0 blur-md opacity-40"
          style={{ 
            backgroundImage: "linear-gradient(90deg, #f78f1e, #90d8f8, #0e7bbd, #10a0c6)",
            backgroundSize: "400% 100%",
            animation: "gradient-move 8s linear infinite",
            height: "12px",
            top: "-5.5px"
          }}
        />
        <div
          className="absolute inset-0 blur-lg opacity-20"
          style={{ 
            backgroundImage: "linear-gradient(90deg, #f78f1e, #90d8f8, #0e7bbd, #10a0c6)",
            backgroundSize: "400% 100%",
            animation: "gradient-move 8s linear infinite",
            height: "16px",
            top: "-7.5px"
          }}
        />
      </div>
    </div>
  );
}

// Import dictionaries
import { en } from "@/lib/i18n/dictionaries/en";
import { es } from "@/lib/i18n/dictionaries/es";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="w-full px-6 py-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function VideoModal({ isOpen, onClose }: VideoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Puerto Rico Convention Center Overview</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="aspect-video">
          <video
            controls
            autoPlay
            className="w-full h-full"
            poster="/images/ui/435987109_821359443355206_5240692529146685724_n-scaled.jpg"
          >
            <source src="https://prconvention.com/wp-content/uploads/2024/08/PRCC-Video-1min-Video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}

interface PDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
}

function PDFModal({ isOpen, onClose, pdfUrl, title }: PDFModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-hidden" style={{ height: 'calc(90vh - 80px)' }}>
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title={title}
          />
        </div>
      </div>
    </div>
  );
}

export default function EventPlannersPage({ params }: { params: { locale: string } }) {
  const locale = params.locale as SupportedLocale;
  if (!supportedLocales.includes(locale)) notFound();
  const dict = locale === "es" ? es : en;

  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState({ url: '', title: '' });

  const resources = [
    {
      title: dict.planners?.eventPlanningGuide || "Event Planning Guide",
      description: dict.planners?.eventPlanningGuideDesc || "Comprehensive guide for planning your event",
      filename: "Event-Planning-Guide-August-2024.pdf",
      size: "2.5MB"
    },
    {
      title: dict.planners?.capacitySheet || "Capacity Sheet",
      description: dict.planners?.capacitySheetDesc || "Room capacities and configurations",
      filename: "PRCC-Capacity-Sheet-2023.pdf",
      size: "609KB"
    },
    {
      title: dict.planners?.cateringMenu || "Catering Menu",
      description: dict.planners?.cateringMenuDesc || "Private events and catering options",
      filename: "Puerto-Ricos-Convention-Center-Catering-Private-Events-Menu-DIGITAL-V.11.2023-2.pdf",
      size: "155MB"
    },
    {
      title: dict.planners?.sustainabilityGuide || "Sustainability Guide",
      description: dict.planners?.sustainabilityGuideDesc || "Environmental practices and sustainability",
      filename: "PRCC-Sustainability-Guide_compressed.pdf",
      size: "1MB"
    },
    {
      title: dict.planners?.kitchenEquipment || "General & Kitchen Equipment",
      description: dict.planners?.kitchenEquipmentDesc || "General kitchen and equipment information",
      filename: "general kitchen and equipment.pdf",
      size: "5.1MB"
    },
    {
      title: dict.planners?.graduationPackages || "Graduation Packages",
      description: dict.planners?.graduationPackagesDesc || "Special packages for graduation events",
      filename: "GRADUATION-PACKAGES.pdf",
      size: "718KB"
    },
    {
      title: dict.planners?.christmasOffers || "Christmas Offers",
      description: dict.planners?.christmasOffersDesc || "Holiday event packages and offers",
      filename: "Christmas-Offers.pdf",
      size: "1MB"
    },
    {
      title: dict.planners?.floorPlans || "Floor Plans", 
      description: dict.planners?.floorPlansDesc || "Detailed floor plans and layouts",
      filename: "BOOKLET-VRS-2024.pdf",
      size: "4.7MB"
    },
    {
      title: dict.planners?.promMenu || "Prom Menu",
      description: dict.planners?.promMenuDesc || "Special menu for prom events",
      filename: "PROM-MENU-CCPR-4.pdf",
      size: "1MB"
    }
  ];

  const openTourWithLevel = (level: string) => {
    const tourData = {
      'level1': {
        title: `${dict.planners?.virtualTourTitle || "Virtual Tour"} - ${dict.planners?.level1 || "Level I"}`,
        src: "https://my.matterport.com/show/?m=V9Dc67ohAdK"
      },
      'level2': {
        title: `${dict.planners?.virtualTourTitle || "Virtual Tour"} - ${dict.planners?.level2 || "Level II"}`, 
        src: "https://my.matterport.com/show/?m=shWiBhBBjoy"
      },
      'level3': {
        title: `${dict.planners?.virtualTourTitle || "Virtual Tour"} - ${dict.planners?.level3 || "Level III & Ocean-View Terrace"}`,
        src: "https://my.matterport.com/show/?m=KeZUKnEmF1n"
      }
    };
    
    const tour = tourData[level as keyof typeof tourData] || tourData.level1;
    window.dispatchEvent(new CustomEvent("open-iframe-modal", { 
      detail: { title: tour.title, src: tour.src } 
    }));
  };

  const openPdfModal = (filename: string, title: string) => {
    setSelectedPdf({ url: `/pdf/${filename}`, title });
    setPdfModalOpen(true);
  };

  const openChat = () => {
    window.dispatchEvent(new CustomEvent('open-chat-modal'));
  };

  return (
    <>
      <Navbar locale={locale} dict={dict} alwaysSolid={true} />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/ui/435987109_821359443355206_5240692529146685724_n-scaled.jpg"
              alt="Puerto Rico Convention Center"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>
          
          <Container className="relative z-10 text-center text-white">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              {dict.planners?.title || "Event Planners"}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
              {dict.planners?.heroSubtitle || "This Event Planner section has helpful information about our facility, amenities, rates and planning guidelines. Our dedicated and experienced staff is eager to assist you in every way possible to guarantee the success of your event."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setVideoModalOpen(true)}
                className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                <Play className="w-5 h-5" />
                {dict.planners?.watchOverview || "Watch Overview"}
              </button>
              
              <button 
                onClick={openChat}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-all duration-200">
                {dict.planners?.getQuote || "Get a Quote!"}
              </button>
            </div>
          </Container>
        </section>

        <EnhancedGradientDivider />

        {/* Quick Stats */}
        <section className="py-16 bg-gray-50">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-black mb-2">600,000</div>
                <div className="text-gray-600">{dict.planners?.sqFtTotalSpace || "Sq Ft Total Space"}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black mb-2">2,215</div>
                <div className="text-gray-600">{dict.planners?.parkingSpaces || "Parking Spaces"}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black mb-2">500</div>
                <div className="text-gray-600">{dict.planners?.mbpsInternet || "Mbps Internet"}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black mb-2">24/7</div>
                <div className="text-gray-600">{dict.planners?.securityCoverage || "Security Coverage"}</div>
              </div>
            </div>
          </Container>
        </section>

        {/* Amenities Section */}
        <section className="py-16">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-black mb-4">{dict.planners?.amenitiesTitle || "Amenities"}</h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                {dict.planners?.amenitiesDesc || "The total space at the Puerto Rico Convention Center is 600,000 sq ft (55,742 sq m). We can help you take advantage of everything this modern marvel has to offer."}
              </p>
            </div>

            <div className="space-y-4">
              <AccordionItem title={dict.planners?.spaceConfigTitle || "Space Configuration"} defaultOpen={true}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-teal-50 p-6 rounded-lg">
                    <Building2 className="w-8 h-8 text-teal-600 mb-3" />
                    <h4 className="font-semibold text-lg mb-2">{dict.planners?.exhibitHall || "Exhibit Hall"}</h4>
                    <div className="text-2xl font-bold text-teal-600 mb-1">152,700 <span className="text-sm">Sq.Ft</span></div>
                    <div className="text-sm text-gray-600">{dict.planners?.exhibitHallDesc || "14,186 Sq. M / Divides into three individual exposition spaces."}</div>
                  </div>
                  
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <Users className="w-8 h-8 text-blue-600 mb-3" />
                    <h4 className="font-semibold text-lg mb-2">{dict.planners?.ballroom || "Ballroom"}</h4>
                    <div className="text-2xl font-bold text-blue-600 mb-1">39,500 <span className="text-sm">Sq.Ft</span></div>
                    <div className="text-sm text-gray-600">{dict.planners?.ballroomDesc || "3,670 Sq. M / Ballroom divides into two individual spaces."}</div>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg">
                    <Users className="w-8 h-8 text-green-600 mb-3" />
                    <h4 className="font-semibold text-lg mb-2">{dict.planners?.meetingSpace || "Meeting Space"}</h4>
                    <div className="text-2xl font-bold text-green-600 mb-1">36,400 <span className="text-sm">Sq.Ft</span></div>
                    <div className="text-sm text-gray-600">{dict.planners?.meetingSpaceDesc || "3,363 Sq. M / Can be arranged as per your requirements."}</div>
                  </div>
                  
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <MapPin className="w-8 h-8 text-orange-600 mb-3" />
                    <h4 className="font-semibold text-lg mb-2">{dict.planners?.outdoorTerrace || "Outdoor Terrace"}</h4>
                    <div className="text-2xl font-bold text-orange-600 mb-1">12,800 <span className="text-sm">Sq.Ft</span></div>
                    <div className="text-sm text-gray-600">{dict.planners?.outdoorTerraceDesc || "1,180 Sq. M / Describe the outdoor terrace in this space."}</div>
                  </div>
                </div>
              </AccordionItem>

              <AccordionItem title={dict.planners?.meetingFacilitiesTitle || "Meeting Facilities"}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="bg-gray-100 p-6 rounded-lg mb-3">
                      <Users className="w-12 h-12 text-gray-600 mx-auto" />
                    </div>
                    <h4 className="font-semibold text-lg mb-2">{dict.planners?.meetingRooms || "Meeting Rooms"}</h4>
                    <div className="text-3xl font-bold text-black mb-1">15 <span className="text-lg">{dict.planners?.rooms || "Rooms"}</span></div>
                    <div className="text-sm text-gray-600">{dict.planners?.meetingRoomsDesc || "can be divided into 29 breakout rooms"}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-gray-100 p-6 rounded-lg mb-3">
                      <Car className="w-12 h-12 text-gray-600 mx-auto" />
                    </div>
                    <h4 className="font-semibold text-lg mb-2">{dict.planners?.loadingDock || "Loading Dock"}</h4>
                    <div className="text-3xl font-bold text-black mb-1">22 <span className="text-lg">{dict.planners?.cpyTrailers || "CPY Trailers"}</span></div>
                    <div className="text-sm text-gray-600">{dict.planners?.loadingDockDesc || "6 with automatic levelers for fast load in & load out"}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-gray-100 p-6 rounded-lg mb-3">
                      <Wifi className="w-12 h-12 text-gray-600 mx-auto" />
                    </div>
                    <h4 className="font-semibold text-lg mb-2">{dict.planners?.internet || "Internet"}</h4>
                    <div className="text-3xl font-bold text-black mb-1">500 <span className="text-lg">{dict.planners?.mbps || "Mbps"}</span></div>
                    <div className="text-sm text-gray-600">{dict.planners?.internetDesc || "Stay connected with our high speed internet"}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-gray-100 p-6 rounded-lg mb-3">
                      <Video className="w-12 h-12 text-gray-600 mx-auto" />
                    </div>
                    <h4 className="font-semibold text-lg mb-2">{dict.planners?.videoConference || "Video Conference"}</h4>
                    <div className="text-3xl font-bold text-black mb-1">HD</div>
                    <div className="text-sm text-gray-600">{dict.planners?.videoConferenceDesc || "Stay connected with our high speed internet & A/V"}</div>
                  </div>
                </div>
              </AccordionItem>

              <AccordionItem title={dict.planners?.servicesTitle || "Services & Support"}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <Clock className="w-6 h-6 text-gray-600 mt-1 shrink-0" />
                      <div>
                        <h4 className="font-semibold mb-2">{dict.planners?.hoursOperation || "Hours of Operation"}</h4>
                        <p className="text-gray-700 text-sm">{dict.planners?.hoursDesc || "The standard hours of operation for the administrative staff are 8:30 a.m. to 5:30 p.m. Monday through Friday. Our standard operating hours for client-leased spaces are 7:00 a.m. to 10:59 p.m. daily."}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Car className="w-6 h-6 text-gray-600 mt-1 shrink-0" />
                      <div>
                        <h4 className="font-semibold mb-2">{dict.planners?.usaParking || "USA Parking"}</h4>
                        <p className="text-gray-700 text-sm">{dict.planners?.parkingDesc || "Self-parking lots are conveniently located adjacent to the Convention Center with capacity for 2,215 vehicles."}</p>
                        <p className="text-gray-700 text-sm mt-2">{dict.planners?.parkingContact || "Contact 787-933-3636 for customized rate and support."}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Wifi className="w-6 h-6 text-gray-600 mt-1 shrink-0" />
                      <div>
                        <h4 className="font-semibold mb-2">{dict.planners?.telecommunications || "Telecommunications & Internet"}</h4>
                        <p className="text-gray-700 text-sm">{dict.planners?.telecomDesc || "The telecommunications and internet services are exclusive with Encore, and can be tailored to meet specific event organizer and exhibitor needs. All meeting rooms and ballrooms are equipped with Ethernet connection and capabilities."}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <Coffee className="w-6 h-6 text-gray-600 mt-1 shrink-0" />
                      <div>
                        <h4 className="font-semibold mb-2">{dict.planners?.cateringConcessions || "Catering and Concessions"}</h4>
                        <p className="text-gray-700 text-sm">{dict.planners?.cateringDesc || "The Food & Beverage Department is prepared to offer the finest quality products and service for all functions from coffee breaks to exquisite gala banquets. Catering menus are available from the Food & Beverage Department."}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Shield className="w-6 h-6 text-gray-600 mt-1 shrink-0" />
                      <div>
                        <h4 className="font-semibold mb-2">{dict.planners?.buildingSecurity || "Building Security"}</h4>
                        <p className="text-gray-700 text-sm">{dict.planners?.securityDesc || "The Center maintains in-house security for the premises only. The Building Security Staff maintains 24-hour security coverage for the Center's perimeter areas, internal corridors and life safety alarm system."}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <Users className="w-6 h-6 text-gray-600 mt-1 shrink-0" />
                      <div>
                        <h4 className="font-semibold mb-2">{dict.planners?.cleaning || "Cleaning"}</h4>
                        <p className="text-gray-700 text-sm">{dict.planners?.cleaningDesc || "The Center staff takes great pride in the care of the facility. Every aspect of the facility is maintained to provide you with a clean and attractive environment to house your event and welcome your members, registrants, patrons and guests."}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionItem>
            </div>
          </Container>
        </section>

        {/* Virtual Tour Section */}
        <section className="py-16 bg-gray-50">
          <Container>
            <div className="text-center mb-12">
                          <h2 className="text-4xl font-bold text-black mb-4">{dict.planners?.exploreFacilityTitle || "Explore Our Facility"}</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              {dict.planners?.exploreFacilityDesc || "Take a virtual tour of our state-of-the-art facility and discover all the spaces available for your event."}
            </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{dict.planners?.level1 || "Level 1"}</h3>
                <p className="text-gray-600 text-sm mb-4">{dict.planners?.level1Desc || "Main exhibition halls and loading docks"}</p>
                <button
                  onClick={() => openTourWithLevel('level1')}
                  className="w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  {dict.planners?.exploreLevel1 || "Explore Level 1"}
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{dict.planners?.level2 || "Level 2"}</h3>
                <p className="text-gray-600 text-sm mb-4">{dict.planners?.level2Desc || "Ballrooms and meeting spaces"}</p>
                <button
                  onClick={() => openTourWithLevel('level2')}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  {dict.planners?.exploreLevel2 || "Explore Level 2"}
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coffee className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{dict.planners?.level3 || "Level 3"}</h3>
                <p className="text-gray-600 text-sm mb-4">{dict.planners?.level3Desc || "Upper level spaces and terraces"}</p>
                <button
                  onClick={() => openTourWithLevel('level3')}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  {dict.planners?.exploreLevel3 || "Explore Level 3"}
                </button>
              </div>
            </div>
          </Container>
        </section>

        {/* Resources Section */}
        <section className="py-16">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-black mb-4">{dict.planners?.resourcesTitle || "Planning Resources"}</h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                {dict.planners?.resourcesSubtitle || "Download comprehensive guides, capacity sheets, and planning materials to help organize your event."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{resource.description}</p>
                      <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {resource.size}
                      </span>
                    </div>
                    <Download className="w-6 h-6 text-gray-400 shrink-0 ml-4" />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => openPdfModal(resource.filename, resource.title)}
                      className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 inline-flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                      {dict.planners?.view || "View"}
                    </button>
                    <a
                      href={`/pdf/${resource.filename}`}
                      download
                      className="flex-1 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 inline-flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {dict.planners?.download || "Download"}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Sales Presentation - Special highlight */}
            <div className="mt-12 bg-gradient-to-r from-teal-50 to-blue-50 p-8 rounded-lg border border-gray-200">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-black mb-4">{dict.planners?.salesPresentationTitle || "Sales Presentation"}</h3>
                <p className="text-gray-700 mb-6">
                  {dict.planners?.salesPresentationDesc || "Get a comprehensive overview of our facility, services, and capabilities with our detailed sales presentation."}
                </p>
                <a 
                  href="https://www.canva.com/design/DAGIzI0bc20/0CqDmjuZGgOywqji61a9AQ/view?utm_content=DAGIzI0bc20&utm_campaign=designshare&utm_medium=link&utm_source=editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200 inline-flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  {dict.planners?.viewSalesPresentation || "View Sales Presentation"}
                </a>
              </div>
            </div>
          </Container>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-[#f78f1e] text-white relative overflow-hidden">
          {/* Orange background texture - same circular pattern as home page */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill-opacity='0.6'%3E%3Cpath fill='%23ffffff' d='M20 20c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20zm40 40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z'/%3E%3Cpath fill='%23ffffff' d='M0 40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20zm40 40c0-11.046 8.954-20 20-20s20 8.954 20 20-8.954 20-20 20-20-8.954-20-20z'/%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
          <Container className="relative z-10">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">{dict.planners?.readyToPlantTitle || "Ready to Plan Your Event?"}</h2>
              <p className="text-xl mb-8 max-w-2xl mx-auto text-orange-100">
                {dict.planners?.readyToPlanDesc || "Our experienced team is ready to help make your event a success. Get in touch today to discuss your requirements."}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <div className="flex items-center gap-3">
                  <Phone className="w-6 h-6 text-orange-200" />
                  <span className="text-lg">(787) 641-7722</span>
                </div>
                
                <button 
                  onClick={openChat}
                  className="bg-white text-[#f78f1e] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
                  Get a Quote
                </button>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer locale={locale} dict={dict} />

      {/* Modals */}
      <VideoModal isOpen={videoModalOpen} onClose={() => setVideoModalOpen(false)} />
      <PDFModal 
        isOpen={pdfModalOpen} 
        onClose={() => setPdfModalOpen(false)} 
        pdfUrl={selectedPdf.url}
        title={selectedPdf.title}
      />
    </>
  );
}
