"use client";

import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { SupportedLocale } from "@/lib/i18n/locales";

type Dict = {
  modals?: {
    close: string;
    awardsTitle: string;
    contactUs: string;
  };
  awards?: {
    title: string;
    subtitle: string;
    callToAction: string;
    getInTouch: string;
    awards: readonly {
      year: string;
      title: string;
      organization: string;
      description: string;
    }[];
  };
};

export default function AwardsModal({ locale, dict }: { locale: SupportedLocale; dict: Dict }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpenAwards = () => setIsOpen(true);
    
    window.addEventListener('open-awards-modal', handleOpenAwards);
    
    return () => {
      window.removeEventListener('open-awards-modal', handleOpenAwards);
    };
  }, []);

  const handleClose = () => setIsOpen(false);

  if (!isOpen) return null;

  const awards = [
    {
      year: "2024",
      title: "Northstar Stella Award - Gold Winner, Best Convention Center",
      organization: "Northstar Meetings Group",
      description: "Gold Winner recognition as Best Convention Center. The largest convention center in the Caribbean with 600,000 square feet of total space, able to accommodate groups of up to 10,000, and anchor of the fast-growing Convention Center District."
    },
    {
      year: "2019",
      title: "President's Excellence Award for Sanitation – Best in Class for Convention Centers",
      organization: "Levy Restaurants",
      description: "Recognized for exceptional sanitation standards and excellence in convention center operations"
    },
    {
      year: "2018", 
      title: "Prevue Visionary Award Winner – Best Convention Center International – Silver",
      organization: "Prevue Magazine",
      description: "Silver award recognizing PRCC as one of the top international convention centers"
    },
    {
      year: "2006-2019",
      title: "Prime Site Award",
      organization: "Facilities & Destinations",
      description: "Consistently awarded Prime Site recognition from 2006 through 2019, demonstrating sustained excellence over 14 consecutive years"
    },
    {
      year: "2017",
      title: "FEMA Work of Excellence Challenge Coin",
      organization: "Federal Emergency Management Agency",
      description: "September 2017 – December 2017. The coin, or medallion, is a form of recognition of excellence and special achievement"
    },
    {
      year: "2009-2013",
      title: "Inner Circle Award Recipient",
      organization: "Associations Meetings",
      description: "Five consecutive years of Inner Circle Award recognition from 2009 through 2013"
    },
    {
      year: "2011 & 2013",
      title: "World's Top Convention Centers",
      organization: "Trade Show Executives Magazine",
      description: "Recognized as one of the world's top convention centers in both 2011 and 2013"
    },
    {
      year: "2012",
      title: "Distinctive Achievement Award",
      organization: "Association Conventions & Facilities Magazine",
      description: "2012 Distinctive Achievement Award for outstanding convention center operations and facilities"
    },
    {
      year: "2014",
      title: "Hot List of 'The South's 101 Largest Expo Halls'",
      organization: "Convention South",
      description: "2015 Hot List recognition featuring PRCC among the South's largest and most prominent expo halls"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{dict.awards?.title || dict.modals?.awardsTitle || "Awards & Recognition"}</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mt-2">{dict.awards?.subtitle || "Celebrating our achievements and industry recognition"}</p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid gap-6">
              {awards.map((award, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#10a0c6] text-white">
                          {award.year}
                        </span>
                        <Trophy className="w-6 h-6 text-[#f78f1e]" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {award.title}
                      </h3>
                      <p className="text-[#10a0c6] font-medium mb-2">
                        {award.organization}
                      </p>
                      <p className="text-gray-600 leading-relaxed">
                        {award.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="mt-8 bg-gray-50 rounded-xl p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {dict.awards?.callToAction || "Ready to Host Your Next Event?"}
              </h3>
              <p className="text-gray-600 mb-4">
                Join the many organizations that have chosen us for their successful events.
              </p>
              <button
                onClick={() => {
                  handleClose();
                  window.dispatchEvent(new CustomEvent('open-chat-modal'));
                }}
                className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                {dict.awards?.getInTouch || dict.modals?.contactUs || "Contact Us"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
