import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { defaultLocale, supportedLocales, type SupportedLocale } from "@/lib/i18n/locales";
import { en } from "@/lib/i18n/dictionaries/en";
import { es } from "@/lib/i18n/dictionaries/es";
import "../globals.css";

export function generateStaticParams() {
  return supportedLocales.map((l) => ({ locale: l }));
}

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const dict = params.locale === "es" ? es : en;
  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export default function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: { locale: string } }>) {
  const locale = (params.locale || defaultLocale) as SupportedLocale;
  if (!supportedLocales.includes(locale)) notFound();
  return (
    <html lang={locale} className="scroll-smooth">
      <head>
        <Script id="linkai-config" strategy="afterInteractive">
          {`
            window.chatbotConfig = { 
              chatbotId: 'cme7jn41o0001d4q5q4gt76dn',
              apiUrl: 'https://dashboard.getlinkai.com'
            };
          `}
        </Script>
        <Script id="linkai-loader" strategy="afterInteractive">
          {`
            (function() {
              var script = document.createElement('script');
              script.src = window.chatbotConfig.apiUrl + '/chatbot.js?v=' + Date.now();
              script.onload = function() {};
              script.onerror = function() {
                fetch(window.chatbotConfig.apiUrl + '/chatbot.js')
                  .then(function(response) {
                    if (!response.ok) { throw new Error('HTTP ' + response.status + ': ' + response.statusText); }
                    return response.text();
                  })
                  .then(function(scriptContent) { eval(scriptContent); })
                  .catch(function() {});
              };
              document.head.appendChild(script);
            })();
          `}
        </Script>
      </head>
      <body className="bg-white text-ink antialiased">{children}</body>
    </html>
  );
}


