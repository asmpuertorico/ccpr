"use client";

import React from "react";
import { SupportedLocale } from "@/lib/i18n/locales";

type Dict = {
  contact?: {
    chatTitle: string;
    chatSubtitle: string;
  };
};

export default function EmbeddedChat({ locale, dict }: { locale: SupportedLocale; dict: Dict }) {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {dict.contact?.chatTitle || "Chat with Us"}
        </h3>
        <p className="text-sm text-gray-600">
          {dict.contact?.chatSubtitle || "Get instant support from our team. We're here to answer your questions and help you plan your event."}
        </p>
      </div>
      
      {/* Chat iframe */}
      <div className="p-0">
        <iframe
          src="https://dashboard.getlinkai.com/embed/cme7jn41o0001d4q5q4gt76dn/window"
          style={{ border: "none", width: "100%", height: "500px" }}
          allow="microphone"
          title="Customer Support Chat"
        />
      </div>
    </div>
  );
}
